"""Schemas for the Candidate Shortlist feature.

The Node layer fans out GitHub deep-analysis for every candidate (reusing the
same compressed profile/repos shape the Specialization Fit Checker already
sends), then forwards the batch here together with the JD and the requested
shortlist count.
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

from specialization.schema import GithubProfileSummary, GithubRepoSummary


# ---------- Inbound -----------------------------------------------------------


class CandidateInput(BaseModel):
    """One candidate's pre-fetched GitHub profile, plus optional roster fields.

    Roster fields (name, email, college, etc.) come straight from the uploaded
    Excel sheet — they are echoed back in the response but never sent to the LLM.
    """

    github_url: str
    name: Optional[str] = None
    email: Optional[str] = None
    college: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    profile: GithubProfileSummary
    repos: List[GithubRepoSummary] = Field(default_factory=list)


class CandidateShortlistRequest(BaseModel):
    job_description: str = Field(..., min_length=20, max_length=8000)
    shortlist_count: int = Field(..., ge=1, le=100)
    candidates: List[CandidateInput] = Field(..., min_length=1, max_length=300)

    @field_validator("job_description")
    @classmethod
    def _strip_jd(cls, v: str) -> str:
        return v.strip()


# ---------- Outbound ----------------------------------------------------------


class JDRequirements(BaseModel):
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    experience_areas: List[str] = Field(default_factory=list)
    project_types: List[str] = Field(default_factory=list)
    seniority_level: str = ""


class ShortlistedCandidate(BaseModel):
    rank: int = Field(..., ge=1)
    candidate_name: Optional[str] = None
    github_url: str
    github_username: str
    avatar_url: Optional[str] = None
    match_score: int = Field(..., ge=0, le=100)
    confidence: int = Field(0, ge=0, le=100)
    specializations: List[str] = Field(default_factory=list)
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    notable_projects: List[str] = Field(default_factory=list)
    reason_for_shortlist: str = ""
    # Pass-through roster fields so the recruiter UI can render them.
    email: Optional[str] = None
    college: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class ShortlistResponse(BaseModel):
    total_candidates: int
    shortlist_count: int
    jd_requirements: JDRequirements
    shortlisted: List[ShortlistedCandidate]
