import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  eq,
  isNull,
  userPosts,
  userProfiles,
  weeklyWorlds,
} from "@packages/db";
import type { WorkerContext } from "@/lib";
import { getWeekStartDate } from "./daily-update";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = resolve(__dirname, "../../assets");

export type SeedTestDataResult = {
  success: boolean;
  userProfileId: string;
  weeklyWorldId: string;
  userPostId: string;
  targetDate: string;
  imageUrl: string;
};

export const seedTestData = async (
  ctx: WorkerContext,
  targetDateStr?: string,
): Promise<SeedTestDataResult> => {
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
  const weekStartDate = getWeekStartDate(targetDate);

  ctx.logger.info("Seeding test data", {
    targetDate: targetDate.toISOString().split("T")[0],
    weekStartDate: weekStartDate.toISOString().split("T")[0],
  });

  const profiles = await ctx.db
    .select()
    .from(userProfiles)
    .where(isNull(userProfiles.deletedAt))
    .limit(1);

  if (profiles.length === 0) {
    throw new Error("No user profiles found. Run db:seed first.");
  }

  const userProfileId = profiles[0].id;
  ctx.logger.info("Using user profile", { userProfileId });

  const baseImagePath = resolve(ASSETS_DIR, "images/bases/origin_base.png");
  const baseImageBuffer = readFileSync(baseImagePath);
  const weekStr = weekStartDate.toISOString().split("T")[0];
  const storagePath = `weekly-worlds/${userProfileId}/${weekStr}/initial.png`;

  const { error: uploadError } = await ctx.supabase.storage
    .from("images")
    .upload(storagePath, baseImageBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = ctx.supabase.storage.from("images").getPublicUrl(storagePath);

  ctx.logger.info("Uploaded initial image", { publicUrl });

  const existingWorld = await ctx.db
    .select()
    .from(weeklyWorlds)
    .where(eq(weeklyWorlds.userProfileId, userProfileId))
    .limit(1);

  let weeklyWorldId: string;

  if (existingWorld.length > 0) {
    weeklyWorldId = existingWorld[0].id;
    await ctx.db
      .update(weeklyWorlds)
      .set({
        weeklyWorldImageUrl: publicUrl,
        weekStartDate: weekStartDate,
      })
      .where(eq(weeklyWorlds.id, weeklyWorldId));
    ctx.logger.info("Updated existing weekly world", { weeklyWorldId });
  } else {
    const [inserted] = await ctx.db
      .insert(weeklyWorlds)
      .values({
        userProfileId,
        weekStartDate: weekStartDate,
        weeklyWorldImageUrl: publicUrl,
      })
      .returning();
    weeklyWorldId = inserted.id;
    ctx.logger.info("Created weekly world", { weeklyWorldId });
  }

  const postCreatedAt = new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      3,
      0,
      0,
      0,
    ),
  );

  const [insertedPost] = await ctx.db
    .insert(userPosts)
    .values({
      userProfileId,
      content:
        "今日はとても良い天気だった。公園を散歩して、桜の木の下でお弁当を食べた。春の訪れを感じる一日だった。",
      createdAt: postCreatedAt,
    })
    .returning();

  ctx.logger.info("Created user post", {
    userPostId: insertedPost.id,
    createdAt: postCreatedAt.toISOString(),
  });

  return {
    success: true,
    userProfileId,
    weeklyWorldId,
    userPostId: insertedPost.id,
    targetDate: targetDate.toISOString().split("T")[0],
    imageUrl: publicUrl,
  };
};
