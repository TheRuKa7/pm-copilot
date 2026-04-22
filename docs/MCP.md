# MCP — pm-copilot

## Bidirectional design

### As a consumer
`pm-copilot` invokes these MCP tools (from sibling servers):
- `doc_rag.retrieve(query, corpus?)` — from `doc-rag` repo
- `forecast.predict(series, horizon)` — from `quanta-forecast` repo *(v2)*

### As a provider
`pm-copilot` exposes these tools to any MCP client (Claude Desktop, Cursor):
- `pm_copilot.do_task(task, context?)` — run full agentic flow
- `pm_copilot.research(question)` — just the researcher agent
- `pm_copilot.draft(template, findings)` — just the writer

## Claude Desktop config

```json
{
  "mcpServers": {
    "pm-copilot": {
      "command": "uv",
      "args": ["run", "--directory", "/path/to/pm-copilot", "python", "-m", "pm_copilot.mcp.server"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-...",
        "TAVILY_API_KEY": "tvly-...",
        "LANGFUSE_PUBLIC_KEY": "pk-lf-...",
        "LANGFUSE_SECRET_KEY": "sk-lf-...",
        "DOC_RAG_URL": "http://localhost:8000"
      }
    }
  }
}
```

## Example in Claude Desktop

> *"Use pm-copilot: research LambdaTest's competitor BrowserStack, compare their pricing tiers, and draft a one-pager on our response strategy."*

Claude Desktop invokes `pm_copilot.do_task(...)`, streams progress, shows approval gate, delivers artifact. You stay in Claude Desktop; no context-switch.

## Why this pattern rocks for portfolio

- Shows MCP *depth* (both consumer and provider)
- Shows AI-native interface thinking (not just "service behind HTTP")
- Demoable in 60 seconds — recruiter opens Claude Desktop, watches task run
