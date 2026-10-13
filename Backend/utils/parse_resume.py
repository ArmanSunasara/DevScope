"""Resume text extractor.

Mirrors the logic in server/src/utils/parseResume.js.
Supports PDF (via pdfplumber), DOCX (via python-docx), and plain text.
"""
from __future__ import annotations

import io
import re

MAX_CHARS = 18000  # matches the Node side's cap (just below ML-service 20k limit)

# Strip control chars (except \n and \t) — mirrors sanitizeText() in the JS.
_CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b-\x1f\x7f]")


def _sanitize(text: str) -> str:
    text = _CONTROL_CHAR_RE.sub(" ", text)
    text = text.replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{3,}", "  ", text)
    return text.strip()


def _truncate(text: str) -> str:
    if len(text) > MAX_CHARS:
        return text[:MAX_CHARS].rstrip() + "…"
    return text


def _extract_pdf(data: bytes) -> str:
    try:
        import pdfplumber  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "pdfplumber is required for PDF parsing. "
            "Install it with: pip install pdfplumber"
        ) from exc

    with pdfplumber.open(io.BytesIO(data)) as pdf:
        parts = []
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                parts.append(t)
        return "\n".join(parts)


def _extract_docx(data: bytes) -> str:
    try:
        from docx import Document  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "python-docx is required for DOCX parsing. "
            "Install it with: pip install python-docx"
        ) from exc

    doc = Document(io.BytesIO(data))
    return "\n".join(para.text for para in doc.paragraphs)


def parse_resume(data: bytes, filename: str = "", content_type: str = "") -> str:
    """Extract plain text from an uploaded resume buffer.

    Args:
        data: Raw file bytes.
        filename: Original filename; used to infer type.
        content_type: MIME type provided by the browser.

    Returns:
        Sanitized, length-capped resume text.

    Raises:
        ValueError: With a user-facing message when the file is empty,
                    unsupported, or yields no readable text.
    """
    if not data:
        raise ValueError("Resume file is empty")

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    mime = content_type.lower()

    raw = ""
    try:
        if ext == "pdf" or "pdf" in mime:
            raw = _extract_pdf(data)
        elif ext == "docx" or "wordprocessingml" in mime:
            raw = _extract_docx(data)
        elif ext in ("txt", "md") or mime.startswith("text/"):
            raw = data.decode("utf-8", errors="replace")
        else:
            raise ValueError(
                "Unsupported resume format. Upload a PDF, DOCX, or TXT file."
            )
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError(
            "Could not read the resume. The file may be corrupted or password-protected."
        ) from exc

    text = _truncate(_sanitize(raw))
    if len(text) < 30:
        raise ValueError(
            "Couldn't extract readable text from the resume. "
            "If it's a scanned PDF, upload a text-based version."
        )
    return text
