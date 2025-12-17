import type { WorkerContext } from "@/lib";
import { healthCheck } from "./health-check";
import { notificationTest } from "./notification-test";

// ジョブ登録（名前でアクセスできるように）
export const jobs = {
  "health-check": healthCheck,
  "notification-test": notificationTest,
} as const satisfies Record<string, (ctx: WorkerContext) => Promise<unknown>>;

export type JobName = keyof typeof jobs;
