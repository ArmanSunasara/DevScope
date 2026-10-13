"""End-to-end specialization-fit orchestration: prompt → LLM → parse → blend."""
from __future__ import annotations

import json
import logging
from typing import Any, Dict

from pydantic import ValidationError

from .llm_client import extract_json_object, stream_completion
from .prompt_builder import build_messages
from .roles import get_role
from .scoring import blend, compute_prior
from .schema import (
    FitReport,
    HiringReadiness,
    RadarAxis,
    SpecializationFitRequest,
)

logger = logging.getLogger("ml-service.specialization")


def _fallback_radar(breakdown: Dict[str, int]) -> list[dict]:
    axes = [
        ("Core Skills", "core_skills_match"),
        ("Projects", "project_relevance"),
        ("Production Readiness", "production_readiness"),
        ("Architecture", "architecture_maturity"),
        ("Profile Quality", "profile_quality"),
        ("JD Match", "jd_keyword_match"),
    ]
    return [{"axis": label, "score": int(breakdown.get(key, 0))} for label, key in axes]


def _coerce_int(value: Any, default: int, lo: int = 0, hi: int = 100) -> int:
    try:
        n = int(value)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, n))


def _parse_llm_json(raw: str) -> Dict[str, Any]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return json.loads(extract_json_object(raw))


def analyze_specialization_fit(req: SpecializationFitRequest) -> FitReport:
    role = get_role(req.role_id)
    if role is None:
        raise ValueError(f"Unknown role_id: {req.role_id}")

    prior = compute_prior(role, req.profile, req.repos, req.job_description)
    prior_breakdown: Dict[str, int] = prior["score_breakdown"]  # type: ignore[assignment]
    prior_score: int = prior["fit_score"]  # type: ignore[assignment]

    messages = build_messages(role, req.profile, req.repos, req.job_description)

    try:
        raw = stream_completion(messages)
        parsed = _parse_llm_json(raw)
    except Exception as err:
        logger.exception("LLM call failed; returning prior-only report")
        return _prior_only_report(req, role, prior, reason=str(err))

    llm_fit = _coerce_int(parsed.get("fit_score"), prior_score)
    final_fit = blend(llm_fit, prior_score)

    breakdown_in = parsed.get("score_breakdown") or {}
    final_breakdown = {
        key: _coerce_int(breakdown_in.get(key), prior_breakdown.get(key, 0))
        for key in prior_breakdown.keys()
    }

    radar_in = parsed.get("radar") or []
    radar: list[RadarAxis] = []
    if isinstance(radar_in, list) and radar_in:
        for item in radar_in:
            if not isinstance(item, dict):
                continue
            axis = str(item.get("axis", "")).strip()
            score = _coerce_int(item.get("score"), 0)
            if axis:
                radar.append(RadarAxis(axis=axis, score=score))
    if not radar:
        radar = [RadarAxis(**axis) for axis in _fallback_radar(final_breakdown)]

    hiring_in = parsed.get("hiring_readiness") or {}
    hiring = HiringReadiness(
        level=str(hiring_in.get("level") or _derive_level(final_fit)),
        estimated_time_to_ready=str(hiring_in.get("estimated_time_to_ready") or _derive_eta(final_fit)),
        rationale=str(hiring_in.get("rationale") or ""),
    )

    payload: Dict[str, Any] = {
        "role_id": role.id,
        "role_name": role.name,
        "fit_score": final_fit,
        "confidence": _coerce_int(parsed.get("confidence"), _derive_confidence(req)),
        "score_breakdown": final_breakdown,
        "strengths": _string_list(parsed.get("strengths")),
        "weak_areas": _string_list(parsed.get("weak_areas")),
        "github_weaknesses": _string_list(parsed.get("github_weaknesses")),
        "missing_skills": _string_list(parsed.get("missing_skills"))
            or list(prior["missing_skills"]),  # type: ignore[arg-type]
        "matched_skills": _string_list(parsed.get("matched_skills"))
            or list(prior["matched_skills"]),  # type: ignore[arg-type]
        "missing_projects": _string_list(parsed.get("missing_projects")),
        "recommended_improvements": _string_list(parsed.get("recommended_improvements")),
        "recommended_projects": _project_list(parsed.get("recommended_projects")),
        "learning_path": _learning_path(parsed.get("learning_path")),
        "technologies_to_learn": _string_list(parsed.get("technologies_to_learn")),
        "ats_suggestions": _string_list(parsed.get("ats_suggestions")),
        "resume_suggestions": _string_list(parsed.get("resume_suggestions")),
        "interview_questions": _string_list(parsed.get("interview_questions")),
        "hiring_readiness": hiring,
        "faang_readiness": parsed.get("faang_readiness") if role.faang_relevant else None,
        "radar": radar,
        "timeline_to_job_ready": str(parsed.get("timeline_to_job_ready") or hiring.estimated_time_to_ready),
        "summary": str(parsed.get("summary") or ""),
    }

    try:
        return FitReport(**payload)
    except ValidationError:
        logger.exception("FitReport validation failed; falling back to prior-only")
        return _prior_only_report(req, role, prior, reason="schema-validation-failed")


# ---------- helpers -----------------------------------------------------------


def _string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    out: list[str] = []
    for v in value:
        if isinstance(v, str) and v.strip():
            out.append(v.strip())
        elif isinstance(v, (int, float)):
            out.append(str(v))
    return out


def _project_list(value: Any) -> list[dict]:
    if not isinstance(value, list):
        return []
    out: list[dict] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        title = str(item.get("title") or "").strip()
        if not title:
            continue
        out.append(
            {
                "title": title,
                "why": str(item.get("why") or "").strip(),
                "difficulty": str(item.get("difficulty") or "intermediate"),
                "estimated_weeks": _coerce_int(item.get("estimated_weeks"), 2, 1, 52),
                "key_tech": _string_list(item.get("key_tech")),
            }
        )
    return out


def _learning_path(value: Any) -> list[dict]:
    if not isinstance(value, list):
        return []
    out: list[dict] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        step = str(item.get("step") or "").strip()
        if not step:
            continue
        out.append(
            {
                "step": step,
                "duration": str(item.get("duration") or ""),
                "resources": _string_list(item.get("resources")),
            }
        )
    return out


def _derive_level(fit: int) -> str:
    if fit >= 85:
        return "Ready"
    if fit >= 70:
        return "High"
    if fit >= 50:
        return "Moderate"
    return "Low"


def _derive_eta(fit: int) -> str:
    if fit >= 85:
        return "Now"
    if fit >= 70:
        return "1-2 months"
    if fit >= 50:
        return "3-4 months"
    if fit >= 30:
        return "5-6 months"
    return "6+ months"


def _derive_confidence(req: SpecializationFitRequest) -> int:
    if not req.repos:
        return 25
    signal = min(len(req.repos) * 12, 60)
    readme_bonus = sum(1 for r in req.repos if r.has_readme) * 3
    return min(signal + readme_bonus + 20, 95)


def _prior_only_report(
    req: SpecializationFitRequest,
    role,
    prior: Dict[str, Any],
    *,
    reason: str = "",
) -> FitReport:
    fit = int(prior["fit_score"])
    breakdown = prior["score_breakdown"]
    radar = [RadarAxis(**axis) for axis in _fallback_radar(breakdown)]
    return FitReport(
        role_id=role.id,
        role_name=role.name,
        fit_score=fit,
        confidence=max(_derive_confidence(req) - 20, 10),
        score_breakdown=breakdown,
        strengths=[],
        weak_areas=[],
        github_weaknesses=[],
        missing_skills=list(prior["missing_skills"]),
        matched_skills=list(prior["matched_skills"]),
        missing_projects=role.expected_projects,
        recommended_improvements=[
            "AI service unavailable — showing baseline scoring only. Retry to get full recommendations.",
        ] if reason else [],
        recommended_projects=[],
        learning_path=[],
        technologies_to_learn=list(prior["missing_skills"])[:6],
        ats_suggestions=[],
        resume_suggestions=[],
        interview_questions=[],
        hiring_readiness=HiringReadiness(
            level=_derive_level(fit),
            estimated_time_to_ready=_derive_eta(fit),
            rationale="Baseline estimate from deterministic signals.",
        ),
        faang_readiness=None,
        radar=radar,
        timeline_to_job_ready=_derive_eta(fit),
        summary="Baseline fit estimate based on repo signals. Detailed AI analysis was not available.",
    )
