import os
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional

# Existing ML feature modules
from analyzer import generate_feedback
from github_compare import analyze_github_compare
from github_compare.schema import GithubCompareRequest
from resume_match import analyze_resume_github_match
from resume_match.schema import ResumeGithubMatchRequest
from shortlist import shortlist_candidates
from shortlist.schema import CandidateShortlistRequest
from specialization import analyze_specialization_fit, list_roles
from specialization.schema import SpecializationFitRequest

# New public API routes (formerly Express)
from api.routes import github as github_router
from api.routes import github_compare as github_compare_router
from api.routes import resume_match as resume_match_router
from api.routes import shortlist as shortlist_router
from api.routes import specialization as specialization_router

logger = logging.getLogger("ml-service")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="GitHub Portfolio Analyzer",
    description="AI-powered GitHub portfolio analysis platform (unified FastAPI backend)",
    version="2.0.0",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

# Accept origins from env; default includes both the React dev server and
# the old Express port (in case the frontend is still warming up).
_raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000",
)
origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Global exception handler — return JSON { success: false, error: "..." }
# ---------------------------------------------------------------------------

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, dict):
        return JSONResponse(status_code=exc.status_code, content=detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": str(detail)},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s", request.url)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"},
    )

# ---------------------------------------------------------------------------
# Health check (available at both /health and /api/health)
# ---------------------------------------------------------------------------

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "success": True,
        "status": "healthy",
        "service": "github-portfolio-analyzer",
    }

# ---------------------------------------------------------------------------
# Public API routes — formerly served by Express
# These are the routes the React frontend calls directly.
# ---------------------------------------------------------------------------

app.include_router(github_router.router, prefix="/api/github", tags=["GitHub"])
app.include_router(github_compare_router.router, prefix="/api/github-compare", tags=["GitHub Compare"])
app.include_router(resume_match_router.router, prefix="/api/resume-match", tags=["Resume Match"])
app.include_router(shortlist_router.router, prefix="/api/shortlist", tags=["Shortlist"])
app.include_router(specialization_router.router, prefix="/api/specialization", tags=["Specialization"])

# ---------------------------------------------------------------------------
# Legacy internal ML-service endpoints (kept for backward compatibility /
# internal use; the new /api/* routes above call these Python functions
# directly instead of via HTTP).
# ---------------------------------------------------------------------------

class RepoAnalysis(BaseModel):
    name: str
    stars: int = 0
    hasReadme: bool = False
    commitCount: int = 0
    languages: List[str] = Field(default_factory=list)


class AnalyzeRequest(BaseModel):
    score: int = Field(..., ge=0, le=100)
    repoAnalysis: List[RepoAnalysis] = Field(...)
    username: Optional[str] = None


@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        data = {
            "score": request.score,
            "repoAnalysis": [repo.model_dump() for repo in request.repoAnalysis],
            "username": request.username,
        }
        result = generate_feedback(data)
        return {"success": True, "data": result}
    except Exception as e:
        logger.exception("Failed to generate feedback")
        raise HTTPException(
            status_code=502,
            detail="Failed to generate feedback. Please try again later.",
        ) from e


@app.get("/specialization/roles")
async def specialization_roles():
    return {"success": True, "data": list_roles()}


@app.post("/specialization/analyze")
async def specialization_analyze(request: SpecializationFitRequest):
    try:
        report = analyze_specialization_fit(request)
        return {"success": True, "data": report.model_dump()}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.exception("Specialization fit analysis failed")
        raise HTTPException(
            status_code=502,
            detail="Failed to analyze specialization fit. Please try again later.",
        ) from e


@app.post("/resume-match/analyze")
async def resume_match_analyze(request: ResumeGithubMatchRequest):
    try:
        report = analyze_resume_github_match(request)
        return {"success": True, "data": report.model_dump()}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.exception("Resume vs GitHub match failed")
        raise HTTPException(
            status_code=502,
            detail="Failed to analyze resume vs GitHub. Please try again later.",
        ) from e


@app.post("/github-compare/analyze")
async def github_compare_analyze(request: GithubCompareRequest):
    try:
        report = analyze_github_compare(request)
        return {"success": True, "data": report.model_dump()}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.exception("GitHub compare failed")
        raise HTTPException(
            status_code=502,
            detail="Failed to compare GitHub profiles. Please try again later.",
        ) from e


@app.post("/shortlist/analyze")
async def shortlist_analyze(request: CandidateShortlistRequest):
    try:
        result = shortlist_candidates(request)
        return {"success": True, "data": result.model_dump()}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.exception("Candidate shortlist failed")
        raise HTTPException(
            status_code=502,
            detail="Failed to shortlist candidates. Please try again later.",
        ) from e
