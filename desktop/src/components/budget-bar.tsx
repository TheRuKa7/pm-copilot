import { cn } from "@/lib/utils";

export function BudgetBar({ cost, budget }: { cost: number; budget: number }) {
  const pct = budget > 0 ? Math.min(100, (cost / budget) * 100) : 0;
  const tone =
    pct > 90 ? "bg-danger" : pct > 65 ? "bg-warning" : "bg-primary";
  return (
    <div>
      <div className="flex justify-between text-xs text-muted mb-1">
        <span>Budget</span>
        <span className="tabular-nums">
          ${cost.toFixed(4)} / ${budget.toFixed(2)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
        <div className={cn("h-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
