"""End-to-end GitHub Profile Compare orchestration: prompt -> LLM -> parse.

A single LLM call scores both candidates across the rubric and decides the
winner. If the call or the parse fails we return a low-confidence deterministic
fallback so the endpoint never hard-fails on a transient provider error.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List

from pydantic import ValidationError

from specialization.llm_client import extract_json_object, stream_completion
from specialization.schema import GithubProfileSummary, GithubRepoSummary

from .prompt_builder import build_messages
from .schema import (
    CandidateScores,
    CompareReport,
    DetailedComparison,
    GithubCompareRequest,
)

logger = logging.getLogger("ml-service.github_compare")


def analyze_github_compare(req: GithubCompareRequest) -> CompareReport:
    a = req.candidate_a
    b = req.candidate_b

    messages = build_messages(a.profile, a.repos, b.profile, b.repos)

    try:
        raw = stream_completion(messages, temperature=0.25, max_tokens=4096)
        parsed = _parse_llm_json(raw)
    except Exception as err:
        logger.exception("Compare LLM call failed; returning fallback report")
        return _fallback_report(req, reason=str(err))

    scores_a = _coerce_scores(_get_nested(parsed, "scores", "candidateA"))
    scores_b = _coerce_scores(_get_nested(parsed, "scores", "candidateB"))

    winner = _coerce_winner(parsed.get("winner"), scores_a.overall, scores_b.overall)
    winner_username = (
        a.profile.username
        if winner == "A"
        else b.profile.username
        if winner == "B"
        else None
    )

    detailed = _coerce_detailed(parsed.get("detailed_comparison"))

    payload: Dict[str, Any] = {
        "winner": winner,
        "winner_username": winner_username,
        "confidence": _coerce_int(
            parsed.get("confidence"), _derive_confidence(a.repos, b.repos)
        ),
        "scores_a": scores_a,
        "scores_b": scores_b,
        "summary": str(parsed.get("summary") or "").strip(),
        "detailed": detailed,
        "final_verdict": str(parsed.get("final_verdict") or "").strip(),
    }

    try:
        return CompareReport(**payload)
    except ValidationError:
        logger.exception("CompareReport validation failed; using fallback")
        return _fallback_report(req, reason="schema-validation-failed")


# ---------- parsing helpers ---------------------------------------------------


def _parse_llm_json(raw: str) -> Dict[str, Any]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return json.loads(extract_json_object(raw))


def _get_nested(obj: Any, *keys: str) -> Any:
    cur = obj
    for k in keys:
        if not isinstance(cur, dict):
            return None
        cur = cur.get(k)
    return cur


def _coerce_int(value: Any, default: int, lo: int = 0, hi: int = 100) -> int:
    try:
        n = int(value)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, n))


def _coerce_scores(value: Any) -> CandidateScores:
    if not isinstance(value, dict):
        return CandidateScores()
    return CandidateScores(
        overall=_coerce_int(value.get("overall"), 0),
        consistency=_coerce_int(value.get("consistency"), 0),
        technical_depth=_coerce_int(value.get("technical_depth"), 0),
        project_quality=_coerce_int(value.get("project_quality"), 0),
        open_source=_coerce_int(value.get("open_source"), 0),
        impact=_coerce_int(value.get("impact"), 0),
    )


def _coerce_winner(value: Any, score_a: int, score_b: int) -> str:
    if isinstance(value, str):
        v = value.strip().upper()
        if v in ("A", "B", "TIE"):
            return v if v != "TIE" else "tie"
    # Fall back to scores when the model omits or misformats winner.
    if score_a > score_b:
        return "A"
    if score_b > score_a:
        return "B"
    return "tie"


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


def _coerce_detailed(value: Any) -> DetailedComparison:
    if not isinstance(value, dict):
        return DetailedComparison()
    strengths = value.get("strengths") if isinstance(value.get("strengths"), dict) else {}
    weaknesses = value.get("weaknesses") if isinstance(value.get("weaknesses"), dict) else {}
    return DetailedComparison(
        consistency=str(value.get("consistency") or "").strip(),
        technical_depth=str(value.get("technical_depth") or "").strip(),
        project_quality=str(value.get("project_quality") or "").strip(),
        collaboration=str(value.get("collaboration") or "").strip(),
        strengths_a=_string_list(strengths.get("candidateA")),
        strengths_b=_string_list(strengths.get("candidateB")),
        weaknesses_a=_string_list(weaknesses.get("candidateA")),
        weaknesses_b=_string_list(weaknesses.get("candidateB")),
    )


# ---------- deterministic fallback -------------------------------------------


def _derive_confidence(
    repos_a: List[GithubRepoSummary], repos_b: List[GithubRepoSummary]
) -> int:
    if not repos_a and not repos_b:
        return 10
    signal = min(len(repos_a) + len(repos_b), 12) * 5
    readme_bonus = sum(1 for r in (*repos_a, *repos_b) if r.has_readme) * 2
    return min(signal + readme_bonus + 10, 90)


def _baseline_score(profile: GithubProfileSummary, repos: List[GithubRepoSummary]) -> int:
    if not repos and profile.public_repos == 0:
        return 0
    repo_factor = min(len(repos) * 6, 30)
    readme_factor = sum(1 for r in repos if r.has_readme) * 2
    eng_factor = sum(
        4 for r in repos if r.has_ci or r.has_docker or r.has_tests
    )
    star_factor = min((profile.total_stars or 0) // 5, 20)
    follow_factor = min((profile.followers or 0) // 10, 10)
    return min(repo_factor + readme_factor + eng_factor + star_factor + follow_factor, 95)


def _fallback_report(req: GithubCompareRequest, *, reason: str = "") -> CompareReport:
    """Best-effort report when the LLM is unavailable.

    We can't produce nuanced commentary, but a deterministic baseline score
    keeps the endpoint usable and the recruiter informed that this is partial.
    """
    a = req.candidate_a
    b = req.candidate_b

    overall_a = _baseline_score(a.profile, a.repos)
    overall_b = _baseline_score(b.profile, b.repos)

    scores_a = CandidateScores(overall=overall_a)
    scores_b = CandidateScores(overall=overall_b)

    if overall_a > overall_b:
        winner = "A"
        winner_username = a.profile.username
    elif overall_b > overall_a:
        winner = "B"
        winner_username = b.profile.username
    else:
        winner = "tie"
        winner_username = None

    summary = (
        "AI analysis was unavailable, so this is a baseline view only. "
        "Scores are based on simple GitHub signals (repo count, readmes, CI/CD, "
        "stars, followers) and should be re-run for the full comparison."
    )

    return CompareReport(
        winner=winner,
        winner_username=winner_username,
        confidence=max(_derive_confidence(a.repos, b.repos) - 30, 10),
        scores_a=scores_a,
        scores_b=scores_b,
        summary=summary,
        detailed=DetailedComparison(),
        final_verdict=(
            "Inconclusive — retry for full AI comparison."
            if reason
            else "Inconclusive — retry for full AI comparison."
        ),
    )
