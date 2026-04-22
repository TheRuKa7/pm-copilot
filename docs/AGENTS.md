# Agents — pm-copilot

Specs for each agent: role, tools, prompt pattern, success criteria.

## Orchestrator

**Role:** Decompose user task into a Plan — ordered list of Steps assigned to specialists.

**Model:** Claude Sonnet 4.6
**Tools:** none (pure reasoning)
**Input:** `task: str, context: {user_profile, recent_tasks}`
**Output:** `Plan = [Step(agent, input, rationale), ...]`

**Prompt pattern:**
- System: role description + "think step by step" + "output JSON plan"
- Few-shot: 3 examples of task → plan

**Success:** plan has 2-5 steps, each step is concrete, dependencies make sense.

---

## Researcher

**Role:** Gather information via web search and document retrieval.

**Model:** Claude Sonnet 4.6
**Tools:** `web_search`, `doc_rag.retrieve`, `linear.query`
**Input:** `research_question: str`
**Output:** `list[Finding] = [{claim, source, confidence}, ...]`

**Agentic pattern:**
1. Decompose question into sub-queries
2. Issue tool calls in parallel
3. Reflect on results; fill gaps with follow-up queries
4. Synthesize findings with citations

**Success:** every claim cites a source; no unsupported statements.

---

## Analyst

**Role:** Run quantitative analysis on CSVs / DB / product metrics.

**Model:** Claude Sonnet 4.6
**Tools:** `spreadsheet.analyze` (pandas in sandbox), `linear.query`
**Input:** `data_source: str, question: str`
**Output:** `list[Insight] = [{metric, value, trend, confidence, method}, ...]`

**Agentic pattern:**
1. Inspect data (columns, dtypes, head)
2. Generate analysis code
3. Execute; check for errors; retry
4. Interpret results

**Success:** numbers are reproducible; method is stated (e.g., "weekly cohort analysis").

---

## Writer

**Role:** Draft artifacts using templates — PRD, one-pager, brief, email.

**Model:** Claude Sonnet 4.6
**Tools:** none (pure generation over context)
**Input:** `template: Literal[...], findings, analysis, style_hints`
**Output:** `draft: str` (markdown)

**Templates shipped:**
- `prd` — problem, users, metrics, solution, scope, risks
- `onepager` — exec-facing summary with decision ask
- `brief` — 3-paragraph memo
- `email` — concise, action-oriented

**Success:** draft fills every template section; cites findings; matches tone.

---

## Reviewer

**Role:** Self-critique the output; decide approve / revise / reject.

**Model:** Claude Haiku (cheap, fast)
**Tools:** none
**Input:** `task, plan, output, findings, analysis`
**Output:** `ReviewVerdict = {decision: approve|revise|reject, critique: str, revision_hints: list[str]}`

**Checks:**
- Does output answer the original task?
- Are citations real (exist in findings)?
- Is tone/format correct?
- Any obvious errors?

**Success:** catches 80%+ of issues a human reviewer would catch.

---

## Human gate

Before any "publish" action (send email, create Linear ticket, post to Slack), user must click "Approve" in the UI. Approval writes to Langfuse as a scored trace.
