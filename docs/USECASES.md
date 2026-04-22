# USECASES — pm-copilot

End-to-end flows for a LangGraph-based PM copilot that researches, drafts,
reviews, and ships product artefacts (PRDs, release notes, user-interview
syntheses) with bounded budget and full observability.

## 1. Personas

| ID | Persona | Context | Primary JTBD |
|----|---------|---------|--------------|
| P1 | **APM (Ravi)** | 0–2 YOE, drowning in Slack / Jira; wants PRDs that don't take 3 days | "Turn my notes + a Linear epic into a first-draft PRD" |
| P2 | **Senior PM (Yuki)** | Ships a release every 2 weeks; tired of manual release notes | "Ingest merged PRs, produce customer-grade release notes" |
| P3 | **UX researcher (Bea)** | Just ran 8 user interviews; needs synthesis | "Cluster themes, pull quotes, surface contradictions" |
| P4 | **Founder / CPO (Anand)** | Wants a weekly "what's shipping" digest from Jira | "Ping me every Monday with a 1-page status" |
| P5 | **Platform engineer (Sam)** | Needs to trust that agents don't burn $100 on one run | "Show me the budget, the cost per run, and the kill switch" |

## 2. Jobs-to-be-done

JTBD-1. **Draft a PRD** from loose notes + linked tickets.
JTBD-2. **Generate release notes** from a PR set.
JTBD-3. **Synthesise interviews** into themes with quotes and contradictions.
JTBD-4. **Status digest** from Jira / Linear with ship-risk callouts.
JTBD-5. **Bounded cost & iteration**: hard caps on tokens, dollars, and steps.
JTBD-6. **Full traceability**: Langfuse trace for every run; replayable.
JTBD-7. **MCP surface**: agent tools expose + consume other MCP servers.

## 3. End-to-end flows

### Flow A — Ravi drafts a PRD

1. Runs `pm-copilot draft-prd --issue LIN-482 --notes notes.md`.
2. Orchestrator plans: fetch issue, fetch linked design-doc, summarise, ask clarifiers.
3. Worker agents run in parallel: researcher pulls background, drafter writes, reviewer critiques.
4. Returns PRD draft with a "questions for human" section marked clearly.
5. Ravi edits; re-runs `--revise` with his inline comments to iterate.

### Flow B — Yuki auto-drafts release notes

1. `pm-copilot release-notes --range v1.4.0..v1.5.0 --audience customer`.
2. Agent pulls merged PRs in range, groups by label (feature/fix/breaking),
   asks customer-voice reviewer agent to rewrite.
3. Output: markdown release notes + a changelog file diff.
4. Yuki reviews, edits, ships.

### Flow C — Bea synthesises 8 interviews

1. `pm-copilot interview-synth --dir ./interviews/ --goals goals.md`.
2. Worker agents: cluster themes, extract quotes with speaker attribution,
   flag contradictions across interviewees.
3. Output: `synthesis.md` with theme → quotes → severity.
4. Bea drops it into a Miro board; starts her debrief with clusters pre-built.

### Flow D — Anand's Monday digest

1. Cron triggers `pm-copilot status --weekly --source jira --project PLAT`.
2. Agent pulls "Done in last 7 days" + "In progress > 5 days" + "Blocked".
3. Produces a 1-page Markdown digest; posts to Slack #product-weekly.
4. Anand skims, asks follow-up: `pm-copilot ask "why is PLAT-812 blocked?"`.

### Flow E — Sam audits cost & limits

1. Opens Langfuse dashboard → sees last 30 runs with cost + latency + tokens.
2. Notices one run hit `max_budget_usd=0.50` cap; agent halted gracefully.
3. Reviews `docs/AGENTS.md` — confirms mix-of-models (Haiku for retrieval, Sonnet for writing).
4. Adds a new per-user budget cap via config.

### Flow F — Contributor adds a new tool

1. Implements `ToolDef` for Notion (read page → markdown).
2. Registers via `@tool("notion.read_page")`.
3. The orchestrator's planner now sees the tool in its available-actions list.
4. Integration test boots a sandbox Notion workspace and runs a full PRD draft.

## 4. Acceptance scenarios

```gherkin
Scenario: PRD draft returns "questions for human"
  When I run draft-prd with notes missing a success metric
  Then the output contains a "Questions for human" section
  And that section explicitly asks about the missing metric

Scenario: Budget cap halts the run
  Given max_budget_usd=0.10 and a task that would exceed it
  When I run pm-copilot ...
  Then the agent stops before exceeding the budget
  And the result includes reason="budget_exceeded" with cost <= 0.10

Scenario: Trace is in Langfuse
  Given LANGFUSE credentials are set
  When a run completes
  Then a new trace appears in Langfuse with span per agent call

Scenario: MCP tool is usable by external agents
  Given the MCP server is running
  When a client calls tool "research.summarise" with a URL
  Then a summary is returned with citations
```

## 5. Non-use-cases

- Autonomous shipping (no git push, no PR merges without human approval)
- Long-running background execution (>15 min) — jobs that big are deferred
- Legal / compliance drafting (disclaimer; humans own that)
- Generating OKRs from raw data without PM input
