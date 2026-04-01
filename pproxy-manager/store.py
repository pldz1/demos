"""
store.py — file-based persistence layer
All state lives in the data/ directory as JSON / JSONL / TXT.
Every write is protected by a per-file asyncio.Lock.
"""

from __future__ import annotations

import asyncio
import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

BASE_DIR: Path = Path(__file__).parent
DATA_DIR: Path = BASE_DIR / "data"
LOGS_DIR: Path = DATA_DIR / "logs"

RULES_FILE      = DATA_DIR / "rules.json"
SETTINGS_FILE   = DATA_DIR / "settings.json"
BLACKLIST_FILE  = DATA_DIR / "blacklist.json"
BLOCKLIST_TXT   = DATA_DIR / "blocklist.txt"

# ---------------------------------------------------------------------------
# Default content
# ---------------------------------------------------------------------------

DEFAULT_SETTINGS: dict[str, Any] = {
    "backoff_min": 1,
    "backoff_max": 60,
    "backoff_factor": 2.0,
    "log_retain_days": 7,
    "web_port": 20088,
    "pproxy_executable": "",  # empty = use sys.executable -m pproxy
    "denied_ips": [],         # IPs blocked from accessing the web UI
}

# ---------------------------------------------------------------------------
# Per-file locks (keyed by resolved path string)
# ---------------------------------------------------------------------------

_locks: dict[str, asyncio.Lock] = {}


def _lock(path: Path) -> asyncio.Lock:
    key = str(path.resolve())
    if key not in _locks:
        _locks[key] = asyncio.Lock()
    return _locks[key]


# ---------------------------------------------------------------------------
# Low-level helpers
# ---------------------------------------------------------------------------

def _ensure_dirs() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    LOGS_DIR.mkdir(exist_ok=True)


def _read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return default


def _write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _log_path(name: str) -> Path:
    return LOGS_DIR / f"{name}_{_today()}.log"


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _new_id() -> str:
    return uuid.uuid4().hex[:12]


def _sync_blocklist_txt_sync(entries: list) -> None:
    """Write active patterns to blocklist.txt for pproxy -b consumption."""
    patterns = [e["pattern"] for e in entries if e.get("pattern")]
    if patterns:
        BLOCKLIST_TXT.write_text("\n".join(patterns) + "\n", encoding="utf-8")
    elif BLOCKLIST_TXT.exists():
        BLOCKLIST_TXT.unlink()


# ---------------------------------------------------------------------------
# Initialise on import
# ---------------------------------------------------------------------------

def init() -> None:
    """Create directories and seed default files if missing."""
    _ensure_dirs()
    if not RULES_FILE.exists():
        _write_json(RULES_FILE, [])
    if not SETTINGS_FILE.exists():
        _write_json(SETTINGS_FILE, DEFAULT_SETTINGS)
    # Migrate old dict format {"ip":[],"url":[]} -> new list format
    raw_bl = _read_json(BLACKLIST_FILE, [])
    if not isinstance(raw_bl, list):
        raw_bl = []
        _write_json(BLACKLIST_FILE, raw_bl)
    # Sync blocklist.txt from blacklist.json on startup
    _sync_blocklist_txt_sync(raw_bl)


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

async def get_settings() -> dict[str, Any]:
    async with _lock(SETTINGS_FILE):
        data = _read_json(SETTINGS_FILE, {})
        return {**DEFAULT_SETTINGS, **data}


async def update_settings(patch: dict[str, Any]) -> dict[str, Any]:
    async with _lock(SETTINGS_FILE):
        data = _read_json(SETTINGS_FILE, {})
        data = {**DEFAULT_SETTINGS, **data, **patch}
        _write_json(SETTINGS_FILE, data)
        return data


# ---------------------------------------------------------------------------
# Rules
# ---------------------------------------------------------------------------

async def list_rules() -> list[dict]:
    async with _lock(RULES_FILE):
        return _read_json(RULES_FILE, [])


async def get_rule(rule_id: str) -> dict | None:
    rules = await list_rules()
    return next((r for r in rules if r["id"] == rule_id), None)


async def create_rule(payload: dict) -> dict:
    async with _lock(RULES_FILE):
        rules = _read_json(RULES_FILE, [])
        rule: dict[str, Any] = {
            "id":             _new_id(),
            "name":           payload.get("name", ""),
            "listen":         payload["listen"],
            "remote":         payload["remote"],
            "alive_interval": int(payload.get("alive_interval", 30)),
            "verbose":        bool(payload.get("verbose", True)),
            "enabled":        bool(payload.get("enabled", True)),
            "created_at":     _ts(),
            "updated_at":     _ts(),
        }
        rules.append(rule)
        _write_json(RULES_FILE, rules)
        return rule


async def update_rule(rule_id: str, patch: dict) -> dict | None:
    async with _lock(RULES_FILE):
        rules = _read_json(RULES_FILE, [])
        for i, r in enumerate(rules):
            if r["id"] == rule_id:
                allowed = {"name", "listen", "remote", "alive_interval", "verbose", "enabled"}
                for k, v in patch.items():
                    if k in allowed:
                        rules[i][k] = v
                rules[i]["updated_at"] = _ts()
                _write_json(RULES_FILE, rules)
                return rules[i]
    return None


async def delete_rule(rule_id: str) -> bool:
    async with _lock(RULES_FILE):
        rules = _read_json(RULES_FILE, [])
        new = [r for r in rules if r["id"] != rule_id]
        if len(new) == len(rules):
            return False
        _write_json(RULES_FILE, new)
        return True


# ---------------------------------------------------------------------------
# Blacklist
# ---------------------------------------------------------------------------

async def list_blacklist() -> list[dict]:
    async with _lock(BLACKLIST_FILE):
        return _read_json(BLACKLIST_FILE, [])


async def add_blacklist_entry(pattern: str, comment: str = "") -> dict:
    async with _lock(BLACKLIST_FILE):
        entries = _read_json(BLACKLIST_FILE, [])
        entry: dict[str, Any] = {
            "id":         _new_id(),
            "pattern":    pattern,
            "comment":    comment,
            "created_at": _ts(),
        }
        entries.append(entry)
        _write_json(BLACKLIST_FILE, entries)
        _sync_blocklist_txt_sync(entries)
        return entry


async def remove_blacklist_entry(entry_id: str) -> bool:
    async with _lock(BLACKLIST_FILE):
        entries = _read_json(BLACKLIST_FILE, [])
        new = [e for e in entries if e["id"] != entry_id]
        if len(new) == len(entries):
            return False
        _write_json(BLACKLIST_FILE, new)
        _sync_blocklist_txt_sync(new)
        return True


# ---------------------------------------------------------------------------
# Access log (JSONL, one record per line, daily rotation)
# ---------------------------------------------------------------------------

_access_lock_map: dict[str, asyncio.Lock] = {}


def _access_lock() -> asyncio.Lock:
    day = _today()
    if day not in _access_lock_map:
        _access_lock_map[day] = asyncio.Lock()
    return _access_lock_map[day]


async def append_access_log(record: dict) -> None:
    path = _log_path("access")
    async with _access_lock():
        with path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")


async def append_raw_log(line: str) -> None:
    path = _log_path("raw")
    async with _lock(path):
        with path.open("a", encoding="utf-8") as f:
            f.write(f"[{_ts()}] {line}\n")


async def query_access_logs(
    *,
    src_ip: str | None = None,
    target_url: str | None = None,
    blocked_only: bool = False,
    date: str | None = None,        # YYYY-MM-DD, default today
    page: int = 1,
    page_size: int = 50,
) -> dict[str, Any]:
    day = date or _today()
    path = _log_path("access").parent / f"access_{day}.log"
    records: list[dict] = []
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
            except json.JSONDecodeError:
                continue
            if src_ip and src_ip not in r.get("src_ip", ""):
                continue
            if target_url and target_url.lower() not in r.get("target_url", "").lower():
                continue
            if blocked_only and not r.get("blocked"):
                continue
            records.append(r)

    total = len(records)
    start = (page - 1) * page_size
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "records": list(reversed(records))[start: start + page_size],
    }


async def get_raw_logs(lines: int = 100) -> list[str]:
    path = _log_path("raw")
    if not path.exists():
        return []
    all_lines = path.read_text(encoding="utf-8").splitlines()
    return all_lines[-lines:]


async def get_stats(date: str | None = None) -> dict[str, Any]:
    day = date or _today()
    path = LOGS_DIR / f"access_{day}.log"
    total = 0
    blocked = 0
    ip_count: dict[str, int] = {}
    url_count: dict[str, int] = {}

    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
            except json.JSONDecodeError:
                continue
            total += 1
            if r.get("blocked"):
                blocked += 1
            ip = r.get("src_ip", "unknown")
            ip_count[ip] = ip_count.get(ip, 0) + 1
            url = r.get("target_url", "unknown")
            url_count[url] = url_count.get(url, 0) + 1

    top_ips  = sorted(ip_count.items(),  key=lambda x: x[1], reverse=True)[:10]
    top_urls = sorted(url_count.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "date": day,
        "total": total,
        "blocked": blocked,
        "allowed": total - blocked,
        "top_ips":  [{"ip": k,  "count": v} for k, v in top_ips],
        "top_urls": [{"url": k, "count": v} for k, v in top_urls],
    }


# ---------------------------------------------------------------------------
# Log retention cleanup
# ---------------------------------------------------------------------------

async def cleanup_old_logs() -> None:
    settings = await get_settings()
    retain = int(settings.get("log_retain_days", 7))
    now_ts = datetime.now(timezone.utc).timestamp()
    for f in LOGS_DIR.glob("*.log"):
        age_days = (now_ts - f.stat().st_mtime) / 86400
        if age_days > retain:
            try:
                f.unlink()
            except OSError:
                pass
