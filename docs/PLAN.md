# /ultraplan — pm-copilot

## Goal
Ship an agentic PM copilot with 4 specialist agents, 5 tools, Langfuse observability, human-in-the-loop, and bidirectional MCP. ~12 working days.

## Phases

### P0 — Scaffold (Day 1)
- [x] uv + LangGraph + Anthropic SDK
- [x] Docs: RESEARCH, PLAN, THINK, AGENTS, MCP
- [x] Docker compose (Langfuse + Postgres)
- [x] CI

### P1 — Core graph + Orchestrator (Days 2-3)
- [ ] `graph/state.py` — typed GraphState
- [ ] `graph/build.py` — node wiring + conditional edges
- [ ] `agents/orchestrator.py` — decompose task into Plan of Steps
- [ ] Guardrails: iteration cap, budget cap, timeout per tool
- [ ] Langfuse integration via LangGraph callbacks

### P2 — Tools (Days 4-5)
- [ ] `tools/web_search.py` — Tavily client
- [ ] `tools/doc_rag.py` — calls sibling doc-rag MCP tool
- [ ] `tools/spreadsheet.py` — pandas code execution in sandbox
- [ ] `tools/linear.py` — Linear API read-only
- [ ] All tools return pydantic models; structured output
- [ ] Unit tests per tool

### P3 — Specialist agents (Days 6-7)
- [ ] `agents/researcher.py` — query decomp + iterative retrieval
- [ ] `agents/analyst.py` — data analysis with code-gen
- [ ] `agents/writer.py` — PRD / brief / one-pager templates
- [ ] `agents/reviewer.py` — self-critique, verdict {approve, revise, reject}
- [ ] Per-agent system prompts in `src/pm_copilot/templates/`

### P4 — API + streaming + UI (Days 8-9)
- [ ] FastAPI `POST /tasks` with SSE streaming
- [ ] Next.js chat UI with step-by-step trace viewer
- [ ] Human-approval modal before publish actions

### P5 — MCP server (Day 10)
- [ ] `mcp/server.py` — expose `pm_copilot.do_task(...)` as MCP tool
- [ ] Claude Desktop config docs
- [ ] Test from Claude Desktop

### P6 — Evals + release (Days 11-12)
- [ ] 10-task golden set (research, analysis, draft, multi-step)
- [ ] Langfuse scoring: correctness, citation quality, cost efficiency
- [ ] `docs/EVALS.md` with results
- [ ] v1.0.0 release

## Acceptance
- ✅ Full task (research → analyse → draft → review) completes in < 3 min
- ✅ Under $0.50 budget per task
- ✅ Loop cap + budget cap trigger correctly in tests
- ✅ Langfuse trace visible for every run
- ✅ MCP server works from Claude Desktop
- ✅ Human gate blocks "publish" actions until approved

## Cross-repo calls
- Uses `doc-rag` MCP tool for retrieval (live integration)
- Calls `quanta-forecast` `/forecast` endpoint for demand-planning demos (v2)
