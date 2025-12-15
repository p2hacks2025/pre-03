import type { SeedContext, Seeder } from "./seeders";

export const runSeeders = async (
  seeders: Seeder[],
  ctx: SeedContext,
): Promise<void> => {
  // リセットまたはforceフラグがある場合は先にリセット
  if (ctx.options.reset || ctx.options.force) {
    console.log("--- Running reset phase ---");
    for (const seeder of seeders) {
      if (seeder.reset) {
        await seeder.reset(ctx);
      }
    }
  }

  // シード実行
  console.log("--- Running seed phase ---");
  for (const seeder of seeders) {
    await seeder.seed(ctx);
  }
};
