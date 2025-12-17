import type { WorkerContext } from "@/lib";
import { dailyUpdate } from "./daily-update";
import { dailyUpdateDate } from "./daily-update-date";
import { healthCheck } from "./health-check";
<<<<<<< HEAD
import { seedTestDataJob } from "./seed-test-data";
=======
import { notificationTest } from "./notification-test";
>>>>>>> 73e4509 (任意のユーザーに対してリモートで通知を送信できるようにする (#50))

export const jobs = {
  "daily-update": dailyUpdate,
  "daily-update-date": dailyUpdateDate,
  "health-check": healthCheck,
<<<<<<< HEAD
  "seed-test-data": seedTestDataJob,
=======
  "notification-test": notificationTest,
>>>>>>> 73e4509 (任意のユーザーに対してリモートで通知を送信できるようにする (#50))
} as const satisfies Record<string, (ctx: WorkerContext) => Promise<unknown>>;

export type JobName = keyof typeof jobs;
