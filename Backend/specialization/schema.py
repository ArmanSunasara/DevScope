"""Pydantic schemas for the Specialization Fit Checker.

These define both the inbound request shape and the validated outbound
report. They double as a contract document for the Node API and React UI.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------- Inbound -----------------------------------------------------------


class GithubRepoSummary(BaseModel):
    """Compressed repo summary produced by the Node-side analyzer.

    The LLM never sees raw README content beyond a truncated excerpt — only
    these structured signals — which is critical for token cost and for
    blunting prompt-injection attempts hidden in READMEs.
    """

    name: str
    description: Optional[str] = None
    stars: int = 0
    forks: int = 0
    size_kb: int = 0
    primary_language: Optional[str] = None
    languages: List[str] = Field(default_factory=list)
    topics: List[str] = Field(default_factory=list)
    has_readme: bool = False
    readme_excerpt: Optional[str] = None
    commit_count: int = 0
    last_pushed: Optional[str] = None
    is_fork: bool = False
    is_archived: bool = False
    has_ci: bool = False
    has_docker: bool = False
    has_kubernetes: bool = False
    has_tests: bool = False
    has_deployment: bool = False
    detected_frameworks: List[str] = Field(default_factory=list)
    license: Optional[str] = None


class GithubProfileSummary(BaseModel):
    username: str
    name: Optional[str] = None
    bio: Optional[str] = None
    public_repos: int = 0
    followers: int = 0
    following: int = 0
    account_age_years: float = 0.0
    total_stars: int = 0
    languages_distribution: Dict[str, int] = Field(default_factory=dict)
    contribution_signal: Optional[str] = None  # "low" | "moderate" | "high"


class SpecializationFitRequest(BaseModel):
    profile: GithubProfileSummary
    repos: List[GithubRepoSummary]
    role_id: str
    job_description: str = Field(..., min_length=20, max_length=8000)

    @field_validator("job_description")
    @classmethod
    def _strip_jd(cls, v: str) -> str:
        return v.strip()


# ---------- Outbound ----------------------------------------------------------


class RecommendedProject(BaseModel):
    title: str
    why: str
    difficulty: str = "intermediate"  # "beginner" | "intermediate" | "advanced"
    estimated_weeks: int = 2
    key_tech: List[str] = Field(default_factory=list)


class LearningStep(BaseModel):
    step: str
    duration: str
    resources: List[str] = Field(default_factory=list)


class HiringReadiness(BaseModel):
    level: str  # "Low" | "Moderate" | "High" | "Ready"
    estimated_time_to_ready: str
    rationale: str = ""


class RadarAxis(BaseModel):
    axis: str
    score: int = Field(..., ge=0, le=100)


class FitReport(BaseModel):
    role_id: str
    role_name: str
    fit_score: int = Field(..., ge=0, le=100)
    confidence: int = Field(..., ge=0, le=100)
    score_breakdown: Dict[str, int] = Field(default_factory=dict)
    strengths: List[str] = Field(default_factory=list)
    weak_areas: List[str] = Field(default_factory=list)
    github_weaknesses: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    matched_skills: List[str] = Field(default_factory=list)
    missing_projects: List[str] = Field(default_factory=list)
    recommended_improvements: List[str] = Field(default_factory=list)
    recommended_projects: List[RecommendedProject] = Field(default_factory=list)
    learning_path: List[LearningStep] = Field(default_factory=list)
    technologies_to_learn: List[str] = Field(default_factory=list)
    ats_suggestions: List[str] = Field(default_factory=list)
    resume_suggestions: List[str] = Field(default_factory=list)
    interview_questions: List[str] = Field(default_factory=list)
    hiring_readiness: HiringReadiness
    faang_readiness: Optional[Dict[str, Any]] = None
    radar: List[RadarAxis] = Field(default_factory=list)
    timeline_to_job_ready: str = ""
    summary: str = ""
