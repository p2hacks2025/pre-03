import {
  type DbClient,
  type NewUserPost,
  type UserPost,
  userPosts,
} from "@packages/db";

export const createUserPost = async (
  db: DbClient,
  input: NewUserPost,
): Promise<UserPost> => {
  const result = await db.insert(userPosts).values(input).returning();

  return result[0];
};
