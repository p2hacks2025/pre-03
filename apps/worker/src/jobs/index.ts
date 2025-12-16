import type { WorkerContext } from "@/lib";
import { healthCheck } from "./health-check";

// ジョブ登録（名前でアクセスできるように）
export const jobs = {
  "health-check": healthCheck,
} as const satisfies Record<string, (ctx: WorkerContext) => Promise<unknown>>;

export type JobName = keyof typeof jobs;
