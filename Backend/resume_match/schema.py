"""Schemas for the Resume vs GitHub Match feature.

The Node layer extracts plain text from the uploaded resume (PDF / DOCX / TXT)
and runs the same GitHub deep-analysis the Specialization Fit Checker uses,
then forwards ``resume_text`` together with the compressed profile/repos here.

A single LLM call both *parses* the resume into structured projects/skills/
claims and *matches* those against the GitHub evidence — keeping latency to one
round-trip while giving the model full context for the comparison.
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

from specialization.schema import GithubProfileSummary, GithubRepoSummary


# ---------- Inbound -----------------------------------------------------------


class ResumeGithubMatchRequest(BaseModel):
    resume_text: str = Field(..., min_length=30, max_length=20000)
    profile: GithubProfileSummary
    repos: List[GithubRepoSummary] = Field(default_factory=list)

    @field_validator("resume_text")
    @classmethod
    def _strip_resume(cls, v: str) -> str:
        return v.strip()


# ---------- Outbound ----------------------------------------------------------


class ParsedProject(BaseModel):
    name: str
    description: str = ""
    technologies: List[str] = Field(default_factory=list)


class ParsedResume(BaseModel):
    candidate_name: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    projects: List[ParsedProject] = Field(default_factory=list)
    experience: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    education: List[str] = Field(default_factory=list)


class MatchedProject(BaseModel):
    resume_project: str
    github_repo: str = ""
    match_score: int = Field(0, ge=0, le=100)
    evidence: List[str] = Field(default_factory=list)
    verified_technologies: List[str] = Field(default_factory=list)
    notes: str = ""


class MissingProject(BaseModel):
    resume_project: str
    reason: str = ""


class GithubOnlyProject(BaseModel):
    repo_name: str
    importance: str = ""  # "low" | "medium" | "high"


class UnsupportedClaim(BaseModel):
    claim: str
    reason: str = ""
    severity: str = "medium"  # "low" | "medium" | "high"


class SkillVerification(BaseModel):
    skill: str
    verified: bool = False
    evidence: List[str] = Field(default_factory=list)


class ResumeMatchReport(BaseModel):
    alignment_score: int = Field(..., ge=0, le=100)
    confidence: int = Field(..., ge=0, le=100)
    summary: str = ""
    verdict: str = ""  # short recruiter-mode call, e.g. "Worth shortlisting"
    resume: ParsedResume = Field(default_factory=ParsedResume)
    matched_projects: List[MatchedProject] = Field(default_factory=list)
    missing_projects: List[MissingProject] = Field(default_factory=list)
    github_only_projects: List[GithubOnlyProject] = Field(default_factory=list)
    unsupported_claims: List[UnsupportedClaim] = Field(default_factory=list)
    skill_verification: List[SkillVerification] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
