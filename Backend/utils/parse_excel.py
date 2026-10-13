"""Excel parser for the Candidate Shortlist feature.

Mirrors the logic in server/src/utils/parseShortlistExcel.js using openpyxl.

Only the first worksheet is read. The first non-empty row is the header.
Column matching is case- and whitespace-insensitive.

Required column : github_url  (aliases: github, github url, profile, github profile)
Optional columns: name, email, college, resume_url, linkedin_url
"""
from __future__ import annotations

import io
import re
from typing import Any, Dict, List, Optional

HEADER_ALIASES: Dict[str, List[str]] = {
    "github_url":   ["github_url", "github url", "github", "profile", "github profile"],
    "name":         ["name", "full name", "student name", "candidate", "candidate name"],
    "email":        ["email", "email id", "email address"],
    "college":      ["college", "university", "institute", "school"],
    "resume_url":   ["resume_url", "resume url", "resume", "cv", "cv url"],
    "linkedin_url": ["linkedin_url", "linkedin url", "linkedin"],
}


def _normalize(value: Any) -> str:
    return re.sub(r"[\s_-]+", " ", str(value or "").strip().lower())


def _cell_to_string(cell_value: Any) -> str:
    if cell_value is None:
        return ""
    return str(cell_value).strip()


def _build_header_map(header_row: List[str]) -> Dict[str, int]:
    mapping: Dict[str, int] = {}
    for idx, raw_header in enumerate(header_row):
        norm = _normalize(raw_header)
        if not norm:
            continue
        for field, aliases in HEADER_ALIASES.items():
            if field in mapping:
                continue
            if any(_normalize(a) == norm for a in aliases):
                mapping[field] = idx
                break
    return mapping


def parse_shortlist_excel(data: bytes) -> List[Dict[str, str]]:
    """Parse an Excel buffer into a list of candidate row dicts.

    Args:
        data: Raw .xlsx / .xls / .xlsm file bytes.

    Returns:
        List of dicts with keys from HEADER_ALIASES (only populated fields included).

    Raises:
        ValueError: With user-facing message for file/format problems.
    """
    try:
        import openpyxl  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "openpyxl is required for Excel parsing. "
            "Install it with: pip install openpyxl"
        ) from exc

    try:
        wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
    except Exception as exc:
        raise ValueError(f"Could not open the Excel file: {exc}") from exc

    if not wb.worksheets:
        raise ValueError("Uploaded file has no worksheets")

    ws = wb.worksheets[0]

    raw_rows: List[List[str]] = []
    for row in ws.iter_rows(values_only=True):
        # Skip fully-empty rows
        row_strs = [_cell_to_string(c) for c in row]
        if any(v.strip() for v in row_strs):
            raw_rows.append(row_strs)

    wb.close()

    if not raw_rows:
        raise ValueError("Uploaded file is empty")

    header_map = _build_header_map(raw_rows[0])
    if "github_url" not in header_map:
        raise ValueError(
            'Excel must include a "github_url" column '
            '(also accepted: "github", "profile")'
        )

    candidates: List[Dict[str, str]] = []
    for row in raw_rows[1:]:
        candidate: Dict[str, str] = {}
        for field, idx in header_map.items():
            if idx < len(row):
                val = row[idx].strip()
                if val:
                    candidate[field] = val
        if not candidate.get("github_url"):
            continue
        candidates.append(candidate)

    return candidates
