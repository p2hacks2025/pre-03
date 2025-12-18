import type { DbClient } from "@packages/db";
import type { GetWeeklyWorldOutput } from "@packages/schema/reflection";
import { getAiPostsByWeek } from "@/repository/ai-post";
import { getUserPostsByWeek } from "@/repository/user-post";
import { getUserProfileByUserId } from "@/repository/user-profile";
import { getWeeklyWorldByDate } from "@/repository/weekly-world";
import { formatDateString } from "@/shared/date";
import { AppError } from "@/shared/error/app-error";

type GetWeeklyWorldDeps = { db: DbClient };
type GetWeeklyWorldInput = {
  userId: string;
  weekStartDate: string;
};

/**
 * 指定された日付が月曜日かどうかを検証
 * UTCベースで判定
 */
const validateMonday = (dateStr: string): Date => {
  const date = new Date(`${dateStr}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("BAD_REQUEST", {
      message: "無効な日付形式です",
    });
  }

  // UTC曜日: 0=日曜, 1=月曜, ..., 6=土曜
  if (date.getUTCDay() !== 1) {
    throw new AppError("BAD_REQUEST", {
      message: "weekStartDateは月曜日を指定してください",
    });
  }

  return date;
};

export const getWeeklyWorld = async (
  deps: GetWeeklyWorldDeps,
  input: GetWeeklyWorldInput,
): Promise<GetWeeklyWorldOutput> => {
  const { db } = deps;
  const { userId, weekStartDate: weekStartDateStr } = input;

  // 月曜日バリデーション
  const weekStartDate = validateMonday(weekStartDateStr);

  // プロフィール取得
  const profile = await getUserProfileByUserId(db, userId);
  if (!profile) {
    throw new AppError("NOT_FOUND", {
      message: "プロフィールが見つかりません",
    });
  }

  // トランザクション内で並列実行（読み取り一貫性確保）
  const result = await db.transaction(async (tx) => {
    const [weeklyWorld, userPosts, aiPosts] = await Promise.all([
      getWeeklyWorldByDate(tx, {
        profileId: profile.id,
        weekStartDate,
      }),
      getUserPostsByWeek(tx, {
        profileId: profile.id,
        weekStartDate,
      }),
      getAiPostsByWeek(tx, {
        profileId: profile.id,
        weekStartDate,
      }),
    ]);
    return { weeklyWorld, userPosts, aiPosts };
  });

  // 週間世界が存在しない場合はエラー
  if (!result.weeklyWorld) {
    throw new AppError("NOT_FOUND", {
      message: "指定された週の世界が見つかりません",
    });
  }

  // レスポンス変換
  return {
    weeklyWorld: {
      id: result.weeklyWorld.id,
      weekStartDate: formatDateString(result.weeklyWorld.weekStartDate),
      weeklyWorldImageUrl: result.weeklyWorld.weeklyWorldImageUrl,
      createdAt: result.weeklyWorld.createdAt.toISOString(),
      updatedAt: result.weeklyWorld.updatedAt.toISOString(),
    },
    userPosts: result.userPosts.map((post) => ({
      id: post.id,
      content: post.content,
      uploadImageUrl: post.uploadImageUrl,
      createdAt: post.createdAt.toISOString(),
    })),
    aiPosts: result.aiPosts.map((post) => ({
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      sourceStartAt: post.sourceStartAt.toISOString(),
      sourceEndAt: post.sourceEndAt.toISOString(),
      createdAt: post.createdAt.toISOString(),
      aiProfile: {
        id: post.aiProfile.id,
        username: post.aiProfile.username,
        avatarUrl: post.aiProfile.avatarUrl,
        description: post.aiProfile.description,
      },
    })),
  };
};
