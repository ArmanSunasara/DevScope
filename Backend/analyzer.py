import os
import re
import json
import logging
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("ml-service.analyzer")

_client = None

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY environment variable is not set. "
                "Please set it in your .env file."
            )
        _client = OpenAI(base_url=GROQ_BASE_URL, api_key=api_key)
    return _client


def _strip_markdown_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    text = re.sub(r"^```(?:json)?\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text)
    return text.strip()


def _extract_json_object(text: str) -> str:
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]
    return text


def _empty_feedback(message: str | None = None):
    return {
        "strengths": [],
        "red_flags": [],
        "suggestions": [message] if message else [],
    }


def generate_feedback(data):
    """Generate AI-powered feedback for a GitHub portfolio."""
    client = _get_client()

    score = data.get("score", 0)
    repo_analysis = data.get("repoAnalysis", [])
    username = data.get("username", "user")

    prompt = f"""You are a technical recruiter analyzing a GitHub portfolio.

Portfolio Score: {score}/100
Username: {username}
Number of analyzed repositories: {len(repo_analysis)}

Repository Details:
{json.dumps(repo_analysis, indent=2)}

Provide constructive feedback in JSON format with the following structure:
{{
    "strengths": ["strength1", "strength2", ...],
    "red_flags": ["flag1", "flag2", ...],
    "suggestions": ["suggestion1", "suggestion2", ...]
}}

Each list should contain 3-5 short, specific, actionable strings. Be professional and focus on what recruiters care about. Respond with valid JSON only, no markdown fences."""

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an experienced technical recruiter providing "
                    "constructive feedback on GitHub portfolios. Always respond "
                    "with valid JSON only."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
        top_p=1,
        max_tokens=2048,
        stream=True,
    )

    content_parts = []
    for chunk in completion:
        if not getattr(chunk, "choices", None):
            continue
        delta = chunk.choices[0].delta
        if getattr(delta, "content", None):
            content_parts.append(delta.content)

    content = _strip_markdown_fences("".join(content_parts))

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        try:
            parsed = json.loads(_extract_json_object(content))
        except json.JSONDecodeError:
            logger.warning("Unable to parse AI response as JSON.")
            return _empty_feedback("Unable to parse AI response. Please try again.")

    def _string_list(value):
        if not isinstance(value, list):
            return []
        return [str(v) for v in value if isinstance(v, (str, int, float))]

    return {
        "strengths": _string_list(parsed.get("strengths")),
        "red_flags": _string_list(parsed.get("red_flags")),
        "suggestions": _string_list(parsed.get("suggestions")),
    }
