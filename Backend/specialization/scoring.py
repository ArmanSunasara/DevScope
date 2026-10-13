"""Deterministic scoring engine used as a *prior* and *guardrail* around the LLM.

The LLM is creative but inconsistent; this engine gives a baseline weighted
fit score from concrete signals. If the LLM hallucinates a score wildly out
of line with the prior, we blend toward the prior.

Weights (sum = 100):
- core_skills_match     35
- project_relevance     25
- production_readiness  15
- architecture_maturity 10
- profile_quality        5
- jd_keyword_match      10
"""
from __future__ import annotations

import re
from typing import Dict, Iterable, List, Tuple

from .roles import Role
from .schema import GithubProfileSummary, GithubRepoSummary


WEIGHTS = {
    "core_skills_match": 35,
    "project_relevance": 25,
    "production_readiness": 15,
    "architecture_maturity": 10,
    "profile_quality": 5,
    "jd_keyword_match": 10,
}


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9+]", "", s.lower())


def _candidate_signals(repos: List[GithubRepoSummary]) -> set[str]:
    bag: set[str] = set()
    for repo in repos:
        for lang in repo.languages:
            bag.add(_norm(lang))
        for fw in repo.detected_frameworks:
            bag.add(_norm(fw))
        for topic in repo.topics:
            bag.add(_norm(topic))
        if repo.primary_language:
            bag.add(_norm(repo.primary_language))
    return bag


def _match_skill(skill: str, bag: Iterable[str]) -> bool:
    target = _norm(skill)
    if not target:
        return False
    return any(target in candidate or candidate in target for candidate in bag if candidate)


def core_skills_score(role: Role, repos: List[GithubRepoSummary]) -> Tuple[int, List[str], List[str]]:
    bag = _candidate_signals(repos)
    matched: List[str] = []
    missing: List[str] = []
    for skill in role.core_skills:
        if _match_skill(skill, bag):
            matched.append(skill)
        else:
            missing.append(skill)
    if not role.core_skills:
        return 0, matched, missing
    ratio = len(matched) / len(role.core_skills)
    return round(ratio * 100), matched, missing


def project_relevance_score(role: Role, repos: List[GithubRepoSummary]) -> int:
    if not repos:
        return 0
    role_keywords = [_norm(s) for s in role.core_skills + role.expected_projects]
    role_keywords = [k for k in role_keywords if len(k) >= 3]
    if not role_keywords:
        return 0

    relevant = 0
    for repo in repos:
        if repo.is_fork or repo.is_archived:
            continue
        haystack = " ".join(
            [
                _norm(repo.description or ""),
                _norm(repo.primary_language or ""),
                " ".join(_norm(t) for t in repo.topics),
                " ".join(_norm(t) for t in repo.detected_frameworks),
                _norm(repo.readme_excerpt or ""),
            ]
        )
        if any(k in haystack for k in role_keywords):
            relevant += 1
    ratio = min(relevant / max(min(len(repos), 5), 1), 1.0)
    return round(ratio * 100)


def production_readiness_score(repos: List[GithubRepoSummary]) -> int:
    if not repos:
        return 0
    points = 0.0
    max_points = 0.0
    for repo in repos[:5]:
        max_points += 5
        if repo.has_ci:
            points += 1.5
        if repo.has_tests:
            points += 1.5
        if repo.has_docker:
            points += 1.0
        if repo.has_deployment:
            points += 1.0
    if max_points == 0:
        return 0
    return min(round((points / max_points) * 100), 100)


def architecture_maturity_score(repos: List[GithubRepoSummary]) -> int:
    if not repos:
        return 0
    score = 0.0
    for repo in repos[:5]:
        complexity = min(repo.size_kb / 5000, 1.0) * 30
        framework_breadth = min(len(repo.detected_frameworks) / 4, 1.0) * 30
        k8s_bonus = 20 if repo.has_kubernetes else 0
        commit_depth = min(repo.commit_count / 50, 1.0) * 20
        score = max(score, complexity + framework_breadth + k8s_bonus + commit_depth)
    return min(round(score), 100)


def profile_quality_score(profile: GithubProfileSummary, repos: List[GithubRepoSummary]) -> int:
    bio_pts = 20 if profile.bio else 0
    age_pts = min(profile.account_age_years / 3, 1.0) * 25
    followers_pts = min(profile.followers / 50, 1.0) * 20
    stars_pts = min(profile.total_stars / 25, 1.0) * 20
    readme_ratio = (
        sum(1 for r in repos if r.has_readme) / max(len(repos), 1) if repos else 0
    )
    readme_pts = readme_ratio * 15
    return min(round(bio_pts + age_pts + followers_pts + stars_pts + readme_pts), 100)


_WORD_RE = re.compile(r"[A-Za-z][A-Za-z0-9+.#-]{2,}")


def _jd_keywords(jd: str) -> List[str]:
    raw = _WORD_RE.findall(jd)
    seen: dict[str, None] = {}
    for tok in raw:
        key = tok.lower()
        if key in _STOPWORDS:
            continue
        seen.setdefault(key, None)
    return list(seen.keys())[:40]


def jd_match_score(jd: str, repos: List[GithubRepoSummary], profile: GithubProfileSummary) -> int:
    keywords = _jd_keywords(jd)
    if not keywords:
        return 0
    bag = _candidate_signals(repos)
    bag.update(_norm(k) for k in profile.languages_distribution.keys())
    if profile.bio:
        bag.update(_norm(w) for w in profile.bio.split())
    matched = sum(1 for k in keywords if _match_skill(k, bag))
    return round(min(matched / max(len(keywords) * 0.4, 1), 1.0) * 100)


def compute_prior(
    role: Role,
    profile: GithubProfileSummary,
    repos: List[GithubRepoSummary],
    job_description: str,
) -> Dict[str, object]:
    core, matched, missing = core_skills_score(role, repos)
    proj = project_relevance_score(role, repos)
    prod = production_readiness_score(repos)
    arch = architecture_maturity_score(repos)
    profq = profile_quality_score(profile, repos)
    jdm = jd_match_score(job_description, repos, profile)

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
        "score_breakdown": breakdown,
        "matched_skills": matched,
        "missing_skills": missing,
    }


def blend(llm_score: int, prior_score: int) -> int:
    """Pull the LLM score toward the deterministic prior if they diverge wildly."""
    if abs(llm_score - prior_score) <= 12:
        return llm_score
    return round(0.6 * llm_score + 0.4 * prior_score)


_STOPWORDS = {
    "the","and","for","with","you","your","our","are","will","have","has",
    "this","that","into","from","work","role","team","using","across","ability",
    "experience","including","such","strong","good","excellent","proven","plus",
    "knowledge","skills","required","preferred","must","should","ideally","etc",
    "responsibilities","candidate","candidates","developer","engineer","engineering",
    "software","year","years","new","build","building","working","ensure","help",
    "ability","strong","ability","etc.","please","apply","applying","company","our",
}
