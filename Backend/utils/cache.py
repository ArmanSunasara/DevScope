"""In-memory TTL cache.

Mirrors the logic in server/src/utils/cache.js.
Single-process, no external dependencies.
"""
from __future__ import annotations

import asyncio
import time
from typing import Any, Awaitable, Callable, Dict, Optional, Tuple

_DEFAULT_TTL_S = 10 * 60  # 10 minutes
_MAX_ENTRIES = 200

# Store: key → (value, expires_at_monotonic)
_store: Dict[str, Tuple[Any, float]] = {}


def _evict_if_full() -> None:
    if len(_store) <= _MAX_ENTRIES:
        return
    # Drop the first (oldest) entry — dict preserves insertion order in Python 3.7+
    try:
        oldest = next(iter(_store))
        del _store[oldest]
    except StopIteration:
        pass


def cache_get(key: str) -> Optional[Any]:
    entry = _store.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.monotonic() > expires_at:
        del _store[key]
        return None
    return value


def cache_set(key: str, value: Any, ttl_s: float = _DEFAULT_TTL_S) -> None:
    _evict_if_full()
    _store[key] = (value, time.monotonic() + ttl_s)


async def with_cache(
    key: str,
    ttl_s: float,
    producer: Callable[[], Awaitable[Any]],
) -> Any:
    """Async cache helper; awaits the producer on a cache miss."""
    cached = cache_get(key)
    if cached is not None:
        return cached
    value = await producer()
    cache_set(key, value, ttl_s)
    return value


def with_cache_sync(
    key: str,
    ttl_s: float,
    producer: Callable[[], Any],
) -> Any:
    """Synchronous cache helper for non-async callers."""
    cached = cache_get(key)
    if cached is not None:
        return cached
    value = producer()
    cache_set(key, value, ttl_s)
    return value
