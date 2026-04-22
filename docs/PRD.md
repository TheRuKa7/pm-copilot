# PRD — pm-copilot

**Owner:** Rushil Kaul · **Status:** P0 scaffold complete · **Last updated:** 2026-04-22

## 1. TL;DR

A LangGraph-powered **product-management copilot** with orchestrator-worker
agents, a **mix-of-models** strategy (Haiku for retrieval, Sonnet for writing,
Opus as escalator), hard budget/iter caps, Langfuse observability, and a
bidirectional MCP surface — it consumes tool-MCPs and exposes its own.

## 2. Problem

PMs do many structured tasks (PRD drafting, release notes, interview synthesis,
digests) that are time-consuming but formulaic. Chat-style assistants don't
carry state, plan, or respect budget. `pm-copilot` is an agent that does.

## 3. Goals

| G | Goal | Measure |
|---|------|---------|
| G1 | High-quality first drafts of PRDs / release notes / syntheses | Human PM rates draft ≥ 7/10 on rubric |
| G2 | Bounded cost and iteration | 100% of runs honour `max_budget_usd` and `max_iterations` |
| G3 | Full observability | Every run has a Langfuse trace; every LLM call is logged with cost |
| G4 | Mix of models | Haiku for retrieval/tools; Sonnet for writing; escalation path to Opus |
| G5 | Bidirectional MCP | Consumes external MCP tools; exposes its own |

## 4. Non-goals

- Autonomous change-making (no PR merges, no ticket status changes without approval)
- Long-running background jobs (> 15 min)
- Training a new model; we are prompt + tool + graph, not RL

## 5. Users & stakeholders

P1–P5 in `USECASES.md`. Engineering stakeholder is a platform team owning cost
caps and observability.

## 6. Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | `draft-prd` command: notes + issue → PRD draft with "questions for human" | P0 |
| F2 | `release-notes` command: PR range → grouped notes | P1 |
| F3 | `interview-synth` command: transcripts → themed synthesis with quotes | P2 |
| F4 | `status` command: Jira/Linear snapshot → weekly digest | P2 |
| F5 | Mix-of-models with per-step model choice | P0 |
| F6 | Hard caps: `max_iterations`, `max_budget_usd`, `max_tokens` | P0 |
| F7 | Langfuse trace per run | P1 |
| F8 | Tool registry with Jira, Linear, GitHub, Notion, Web search | P1 |
| F9 | MCP server exposing high-level tools | P2 |
| F10 | Human-in-the-loop `--revise` mode with inline comments | P1 |

## 7. Non-functional requirements

| Category | Requirement |
|----------|-------------|
| Cost | Default budget 0.50 USD/run; configurable |
| Safety | Never execute destructive tool calls without explicit `--apply` flag |
| Privacy | Transcripts never leave the configured LLM provider without consent |
| Observability | Langfuse + OTEL traces; stdout summary per run |
| Repro | Deterministic node traversal where the graph allows; seeded retries |
| Portability | Runs on CPU; no GPU required |

## 8. Success metrics

- **Primary:** human-rated draft quality on a committed rubric (target ≥ 7/10).
- **Secondary:** % of runs within budget; avg cost per run.
- **Adoption:** number of external MCP clients connected per week.

## 9. Milestones

| Phase | Deliverable | ETA |
|-------|-------------|-----|
| P0 | Graph skeleton, CLI, budget/iter caps, `draft-prd` stub | shipped |
| P1 | Real LangGraph flows, tool registry, Langfuse, `--revise` | +3 weeks |
| P2 | `release-notes`, `interview-synth`, `status`, MCP server | +6 weeks |
| P3 | Benchmark suite + rubric scoring harness + docs site | +8 weeks |

## 10. Dependencies

- LangGraph, Anthropic SDK, Langfuse, MCP Python SDK
- Optional: Jira, Linear, GitHub, Notion API clients
- `tavily-python` or `serper` for web search

## 11. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Runaway iteration / cost | Cert. | $ loss | Hard caps + step-level Langfuse supervisor that can kill a run |
| Tool call misuse (destructive Jira ops) | Med | Data loss | `--apply` required for any write; dry-run by default |
| Prompt drift breaks output format | Med | Broken artefacts | JSON-schema-validated outputs between graph steps |
| Langfuse downtime | Low | Lose obs | Local JSONL fallback |
| Model deprecation | Cert. over time | Breakage | Model pinned via config; upgrade PRs gated on rubric regression |

## 12. Open questions

- Rubric: single global or per-artefact-type? Lean per-type (PRD rubric ≠ release-notes rubric).
- Offer a hosted demo or CLI-only v1? CLI-only; hosted sandbox in P3.
- Multi-tenant isolation — relevant only if we host; defer.
