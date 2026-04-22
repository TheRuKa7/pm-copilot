import { z } from "zod";

export const GraphStateSchema = z.object({
  trace_id: z.string(),
  status: z.enum(["idle", "planning", "researching", "drafting", "reviewing", "done", "error"]),
  plan: z.array(z.string()),
  findings: z.array(z.string()),
  draft: z.string(),
  review: z.string(),
  iterations: z.number(),
  max_iterations: z.number(),
  cost_usd: z.number(),
  budget_usd: z.number(),
  model_calls: z.array(
    z.object({
      node: z.string(),
      model: z.string(),
      input_tokens: z.number(),
      output_tokens: z.number(),
      cost_usd: z.number(),
      cached: z.boolean().optional(),
      ts: z.string(),
    }),
  ),
});
export type GraphState = z.infer<typeof GraphStateSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(["prd", "spec", "review", "roadmap", "brief"]),
  created_at: z.string(),
  status: z.enum(["running", "done", "error"]),
  cost_usd: z.number(),
});
export type Task = z.infer<typeof TaskSchema>;
