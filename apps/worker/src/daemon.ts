import cron from "node-cron";
import { jobs } from "@/jobs";
import { getContext, TIMEZONE } from "@/lib";

const schedules = [
  { name: "daily-update", cron: "5 0 * * *", job: jobs["daily-update"] },
  { name: "weekly-reset", cron: "10 0 * * 1", job: jobs["weekly-reset"] },
] as const;
const ctx = getContext();

for (const schedule of schedules) {
  cron.schedule(
    schedule.cron,
    async () => {
      ctx.logger.info(`[cron] Starting: ${schedule.name}`);
      try {
        await schedule.job(ctx);
        ctx.logger.info(`[cron] Completed: ${schedule.name}`);
      } catch (error) {
        ctx.logger.error(`[cron] Failed: ${schedule.name}`, {}, error as Error);
      }
    },
    { timezone: TIMEZONE },
  );
}

ctx.logger.info("worker daemon started");
