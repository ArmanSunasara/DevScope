"""Thin wrapper around the Groq-hosted OpenAI-compatible client.

Kept separate from the analyzer module so multiple features (current ATS
feedback + new specialization fit) can share the same singleton client and
retry policy.
"""
from __future__ import annotations

import logging
import os
import re
import time
from typing import List

from openai import OpenAI

logger = logging.getLogger("ml-service.llm")

_client: OpenAI | None = None

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")


def get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY environment variable is not set."
            )
        _client = OpenAI(base_url=GROQ_BASE_URL, api_key=api_key)
    return _client


def strip_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    text = re.sub(r"^```(?:json)?\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text)
    return text.strip()


def extract_json_object(text: str) -> str:
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]
    return text


def stream_completion(messages: List[dict], *, temperature: float = 0.3, max_tokens: int = 4096) -> str:
    """Run a streaming chat completion with one automatic retry on transient errors."""
    client = get_client()

    last_err: Exception | None = None
    for attempt in range(2):
        try:
            completion = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=temperature,
                top_p=1,
                max_tokens=max_tokens,
                stream=True,
            )
            parts: list[str] = []
            for chunk in completion:
                if not getattr(chunk, "choices", None):
                    continue
                delta = chunk.choices[0].delta
                if getattr(delta, "content", None):
                    parts.append(delta.content)
            return strip_fences("".join(parts))
        except Exception as err:  # broad on purpose — provider errors vary
            last_err = err
            logger.warning("LLM call failed (attempt %d): %s", attempt + 1, err)
            time.sleep(0.5 * (attempt + 1))

    assert last_err is not None
    raise last_err
