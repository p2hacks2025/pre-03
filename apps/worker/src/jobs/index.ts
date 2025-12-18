import type { WorkerContext } from "@/lib";
import { dailyUpdate } from "./daily-update";
import { healthCheck } from "./health-check";
import { notificationTest } from "./notification-test";

export const jobs = {
  "daily-update": dailyUpdate,
  "health-check": healthCheck,
  "notification-test": notificationTest,
} as const satisfies Record<string, (ctx: WorkerContext) => Promise<unknown>>;

export type JobName = keyof typeof jobs;
