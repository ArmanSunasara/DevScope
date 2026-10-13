import io
import openpyxl
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoints():
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json()["success"] is True
    assert r1.json()["status"] == "healthy"

    r2 = client.get("/api/health")
    assert r2.status_code == 200
    assert r2.json()["success"] is True


def test_specialization_roles_endpoints():
    # Public API route
    r1 = client.get("/api/specialization/roles")
    assert r1.status_code == 200
    data1 = r1.json()
    assert data1["success"] is True
    assert isinstance(data1["data"], list)
    assert len(data1["data"]) > 0
    role_ids = [role["id"] for role in data1["data"]]
    assert "frontend_engineer" in role_ids
    assert "backend_engineer" in role_ids

    # Legacy internal route
    r2 = client.get("/specialization/roles")
    assert r2.status_code == 200
    assert r2.json()["data"] == data1["data"]


def test_github_analyze_validation():
    # Missing / empty URL
    r1 = client.post("/api/github/analyze", json={"url": ""})
    assert r1.status_code in (400, 422)

    # Invalid URL format (e.g. not a valid GitHub handle/url)
    r2 = client.post("/api/github/analyze", json={"url": "https://unknown-domain.com/user"})
    assert r2.status_code == 400
    assert "error" in r2.json() or "detail" in r2.json()


def test_github_compare_validation():
    # Empty payload
    r1 = client.post("/api/github-compare/analyze", json={})
    assert r1.status_code in (400, 422)

    # Invalid profile A
    r2 = client.post("/api/github-compare/analyze", json={"profileA": "https://notgithub.com/abc", "profileB": "octocat"})
    assert r2.status_code == 400

    # Identical profiles
    r3 = client.post("/api/github-compare/analyze", json={"profileA": "octocat", "profileB": "https://github.com/octocat"})
    assert r3.status_code == 400
    assert "two different" in (r3.json().get("error") or str(r3.json().get("detail", "")))


def test_resume_match_validation():
    # Missing file
    r1 = client.post("/api/resume-match/analyze", data={"url": "octocat"})
    assert r1.status_code in (400, 422)

    # Invalid URL
    r2 = client.post(
        "/api/resume-match/analyze",
        data={"url": "https://gitlab.com/user"},
        files={"resume": ("resume.txt", b"A" * 100, "text/plain")}
    )
    assert r2.status_code == 400

    # Unsupported file type
    r3 = client.post(
        "/api/resume-match/analyze",
        data={"url": "octocat"},
        files={"resume": ("resume.exe", b"A" * 100, "application/octet-stream")}
    )
    assert r3.status_code == 400


def test_shortlist_validation():
    # Short JD
    r1 = client.post(
        "/api/shortlist/analyze",
        data={"jobDescription": "too short", "shortlistCount": "5"},
        files={"excel_file": ("test.xlsx", b"dummy", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert r1.status_code == 400

    # Invalid shortlist count
    r2 = client.post(
        "/api/shortlist/analyze",
        data={"jobDescription": "Valid job description of sufficient length for software engineering", "shortlistCount": "not_a_number"},
        files={"excel_file": ("test.xlsx", b"dummy", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    assert r2.status_code == 400

    # Invalid file extension
    r3 = client.post(
        "/api/shortlist/analyze",
        data={"jobDescription": "Valid job description of sufficient length for software engineering", "shortlistCount": "5"},
        files={"excel_file": ("test.pdf", b"dummy", "application/pdf")}
    )
    assert r3.status_code == 400


def test_specialization_validation():
    # Invalid roleId
    r1 = client.post(
        "/api/specialization/analyze",
        json={
            "url": "octocat",
            "roleId": "invalid-role-id-xyz",
            "jobDescription": "Valid job description of sufficient length for software engineering role"
        }
    )
    assert r1.status_code == 400
    assert "Unknown or invalid role" in (r1.json().get("error") or str(r1.json().get("detail", "")))

    # Short JD
    r2 = client.post(
        "/api/specialization/analyze",
        json={
            "url": "octocat",
            "roleId": "frontend_engineer",
            "jobDescription": "Too short"
        }
    )
    assert r2.status_code in (400, 422)


def test_legacy_analyze_validation():
    # Legacy /analyze route
    r = client.post("/analyze", json={"score": 85, "repoAnalysis": []})
    # Since repoAnalysis is empty, it runs generate_feedback which might need Groq or returns
    assert r.status_code in (200, 502)
