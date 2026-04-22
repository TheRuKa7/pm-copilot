"use client";

import { FileText, Play, Plus, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BudgetBar } from "@/components/budget-bar";
import { PlanList } from "@/components/plan-list";
import { listTasks, startTask, subscribeGraph } from "@/lib/api";
import type { GraphState, Task } from "@/lib/types";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";

type Kind = "prd" | "spec" | "review" | "roadmap" | "brief";
const KINDS: { id: Kind; label: string }[] = [
  { id: "prd", label: "PRD" },
  { id: "spec", label: "Spec" },
  { id: "review", label: "Review" },
  { id: "roadmap", label: "Roadmap" },
  { id: "brief", label: "Brief" },
];

const EMPTY_STATE: GraphState = {
  trace_id: "",
  status: "idle",
  plan: [],
  findings: [],
  draft: "",
  review: "",
  iterations: 0,
  max_iterations: 3,
  cost_usd: 0,
  budget_usd: 1.0,
  model_calls: [],
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [kind, setKind] = useState<Kind>("prd");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<GraphState>(EMPTY_STATE);
  const unsub = useRef<(() => void) | null>(null);

  useEffect(() => {
    listTasks().then(setTasks).catch(() => {});
  }, []);

  useEffect(() => {
    unsub.current?.();
    if (!activeId) return;
    unsub.current = subscribeGraph(activeId, setState);
    return () => unsub.current?.();
  }, [activeId]);

  async function onStart() {
    if (!title.trim() || !prompt.trim()) return;
    const t = await startTask(kind, title.trim(), prompt.trim());
    setTasks((xs) => [t, ...xs]);
    setActiveId(t.id);
    setTitle("");
    setPrompt("");
  }

  async function onSave() {
    const path = await save({
      defaultPath: `${state.trace_id || "draft"}.md`,
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
    if (!path) return;
    await writeTextFile(path, state.draft);
  }

  return (
    <div className="grid grid-cols-[260px_1fr_360px] h-screen">
      {/* Sidebar: task history */}
      <aside className="border-r border-border bg-surface flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="text-sm font-semibold">Tasks</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`w-full text-left px-3 py-2 text-sm border-b border-border/60 hover:bg-background/60 ${activeId === t.id ? "bg-background" : ""}`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="h-3.5 w-3.5 text-muted shrink-0" />
                <span className="truncate">{t.title}</span>
              </div>
              <div className="text-muted text-[11px] mt-0.5 flex gap-2">
                <span>{t.kind}</span>
                <span>·</span>
                <span>${t.cost_usd.toFixed(3)}</span>
              </div>
            </button>
          ))}
          {tasks.length === 0 ? (
            <div className="p-4 text-muted text-xs italic">No tasks yet.</div>
          ) : null}
        </div>
      </aside>

      {/* Main: composer + draft */}
      <main className="flex flex-col">
        <div className="border-b border-border p-3 flex items-center gap-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
            className="rounded-md bg-background border border-border text-sm px-2 py-1.5"
          >
            {KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-md bg-background border border-border text-sm px-2 py-1.5"
          />
          <button
            onClick={onStart}
            disabled={!title.trim() || !prompt.trim()}
            className="inline-flex items-center gap-1 rounded-md bg-primary text-white text-sm px-3 py-1.5 hover:opacity-90 disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5" /> Start
          </button>
          <button
            onClick={onSave}
            disabled={!state.draft}
            className="inline-flex items-center gap-1 rounded-md border border-border text-sm px-3 py-1.5 hover:bg-background disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" /> Save .md
          </button>
        </div>

        <textarea
          placeholder="Paste context, goals, constraints…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="h-32 p-3 bg-surface border-b border-border text-sm resize-none outline-none"
        />

        <div className="flex-1 overflow-y-auto p-4">
          {state.draft ? (
            <pre className="whitespace-pre-wrap text-sm leading-6 font-sans">{state.draft}</pre>
          ) : (
            <div className="text-muted text-sm italic flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Start a task to see the draft stream in.
            </div>
          )}
        </div>
      </main>

      {/* Right: plan + budget + traces */}
      <aside className="border-l border-border bg-surface flex flex-col">
        <div className="p-3 border-b border-border space-y-3">
          <div className="text-xs uppercase text-muted tracking-wide">Status</div>
          <div className="text-sm font-medium capitalize">{state.status}</div>
          <BudgetBar cost={state.cost_usd} budget={state.budget_usd} />
          <div className="text-xs text-muted">
            Iteration {state.iterations} / {state.max_iterations}
          </div>
        </div>

        <div className="p-3 border-b border-border">
          <div className="text-xs uppercase text-muted tracking-wide mb-2">Plan</div>
          <PlanList state={state} />
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs uppercase text-muted tracking-wide mb-2">Model calls</div>
          <ul className="space-y-1">
            {state.model_calls.slice(-20).map((c, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-xs border-b border-border/60 py-1"
              >
                <span className="truncate">
                  <span className="text-foreground">{c.node}</span>{" "}
                  <span className="text-muted">· {c.model}</span>
                  {c.cached ? <span className="text-success"> · cached</span> : null}
                </span>
                <span className="tabular-nums text-muted">${c.cost_usd.toFixed(4)}</span>
              </li>
            ))}
            {state.model_calls.length === 0 ? (
              <li className="text-muted italic text-xs">No calls yet.</li>
            ) : null}
          </ul>
        </div>
      </aside>
    </div>
  );
}
