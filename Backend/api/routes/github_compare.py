"""FastAPI route: POST /api/github-compare/analyze

Mirrors the Express /api/github-compare/analyze endpoint.
"""
from __future__ import annotations

import hashlib
import logging
from typing import Any, Dict

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from github_compare.schema import GithubCompareRequest, GithubCandidatePayload
from github_compare.service import analyze_github_compare
from services.github_service import build_deep_analysis
from utils.extract_username import extract_username
from utils.cache import with_cache

logger = logging.getLogger("ml-service.routes.github_compare")
router = APIRouter()

MAX_URL_LENGTH = 256
PROFILE_TTL_S = 10 * 60  # 10 minutes


class CompareRequest(BaseModel):
    profileA: str = Field(..., min_length=1, max_length=MAX_URL_LENGTH)
    profileB: str = Field(..., min_length=1, max_length=MAX_URL_LENGTH)

    @field_validator("profileA", "profileB")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()


@router.post("/analyze")
async def compare_github_profiles(request: CompareRequest) -> Dict[str, Any]:
    username_a = extract_username(request.profileA)
    username_b = extract_username(request.profileB)

    if not username_a:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": "profileA is not a valid GitHub URL or username"},
        )
    if not username_b:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": "profileB is not a valid GitHub URL or username"},
        )
    if username_a.lower() == username_b.lower():
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": "Please enter two different GitHub profiles to compare"},
        )

    # Fetch both in parallel, settle independently for per-user errors
    import asyncio
    result_a, result_b = await asyncio.gather(
        _fetch_cached(username_a),
        _fetch_cached(username_b),
        return_exceptions=True,
    )

    if isinstance(result_a, Exception):
        _raise_github_error(result_a, "Profile A", username_a)
    if isinstance(result_b, Exception):
        _raise_github_error(result_b, "Profile B", username_b)

    analysis_a = result_a  # type: ignore[assignment]
    analysis_b = result_b  # type: ignore[assignment]

    compare_req = GithubCompareRequest(
        candidate_a=GithubCandidatePayload(
            profile=analysis_a["profile"],
            repos=analysis_a["repos"],
        ),
        candidate_b=GithubCandidatePayload(
            profile=analysis_b["profile"],
            repos=analysis_b["repos"],
        ),
    )

    report = analyze_github_compare(compare_req)

    return {
        "success": True,
        "data": {
            "report": report.model_dump(),
            "candidates": {
                "A": {
                    "profile": analysis_a["profile"],
                    "avatarUrl": analysis_a["raw"]["avatar_url"],
                    "htmlUrl": analysis_a["raw"]["html_url"],
                    "topRepoNames": [r["name"] for r in analysis_a["repos"]],
                },
                "B": {
                    "profile": analysis_b["profile"],
                    "avatarUrl": analysis_b["raw"]["avatar_url"],
                    "htmlUrl": analysis_b["raw"]["html_url"],
                    "topRepoNames": [r["name"] for r in analysis_b["repos"]],
                },
            },
        },
    }


async def _fetch_cached(username: str) -> Dict[str, Any]:
    return await with_cache(
        f"gh:deep:{username.lower()}",
        PROFILE_TTL_S,
        lambda: build_deep_analysis(username),
    )


def _raise_github_error(exc: Exception, label: str, username: str) -> None:
    if isinstance(exc, httpx.HTTPStatusError):
        if exc.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": f"{label} ({username}) was not found on GitHub"},
            )
        if exc.response.status_code == 403:
            raise HTTPException(
                status_code=429,
                detail={"success": False, "error": "GitHub API rate limit reached. Please try again later."},
            )
    raise HTTPException(
        status_code=502,
        detail={"success": False, "error": f"Failed to fetch GitHub data for {label}"},
    )
