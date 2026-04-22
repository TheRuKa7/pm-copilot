# /ultrathink — pm-copilot

## 1. Why Rushil builds this specifically

Most agent demos are toys — "an agent that orders pizza." Rushil IS a PM; the agent he builds solves his *own* workflow. That's not a demo, it's dogfood. Recruiters see a candidate who ships for themselves before pitching to others.

Concretely: every Monday Rushil does competitor scans, reads customer interview notes, and drafts one-pagers. That's the workflow the copilot automates. The demo video is him using it at work.

## 2. Why LangGraph (and not CrewAI)?

CrewAI looks cleaner on the surface — role + task + crew. But:
- **Explicit state** matters in production. LangGraph's typed state machine is debuggable; CrewAI's implicit state is a black box when things fail.
- **Checkpointing** (LangGraph's `MemorySaver`, `SqliteSaver`, `PostgresSaver`) is a first-class concept. Critical for long-running tasks + human-in-the-loop.
- **Conditional edges** map directly to PM workflows: research-complete? → analyst. analyst-done? → writer.

Tradeoff: more verbose, steeper curve.

## 3. Why orchestrator-worker + reviewer?

From Anthropic's "Building effective agents": orchestrator-worker beats single-ReAct on tasks that decompose cleanly. PM tasks decompose cleanly.

The Reviewer (cheap Haiku) catches the 20-30% of cases where the initial draft misses the brief. Adding a reviewer > adding more steps to the main path.

## 4. Why bidirectional MCP?

- **Consumer:** eats MCP tools (doc_rag, etc.) — demonstrates ecosystem fluency
- **Provider:** exposed as MCP to Claude Desktop — the PM-specific version of "write me a PRD"

Bidirectional MCP is rare in portfolios. Shows genuine understanding of the protocol as plumbing, not just a product.

## 5. Runaway-loop mitigations (the #1 agent failure mode)

| Control | Default | Why |
|---------|---------|-----|
| Iteration cap | 8 | Most real tasks fit in < 6 dispatches |
| Budget cap | $0.50 | ~200K input + 50K output at Sonnet rates |
| Tool timeout | 30s | Web search / analysis should be fast |
| Retry cap | 3 | Exponential backoff; then fail loudly |
| Same-plan detector | On | If plan == last plan, break (no progress) |

Tests explicitly trigger each control. Without these, one malformed tool call burns $20 in an afternoon.

## 6. Mix-of-models for cost

Not every step needs Sonnet:
- Planning + writing → Sonnet (quality matters)
- Reviewing + classifying → Haiku (fast binary/short decisions)

Typical task: ~3 Sonnet calls + ~2 Haiku calls. With prompt caching for system prompts, avg cost < $0.30 per task.

## 7. PM framing

- **Problem:** PMs spend 30-40% of time on research, analysis, and first-draft writing
- **Insight:** These tasks are agentic-amenable — decomposable, tool-shaped, fits a plan-execute-review loop
- **Wedge:** Domain-specific templates (PRD, brief, one-pager) + integrations with PM tools (Linear, analytics, docs) — generic copilots miss these
- **Monetization:** Per-seat SaaS; enterprise tier adds SSO + audit + on-prem Langfuse
- **Competition:** ChatPRD, Coda AI, Notion AI — mostly chat, not agentic; no tool orchestration

## 8. Risks

| Risk | Mitigation |
|------|------------|
| Hallucinated tool args | Structured outputs (pydantic) + strict validation |
| Runaway loops | See §5 |
| Privacy in Langfuse traces | Scrubber layer before emission |
| Claude Desktop unavailable | Copilot works via web UI too; MCP is a delivery channel |
| Tavily/Anthropic outages | Graceful degradation; report partial results |
| Cost overruns | Per-task budget ceiling; alert on daily spend |

## 9. What v2 brings

- Fine-tuned classifier for "should reviewer reject?" (distill off Sonnet judgments)
- Personalized templates (learn Rushil's writing style)
- Slack/Linear write actions (post draft to channel)
- Multi-user + teams (shared templates, shared corpora)
- Voice input (speech-to-text wrapper)

## 10. Interview talking points

- *"Why multi-agent?"* — decomposition + specialization; orchestrator-worker from Anthropic
- *"How do you prevent runaway loops?"* — iteration cap + budget cap + same-plan detector + timeouts
- *"Why both REST and MCP?"* — REST for the web UI + programmatic use; MCP for Claude Desktop in-IDE experience
- *"How do you evaluate an agent?"* — golden tasks + Langfuse scoring (correctness, citation quality, cost efficiency)
- *"Mix of models?"* — Sonnet for reasoning/writing, Haiku for review/classification; cuts cost ~40% with no quality loss
