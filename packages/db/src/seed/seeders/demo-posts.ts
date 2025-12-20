import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { userPosts, userProfiles } from "../../schema";
import type { Seeder } from "./index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEMO_USER_EMAIL = "demo@example.com";

interface CsvRow {
  content: string;
  created_at: string;
  image_url: string;
}

/**
 * CSVをパース（ダブルクォートで囲まれた値に対応）
 */
const parseCsv = (csvContent: string): CsvRow[] => {
  const lines = csvContent.trim().split("\n");
  const dataLines = lines.slice(1); // ヘッダーをスキップ

  return dataLines.map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    return {
      content: values[0] || "",
      created_at: values[1] || "",
      image_url: values[2] || "",
    };
  });
};

export const demoPostsSeeder: Seeder = {
  name: "demo-posts",

  async reset(ctx) {
    console.log("  [demo-posts] Resetting demo posts...");

    const authUser = await ctx.db
      .select()
      .from(authUsers)
      .where(eq(authUsers.email, DEMO_USER_EMAIL))
      .limit(1);

    if (authUser.length === 0) {
      console.log("  [demo-posts] Demo user not found, skipping reset");
      return;
    }

    const profile = await ctx.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, authUser[0].id))
      .limit(1);

    if (profile.length === 0) {
      console.log("  [demo-posts] Profile not found, skipping reset");
      return;
    }

    const deleted = await ctx.db
      .delete(userPosts)
      .where(eq(userPosts.userProfileId, profile[0].id))
      .returning();

    console.log(`  [demo-posts] Deleted ${deleted.length} posts`);
  },

  async seed(ctx) {
    console.log("  [demo-posts] Seeding demo posts from CSV...");

    // デモユーザーを取得
    const authUser = await ctx.db
      .select()
      .from(authUsers)
      .where(eq(authUsers.email, DEMO_USER_EMAIL))
      .limit(1);

    if (authUser.length === 0) {
      console.log(
        "  [demo-posts] Demo user not found. Run users seeder first.",
      );
      return;
    }

    // プロフィールを取得
    const profile = await ctx.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, authUser[0].id))
      .limit(1);

    if (profile.length === 0) {
      console.log("  [demo-posts] Profile not found. Run users seeder first.");
      return;
    }

    const profileId = profile[0].id;

    // CSVファイルを読み込み
    const csvPath = path.join(__dirname, "../data/demo-posts.csv");
    if (!fs.existsSync(csvPath)) {
      console.log(`  [demo-posts] CSV file not found: ${csvPath}`);
      return;
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const rows = parseCsv(csvContent);

    // 投稿データを作成
    const posts = rows
      .filter((row) => row.content && row.created_at)
      .map((row) => {
        const createdAt = new Date(row.created_at);
        return {
          userProfileId: profileId,
          content: row.content,
          uploadImageUrl: row.image_url || null,
          createdAt,
          updatedAt: createdAt,
        };
      });

    if (posts.length === 0) {
      console.log("  [demo-posts] No valid posts found in CSV");
      return;
    }

    // createdAtでソート（古い順）して挿入
    posts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // bulk insert
    await ctx.db.insert(userPosts).values(posts);

    const withImage = posts.filter((p) => p.uploadImageUrl !== null).length;
    console.log(
      `  [demo-posts] Created ${posts.length} posts (${withImage} with images)`,
    );
  },
};
