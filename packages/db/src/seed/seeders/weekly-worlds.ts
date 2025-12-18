import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { and, eq, isNull } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { userProfiles, weeklyWorlds } from "../../schema";
import type { SeedContext, Seeder } from "./index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WORKER_EMAIL = "worker@example.com";
const ORIGIN_BASE_PATH = path.join(__dirname, "../assets/origin_base.png");

/**
 * 指定日の週の開始日（月曜日）を取得
 */
const getWeekStartDate = (targetDate: Date): Date => {
  const dayOfWeek = targetDate.getUTCDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate() - daysToMonday,
    ),
  );
};

/**
 * 画像をStorageにアップロードし、公開URLを返す
 */
const uploadOriginBase = async (
  ctx: SeedContext,
  userProfileId: string,
  weekStartDate: Date,
): Promise<string> => {
  const imageBuffer = fs.readFileSync(ORIGIN_BASE_PATH);
  const weekStr = weekStartDate.toISOString().split("T")[0];
  const storagePath = `weekly-worlds/${userProfileId}/${weekStr}/origin_base.png`;

  // 既存ファイルがあれば削除
  await ctx.adminSupabase.storage.from("images").remove([storagePath]);

  const { error } = await ctx.adminSupabase.storage
    .from("images")
    .upload(storagePath, imageBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload origin_base.png: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = ctx.adminSupabase.storage.from("images").getPublicUrl(storagePath);

  return publicUrl;
};

export const weeklyWorldsSeeder: Seeder = {
  name: "weekly-worlds",

  async reset(ctx) {
    console.log("Resetting weekly worlds for worker user...");

    // worker@example.com の userProfileId を取得
    const workerUser = await ctx.db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .innerJoin(authUsers, eq(authUsers.id, userProfiles.userId))
      .where(eq(authUsers.email, WORKER_EMAIL))
      .limit(1);

    if (workerUser.length === 0) {
      console.log("Worker user not found, skipping reset...");
      return;
    }

    const deleted = await ctx.db
      .delete(weeklyWorlds)
      .where(eq(weeklyWorlds.userProfileId, workerUser[0].id))
      .returning();

    console.log(`Deleted ${deleted.length} weekly worlds`);
  },

  async seed(ctx) {
    console.log("Seeding weekly worlds for worker user...");

    // worker@example.com の userProfileId を取得
    const workerUser = await ctx.db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .innerJoin(authUsers, eq(authUsers.id, userProfiles.userId))
      .where(eq(authUsers.email, WORKER_EMAIL))
      .limit(1);

    if (workerUser.length === 0) {
      console.log(
        "Worker user not found. Run usersSeeder first with worker@example.com",
      );
      return;
    }

    const userProfileId = workerUser[0].id;
    const now = new Date();
    const weekStartDate = getWeekStartDate(now);

    // 既存の weekly_world があるかチェック
    const existing = await ctx.db
      .select()
      .from(weeklyWorlds)
      .where(
        and(
          eq(weeklyWorlds.userProfileId, userProfileId),
          eq(weeklyWorlds.weekStartDate, weekStartDate),
          isNull(weeklyWorlds.deletedAt),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(
        `Weekly world already exists for ${WORKER_EMAIL} week ${weekStartDate.toISOString().split("T")[0]}, skipping...`,
      );
      return;
    }

    // origin_base.png をStorageにアップロード
    console.log("Uploading origin_base.png to Storage...");
    const imageUrl = await uploadOriginBase(ctx, userProfileId, weekStartDate);
    console.log(`Uploaded to: ${imageUrl}`);

    // weekly_worlds テーブルにレコード作成
    await ctx.db.insert(weeklyWorlds).values({
      userProfileId,
      weekStartDate,
      weeklyWorldImageUrl: imageUrl,
    });

    console.log(
      `Created weekly world for ${WORKER_EMAIL} week ${weekStartDate.toISOString().split("T")[0]}`,
    );
  },
};
