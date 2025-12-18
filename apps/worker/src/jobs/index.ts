import type { WorkerContext } from "@/lib";
import { aiPostLongTerm } from "./ai-post-long-term";
import { aiPostPublish } from "./ai-post-publish";
import { aiPostShortTerm } from "./ai-post-short-term";
import { dailyUpdate } from "./daily-update";
import { healthCheck } from "./health-check";
import { notificationTest } from "./notification-test";
import { weeklyReset } from "./weekly-reset";

export const jobs = {
  "ai-post-long-term": aiPostLongTerm,
  "ai-post-publish": aiPostPublish,
  "ai-post-short-term": aiPostShortTerm,
  "daily-update": dailyUpdate,
  "health-check": healthCheck,
  "notification-test": notificationTest,
  "weekly-reset": weeklyReset,
} as const satisfies Record<string, (ctx: WorkerContext) => Promise<unknown>>;

export type JobName = keyof typeof jobs;
