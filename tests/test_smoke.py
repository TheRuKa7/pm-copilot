"""Smoke tests for the scaffold."""
from __future__ import annotations

from fastapi.testclient import TestClient

from pm_copilot import __version__
from pm_copilot.api.main import app
from pm_copilot.config import settings
from pm_copilot.graph.state import GraphState, Step

client = TestClient(app)


def test_healthz() -> None:
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json()["version"] == __version__


def test_guardrails_defaults() -> None:
    assert settings.max_iterations == 8
    assert settings.max_budget_usd == 0.50


def test_state_types_import() -> None:
    state: GraphState = {"task": "demo", "iterations": 0, "budget_spent_usd": 0.0}
    step = Step(agent="researcher", input="q?", rationale="need data")
    assert step.agent == "researcher"
    assert state["task"] == "demo"
