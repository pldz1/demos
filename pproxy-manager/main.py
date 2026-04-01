"""
main.py — aiohttp web server entry point

Serves:
  GET  /          -> web/index.html
  GET  /web/*     -> static files in web/
  /api/*          -> REST API handlers

All JSON responses follow: {"ok": true, "data": ...} or {"ok": false, "error": "..."}
"""

from __future__ import annotations

import asyncio
import json
import sys
import os
from pathlib import Path

from aiohttp import web

import store
import watchdog

# ---------------------------------------------------------------------------
# IP denylist (in-memory cache, loaded from settings on startup / update)
# ---------------------------------------------------------------------------

_denied_ips: set[str] = set()


def _refresh_denied_ips(settings: dict) -> None:
    global _denied_ips
    _denied_ips = set(settings.get("denied_ips", []))

# ---------------------------------------------------------------------------
# Resolve web/ directory (works both in dev and PyInstaller bundle)
# ---------------------------------------------------------------------------

if getattr(sys, "frozen", False):
    _BASE = Path(sys._MEIPASS)  # type: ignore[attr-defined]
else:
    _BASE = Path(__file__).parent

WEB_DIR = _BASE / "web"


# ---------------------------------------------------------------------------
# JSON helpers
# ---------------------------------------------------------------------------

def ok(data=None) -> web.Response:
    return web.Response(
        content_type="application/json",
        text=json.dumps({"ok": True, "data": data}, ensure_ascii=False),
    )


def err(message: str, status: int = 400) -> web.Response:
    return web.Response(
        status=status,
        content_type="application/json",
        text=json.dumps({"ok": False, "error": message}, ensure_ascii=False),
    )


async def _json_body(request: web.Request) -> dict:
    try:
        return await request.json()
    except Exception:
        return {}


# ---------------------------------------------------------------------------
# CORS middleware (for dev; SPA is same-origin in prod)
# ---------------------------------------------------------------------------

@web.middleware
async def ip_deny_middleware(request: web.Request, handler):
    if request.remote in _denied_ips:
        return web.Response(
            status=403,
            content_type="application/json",
            text=json.dumps({"ok": False, "error": "Forbidden"}),
        )
    return await handler(request)


@web.middleware
async def cors_middleware(request: web.Request, handler):
    if request.method == "OPTIONS":
        return web.Response(headers={
            "Access-Control-Allow-Origin":  "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        })
    response = await handler(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# ---------------------------------------------------------------------------
# Static / SPA
# ---------------------------------------------------------------------------

async def handle_index(request: web.Request) -> web.FileResponse:
    return web.FileResponse(WEB_DIR / "index.html")


# ---------------------------------------------------------------------------
# API: Health
# ---------------------------------------------------------------------------

async def api_health(request: web.Request) -> web.Response:
    statuses = watchdog.all_statuses()
    running  = sum(1 for s in statuses if s["status"] == watchdog.STATUS_RUNNING)
    total    = len(statuses)
    return ok({"status": "ok", "running": running, "total": total})


# ---------------------------------------------------------------------------
# API: Settings
# ---------------------------------------------------------------------------

async def api_get_settings(request: web.Request) -> web.Response:
    return ok(await store.get_settings())


async def api_update_settings(request: web.Request) -> web.Response:
    body = await _json_body(request)
    data = await store.update_settings(body)
    _refresh_denied_ips(data)
    return ok(data)


# ---------------------------------------------------------------------------
# API: Rules
# ---------------------------------------------------------------------------

async def api_list_rules(request: web.Request) -> web.Response:
    rules = await store.list_rules()
    # Attach live status
    for r in rules:
        r["_status"] = watchdog.get_status(r["id"])
    return ok(rules)


async def api_create_rule(request: web.Request) -> web.Response:
    body = await _json_body(request)
    if not body.get("listen") or not body.get("remote"):
        return err("'listen' and 'remote' are required")
    rule = await store.create_rule(body)
    if rule.get("enabled", True):
        await watchdog.start_rule(rule["id"])
    return ok(rule)


async def api_update_rule(request: web.Request) -> web.Response:
    rule_id = request.match_info["id"]
    body    = await _json_body(request)
    updated = await store.update_rule(rule_id, body)
    if updated is None:
        return err("Rule not found", 404)
    # Restart to apply changes
    await watchdog.restart_rule(rule_id)
    updated["_status"] = watchdog.get_status(rule_id)
    return ok(updated)


async def api_delete_rule(request: web.Request) -> web.Response:
    rule_id = request.match_info["id"]
    await watchdog.stop_rule(rule_id)
    deleted = await store.delete_rule(rule_id)
    if not deleted:
        return err("Rule not found", 404)
    return ok({"deleted": rule_id})


async def api_rule_status(request: web.Request) -> web.Response:
    rule_id = request.match_info["id"]
    return ok(watchdog.get_status(rule_id))


async def api_rule_start(request: web.Request) -> web.Response:
    rule_id = request.match_info["id"]
    result  = await watchdog.start_rule(rule_id)
    return ok({"started": result, "rule_id": rule_id})


async def api_rule_stop(request: web.Request) -> web.Response:
    rule_id = request.match_info["id"]
    result  = await watchdog.stop_rule(rule_id)
    return ok({"stopped": result, "rule_id": rule_id})


async def api_rule_restart(request: web.Request) -> web.Response:
    rule_id = request.match_info["id"]
    result  = await watchdog.restart_rule(rule_id)
    return ok({"restarted": result, "rule_id": rule_id})


async def api_start_all(request: web.Request) -> web.Response:
    await watchdog.start_all()
    return ok({"action": "start_all"})


async def api_stop_all(request: web.Request) -> web.Response:
    await watchdog.stop_all()
    return ok({"action": "stop_all"})


# ---------------------------------------------------------------------------
# API: Denied IPs (web UI access control)
# ---------------------------------------------------------------------------

async def api_list_denied_ips(request: web.Request) -> web.Response:
    settings = await store.get_settings()
    return ok(settings.get("denied_ips", []))


async def api_add_denied_ip(request: web.Request) -> web.Response:
    body = await _json_body(request)
    ip = body.get("ip", "").strip()
    if not ip:
        return err("'ip' is required")
    settings = await store.get_settings()
    denied: list = list(settings.get("denied_ips", []))
    if ip not in denied:
        denied.append(ip)
        settings = await store.update_settings({"denied_ips": denied})
        _refresh_denied_ips(settings)
    return ok(denied)


async def api_remove_denied_ip(request: web.Request) -> web.Response:
    ip = request.match_info["ip"]
    settings = await store.get_settings()
    denied = [x for x in settings.get("denied_ips", []) if x != ip]
    settings = await store.update_settings({"denied_ips": denied})
    _refresh_denied_ips(settings)
    return ok(denied)


# ---------------------------------------------------------------------------
# API: Blacklist
# ---------------------------------------------------------------------------

async def api_list_blacklist(request: web.Request) -> web.Response:
    return ok(await store.list_blacklist())


async def api_add_blacklist(request: web.Request) -> web.Response:
    body = await _json_body(request)
    pattern = body.get("pattern", "").strip()
    if not pattern:
        return err("'pattern' is required")
    entry = await store.add_blacklist_entry(pattern, body.get("comment", ""))
    await watchdog.restart_all_running()
    return ok(entry)


async def api_remove_blacklist(request: web.Request) -> web.Response:
    entry_id = request.match_info["id"]
    deleted = await store.remove_blacklist_entry(entry_id)
    if not deleted:
        return err("Entry not found", 404)
    await watchdog.restart_all_running()
    return ok({"deleted": entry_id})


# ---------------------------------------------------------------------------
# API: Logs
# ---------------------------------------------------------------------------

async def api_query_logs(request: web.Request) -> web.Response:
    qs          = request.rel_url.query
    src_ip      = qs.get("src_ip") or None
    target_url  = qs.get("target_url") or None
    blocked_only= qs.get("blocked_only", "").lower() in ("1", "true")
    date        = qs.get("date") or None
    try:
        page      = int(qs.get("page", 1))
        page_size = int(qs.get("page_size", 50))
    except ValueError:
        return err("page and page_size must be integers")

    result = await store.query_access_logs(
        src_ip=src_ip,
        target_url=target_url,
        blocked_only=blocked_only,
        date=date,
        page=page,
        page_size=page_size,
    )
    return ok(result)


async def api_raw_logs(request: web.Request) -> web.Response:
    qs = request.rel_url.query
    try:
        lines = int(qs.get("lines", 100))
    except ValueError:
        lines = 100
    result = await store.get_raw_logs(lines)
    return ok(result)


# ---------------------------------------------------------------------------
# API: Stats
# ---------------------------------------------------------------------------

async def api_stats(request: web.Request) -> web.Response:
    date = request.rel_url.query.get("date") or None
    return ok(await store.get_stats(date))


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

def create_app() -> web.Application:
    app = web.Application(middlewares=[ip_deny_middleware, cors_middleware])

    # Static SPA
    app.router.add_get("/",           handle_index)
    app.router.add_static("/web",     WEB_DIR, show_index=False)

    # Health
    app.router.add_get("/api/health", api_health)

    # Settings
    app.router.add_get ("/api/settings", api_get_settings)
    app.router.add_put ("/api/settings", api_update_settings)

    # Rules
    app.router.add_get   ("/api/rules",              api_list_rules)
    app.router.add_post  ("/api/rules",              api_create_rule)
    app.router.add_put   ("/api/rules/{id}",         api_update_rule)
    app.router.add_delete("/api/rules/{id}",         api_delete_rule)
    app.router.add_get   ("/api/rules/{id}/status",  api_rule_status)
    app.router.add_post  ("/api/rules/{id}/start",   api_rule_start)
    app.router.add_post  ("/api/rules/{id}/stop",    api_rule_stop)
    app.router.add_post  ("/api/rules/{id}/restart", api_rule_restart)
    app.router.add_post  ("/api/rules/start-all",    api_start_all)
    app.router.add_post  ("/api/rules/stop-all",     api_stop_all)

    # Denied IPs
    app.router.add_get   ("/api/denied-ips",        api_list_denied_ips)
    app.router.add_post  ("/api/denied-ips",        api_add_denied_ip)
    app.router.add_delete("/api/denied-ips/{ip}",   api_remove_denied_ip)

    # Blacklist
    app.router.add_get   ("/api/blacklist",      api_list_blacklist)
    app.router.add_post  ("/api/blacklist",      api_add_blacklist)
    app.router.add_delete("/api/blacklist/{id}", api_remove_blacklist)

    # Logs
    app.router.add_get("/api/logs",     api_query_logs)
    app.router.add_get("/api/logs/raw", api_raw_logs)

    # Stats
    app.router.add_get("/api/stats", api_stats)

    return app


# ---------------------------------------------------------------------------
# Startup / shutdown hooks
# ---------------------------------------------------------------------------

async def on_startup(app: web.Application) -> None:
    store.init()
    await store.cleanup_old_logs()
    _refresh_denied_ips(await store.get_settings())
    await watchdog.start_all()
    print(f"[pproxy-manager] Web UI available at http://localhost:{app['port']}", flush=True)


async def on_shutdown(app: web.Application) -> None:
    print("[pproxy-manager] Shutting down — stopping all proxies ...", flush=True)
    await watchdog.stop_all()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    store.init()
    settings = asyncio.run(store.get_settings())
    port = int(settings.get("web_port", 20088))

    app = create_app()
    app["port"] = port
    app.on_startup.append(on_startup)
    app.on_shutdown.append(on_shutdown)

    web.run_app(app, host="0.0.0.0", port=port, print=lambda *a, **k: None)


if __name__ == "__main__":
    main()
