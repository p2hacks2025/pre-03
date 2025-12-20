import { userProfiles } from "../../schema";
import { resetAuthUsers } from "../utils/reset";
import type { Seeder } from "./index";

interface TestUser {
  email: string;
  password: string;
  username: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: "test@example.com",
    password: "password",
    username: "Test User",
  },
  {
    email: "admin@example.com",
    password: "password",
    username: "Admin User",
  },
  {
    email: "worker@example.com",
    password: "password",
    username: "Worker Test User",
  },
  {
    email: "demo@example.com",
    password: "password",
    username: "Demo User",
  },
];

export const usersSeeder: Seeder = {
  name: "users",

  async reset(ctx) {
    console.log("Resetting auth users...");
    const deletedCount = await resetAuthUsers(ctx.adminSupabase);
    console.log(
      `Deleted ${deletedCount} auth users (user_profiles cascade deleted)`,
    );
  },

  async seed(ctx) {
    console.log("Seeding users...");

    for (const user of TEST_USERS) {
      // 1. auth.usersにユーザー作成（メール確認スキップ）
      const { data, error } = await ctx.adminSupabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (error) {
        if (error.message.includes("already been registered")) {
          console.log(`User ${user.email} already exists, skipping...`);
          continue;
        }
        throw error;
      }

      if (!data.user) {
        throw new Error(`Failed to create user: ${user.email}`);
      }

      // 2. user_profilesテーブルにプロフィール作成
      await ctx.db.insert(userProfiles).values({
        userId: data.user.id,
        username: user.username,
      });

      console.log(`Created user: ${user.email}: password=${user.password}`);
    }
  },
};
