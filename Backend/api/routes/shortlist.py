"""FastAPI route: POST /api/shortlist/analyze

Mirrors the Express /api/shortlist/analyze multipart endpoint.
"""
from __future__ import annotations

import logging
from typing import Any, Dict

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from shortlist.schema import CandidateInput, CandidateShortlistRequest
from shortlist.service import shortlist_candidates
from services.shortlist_analyzer import build_shortlist_batch
from utils.parse_excel import parse_shortlist_excel

logger = logging.getLogger("ml-service.routes.shortlist")
router = APIRouter()

MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB
ACCEPTED_EXTENSIONS = {"xlsx", "xls", "xlsm"}
MIN_JD_LENGTH = 20
MAX_JD_LENGTH = 8000
MIN_COUNT = 1
MAX_COUNT = 100


@router.post("/analyze")
async def analyze_shortlist(
    jobDescription: str = Form(...),
    shortlistCount: str = Form(...),
    excel_file: UploadFile = File(...),
) -> Dict[str, Any]:
    # Validate job description
    jd = jobDescription.strip()
    if len(jd) < MIN_JD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": f"Job description must be at least {MIN_JD_LENGTH} characters"},
        )
    if len(jd) > MAX_JD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": f"Job description must be {MAX_JD_LENGTH} characters or fewer"},
        )

    # Validate shortlist count
    try:
        count = int(shortlistCount)
        if count < MIN_COUNT or count > MAX_COUNT:
            raise ValueError
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": f"Shortlist count must be an integer between {MIN_COUNT} and {MAX_COUNT}"},
        )

    # Validate file extension
    filename = excel_file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ACCEPTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": "Only .xlsx, .xls, or .xlsm files are supported"},
        )

    # Read file with size cap
    data = await excel_file.read(MAX_FILE_BYTES + 1)
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=413,
            detail={"success": False, "error": "Uploaded file is too large"},
        )

    # Parse Excel
    try:
        rows = parse_shortlist_excel(data)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": str(exc)},
        )

    if not rows:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": "No candidate rows found in the uploaded sheet"},
        )

    # Fan out GitHub analysis
    batch = await build_shortlist_batch(rows)
    candidates = batch["candidates"]
    skipped = batch["skipped"]

    if not candidates:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "None of the GitHub profiles could be analyzed. Check the URLs and try again.",
                "skipped": skipped,
            },
        )

    # Build index for avatar enrichment
    raw_by_username = {
        c["profile"]["username"].lower(): c["_raw"]
        for c in candidates
    }

    # Build CandidateInput list (strip _raw before sending to ML service)
    candidate_inputs = [
        CandidateInput(
            github_url=c["github_url"],
            name=c.get("name"),
            email=c.get("email"),
            college=c.get("college"),
            resume_url=c.get("resume_url"),
            linkedin_url=c.get("linkedin_url"),
            profile=c["profile"],
            repos=c["repos"],
        )
        for c in candidates
    ]

    shortlist_req = CandidateShortlistRequest(
        job_description=jd,
        shortlist_count=count,
        candidates=candidate_inputs,
    )

    try:
        result = shortlist_candidates(shortlist_req)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"success": False, "error": str(exc)},
        )
    except Exception:
        logger.exception("Shortlist analysis failed")
        raise HTTPException(
            status_code=502,
            detail={"success": False, "error": "Failed to shortlist candidates. Please try again later."},
        )

    # Enrich shortlisted candidates with avatar_url / html_url from GitHub fetch
    enriched = []
    for entry in result.shortlisted:
        entry_dict = entry.model_dump()
        raw = raw_by_username.get((entry.github_username or "").lower(), {})
        entry_dict["avatar_url"] = raw.get("avatar_url") or entry_dict.get("avatar_url")
        entry_dict["html_url"] = raw.get("html_url")
        enriched.append(entry_dict)

    return {
        "success": True,
        "data": {
            "total_candidates": result.total_candidates,
            "shortlist_count": result.shortlist_count,
            "jd_requirements": result.jd_requirements.model_dump(),
            "shortlisted": enriched,
            "skipped": skipped,
        },
    }
