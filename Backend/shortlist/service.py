"""End-to-end candidate shortlist orchestration.

Workflow:
  1. Extract structured JD requirements (one LLM call).
  2. For each candidate, compute a deterministic prior fit score from
     concrete signals (skills overlap, project relevance, code-quality
     signals) and ask the LLM for a verdict in parallel.
  3. Blend prior + LLM score the same way the Specialization Fit Checker
     does, then rank descending and return the top N.

Per-candidate calls run in a thread pool so a 100-row sheet still finishes
in something reasonable, while the LLM client stays the singleton from
``specialization.llm_client``.
"""
from __future__ import annotations

import json
import logging
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List

from specialization.llm_client import extract_json_object, stream_completion
from specialization.scoring import (
    WEIGHTS,
    architecture_maturity_score,
    core_skills_score,
    jd_match_score,
    production_readiness_score,
    profile_quality_score,
    project_relevance_score,
)
from specialization.roles import Role

from .prompt_builder import (
    build_candidate_evaluation_messages,
    build_jd_extraction_messages,
)
from .schema import (
    CandidateInput,
    CandidateShortlistRequest,
    JDRequirements,
    ShortlistedCandidate,
    ShortlistResponse,
)

logger = logging.getLogger("ml-service.shortlist")

MAX_CONCURRENCY = 6


# ---------- helpers -----------------------------------------------------------


def _coerce_int(value: Any, default: int, lo: int = 0, hi: int = 100) -> int:
    try:
        n = int(value)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, n))


def _string_list(value: Any) -> List[str]:
    if not isinstance(value, list):
        return []
    out: List[str] = []
    for v in value:
        if isinstance(v, str) and v.strip():
            out.append(v.strip())
        elif isinstance(v, (int, float)):
            out.append(str(v))
    return out


def _parse_llm_json(raw: str) -> Dict[str, Any]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return json.loads(extract_json_object(raw))


def _blend(llm_score: int, prior_score: int) -> int:
    if abs(llm_score - prior_score) <= 12:
        return llm_score
    return round(0.6 * llm_score + 0.4 * prior_score)


def _extract_github_username(github_url: str) -> str:
    """Best-effort username pull from a GitHub URL.

    The Node side already validates these before forwarding, but be defensive
    anyway — this string is shown in the response.
    """
    match = re.search(r"github\.com/([^/\s?#]+)", github_url, flags=re.IGNORECASE)
    if match:
        return match.group(1).removesuffix(".git")
    return github_url.strip()


# ---------- JD extraction -----------------------------------------------------


def _extract_jd_requirements(job_description: str) -> JDRequirements:
    """Distill the raw JD into structured requirements. Falls back to an
    empty object if the LLM call fails — downstream scoring still works."""
    try:
        raw = stream_completion(
            build_jd_extraction_messages(job_description),
            temperature=0.2,
            max_tokens=600,
        )
        parsed = _parse_llm_json(raw)
    except Exception:
        logger.exception("JD extraction failed; falling back to empty requirements")
        return JDRequirements()

    return JDRequirements(
        required_skills=_string_list(parsed.get("required_skills")),
        preferred_skills=_string_list(parsed.get("preferred_skills")),
        experience_areas=_string_list(parsed.get("experience_areas")),
        project_types=_string_list(parsed.get("project_types")),
        seniority_level=str(parsed.get("seniority_level") or "unspecified"),
    )


# ---------- Prior scoring -----------------------------------------------------


def _synthetic_role(jd_requirements: JDRequirements) -> Role:
    """Wrap the JD-extracted skills as a Role so we can reuse the existing
    scoring engine without forking it. ``id``/``name`` are placeholders that
    aren't surfaced to the user."""
    core = list(dict.fromkeys(jd_requirements.required_skills))
    nice = list(dict.fromkeys(jd_requirements.preferred_skills))
    projects = list(dict.fromkeys(jd_requirements.project_types))
    return Role(
        id="__shortlist_synthetic__",
        name="Shortlist target role",
        category="Shortlist",
        core_skills=core,
        nice_to_have=nice,
        expected_projects=projects,
        faang_relevant=False,
    )


def _compute_prior(
    role: Role,
    candidate: CandidateInput,
    job_description: str,
) -> Dict[str, Any]:
    core, matched, missing = core_skills_score(role, candidate.repos)
    proj = project_relevance_score(role, candidate.repos)
    prod = production_readiness_score(candidate.repos)
    arch = architecture_maturity_score(candidate.repos)
    profq = profile_quality_score(candidate.profile, candidate.repos)
    jdm = jd_match_score(job_description, candidate.repos, candidate.profile)

    breakdown = {
        "core_skills_match": core,
        "project_relevance": proj,
        "production_readiness": prod,
        "architecture_maturity": arch,
        "profile_quality": profq,
        "jd_keyword_match": jdm,
    }
    weighted = sum(breakdown[k] * WEIGHTS[k] for k in WEIGHTS) / 100
    return {
        "fit_score": round(weighted),
        "matched_skills": matched,
        "missing_skills": missing,
    }


def _derive_confidence(candidate: CandidateInput) -> int:
    repos = candidate.repos
    if not repos:
        return 20
    signal = min(len(repos) * 12, 60)
    readme_bonus = sum(1 for r in repos if r.has_readme) * 3
    return min(signal + readme_bonus + 15, 95)


# ---------- Per-candidate evaluation -----------------------------------------


def _evaluate_candidate(
    candidate: CandidateInput,
    jd_requirements_payload: dict,
    role: Role,
    job_description: str,
) -> Dict[str, Any]:
    prior = _compute_prior(role, candidate, job_description)
    prior_score: int = prior["fit_score"]  # type: ignore[assignment]
    prior_matched: List[str] = list(prior["matched_skills"])  # type: ignore[arg-type]
    prior_missing: List[str] = list(prior["missing_skills"])  # type: ignore[arg-type]

    llm_payload: Dict[str, Any] = {}
    try:
        raw = stream_completion(
            build_candidate_evaluation_messages(
                candidate.profile, candidate.repos, jd_requirements_payload
            ),
            temperature=0.3,
            max_tokens=900,
        )
        llm_payload = _parse_llm_json(raw)
    except Exception:
        logger.exception(
            "LLM evaluation failed for %s; using prior-only signals",
            candidate.profile.username,
        )

    llm_score = _coerce_int(llm_payload.get("match_score"), prior_score)
    final_score = _blend(llm_score, prior_score)

    return {
        "match_score": final_score,
        "confidence": _coerce_int(
            llm_payload.get("confidence"), _derive_confidence(candidate)
        ),
        "specializations": _string_list(llm_payload.get("specializations")),
        "matched_skills": _string_list(llm_payload.get("matched_skills")) or prior_matched,
        "missing_skills": _string_list(llm_payload.get("missing_skills")) or prior_missing,
        "strengths": _string_list(llm_payload.get("strengths")),
        "notable_projects": _string_list(llm_payload.get("notable_projects")),
        "reason_for_shortlist": str(llm_payload.get("reason_for_shortlist") or ""),
    }


# ---------- Public API --------------------------------------------------------


def shortlist_candidates(req: CandidateShortlistRequest) -> ShortlistResponse:
    jd_requirements = _extract_jd_requirements(req.job_description)
    jd_payload = jd_requirements.model_dump()
    role = _synthetic_role(jd_requirements)

    total = len(req.candidates)
    evaluated: List[Dict[str, Any]] = []

    # Fan out per-candidate LLM calls. The OpenAI SDK is thread-safe for
    # independent requests so a small pool is fine and dramatically faster
    # than serial calls when the sheet is large.
    with ThreadPoolExecutor(max_workers=min(MAX_CONCURRENCY, total)) as pool:
        futures = {
            pool.submit(
                _evaluate_candidate, c, jd_payload, role, req.job_description
            ): c
            for c in req.candidates
        }
        for future in as_completed(futures):
            candidate = futures[future]
            try:
                result = future.result()
            except Exception:
                logger.exception(
                    "Candidate evaluation crashed for %s",
                    candidate.profile.username,
                )
                continue
            result["_candidate"] = candidate
            evaluated.append(result)

    evaluated.sort(
        key=lambda r: (r["match_score"], r["confidence"]), reverse=True
    )

    shortlisted: List[ShortlistedCandidate] = []
    for rank, entry in enumerate(evaluated[: req.shortlist_count], start=1):
        candidate: CandidateInput = entry["_candidate"]
        github_username = candidate.profile.username or _extract_github_username(
            candidate.github_url
        )
        shortlisted.append(
            ShortlistedCandidate(
                rank=rank,
                candidate_name=candidate.name,
                github_url=candidate.github_url,
                github_username=github_username,
                match_score=entry["match_score"],
                confidence=entry["confidence"],
                specializations=entry["specializations"],
                matched_skills=entry["matched_skills"],
                missing_skills=entry["missing_skills"],
                strengths=entry["strengths"],
                notable_projects=entry["notable_projects"],
                reason_for_shortlist=entry["reason_for_shortlist"],
                email=candidate.email,
                college=candidate.college,
                resume_url=candidate.resume_url,
                linkedin_url=candidate.linkedin_url,
            )
        )

    return ShortlistResponse(
        total_candidates=total,
        shortlist_count=len(shortlisted),
        jd_requirements=jd_requirements,
        shortlisted=shortlisted,
    )
