import {
  and,
  eq,
  isNull,
  type WeeklyWorld,
  weeklyWorlds,
  worldBuildLogs,
} from "@packages/db";
import { FIELD_ID_MAX, FIELD_ID_MIN } from "../constants";
import type { WorkerContext } from "../context";

export const getWeeklyWorld = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
): Promise<WeeklyWorld> => {
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

  if (existing.length === 0) {
    ctx.logger.error("Weekly world not found", {
      userProfileId,
      weekStartDate: weekStartDate.toISOString().split("T")[0],
    });
    throw new Error(
      `Weekly world not found for user ${userProfileId} week ${weekStartDate.toISOString().split("T")[0]}`,
    );
  }

  return existing[0];
};

export const findWeeklyWorld = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
): Promise<WeeklyWorld | null> => {
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

  return existing[0] ?? null;
};

export const createWeeklyWorld = async (
  ctx: WorkerContext,
  userProfileId: string,
  weekStartDate: Date,
  imageUrl: string,
): Promise<WeeklyWorld> => {
  const [created] = await ctx.db
    .insert(weeklyWorlds)
    .values({
      userProfileId,
      weekStartDate,
      weeklyWorldImageUrl: imageUrl,
    })
    .returning();

  return created;
};

export const updateWeeklyWorldImage = async (
  ctx: WorkerContext,
  weeklyWorldId: string,
  newImageUrl: string,
): Promise<void> => {
  await ctx.db
    .update(weeklyWorlds)
    .set({ weeklyWorldImageUrl: newImageUrl })
    .where(eq(weeklyWorlds.id, weeklyWorldId));
};

export const selectFieldId = async (
  ctx: WorkerContext,
  weeklyWorldId: string,
): Promise<{ fieldId: number; isOverwrite: boolean }> => {
  const usedLogs = await ctx.db
    .select({ fieldId: worldBuildLogs.fieldId })
    .from(worldBuildLogs)
    .where(eq(worldBuildLogs.weeklyWorldId, weeklyWorldId));

  const usedFieldIds = new Set(usedLogs.map((log) => log.fieldId));

  const availableFieldIds: number[] = [];
  for (let i = FIELD_ID_MIN; i <= FIELD_ID_MAX; i++) {
    if (!usedFieldIds.has(i)) {
      availableFieldIds.push(i);
    }
  }

  if (availableFieldIds.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableFieldIds.length);
    return { fieldId: availableFieldIds[randomIndex], isOverwrite: false };
  }

  const randomFieldId =
    Math.floor(Math.random() * (FIELD_ID_MAX - FIELD_ID_MIN + 1)) +
    FIELD_ID_MIN;
  return { fieldId: randomFieldId, isOverwrite: true };
};

export const createOrUpdateWorldBuildLog = async (
  ctx: WorkerContext,
  weeklyWorldId: string,
  fieldId: number,
  createDate: Date,
  isOverwrite: boolean,
): Promise<void> => {
  if (isOverwrite) {
    await ctx.db
      .update(worldBuildLogs)
      .set({ createDate })
      .where(
        and(
          eq(worldBuildLogs.weeklyWorldId, weeklyWorldId),
          eq(worldBuildLogs.fieldId, fieldId),
        ),
      );
  } else {
    await ctx.db.insert(worldBuildLogs).values({
      weeklyWorldId,
      fieldId,
      createDate,
    });
  }
};
