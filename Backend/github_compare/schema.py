"""Schemas for the GitHub Profile Compare feature.

Two candidates' compressed GitHub signals come in (already produced by the
Node-side ``buildDeepAnalysis`` service the resume-match feature uses); one LLM
call returns scores per axis, strengths/weaknesses, a winner decision, and a
recruiter-style verdict.
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field

from specialization.schema import GithubProfileSummary, GithubRepoSummary


# ---------- Inbound -----------------------------------------------------------


class GithubCandidatePayload(BaseModel):
    profile: GithubProfileSummary
    repos: List[GithubRepoSummary] = Field(default_factory=list)


class GithubCompareRequest(BaseModel):
    candidate_a: GithubCandidatePayload
    candidate_b: GithubCandidatePayload


# ---------- Outbound ----------------------------------------------------------


class CandidateScores(BaseModel):
    overall: int = Field(0, ge=0, le=100)
    consistency: int = Field(0, ge=0, le=100)
    technical_depth: int = Field(0, ge=0, le=100)
    project_quality: int = Field(0, ge=0, le=100)
    open_source: int = Field(0, ge=0, le=100)
    impact: int = Field(0, ge=0, le=100)


class DetailedComparison(BaseModel):
    consistency: str = ""
    technical_depth: str = ""
    project_quality: str = ""
    collaboration: str = ""
    strengths_a: List[str] = Field(default_factory=list)
    strengths_b: List[str] = Field(default_factory=list)
    weaknesses_a: List[str] = Field(default_factory=list)
    weaknesses_b: List[str] = Field(default_factory=list)


class CompareReport(BaseModel):
    winner: str  # "A", "B", or "tie"
    winner_username: Optional[str] = None
    confidence: int = Field(0, ge=0, le=100)
    scores_a: CandidateScores
    scores_b: CandidateScores
    summary: str = ""
    detailed: DetailedComparison = Field(default_factory=DetailedComparison)
    final_verdict: str = ""
