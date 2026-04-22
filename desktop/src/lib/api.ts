import { z } from "zod";
import { GraphState, GraphStateSchema, Task, TaskSchema } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function listTasks(): Promise<Task[]> {
  const r = await fetch(`${BASE}/tasks`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return z.array(TaskSchema).parse(await r.json());
}

export async function getTask(id: string): Promise<Task> {
  const r = await fetch(`${BASE}/tasks/${id}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return TaskSchema.parse(await r.json());
}

export async function startTask(kind: string, title: string, prompt: string): Promise<Task> {
  const r = await fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, title, prompt }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return TaskSchema.parse(await r.json());
}

/**
 * Subscribe to the live graph state for a task via SSE. Each frame carries
 * the full GraphState so the UI can re-render idempotently.
 */
export function subscribeGraph(
  taskId: string,
  onState: (s: GraphState) => void,
  onError?: (e: Error) => void,
): () => void {
  // EventSource exists in Tauri's webview (Chromium / WebKit / WebView2)
  const es = new EventSource(`${BASE}/tasks/${taskId}/stream`);
  es.onmessage = (e) => {
    try {
      onState(GraphStateSchema.parse(JSON.parse(e.data)));
    } catch (err) {
      onError?.(err as Error);
    }
  };
  es.onerror = () => {
    onError?.(new Error("stream error"));
    es.close();
  };
  return () => es.close();
}
