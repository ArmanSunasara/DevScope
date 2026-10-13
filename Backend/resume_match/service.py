"""End-to-end Resume vs GitHub Match orchestration: prompt -> LLM -> parse.

The matching is inherently semantic, so unlike the Specialization Fit Checker
there is no deterministic prior to blend in. Instead, when the LLM call or its
output fails we fall back to a low-confidence report built from a lightweight
deterministic skill check, so the endpoint never hard-fails on a transient
provider error.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List

from pydantic import ValidationError

from specialization.llm_client import extract_json_object, stream_completion

from .prompt_builder import build_messages
from .schema import (
    GithubProfileSummary,
    GithubRepoSummary,
    ParsedProject,
    ParsedResume,
    ResumeGithubMatchRequest,
    ResumeMatchReport,
)

logger = logging.getLogger("ml-service.resume_match")


def analyze_resume_github_match(req: ResumeGithubMatchRequest) -> ResumeMatchReport:
    messages = build_messages(req.resume_text, req.profile, req.repos)

    try:
        raw = stream_completion(messages, temperature=0.25, max_tokens=4096)
        parsed = _parse_llm_json(raw)
    except Exception as err:  # provider error, malformed JSON, etc.
        logger.exception("Resume-match LLM call failed; returning fallback report")
        return _fallback_report(req, reason=str(err))

    payload: Dict[str, Any] = {
        "alignment_score": _coerce_int(parsed.get("alignment_score"), 0),
        "confidence": _coerce_int(parsed.get("confidence"), _derive_confidence(req)),
        "summary": str(parsed.get("summary") or ""),
        "verdict": str(parsed.get("verdict") or ""),
        "resume": _parsed_resume(parsed.get("resume")),
        "matched_projects": _matched_projects(parsed.get("matched_projects")),
        "missing_projects": _missing_projects(parsed.get("missing_projects")),
        "github_only_projects": _github_only(parsed.get("github_only_projects")),
        "unsupported_claims": _unsupported_claims(parsed.get("unsupported_claims")),
        "skill_verification": _skill_verification(parsed.get("skill_verification")),
        "recommendations": _string_list(parsed.get("recommendations")),
    }

    try:
        return ResumeMatchReport(**payload)
    except ValidationError:
        logger.exception("ResumeMatchReport validation failed; using fallback")
        return _fallback_report(req, reason="schema-validation-failed")


# ---------- parsing helpers ---------------------------------------------------


def _parse_llm_json(raw: str) -> Dict[str, Any]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return json.loads(extract_json_object(raw))


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


def _parsed_resume(value: Any) -> ParsedResume:
    if not isinstance(value, dict):
        return ParsedResume()
    name = value.get("candidate_name")
    return ParsedResume(
        candidate_name=str(name).strip() if isinstance(name, str) and name.strip() else None,
        skills=_string_list(value.get("skills")),
        projects=_parsed_projects(value.get("projects")),
        experience=_string_list(value.get("experience")),
        certifications=_string_list(value.get("certifications")),
        education=_string_list(value.get("education")),
    )


def _parsed_projects(value: Any) -> List[ParsedProject]:
    if not isinstance(value, list):
        return []
    out: List[ParsedProject] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "").strip()
        if not name:
            continue
        out.append(
            ParsedProject(
                name=name,
                description=str(item.get("description") or "").strip(),
                technologies=_string_list(item.get("technologies")),
            )
        )
    return out


def _matched_projects(value: Any) -> List[dict]:
    if not isinstance(value, list):
        return []
    out: List[dict] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        resume_project = str(item.get("resume_project") or "").strip()
        if not resume_project:
            continue
        out.append(
            {
                "resume_project": resume_project,
                "github_repo": str(item.get("github_repo") or "").strip(),
                "match_score": _coerce_int(item.get("match_score"), 0),
                "evidence": _string_list(item.get("evidence")),
                "verified_technologies": _string_list(item.get("verified_technologies")),
                "notes": str(item.get("notes") or "").strip(),
            }
        )
    return out


def _missing_projects(value: Any) -> List[dict]:
    if not isinstance(value, list):
        return []
    out: List[dict] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        resume_project = str(item.get("resume_project") or "").strip()
        if not resume_project:
            continue
        out.append(
            {"resume_project": resume_project, "reason": str(item.get("reason") or "").strip()}
        )
    return out


def _github_only(value: Any) -> List[dict]:
    if not isinstance(value, list):
        return []
    out: List[dict] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        repo_name = str(item.get("repo_name") or "").strip()
        if not repo_name:
            continue
        importance = str(item.get("importance") or "medium").strip().lower()
        if importance not in ("low", "medium", "high"):
            importance = "medium"
        out.append({"repo_name": repo_name, "importance": importance})
    return out


def _unsupported_claims(value: Any) -> List[dict]:
    if not isinstance(value, list):
        return []
    out: List[dict] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        claim = str(item.get("claim") or "").strip()
        if not claim:
            continue
        severity = str(item.get("severity") or "medium").strip().lower()
        if severity not in ("low", "medium", "high"):
            severity = "medium"
        out.append(
            {"claim": claim, "reason": str(item.get("reason") or "").strip(), "severity": severity}
        )
    return out


def _skill_verification(value: Any) -> List[dict]:
    if not isinstance(value, list):
        return []
    out: List[dict] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        skill = str(item.get("skill") or "").strip()
        if not skill:
            continue
        out.append(
            {
                "skill": skill,
                "verified": bool(item.get("verified")),
                "evidence": _string_list(item.get("evidence")),
            }
        )
    return out


# ---------- deterministic fallback -------------------------------------------


def _derive_confidence(req: ResumeGithubMatchRequest) -> int:
    repos = req.repos
    if not repos:
        return 20
    signal = min(len(repos) * 12, 60)
    readme_bonus = sum(1 for r in repos if r.has_readme) * 3
    return min(signal + readme_bonus + 15, 95)


def _repo_signal_corpus(repos: List[GithubRepoSummary]) -> List[tuple[str, str]]:
    """(repo_name, lowercased searchable blob) for each repo."""
    corpus: List[tuple[str, str]] = []
    for r in repos:
        parts = [
            r.name,
            r.description or "",
            r.primary_language or "",
            " ".join(r.languages),
            " ".join(r.topics),
            " ".join(r.detected_frameworks),
            r.readme_excerpt or "",
        ]
        corpus.append((r.name, " ".join(parts).lower()))
    return corpus


def _fallback_report(req: ResumeGithubMatchRequest, *, reason: str = "") -> ResumeMatchReport:
    """Best-effort report when the LLM is unavailable.

    We can't parse the resume without the model, so we surface the GitHub repos
    we *did* find and flag that AI analysis was unavailable, keeping confidence
    low so the recruiter treats the result as a partial baseline.
    """
    corpus = _repo_signal_corpus(req.repos)
    repo_names = [name for name, _ in corpus]

    return ResumeMatchReport(
        alignment_score=0,
        confidence=max(_derive_confidence(req) - 25, 10),
        summary=(
            "AI analysis was unavailable, so this is a baseline view only. "
            f"Found {len(repo_names)} public repositories to compare against. "
            "Retry to get the full resume-vs-GitHub match."
        ),
        verdict="Inconclusive — retry for full analysis",
        resume=ParsedResume(),
        matched_projects=[],
        missing_projects=[],
        github_only_projects=[
            {"repo_name": name, "importance": "medium"} for name in repo_names
        ],
        unsupported_claims=[],
        skill_verification=[],
        recommendations=[
            "AI service was temporarily unavailable — please run the analysis again.",
        ]
        if reason
        else [],
    )
