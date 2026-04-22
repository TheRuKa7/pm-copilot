"""FastAPI — POST /tasks with SSE streaming. Full routes in P4."""
from __future__ import annotations

from fastapi import FastAPI

from pm_copilot import __version__

app = FastAPI(title="pm-copilot", version=__version__)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok", "version": __version__}


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": "pm-copilot",
        "repo": "https://github.com/TheRuKa7/pm-copilot",
    }
