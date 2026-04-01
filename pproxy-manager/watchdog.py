"""
watchdog.py — async pproxy process manager

One asyncio.Task per rule. Each task:
  1. Builds the pproxy command from the rule config
  2. Spawns the subprocess with asyncio.create_subprocess_exec
  3. Streams stdout line-by-line, parses log entries, enforces blacklist
  4. On process exit (unexpected), backs off and restarts
  5. On stop() the task is cancelled cleanly
"""

from __future__ import annotations

import asyncio
import re
import sys
import traceback
from datetime import datetime, timezone
from typing import Any

import store

# ---------------------------------------------------------------------------
# Status constants
# ---------------------------------------------------------------------------

STATUS_STOPPED    = "stopped"
STATUS_RUNNING    = "running"
STATUS_RESTARTING = "restarting"
STATUS_ERROR      = "error"

# ---------------------------------------------------------------------------
# Log-line parsers
#
# Actual pproxy -v output format:
#   "http 127.0.0.1:61240 -> http 10.137.212.28:7890 -> www.google.com:443"
#   protocol src_ip:port -> protocol remote_ip:port -> final_target
# ---------------------------------------------------------------------------

# PRIMARY: pproxy -v actual format
#   <proto> <src>:<port> -> <proto> <relay>:<port> -> <final_target>
_RE_PPROXY = re.compile(
    r"(?P<proto>\w+)\s+"
    r"(?P<src>[\d]{1,3}(?:\.[\d]{1,3}){3}):\d+\s+->\s+"
    r"\w+\s+\S+\s+->\s+"
    r"(?P<target>\S+)",
    re.IGNORECASE,
)

# FALLBACK: CONNECT <src> -> <target>  (some tunnel variants)
_RE_CONNECT = re.compile(
    r"CONNECT\s+(?P<src>[\d\.]+)(?::\d+)?\s+->\s+(?P<target>\S+)",
    re.IGNORECASE,
)

# FALLBACK: GET/POST <url> from <ip>
_RE_HTTP = re.compile(
    r"(?:GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\s+(?P<target>\S+)\s+from\s+(?P<src>[\d\.]+)",
    re.IGNORECASE,
)


def _parse_log_line(line: str) -> tuple[str | None, str | None, str | None]:
    """Return (src_ip, target_url, protocol) or (None, None, None) if unparseable."""
    m = _RE_PPROXY.search(line)
    if m:
        d = m.groupdict()
        return d.get("src"), d.get("target"), d.get("proto", "").lower()

    for pattern in (_RE_CONNECT, _RE_HTTP):
        m = pattern.search(line)
        if m:
            d = m.groupdict()
            return d.get("src"), d.get("target"), None

    return None, None, None


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# ---------------------------------------------------------------------------
# Per-rule state
# ---------------------------------------------------------------------------

class RuleState:
    def __init__(self, rule_id: str):
        self.rule_id   = rule_id
        self.status    = STATUS_STOPPED
        self.pid: int | None = None
        self.last_error: str | None = None
        self.started_at: str | None = None
        self.restart_count: int = 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "rule_id":       self.rule_id,
            "status":        self.status,
            "pid":           self.pid,
            "last_error":    self.last_error,
            "started_at":    self.started_at,
            "restart_count": self.restart_count,
        }


# ---------------------------------------------------------------------------
# Global registry
# ---------------------------------------------------------------------------

_states:  dict[str, RuleState]       = {}  # rule_id -> RuleState
_tasks:   dict[str, asyncio.Task]    = {}  # rule_id -> asyncio.Task
_stop_ev: dict[str, asyncio.Event]   = {}  # rule_id -> stop event


def get_status(rule_id: str) -> dict[str, Any]:
    if rule_id in _states:
        return _states[rule_id].to_dict()
    return {"rule_id": rule_id, "status": STATUS_STOPPED}


def all_statuses() -> list[dict[str, Any]]:
    return [s.to_dict() for s in _states.values()]


# ---------------------------------------------------------------------------
# Build pproxy command
# ---------------------------------------------------------------------------

_BLOCKLIST_TXT = store.DATA_DIR / "blocklist.txt"


def _build_cmd(rule: dict, settings: dict) -> list[str]:
    exe = settings.get("pproxy_executable", "").strip()
    # Default: use the same Python that launched main.py so pproxy is always
    # found in the same environment (works for embedded Python, venv, etc.)
    if not exe or exe == "pproxy":
        base = [sys.executable, "-m", "pproxy"]
    else:
        base = [exe]
    cmd = base + ["-l", rule["listen"], "-r", rule["remote"]]
    alive = rule.get("alive_interval", 30)
    if alive and int(alive) > 0:
        cmd += ["-a", str(alive)]
    if rule.get("verbose", True):
        cmd.append("-v")
    if _BLOCKLIST_TXT.exists() and _BLOCKLIST_TXT.stat().st_size > 0:
        cmd += ["-b", str(_BLOCKLIST_TXT)]
    return cmd


# ---------------------------------------------------------------------------
# Single-rule watchdog coroutine
# ---------------------------------------------------------------------------

async def _run_rule(rule: dict, settings: dict, state: RuleState, stop_ev: asyncio.Event) -> None:
    backoff_min    = float(settings.get("backoff_min", 1))
    backoff_max    = float(settings.get("backoff_max", 60))
    backoff_factor = float(settings.get("backoff_factor", 2.0))
    backoff        = backoff_min

    cmd = _build_cmd(rule, settings)

    while not stop_ev.is_set():
        proc: asyncio.subprocess.Process | None = None
        state.status = STATUS_RUNNING
        state.last_error = None

        await store.append_raw_log(f"[watchdog:{rule['id']}] starting: {' '.join(cmd)}")

        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
            )
            state.pid        = proc.pid
            state.started_at = _ts()

            assert proc.stdout is not None

            # Stream stdout lines
            async for raw_bytes in proc.stdout:
                if stop_ev.is_set():
                    break
                line = raw_bytes.decode(errors="replace").rstrip()
                if not line:
                    continue

                # Always persist raw
                await store.append_raw_log(f"[{rule['id']}] {line}")

                # Try to parse structured fields
                src_ip, target_url, proto = _parse_log_line(line)
                if src_ip or target_url:
                    # Use protocol from log line; fall back to rule listen scheme
                    protocol = proto or (rule["listen"].split("://")[0] if "://" in rule["listen"] else "")

                    record = {
                        "rule_id":    rule["id"],
                        "src_ip":     src_ip or "",
                        "target_url": target_url or "",
                        "protocol":   protocol,
                        "raw":        line,
                        "created_at": _ts(),
                    }
                    await store.append_access_log(record)

            rc = await proc.wait()
            state.pid = None

            if stop_ev.is_set():
                break

            msg = f"[watchdog:{rule['id']}] pproxy exited with code {rc}"
            await store.append_raw_log(msg)
            state.status = STATUS_RESTARTING
            state.restart_count += 1

        except FileNotFoundError:
            err = f"[watchdog:{rule['id']}] ERROR: pproxy executable not found — install pproxy or check settings"
            await store.append_raw_log(err)
            state.status     = STATUS_ERROR
            state.last_error = "pproxy not found"
            state.pid        = None
            return  # fatal — don't restart

        except asyncio.CancelledError:
            # Requested stop
            if proc and proc.returncode is None:
                try:
                    proc.terminate()
                    await asyncio.wait_for(proc.wait(), timeout=5.0)
                except Exception:
                    try:
                        proc.kill()
                    except Exception:
                        pass
            state.status = STATUS_STOPPED
            state.pid    = None
            raise

        except Exception as exc:
            err = f"[watchdog:{rule['id']}] ERROR: {exc!r}\n{traceback.format_exc()}"
            await store.append_raw_log(err)
            state.last_error = str(exc)
            state.pid        = None
            if proc and proc.returncode is None:
                try:
                    proc.kill()
                except Exception:
                    pass

        if stop_ev.is_set():
            break

        # Backoff before restart
        await store.append_raw_log(f"[watchdog:{rule['id']}] restarting in {backoff:.0f}s ...")
        try:
            await asyncio.wait_for(stop_ev.wait(), timeout=backoff)
        except asyncio.TimeoutError:
            pass
        if stop_ev.is_set():
            break
        backoff = min(backoff * backoff_factor, backoff_max)

        # Refresh rule from disk in case it was updated
        fresh = await store.get_rule(rule["id"])
        if fresh:
            rule = fresh
            settings = await store.get_settings()
            cmd = _build_cmd(rule, settings)

    state.status = STATUS_STOPPED
    state.pid    = None


# ---------------------------------------------------------------------------
# Public control API
# ---------------------------------------------------------------------------

async def start_rule(rule_id: str) -> bool:
    """Start watchdog for a rule. Returns False if already running."""
    if rule_id in _tasks and not _tasks[rule_id].done():
        return False

    rule = await store.get_rule(rule_id)
    if not rule:
        return False

    settings = await store.get_settings()
    state    = RuleState(rule_id)
    stop_ev  = asyncio.Event()

    _states[rule_id]  = state
    _stop_ev[rule_id] = stop_ev

    task = asyncio.create_task(
        _run_rule(rule, settings, state, stop_ev),
        name=f"watchdog-{rule_id}",
    )
    _tasks[rule_id] = task
    return True


async def stop_rule(rule_id: str) -> bool:
    """Stop watchdog for a rule. Returns False if not running."""
    if rule_id not in _tasks or _tasks[rule_id].done():
        if rule_id in _states:
            _states[rule_id].status = STATUS_STOPPED
        return False

    ev = _stop_ev.get(rule_id)
    if ev:
        ev.set()

    _tasks[rule_id].cancel()
    try:
        await asyncio.wait_for(asyncio.shield(_tasks[rule_id]), timeout=7.0)
    except (asyncio.CancelledError, asyncio.TimeoutError):
        pass

    if rule_id in _states:
        _states[rule_id].status = STATUS_STOPPED
    return True


async def restart_rule(rule_id: str) -> bool:
    await stop_rule(rule_id)
    await asyncio.sleep(0.3)
    return await start_rule(rule_id)


async def start_all() -> None:
    rules = await store.list_rules()
    for rule in rules:
        if rule.get("enabled", True):
            await start_rule(rule["id"])


async def stop_all() -> None:
    ids = list(_tasks.keys())
    for rule_id in ids:
        await stop_rule(rule_id)


async def restart_all_running() -> None:
    """Restart every currently-running rule (e.g. to apply a new blocklist)."""
    ids = [rid for rid, s in _states.items() if s.status == STATUS_RUNNING]
    for rule_id in ids:
        await restart_rule(rule_id)
