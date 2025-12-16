import {
  and,
  type DbClient,
  eq,
  isNull,
  type NewUserProfile,
  type UserProfile,
  type UserProfileUpdate,
  userProfiles,
} from "@packages/db";

export const getUserProfileByUserId = async (
  db: DbClient,
  userId: string,
): Promise<UserProfile | null> => {
  const result = await db
    .select()
    .from(userProfiles)
    .where(and(eq(userProfiles.userId, userId), isNull(userProfiles.deletedAt)))
    .limit(1);

  return result[0] ?? null;
};

export const createUserProfile = async (
  db: DbClient,
  input: NewUserProfile,
): Promise<UserProfile> => {
  const result = await db.insert(userProfiles).values(input).returning();

  return result[0];
};

export const updateUserProfile = async (
  db: DbClient,
  userId: string,
  input: UserProfileUpdate,
): Promise<UserProfile | null> => {
  // 更新するフィールドがない場合は現在のプロフィールを返す
  if (Object.keys(input).length === 0) {
    return getUserProfileByUserId(db, userId);
  }

  const result = await db
    .update(userProfiles)
    .set(input)
    .where(and(eq(userProfiles.userId, userId), isNull(userProfiles.deletedAt)))
    .returning();

  return result[0] ?? null;
};

export const softDeleteUserProfile = async (
  db: DbClient,
  userId: string,
): Promise<UserProfile | null> => {
  const result = await db
    .update(userProfiles)
    .set({ deletedAt: new Date() })
    .where(and(eq(userProfiles.userId, userId), isNull(userProfiles.deletedAt)))
    .returning();

  return result[0] ?? null;
};
