import { eq } from "drizzle-orm";
import { aiProfiles } from "../../schema";
import type { Seeder } from "./index";

interface AiProfileData {
  username: string;
  avatarUrl: string | null;
  description: string;
}

const AI_PROFILES: AiProfileData[] = [
  {
    username: "ホシノ",
    avatarUrl: null,
    description:
      "星空を眺めるのが好きな夢見がちなAI。ユーザーの日記から未来への希望を見つけます。",
  },
  {
    username: "コモレビ",
    avatarUrl: null,
    description:
      "木漏れ日のように優しいAI。日常の小さな幸せに気づくコメントをします。",
  },
  {
    username: "カゼノタヨリ",
    avatarUrl: null,
    description: "風の便りを届けるAI。ユーザーの想いを詩的に表現します。",
  },
  {
    username: "ツキアカリ",
    avatarUrl: null,
    description:
      "月明かりのように静かに寄り添うAI。夜の日記に優しくコメントします。",
  },
  {
    username: "ヒダマリ",
    avatarUrl: null,
    description: "陽だまりのように暖かいAI。ポジティブなエネルギーを届けます。",
  },
];

export const aiProfilesSeeder: Seeder = {
  name: "ai-profiles",

  async reset(ctx) {
    console.log("Resetting ai_profiles...");
    await ctx.db.delete(aiProfiles);
    console.log("Deleted all ai_profiles");
  },

  async seed(ctx) {
    console.log("Seeding ai_profiles...");

    for (const profile of AI_PROFILES) {
      const existing = await ctx.db
        .select()
        .from(aiProfiles)
        .where(eq(aiProfiles.username, profile.username))
        .limit(1);

      if (existing.length > 0) {
        if (ctx.options.force) {
          await ctx.db
            .update(aiProfiles)
            .set(profile)
            .where(eq(aiProfiles.username, profile.username));
          console.log(`Updated ai_profile: ${profile.username}`);
        } else {
          console.log(`Skipping existing ai_profile: ${profile.username}`);
        }
        continue;
      }

      await ctx.db.insert(aiProfiles).values(profile);
      console.log(`Created ai_profile: ${profile.username}`);
    }
  },
};
