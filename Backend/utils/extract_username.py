"""Extract a GitHub username from a URL or bare handle.

Mirrors and hardens the logic in server/src/utils/extractUsername.js.
Supports:
  - Bare usernames ("torvalds", "octocat-123")
  - GitHub URLs ("https://github.com/torvalds", "http://github.com/torvalds.git")
  - Domain paths ("github.com/torvalds", "www.github.com/torvalds")
  - Query parameters / trailing slashes ("https://github.com/torvalds?tab=repositories")
Rejects non-GitHub domains ("gitlab.com", "notgithub.com") and invalid handles.
"""
from __future__ import annotations

import re
import urllib.parse

# GitHub username rules: 1-39 chars, alphanumeric + hyphens, no leading/trailing hyphen.
_USERNAME_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$")


def extract_username(url: str | None) -> str | None:
    """Return a validated GitHub username from a URL or bare handle, or None."""
    if not url or not isinstance(url, str):
        return None

    trimmed = url.strip()
    if not trimmed:
        return None

    candidate = trimmed
    if "://" in trimmed:
        try:
            parsed = urllib.parse.urlparse(trimmed)
            host = (parsed.hostname or "").lower()
            if host == "github.com" or host.endswith(".github.com"):
                parts = [p for p in parsed.path.split("/") if p]
                if parts:
                    candidate = parts[0]
                else:
                    return None
            else:
                return None
        except Exception:
            return None
    elif "/" in trimmed or ":" in trimmed:
        parts = [p for p in trimmed.split("/") if p]
        if parts and parts[0].lower() in ("github.com", "www.github.com"):
            if len(parts) > 1:
                candidate = parts[1]
            else:
                return None
        else:
            return None

    # Strip trailing .git
    candidate = re.sub(r"\.git$", "", candidate, flags=re.IGNORECASE).strip()

    return candidate if _USERNAME_RE.match(candidate) else None
