import io
import openpyxl
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

MOCK_PROFILE = {
    "login": "octocat",
    "name": "The Octocat",
    "avatar_url": "https://avatars.githubusercontent.com/u/583231?v=4",
    "html_url": "https://github.com/octocat",
    "bio": "GitHub's mascot",
    "public_repos": 8,
    "followers": 1000,
    "following": 9,
    "created_at": "2011-01-25T18:44:36Z",
}

MOCK_DEEP_ANALYSIS = {
    "profile": {
        "username": "octocat",
        "name": "The Octocat",
        "bio": "GitHub's mascot",
        "public_repos": 8,
        "followers": 1000,
        "following": 9,
        "account_age_years": 15.0,
        "total_stars": 50,
        "languages_distribution": {"Python": 1000, "JavaScript": 500},
        "contribution_signal": "high",
    },
    "repos": [
        {
            "name": "Hello-World",
            "description": "My first repo",
            "stars": 50,
            "forks": 10,
            "size_kb": 120,
            "primary_language": "Python",
            "languages": ["Python"],
            "topics": ["beginner"],
            "has_readme": True,
            "readme_excerpt": "Hello World project description",
            "commit_count": 25,
            "last_pushed": "2026-01-01T00:00:00Z",
            "is_fork": False,
            "is_archived": False,
            "has_ci": True,
            "has_docker": True,
            "has_kubernetes": False,
            "has_tests": True,
            "has_deployment": False,
            "detected_frameworks": ["fastapi", "docker", "ci/cd"],
            "license": "MIT",
        }
    ],
    "raw": {
        "avatar_url": "https://avatars.githubusercontent.com/u/583231?v=4",
        "html_url": "https://github.com/octocat",
    },
}


def test_e2e_github_analyze():
    with patch("api.routes.github.fetch_profile", new=AsyncMock(return_value=MOCK_PROFILE)), \
         patch("api.routes.github.fetch_repos", new=AsyncMock(return_value=[{"name": "Hello-World", "fork": False, "stargazers_count": 10}])), \
         patch("api.routes.github.simple_repo_analysis", new=AsyncMock(return_value=[{"name": "Hello-World", "stars": 10, "hasReadme": True, "commitCount": 20, "languages": ["Python"]}])), \
         patch("api.routes.github.generate_feedback", return_value={"summary": "Great profile", "recommendations": ["Add CI"]}):
        
        resp = client.post("/api/github/analyze", json={"url": "https://github.com/octocat"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["username"] == "octocat"
        assert data["avatarUrl"] == MOCK_PROFILE["avatar_url"]
        assert data["score"] > 0
        assert data["aiFeedback"]["summary"] == "Great profile"
        assert len(data["repoAnalysis"]) == 1


def test_e2e_github_compare():
    with patch("api.routes.github_compare._fetch_cached", new=AsyncMock(return_value=MOCK_DEEP_ANALYSIS)):
        mock_report = MagicMock()
        mock_report.model_dump.return_value = {
            "winner": "A",
            "verdict": "Candidate A demonstrates superior engineering depth.",
            "comparison_table": [],
        }
        with patch("api.routes.github_compare.analyze_github_compare", return_value=mock_report):
            resp = client.post(
                "/api/github-compare/analyze",
                json={"profileA": "octocat", "profileB": "torvalds"}
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert data["data"]["report"]["winner"] == "A"
            assert "A" in data["data"]["candidates"]
            assert "B" in data["data"]["candidates"]
            assert data["data"]["candidates"]["A"]["avatarUrl"] == MOCK_DEEP_ANALYSIS["raw"]["avatar_url"]


def test_e2e_resume_match():
    with patch("api.routes.resume_match.build_deep_analysis", new=AsyncMock(return_value=MOCK_DEEP_ANALYSIS)):
        mock_report = MagicMock()
        mock_report.model_dump.return_value = {
            "match_score": 88,
            "verdict": "Strong alignment with backend requirements.",
            "verified_skills": ["Python", "FastAPI"],
        }
        with patch("api.routes.resume_match.analyze_resume_github_match", return_value=mock_report):
            resume_content = (
                "Senior Software Engineer\n"
                "Skills: Python, FastAPI, Docker, Microservices, CI/CD pipelines.\n"
                "Experience: Built production APIs serving 10M requests daily."
            )
            resp = client.post(
                "/api/resume-match/analyze",
                data={"url": "octocat"},
                files={"resume": ("resume.txt", resume_content.encode("utf-8"), "text/plain")}
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert data["data"]["report"]["match_score"] == 88
            assert data["data"]["avatarUrl"] == MOCK_DEEP_ANALYSIS["raw"]["avatar_url"]


def test_e2e_specialization():
    with patch("api.routes.specialization.build_deep_analysis", new=AsyncMock(return_value=MOCK_DEEP_ANALYSIS)):
        mock_report = MagicMock()
        mock_report.model_dump.return_value = {
            "fit_score": 92,
            "role_title": "Backend Developer",
            "strengths": ["FastAPI expertise"],
        }
        with patch("api.routes.specialization.analyze_specialization_fit", return_value=mock_report):
            resp = client.post(
                "/api/specialization/analyze",
                json={
                    "url": "octocat",
                    "roleId": "backend_engineer",
                    "jobDescription": "We are seeking a senior Python backend developer skilled in FastAPI, async architecture, and database design."
                }
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert data["data"]["report"]["fit_score"] == 92
            assert data["data"]["avatarUrl"] == MOCK_DEEP_ANALYSIS["raw"]["avatar_url"]


def test_e2e_shortlist():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["Name", "GitHub URL", "Email"])
    ws.append(["Octocat", "https://github.com/octocat", "octo@github.com"])
    out = io.BytesIO()
    wb.save(out)
    excel_bytes = out.getvalue()

    with patch("services.shortlist_analyzer.build_deep_analysis", new=AsyncMock(return_value=MOCK_DEEP_ANALYSIS)):
        mock_result = MagicMock()
        mock_result.total_candidates = 1
        mock_result.shortlist_count = 1
        mock_reqs = MagicMock()
        mock_reqs.model_dump.return_value = {"must_have": ["Python"]}
        mock_result.jd_requirements = mock_reqs

        mock_candidate = MagicMock()
        mock_candidate.model_dump.return_value = {
            "name": "Octocat",
            "github_username": "octocat",
            "rank": 1,
            "fit_score": 95,
        }
        mock_candidate.github_username = "octocat"
        mock_result.shortlisted = [mock_candidate]

        with patch("api.routes.shortlist.shortlist_candidates", return_value=mock_result):
            resp = client.post(
                "/api/shortlist/analyze",
                data={
                    "jobDescription": "Looking for top-tier software engineers with open-source experience.",
                    "shortlistCount": "1",
                },
                files={
                    "excel_file": ("candidates.xlsx", excel_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                }
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert data["data"]["total_candidates"] == 1
            assert len(data["data"]["shortlisted"]) == 1
            assert data["data"]["shortlisted"][0]["avatar_url"] == MOCK_DEEP_ANALYSIS["raw"]["avatar_url"]
