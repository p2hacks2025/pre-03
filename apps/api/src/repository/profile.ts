import {
  type DbClient,
  eq,
  type NewProfile,
  type Profile,
  type ProfileUpdate,
  profiles,
} from "@packages/db";

export const getProfileByUserId = async (
  db: DbClient,
  userId: string,
): Promise<Profile | null> => {
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  return result[0] ?? null;
};

export const createProfile = async (
  db: DbClient,
  input: NewProfile,
): Promise<Profile> => {
  const result = await db.insert(profiles).values(input).returning();

  return result[0];
};

export const updateProfile = async (
  db: DbClient,
  userId: string,
  input: ProfileUpdate,
): Promise<Profile | null> => {
  // 更新するフィールドがない場合は現在のプロフィールを返す
  if (Object.keys(input).length === 0) {
    return getProfileByUserId(db, userId);
  }

  const result = await db
    .update(profiles)
    .set(input)
    .where(eq(profiles.userId, userId))
    .returning();

  return result[0] ?? null;
};
