"""FastAPI route: POST /api/github/analyze

Mirrors the Express /api/github/analyze endpoint.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from services.github_service import (
    build_deep_analysis,
    calculate_advanced_score,
    fetch_profile,
    fetch_repos,
    simple_repo_analysis,
)
from analyzer import generate_feedback
from utils.extract_username import extract_username

logger = logging.getLogger("ml-service.routes.github")
router = APIRouter()

MAX_URL_LENGTH = 256


class AnalyzeGithubRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=MAX_URL_LENGTH)

    @field_validator("url")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()


@router.post("/analyze")
async def analyze_github(request: AnalyzeGithubRequest) -> Dict[str, Any]:
    url = request.url

    username = extract_username(url)
    if not username:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": "Invalid GitHub URL or username format"},
        )

    try:
        profile = await fetch_profile(username)
        repos = await fetch_repos(username)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "GitHub user not found"},
            )
        if exc.response.status_code == 403:
            raise HTTPException(
                status_code=429,
                detail={"success": False, "error": "GitHub API rate limit reached. Please try again later."},
            )
        raise HTTPException(
            status_code=502,
            detail={"success": False, "error": "GitHub API error"},
        )

    repo_analysis = await simple_repo_analysis(repos, profile["login"])
    score = calculate_advanced_score(repo_analysis)

    # Call the AI feedback endpoint (same Python module — no HTTP hop needed)
    ai_feedback = None
    try:
        ai_feedback = generate_feedback(
            {"score": score, "repoAnalysis": repo_analysis, "username": profile["login"]}
        )
    except Exception as ai_err:
        logger.warning("AI feedback unavailable: %s", ai_err)

    return {
        "success": True,
        "username": profile["login"],
        "avatarUrl": profile.get("avatar_url"),
        "bio": profile.get("bio"),
        "publicRepos": profile.get("public_repos"),
        "followers": profile.get("followers"),
        "following": profile.get("following"),
        "createdAt": profile.get("created_at"),
        "score": score,
        "repoAnalysis": repo_analysis,
        "aiFeedback": ai_feedback,
    }
