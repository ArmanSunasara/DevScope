"""GitHub data-fetching service.

This is a complete port of the Node.js services:
  - githubDeepAnalyzer.service.js  (primary, for compare/specialization/resume-match/shortlist)
  - github.service.js              (simple profile+repos fetch)
  - repoAnalyzer.service.js        (simple analysis for /api/github/analyze)
  - scoring.service.js             (simple score for /api/github/analyze)

Uses httpx for async HTTP, mirrors all GitHub API calls, tree inspection,
framework detection, README sanitization, and score calculation logic.
"""
from __future__ import annotations

import asyncio
import base64
import logging
import os
import re
from typing import Any, Dict, List, Optional, Tuple

import httpx

logger = logging.getLogger("ml-service.github")

BASE_URL = "https://api.github.com"
TIMEOUT = 12.0  # seconds per request
MAX_TOP_REPOS = 6
README_EXCERPT_CHARS = 1200

# ---- framework detection (mirrors FRAMEWORK_HINTS in githubDeepAnalyzer.service.js) ----

_FRAMEWORK_HINTS: Dict[str, List[str]] = {
    "react":        ["react", "next", "vite"],
    "next.js":      ["next"],
    "express":      ["express"],
    "fastify":      ["fastify"],
    "nestjs":       ["@nestjs/"],
    "tailwind":     ["tailwindcss"],
    "vue":          ["vue"],
    "svelte":       ["svelte"],
    "django":       ["django"],
    "flask":        ["flask"],
    "fastapi":      ["fastapi"],
    "pytorch":      ["torch"],
    "tensorflow":   ["tensorflow"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "langchain":    ["langchain"],
    "llama-index":  ["llama-index", "llama_index"],
    "spring":       ["spring-boot", "org.springframework"],
    "gin":          ["gin-gonic/gin"],
    "actix":        ["actix-web"],
}

_MANIFEST_FILES = {
    "package.json", "requirements.txt", "pyproject.toml",
    "go.mod", "cargo.toml", "pom.xml", "build.gradle",
}

# ---- text sanitization -------------------------------------------------------

_CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b-\x1f\x7f]")


def _sanitize(text: str) -> str:
    text = _CONTROL_CHAR_RE.sub(" ", str(text or ""))
    text = text.replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{3,}", "  ", text)
    return text.strip()


def _truncate(text: str, n: int) -> str:
    return text[:n].rstrip() + "…" if len(text) > n else text


# ---- HTTP helpers ------------------------------------------------------------

def _get_headers() -> Dict[str, str]:
    token = os.getenv("GITHUB_TOKEN")
    return {"Authorization": f"Bearer {token}"} if token else {}


def _make_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        headers=_get_headers(),
        timeout=TIMEOUT,
        follow_redirects=True,
    )


async def _safe_get(client: httpx.AsyncClient, url: str, **kwargs: Any) -> Optional[Any]:
    """GET url; returns parsed JSON or None on any error."""
    try:
        resp = await client.get(url, **kwargs)
        resp.raise_for_status()
        return resp.json()
    except Exception:
        return None


def _decode_base64(b64: str) -> str:
    try:
        return base64.b64decode(b64.replace("\n", "")).decode("utf-8", errors="replace")
    except Exception:
        return ""


# ---- tree inspection (mirrors inspectTree in githubDeepAnalyzer.service.js) ----

def _inspect_tree(tree: Optional[List[Dict]]) -> Dict[str, Any]:
    signals: Dict[str, Any] = {
        "has_ci": False,
        "has_docker": False,
        "has_kubernetes": False,
        "has_tests": False,
        "has_deployment": False,
        "manifest_files": [],
    }
    if not isinstance(tree, list):
        return signals

    for node in tree:
        if not isinstance(node, dict):
            continue
        p = (node.get("path") or "").lower()

        if p.startswith(".github/workflows/") or p in (".gitlab-ci.yml", "circleci/config.yml", ".circleci/config.yml"):
            signals["has_ci"] = True
        if p in ("dockerfile",) or p.endswith("/dockerfile") or p in ("docker-compose.yml",) or p.endswith("/docker-compose.yml"):
            signals["has_docker"] = True
        if "k8s" in p or "kubernetes" in p or "helm" in p:
            signals["has_kubernetes"] = True
        if (
            p.startswith("tests/") or p.startswith("test/") or "__tests__/" in p
            or p.endswith((".test.js", ".test.ts", ".spec.js", ".spec.ts", "_test.go", "_test.py"))
            or p.startswith(("cypress/", "playwright/"))
        ):
            signals["has_tests"] = True
        if p in ("vercel.json", "netlify.toml", "render.yaml", "fly.toml", "app.yaml", "serverless.yml", "main.tf") or p.endswith("/terraform.tfstate"):
            signals["has_deployment"] = True

        filename = p.rsplit("/", 1)[-1]
        if filename in _MANIFEST_FILES:
            signals["manifest_files"].append(node.get("path") or p)

    return signals


def _detect_frameworks(filename: str, content: str) -> List[str]:
    lower = content.lower()
    hits = set()
    for name, needles in _FRAMEWORK_HINTS.items():
        if any(n in lower for n in needles):
            hits.add(name)
    fn = filename.lower()
    if fn == "package.json":
        hits.add("node.js")
    elif fn in ("requirements.txt", "pyproject.toml"):
        hits.add("python")
    elif fn == "go.mod":
        hits.add("go")
    elif fn == "cargo.toml":
        hits.add("rust")
    elif fn in ("pom.xml", "build.gradle"):
        hits.add("jvm")
    return list(hits)


# ---- Deep per-repo analysis --------------------------------------------------

async def _summarize_repo(
    client: httpx.AsyncClient,
    repo: Dict[str, Any],
    owner_login: str,
) -> Dict[str, Any]:
    owner = (repo.get("owner") or {}).get("login") or owner_login
    name = repo["name"]
    default_branch = repo.get("default_branch")

    # Fetch README, languages, commit count, tree in parallel
    readme_task = asyncio.create_task(
        _safe_get(client, f"{BASE_URL}/repos/{owner}/{name}/readme")
    )
    languages_task = asyncio.create_task(
        _safe_get(client, f"{BASE_URL}/repos/{owner}/{name}/languages")
    )
    commits_task = asyncio.create_task(
        _safe_get(client, f"{BASE_URL}/repos/{owner}/{name}/commits?per_page=100")
    )
    tree_url = (
        f"{BASE_URL}/repos/{owner}/{name}/git/trees/{default_branch}?recursive=1"
        if default_branch
        else None
    )
    tree_task = asyncio.create_task(
        _safe_get(client, tree_url) if tree_url else asyncio.sleep(0, result=None)
    )

    readme_data, languages_data, commits_data, tree_data = await asyncio.gather(
        readme_task, languages_task, commits_task, tree_task
    )

    # README
    readme_exists = False
    readme_excerpt = ""
    if isinstance(readme_data, dict) and readme_data.get("content"):
        readme_exists = True
        raw_text = _decode_base64(readme_data["content"])
        readme_excerpt = _truncate(_sanitize(raw_text), README_EXCERPT_CHARS)

    # Languages
    languages = list((languages_data or {}).keys())

    # Commit count
    commit_count = len(commits_data) if isinstance(commits_data, list) else 0

    # Tree signals
    tree_nodes = (tree_data or {}).get("tree") if isinstance(tree_data, dict) else None
    signals = _inspect_tree(tree_nodes)

    # Detect frameworks from manifests (max 2)
    detected = set()
    manifest_paths: List[str] = signals["manifest_files"][:2]
    for path in manifest_paths:
        content_data = await _safe_get(
            client,
            f"{BASE_URL}/repos/{owner}/{name}/contents/{path}"
        )
        if isinstance(content_data, dict) and content_data.get("content"):
            text = _decode_base64(content_data["content"])
            filename = path.rsplit("/", 1)[-1]
            for fw in _detect_frameworks(filename, text):
                detected.add(fw)

    if signals["has_docker"]:
        detected.add("docker")
    if signals["has_kubernetes"]:
        detected.add("kubernetes")
    if signals["has_ci"]:
        detected.add("ci/cd")

    license_info = repo.get("license") or {}
    return {
        "name": name,
        "description": _sanitize(repo.get("description") or ""),
        "stars": repo.get("stargazers_count") or 0,
        "forks": repo.get("forks_count") or 0,
        "size_kb": repo.get("size") or 0,
        "primary_language": repo.get("language"),
        "languages": languages,
        "topics": (repo.get("topics") or [])[:10],
        "has_readme": readme_exists,
        "readme_excerpt": readme_excerpt,
        "commit_count": commit_count,
        "last_pushed": repo.get("pushed_at"),
        "is_fork": bool(repo.get("fork")),
        "is_archived": bool(repo.get("archived")),
        "has_ci": signals["has_ci"],
        "has_docker": signals["has_docker"],
        "has_kubernetes": signals["has_kubernetes"],
        "has_tests": signals["has_tests"],
        "has_deployment": signals["has_deployment"],
        "detected_frameworks": list(detected),
        "license": license_info.get("spdx_id") if isinstance(license_info, dict) else None,
    }


# ---- Profile / repo aggregation helpers --------------------------------------

def _years_between(iso: Optional[str]) -> float:
    if not iso:
        return 0.0
    import datetime
    try:
        dt = datetime.datetime.fromisoformat(iso.replace("Z", "+00:00"))
        now = datetime.datetime.now(datetime.timezone.utc)
        return (now - dt).days / 365.25
    except Exception:
        return 0.0


def _aggregate_languages(summaries: List[Dict]) -> Dict[str, int]:
    totals: Dict[str, int] = {}
    for repo in summaries:
        lang = repo.get("primary_language")
        if lang:
            totals[lang] = totals.get(lang, 0) + max(repo.get("size_kb") or 1, 1)
    return totals


def _contribution_signal(profile: Dict, summaries: List[Dict]) -> str:
    import datetime
    now = datetime.datetime.now(datetime.timezone.utc)
    recent = 0
    for r in summaries:
        pushed = r.get("last_pushed")
        if not pushed:
            continue
        try:
            dt = datetime.datetime.fromisoformat(pushed.replace("Z", "+00:00"))
            if (now - dt).days < 180:
                recent += 1
        except Exception:
            pass
    if recent >= 5:
        return "high"
    if recent >= 2:
        return "moderate"
    return "low"


# ---- Public async API --------------------------------------------------------

async def fetch_profile(username: str) -> Dict[str, Any]:
    """Fetch a GitHub user profile. Raises httpx.HTTPStatusError on 404/403."""
    async with _make_client() as client:
        resp = await client.get(f"{BASE_URL}/users/{username}")
        resp.raise_for_status()
        return resp.json()


async def fetch_repos(username: str) -> List[Dict[str, Any]]:
    """Fetch all public repos for a user (up to 100, sorted by updated)."""
    async with _make_client() as client:
        resp = await client.get(
            f"{BASE_URL}/users/{username}/repos?per_page=100&sort=updated"
        )
        resp.raise_for_status()
        data = resp.json()
        return data if isinstance(data, list) else []


async def build_deep_analysis(username: str) -> Dict[str, Any]:
    """Build the full deep-analysis payload (profile + top repos + raw).

    This is the Python equivalent of buildDeepAnalysis() in
    githubDeepAnalyzer.service.js. The returned dict shape is:
        {
            "profile": { GithubProfileSummary fields },
            "repos":   [ GithubRepoSummary fields, ... ],
            "raw":     { "avatar_url": ..., "html_url": ... },
        }
    """
    async with _make_client() as client:
        # Fetch profile (let 404/403 propagate — callers handle them)
        profile_resp = await client.get(f"{BASE_URL}/users/{username}")
        profile_resp.raise_for_status()
        profile = profile_resp.json()

        repos_resp = await client.get(
            f"{BASE_URL}/users/{username}/repos?per_page=100&sort=updated"
        )
        repos_resp.raise_for_status()
        all_repos = repos_resp.json()
        if not isinstance(all_repos, list):
            all_repos = []

        # Rank: non-fork, non-archived, by stars then recency
        ranked = sorted(
            [r for r in all_repos if not r.get("fork") and not r.get("archived")],
            key=lambda r: (-(r.get("stargazers_count") or 0), r.get("pushed_at") or ""),
        )[:MAX_TOP_REPOS]

        summaries = await asyncio.gather(
            *[_summarize_repo(client, repo, profile["login"]) for repo in ranked]
        )
        summaries = list(summaries)

    total_stars = sum(r.get("stars") or 0 for r in summaries)

    profile_summary = {
        "username": profile["login"],
        "name": profile.get("name"),
        "bio": _sanitize(profile.get("bio") or ""),
        "public_repos": profile.get("public_repos") or 0,
        "followers": profile.get("followers") or 0,
        "following": profile.get("following") or 0,
        "account_age_years": _years_between(profile.get("created_at")),
        "total_stars": total_stars,
        "languages_distribution": _aggregate_languages(summaries),
        "contribution_signal": _contribution_signal(profile, summaries),
    }

    return {
        "profile": profile_summary,
        "repos": summaries,
        "raw": {
            "avatar_url": profile.get("avatar_url"),
            "html_url": profile.get("html_url"),
        },
    }


# ---- Simple analysis (for /api/github/analyze) --------------------------------
# Mirrors repoAnalyzer.service.js + scoring.service.js

async def simple_repo_analysis(
    repos: List[Dict], username: str
) -> List[Dict[str, Any]]:
    """Analyse the top-5 non-fork repos: readme, commits, languages.

    Mirrors analyzeRepos() from repoAnalyzer.service.js.
    """
    top_repos = sorted(
        [r for r in repos if not r.get("fork")],
        key=lambda r: -(r.get("stargazers_count") or 0),
    )[:5]

    async with _make_client() as client:

        async def _analyze_one(repo: Dict) -> Dict[str, Any]:
            owner = (repo.get("owner") or {}).get("login") or username
            name = repo["name"]
            readme_data, commits_data, lang_data = await asyncio.gather(
                _safe_get(client, f"{BASE_URL}/repos/{owner}/{name}/readme"),
                _safe_get(client, f"{BASE_URL}/repos/{owner}/{name}/commits?per_page=100"),
                _safe_get(client, f"{BASE_URL}/repos/{owner}/{name}/languages"),
            )
            return {
                "name": name,
                "stars": repo.get("stargazers_count") or 0,
                "hasReadme": readme_data is not None,
                "commitCount": len(commits_data) if isinstance(commits_data, list) else 0,
                "languages": list((lang_data or {}).keys()),
            }

        results = await asyncio.gather(*[_analyze_one(r) for r in top_repos])
    return list(results)


def calculate_advanced_score(repo_analysis: List[Dict]) -> int:
    """Calculate a portfolio score from repo signals.

    Mirrors calculateAdvancedScore() from scoring.service.js.
    """
    if not repo_analysis:
        return 0
    total = len(repo_analysis)

    readme_score = sum(1 for r in repo_analysis if r.get("hasReadme")) / total
    commit_score = sum(1 for r in repo_analysis if (r.get("commitCount") or 0) > 5) / total

    lang_set: set = set()
    for r in repo_analysis:
        for lang in r.get("languages") or []:
            lang_set.add(lang)
    language_score = min(len(lang_set) / 4, 1)

    total_stars = sum(r.get("stars") or 0 for r in repo_analysis)
    star_score = min(total_stars / 50, 1)

    avg_commits = sum(r.get("commitCount") or 0 for r in repo_analysis) / total
    consistency_score = min(avg_commits / 20, 1)

    score = (
        readme_score * 25
        + commit_score * 25
        + language_score * 20
        + star_score * 15
        + consistency_score * 15
    )
    return min(round(score), 100)
