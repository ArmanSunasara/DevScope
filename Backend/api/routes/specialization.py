"""FastAPI routes: GET /api/specialization/roles, POST /api/specialization/analyze

Mirrors the Express /api/specialization/* endpoints.
"""
from __future__ import annotations

import hashlib
import logging
from typing import Any, Dict

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from specialization.schema import SpecializationFitRequest
from specialization.service import analyze_specialization_fit
from specialization.roles import list_roles, ROLES
from services.github_service import build_deep_analysis
from utils.cache import with_cache
from utils.extract_username import extract_username

logger = logging.getLogger("ml-service.routes.specialization")
router = APIRouter()

MAX_URL_LENGTH = 256
MAX_ROLE_ID_LENGTH = 64
MIN_JD_LENGTH = 20
MAX_JD_LENGTH = 8000
PROFILE_TTL_S = 10 * 60   # 10 minutes
REPORT_TTL_S = 30 * 60    # 30 minutes

ALLOWED_ROLES = set(ROLES.keys())


class SpecializationRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=MAX_URL_LENGTH)
    roleId: str = Field(..., min_length=1, max_length=MAX_ROLE_ID_LENGTH)
    jobDescription: str = Field(..., min_length=MIN_JD_LENGTH, max_length=MAX_JD_LENGTH)

    @field_validator("url", "roleId", "jobDescription")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()


@router.get("/roles")
async def get_roles() -> Dict[str, Any]:
    return {"success": True, "data": list_roles()}


@router.post("/analyze")
async def analyze_specialization(request: SpecializationRequest) -> Dict[str, Any]:
    username = extract_username(request.url)
    if not username:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": "Invalid GitHub URL or username"},
        )

    if request.roleId not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": "Unknown or invalid role"},
        )

    # Fetch GitHub analysis (cached per user)
    try:
        analysis = await with_cache(
            f"gh:deep:{username.lower()}",
            PROFILE_TTL_S,
            lambda: build_deep_analysis(username),
        )
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
            detail={"success": False, "error": "Failed to fetch GitHub data"},
        )

    # Cache report by (user, role, JD hash)
    jd_hash = hashlib.sha256(request.jobDescription.encode()).hexdigest()[:16]
    report_key = f"fit:{username.lower()}:{request.roleId}:{jd_hash}"

    def _run_analysis() -> Any:
        req = SpecializationFitRequest(
            profile=analysis["profile"],
            repos=analysis["repos"],
            role_id=request.roleId,
            job_description=request.jobDescription,
        )
        return analyze_specialization_fit(req)

    try:
        report = await with_cache(report_key, REPORT_TTL_S, lambda: _async_run(_run_analysis))
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": str(exc)},
        )
    except Exception:
        logger.exception("Specialization analysis failed")
        raise HTTPException(
            status_code=502,
            detail={"success": False, "error": "Failed to analyze specialization fit. Please try again later."},
        )

    return {
        "success": True,
        "data": {
            "report": report.model_dump() if hasattr(report, "model_dump") else report,
            "profile": analysis["profile"],
            "avatarUrl": analysis["raw"]["avatar_url"],
            "htmlUrl": analysis["raw"]["html_url"],
            "topRepoNames": [r["name"] for r in analysis["repos"]],
        },
    }


async def _async_run(fn):
    """Run a sync function in the async context (it may block briefly)."""
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, fn)
