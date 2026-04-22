# pm-copilot

> **Agentic multi-step PM copilot.** Feed it a PM task — "research competitor X pricing and draft a PRD response" — and it decomposes, researches, analyses, drafts, and reviews, with human-in-the-loop checkpoints. LangGraph + Claude + bidirectional MCP.

[![CI](https://github.com/TheRuKa7/pm-copilot/actions/workflows/ci.yml/badge.svg)](https://github.com/TheRuKa7/pm-copilot/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Built by [Rushil Kaul](https://github.com/TheRuKa7) — a PM who built the agent he wanted. Dogfooded daily against real product management work.

## What it does

Tasks you can hand it:
- *"Research competitor X, analyse their pricing, draft a PRD for our response."*
- *"Summarize last week's customer interviews and identify top 3 pain points."*
- *"Analyse our activation funnel CSV and propose experiments."*
- *"Draft a one-pager for feature Y — audience: exec team."*

It produces: a research brief, an analysis, and a draft artifact, with citations, confidence scores, and a human-approval gate before anything publishes.

## Architecture (at a glance)

```
User → Orchestrator → {Researcher, Analyst, Writer} → Reviewer → Human approval → Output
           ↓                   ↓                          ↓
        LangGraph         Tools (MCP)              Langfuse (traces)
                         • web_search
                         • doc_rag.retrieve
                         • spreadsheet.analyze
                         • linear.query
```

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Docs

- [docs/RESEARCH.md](./docs/RESEARCH.md) — agent framework comparison, patterns, observability
- [docs/PLAN.md](./docs/PLAN.md) — phased build plan
- [docs/THINK.md](./docs/THINK.md) — why dogfood, why LangGraph, runaway-loop mitigations
- [docs/AGENTS.md](./docs/AGENTS.md) — role of each agent, tool access, prompts
- [docs/MCP.md](./docs/MCP.md) — consuming MCP + exposing as MCP

## Stack

| Layer | Choice |
|-------|--------|
| Graph | LangGraph |
| LLM | Claude Sonnet 4.6 (primary), GPT-4.1 (fallback), Haiku for cheap steps |
| Tools | Tavily (web), `doc-rag` (retrieval), pandas/polars (analysis) |
| Observability | Langfuse (self-hostable, open) |
| API | FastAPI + SSE for streaming |
| UI | Next.js 15 + shadcn |
| MCP | Bidirectional — consumes + exposes |

## Quickstart

```bash
uv sync
docker compose up -d langfuse-pg langfuse
cp .env.example .env
uv run python -m pm_copilot "Research competitor pricing for LambdaTest and draft a PRD response"
```

## License

MIT.
