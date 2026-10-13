"""Shortlist batch builder.

Mirrors shortlistAnalyzer.service.js — extracts and deduplicates GitHub
usernames from parsed Excel rows, then fans out deep GitHub analyses with
bounded concurrency, gracefully dropping unreachable profiles into a
'skipped' bucket.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, List, Tuple

import httpx

from utils.extract_username import extract_username
from utils.cache import with_cache
from services.github_service import build_deep_analysis

logger = logging.getLogger("ml-service.shortlist_analyzer")

PROFILE_TTL_S = 10 * 60  # 10 minutes
DEFAULT_CONCURRENCY = 4


def _dedupe_candidates(
    rows: List[Dict[str, str]],
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    seen: Dict[str, Dict[str, Any]] = {}
    skipped: List[Dict[str, Any]] = []

    for row in rows:
        username = extract_username(row.get("github_url", ""))
        if not username:
            skipped.append({**row, "reason": "invalid_github_url"})
            continue
        key = username.lower()
        if key in seen:
            skipped.append({**row, "reason": "duplicate"})
            continue
        seen[key] = {**row, "github_username": username}

    return list(seen.values()), skipped


async def _fetch_single_candidate(row: Dict[str, Any]) -> Dict[str, Any]:
    """Fetch one candidate's deep GitHub analysis. Returns ok/error dict."""
    username: str = row["github_username"]
    try:
        analysis = await with_cache(
            f"gh:deep:{username.lower()}",
            PROFILE_TTL_S,
            lambda: build_deep_analysis(username),
        )
        return {
            "ok": True,
            "payload": {
                "github_url": row.get("github_url", ""),
                "name": row.get("name"),
                "email": row.get("email"),
                "college": row.get("college"),
                "resume_url": row.get("resume_url"),
                "linkedin_url": row.get("linkedin_url"),
                "profile": analysis["profile"],
                "repos": analysis["repos"],
                "_raw": analysis["raw"],
            },
        }
    except httpx.HTTPStatusError as exc:
        status = exc.response.status_code
        if status == 404:
            reason = "profile_not_found"
        elif status == 403:
            reason = "github_rate_limited"
        else:
            reason = "github_fetch_failed"
        return {"ok": False, "skipped": {**row, "reason": reason}}
    except Exception:
        logger.exception("Failed to fetch GitHub profile for %s", username)
        return {"ok": False, "skipped": {**row, "reason": "github_fetch_failed"}}


async def build_shortlist_batch(
    rows: List[Dict[str, str]],
    concurrency: int = DEFAULT_CONCURRENCY,
) -> Dict[str, Any]:
    """Process Excel rows into a batch of analyzed candidates.

    Returns:
        {
            "candidates": [ { profile, repos, _raw, ... }, ... ],
            "skipped":    [ { ...row, reason: str }, ... ],
        }
    """
    unique, skipped = _dedupe_candidates(rows)

    semaphore = asyncio.Semaphore(concurrency)

    async def _bounded(row: Dict[str, Any]) -> Dict[str, Any]:
        async with semaphore:
            return await _fetch_single_candidate(row)

    results = await asyncio.gather(*[_bounded(row) for row in unique])

    candidates = []
    all_skipped = list(skipped)
    for result in results:
        if result["ok"]:
            candidates.append(result["payload"])
        else:
            all_skipped.append(result["skipped"])

    return {"candidates": candidates, "skipped": all_skipped}
