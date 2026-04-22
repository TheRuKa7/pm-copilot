import { Check, Circle, Loader2 } from "lucide-react";
import type { GraphState } from "@/lib/types";

export function PlanList({ state }: { state: GraphState }) {
  const inProgress = state.status !== "done" && state.status !== "error";
  return (
    <ol className="space-y-1">
      {state.plan.length === 0 ? (
        <li className="text-muted text-sm italic">Awaiting plan…</li>
      ) : null}
      {state.plan.map((step, i) => {
        const isLast = i === state.plan.length - 1;
        const done = !isLast || !inProgress;
        return (
          <li key={i} className="flex items-start gap-2 text-sm">
            {done ? (
              <Check className="h-4 w-4 text-success mt-0.5" />
            ) : inProgress && isLast ? (
              <Loader2 className="h-4 w-4 text-primary mt-0.5 animate-spin" />
            ) : (
              <Circle className="h-4 w-4 text-muted mt-0.5" />
            )}
            <span className={done ? "text-foreground" : "text-muted"}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
