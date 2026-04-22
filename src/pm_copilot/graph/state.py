"""Typed LangGraph state for pm-copilot."""
from __future__ import annotations

from typing import Literal, TypedDict

from pydantic import BaseModel


class Step(BaseModel):
    agent: Literal["researcher", "analyst", "writer", "reviewer"]
    input: str
    rationale: str


class Finding(BaseModel):
    claim: str
    source: str  # URL or doc-id
    confidence: float  # 0..1


class Insight(BaseModel):
    metric: str
    value: str
    trend: str | None = None
    confidence: float
    method: str


class ReviewVerdict(BaseModel):
    decision: Literal["approve", "revise", "reject"]
    critique: str
    revision_hints: list[str] = []


class GraphState(TypedDict, total=False):
    task: str
    plan: list[Step]
    findings: list[Finding]
    analysis: list[Insight]
    draft: str | None
    review: ReviewVerdict | None
    iterations: int
    budget_spent_usd: float
    human_approved: bool
