import cron from "node-cron";
import { jobs } from "@/jobs";
import { getContext } from "@/lib";

// スケジュール定義
const schedules = [
  // 1分ごとにヘルスチェック（デモ用）
  { name: "health-check", cron: "* * * * *", job: jobs["health-check"] },
] as const;

const ctx = getContext();

// スケジュール登録
for (const schedule of schedules) {
  cron.schedule(schedule.cron, async () => {
    ctx.logger.info(`[cron] Starting: ${schedule.name}`);
    try {
      await schedule.job(ctx);
      ctx.logger.info(`[cron] Completed: ${schedule.name}`);
    } catch (error) {
      ctx.logger.error(`[cron] Failed: ${schedule.name}`, {}, error as Error);
    }
  });
  ctx.logger.info(`Scheduled: ${schedule.name} (${schedule.cron})`);
}

ctx.logger.info("worker daemon started");
