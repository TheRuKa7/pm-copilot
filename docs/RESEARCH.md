# /ultraresearch — pm-copilot

## 1. Agent framework comparison

| Framework | Paradigm | State | Observability | Multi-agent | Pick? |
|-----------|----------|-------|---------------|-------------|-------|
| **LangGraph** | Typed graph | Explicit | LangSmith native, Langfuse works | ✅ | **Primary** |
| CrewAI | Role + task | Implicit | Telemetry decent | ✅ | Simpler alt |
| AutoGen | Conversational | Chat history | Custom | ✅ | Research-heavy |
| LlamaIndex AgentWorkflows | DAG | Events | LI tracing | ✅ | Lighter |
| Anthropic SDK + MCP | Raw tool-use | Client-managed | BYO | Manual | Low-level |
| Mastra (TS) | TS-native | Zod schemas | Custom | ✅ | Not our stack |
| BeeAI (IBM) | Open multi-agent | — | — | ✅ | Worth watching |

## 2. Agent patterns

### Single-agent
- **ReAct** — reason step, action step, observation step, loop
- **Plan-and-execute** — plan first, then execute steps

### Multi-agent
- **Orchestrator-worker** (Anthropic) — one planner, many executors
- **Hierarchical** — nested teams
- **Debate** — agents critique each other
- **Consensus** — multiple agents vote

**Pick:** Orchestrator-worker + Reviewer for self-critique. Keeps coordination simple while enabling specialization.

## 3. Agentic RAG (vs one-shot RAG in sibling repo)

The copilot's Researcher uses:
1. **Query decomposition** — split "compare X and Y pricing" into separate retrievals
2. **Iterative retrieval** — first pass retrieval → reflection → refined retrieval
3. **Self-correcting** — verify citations exist in retrieved chunks; re-retrieve on miss
4. **Multi-hop** — use output of one retrieval as input to next

Anthropic's research: agentic RAG outperforms single-shot by 20-40% on multi-hop questions.

## 4. Tool use best practices

- **Structured outputs** (pydantic/zod) — catch parse errors before execution
- **Idempotent tools** — safe to retry
- **Budget awareness** — each tool reports estimated tokens/cost
- **Descriptive names + docstrings** — LLM picks better tools
- **Few-shot examples in prompts** — especially for rarely-used tools

## 5. Observability — Langfuse deep dive

Why Langfuse specifically:
- **Open source, self-hostable** (no vendor lock)
- **Trace view** — full tree of LLM + tool calls
- **Scoring** — automated + manual evaluation
- **Cost tracking** per trace, per session, per user
- **Prompt management** — version prompts, A/B test
- **OTLP integration** — meshes with observability elsewhere

Alt: LangSmith (easier, closed), Phoenix (open, eval-focused), Helicone (proxy-based).

## 6. Guardrails libraries

- **Guardrails AI** — input/output validation (PII, topics, format)
- **NeMo Guardrails** (Nvidia) — dialog-policy based
- **Custom pydantic + regex** — often enough for production

For v1, pydantic + a small custom policy module.

## 7. Relevant literature

- *"Building effective agents"* (Anthropic, Dec 2024) — orchestrator-worker pattern
- *"Agent-E"* (Emergence AI, 2024) — web-agent SOTA
- *"Reflexion"* (Shinn et al. 2023) — self-reflection in agents
- *"ReAct"* (Yao et al. 2022) — foundational pattern
- *"Plan-and-Solve"* (Wang et al. 2023)

## 8. Cost tiers (LLM choice per node)

| Node | Model | Why |
|------|-------|-----|
| Orchestrator (planning) | Claude Sonnet 4.6 | Needs reasoning |
| Researcher | Claude Sonnet 4.6 | Tool use + synthesis |
| Analyst | Claude Sonnet 4.6 | Code + data reasoning |
| Writer | Claude Sonnet 4.6 | Long-form quality |
| Reviewer | Claude Haiku | Cheap, fast critique |
| Classifier (is-this-done?) | Claude Haiku | Binary decision |

Mix-of-models is a legit cost lever — don't use Opus/Sonnet for every step.
