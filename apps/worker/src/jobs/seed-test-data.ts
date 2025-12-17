import type { WorkerContext } from "@/lib";
import { type SeedTestDataResult, seedTestData } from "@/tasks";

export const seedTestDataJob = async (
  ctx: WorkerContext,
): Promise<SeedTestDataResult> => {
  ctx.logger.info("=== Starting seed-test-data job ===");

  // TARGET_DATE 環境変数があれば使用、なければ今日
  const targetDate = process.env.TARGET_DATE;

  const result = await seedTestData(ctx, targetDate);

  ctx.logger.info("=== seed-test-data job completed ===", {
    userProfileId: result.userProfileId,
    weeklyWorldId: result.weeklyWorldId,
    userPostId: result.userPostId,
    targetDate: result.targetDate,
  });

  return result;
};
