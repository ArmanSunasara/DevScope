"""FastAPI route: POST /api/resume-match/analyze

Mirrors the Express /api/resume-match/analyze multipart endpoint.
"""
from __future__ import annotations

import logging
from typing import Any, Dict

import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from resume_match.schema import ResumeGithubMatchRequest
from resume_match.service import analyze_resume_github_match
from services.github_service import build_deep_analysis
from utils.cache import with_cache
from utils.extract_username import extract_username
from utils.parse_resume import parse_resume

logger = logging.getLogger("ml-service.routes.resume_match")
router = APIRouter()

MAX_URL_LENGTH = 256
ACCEPTED_EXTENSIONS = {"pdf", "docx", "txt", "md"}
MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB
PROFILE_TTL_S = 10 * 60  # 10 minutes


@router.post("/analyze")
async def analyze_resume_match(
    url: str = Form(...),
    resume: UploadFile = File(...),
) -> Dict[str, Any]:
    # Validate URL
    url = url.strip()
    if not url:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": "GitHub URL is required"},
        )
    if len(url) > MAX_URL_LENGTH:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": f"GitHub URL must be {MAX_URL_LENGTH} characters or fewer"},
        )

    username = extract_username(url)
    if not username:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": "Invalid GitHub URL or username"},
        )

    # Validate resume file extension
    filename = resume.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ACCEPTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": "Only PDF, DOCX, or TXT resumes are supported"},
        )

    # Read file with size cap
    data = await resume.read(MAX_FILE_BYTES + 1)
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=413,
            detail={"success": False, "error": "Uploaded file is too large"},
        )

    # Parse resume text
    try:
        resume_text = parse_resume(data, filename, resume.content_type or "")
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": str(exc)},
        )

    # Fetch GitHub analysis (cached)
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

    # LLM analysis
    try:
        req = ResumeGithubMatchRequest(
            resume_text=resume_text,
            profile=analysis["profile"],
            repos=analysis["repos"],
        )
        report = analyze_resume_github_match(req)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": str(exc)},
        )
    except Exception as exc:
        logger.exception("Resume-match analysis failed")
        raise HTTPException(
            status_code=502,
            detail={"success": False, "error": "Failed to analyze resume vs GitHub. Please try again later."},
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
