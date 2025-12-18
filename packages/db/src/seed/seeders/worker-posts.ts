import { eq } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { userPosts, userProfiles } from "../../schema";
import type { Seeder } from "./index";

const WORKER_EMAIL = "worker@example.com";

/**
 * worker@example.com 用のテスト投稿データ
 * daily-update ジョブのテストに使用する意味のある日本語の日記
 */
const WORKER_TEST_POSTS = [
  // 今日の投稿
  {
    content:
      "今日は朝早く起きて近所の公園をランニングした。空気が澄んでいて気持ちよかった。帰りにコンビニでコーヒーを買って、ベンチで一息。小さな幸せを感じた朝だった。",
    daysAgo: 0,
  },
  {
    content:
      "午後から図書館で読書。村上春樹の新作を読み始めた。静かな空間で本に集中できる時間は贅沢だと思う。",
    daysAgo: 0,
  },
  // 昨日の投稿（daily-update のテスト対象）
  {
    content:
      "初めてパン作りに挑戦した。強力粉をこねるのは想像以上に大変だったけど、オーブンから焼きたてのパンの香りがしてきた時は感動した。形はいびつだけど、味は最高。",
    daysAgo: 1,
  },
  {
    content:
      "夕方、友人と駅前のカフェで待ち合わせ。久しぶりに会って近況報告。お互い忙しいけど、こうやって時間を作って会えるのは大切だと改めて思った。",
    daysAgo: 1,
  },
  // 2日前の投稿
  {
    content:
      "新しいプログラミング言語の勉強を始めた。最初は難しく感じたけど、チュートリアルを一つずつ進めていくうちに少しずつ理解できてきた。継続は力なり。",
    daysAgo: 2,
  },
  // 3日前の投稿
  {
    content:
      "雨の日は家でゆっくり映画鑑賞。昔の名作を見返すと、当時とは違う感想を持つことがある。年を重ねることで見え方が変わるのは面白い。",
    daysAgo: 3,
  },
  {
    content:
      "夜、久しぶりに料理を作った。冷蔵庫にあった野菜でミネストローネ。温かいスープは心も体も温めてくれる。",
    daysAgo: 3,
  },
  // 5日前の投稿
  {
    content:
      "週末に近くの山にハイキングに行った。山頂からの景色は絶景で、日頃の疲れが吹き飛んだ。自然の中で過ごす時間は何物にも代えがたい。",
    daysAgo: 5,
  },
  // 1週間前の投稿
  {
    content:
      "新しいノートを買った。手書きでアイデアを書き出すと、デジタルとは違う発想が生まれる気がする。白紙のページが可能性で満ちているように感じる。",
    daysAgo: 7,
  },
];

export const workerPostsSeeder: Seeder = {
  name: "worker-posts",

  async reset(ctx) {
    console.log("Resetting worker posts...");

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
      .delete(userPosts)
      .where(eq(userPosts.userProfileId, workerUser[0].id))
      .returning();

    console.log(`Deleted ${deleted.length} worker posts`);
  },

  async seed(ctx) {
    console.log("Seeding worker posts...");

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

    for (const post of WORKER_TEST_POSTS) {
      // daysAgo に基づいて createdAt を計算
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - post.daysAgo);
      // 時刻をランダムに設定（9:00〜21:00）
      createdAt.setHours(9 + Math.floor(Math.random() * 12));
      createdAt.setMinutes(Math.floor(Math.random() * 60));

      await ctx.db.insert(userPosts).values({
        userProfileId,
        content: post.content,
        createdAt,
        updatedAt: createdAt,
      });

      console.log(
        `Created post: ${post.content.substring(0, 30)}... (${post.daysAgo} days ago)`,
      );
    }

    console.log(`Seeded ${WORKER_TEST_POSTS.length} posts for ${WORKER_EMAIL}`);
  },
};
