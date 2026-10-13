import pytest
from utils.extract_username import extract_username
from utils.cache import cache_get, cache_set, with_cache, with_cache_sync
from utils.parse_resume import parse_resume
from utils.parse_excel import parse_shortlist_excel
import openpyxl
import io


def test_extract_username():
    # Valid handles
    assert extract_username("torvalds") == "torvalds"
    assert extract_username("octocat-123") == "octocat-123"
    assert extract_username("https://github.com/torvalds") == "torvalds"
    assert extract_username("https://github.com/torvalds/") == "torvalds"
    assert extract_username("http://github.com/torvalds.git") == "torvalds"
    assert extract_username("https://github.com/torvalds?tab=repositories") == "torvalds"

    # Invalid handles
    assert extract_username("") is None
    assert extract_username(None) is None
    assert extract_username("-invalid") is None
    assert extract_username("invalid-") is None
    assert extract_username("https://gitlab.com/torvalds") is None
    assert extract_username("https://example.com/notgithub") is None


def test_cache_sync_and_ttl():
    cache_set("test_key", "val_123", ttl_s=60)
    assert cache_get("test_key") == "val_123"
    assert cache_get("non_existent") is None

    # Expiry test
    cache_set("expired_key", "val_exp", ttl_s=-1)
    assert cache_get("expired_key") is None

    # with_cache_sync
    calls = 0
    def producer():
        nonlocal calls
        calls += 1
        return "produced"

    res1 = with_cache_sync("sync_key", 60, producer)
    assert res1 == "produced"
    assert calls == 1
    res2 = with_cache_sync("sync_key", 60, producer)
    assert res2 == "produced"
    assert calls == 1  # returned from cache


def test_cache_async():
    import asyncio

    calls = 0
    async def async_producer():
        nonlocal calls
        calls += 1
        return "async_value"

    async def _test():
        nonlocal calls
        val1 = await with_cache("async_key", 60, async_producer)
        assert val1 == "async_value"
        assert calls == 1
        val2 = await with_cache("async_key", 60, async_producer)
        assert val2 == "async_value"
        assert calls == 1

    asyncio.run(_test())


def test_parse_resume_plain_text():
    sample_text = ("Experienced software engineer with 5 years in Python, FastAPI, React, "
                   "Docker, PostgreSQL, and scalable microservices architectures.")
    parsed = parse_resume(sample_text.encode("utf-8"), "resume.txt", "text/plain")
    assert "FastAPI" in parsed
    assert "React" in parsed

    # Empty file error
    with pytest.raises(ValueError, match="Resume file is empty"):
        parse_resume(b"", "resume.txt", "text/plain")

    # Unsupported extension
    with pytest.raises(ValueError, match="Unsupported resume format"):
        parse_resume(b"some content that is long enough to pass length check", "resume.xyz", "application/xyz")

    # Too short content
    with pytest.raises(ValueError, match="Couldn't extract readable text"):
        parse_resume(b"too short", "resume.txt", "text/plain")


def test_parse_shortlist_excel():
    # Build a simple in-memory workbook
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["Name", "GitHub URL", "Email", "College"])
    ws.append(["Alice Smith", "https://github.com/alice", "alice@example.com", "MIT"])
    ws.append(["Bob Jones", "bob_dev", "bob@example.com", "Stanford"])
    ws.append(["Empty Guy", "", "", ""])

    out = io.BytesIO()
    wb.save(out)
    data = out.getvalue()

    candidates = parse_shortlist_excel(data)
    assert len(candidates) == 2
    assert candidates[0]["name"] == "Alice Smith"
    assert candidates[0]["github_url"] == "https://github.com/alice"
    assert candidates[1]["name"] == "Bob Jones"
    assert candidates[1]["github_url"] == "bob_dev"

    # Missing github_url column test
    wb_bad = openpyxl.Workbook()
    ws_bad = wb_bad.active
    ws_bad.append(["Name", "Email", "College"])
    ws_bad.append(["Alice", "a@a.com", "MIT"])
    out_bad = io.BytesIO()
    wb_bad.save(out_bad)

    with pytest.raises(ValueError, match='must include a "github_url" column'):
        parse_shortlist_excel(out_bad.getvalue())
