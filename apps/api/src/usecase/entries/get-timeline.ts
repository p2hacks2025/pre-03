import type { DbClient } from "@packages/db";
import type {
  GetTimelineOutput,
  TimelineEntry,
  TimelineEntryType,
} from "@packages/schema/entry";
import { getAiPostsForTimeline } from "@/repository/ai-post";
import { getUserPostsForTimeline } from "@/repository/user-post";
import { getUserProfileByUserId } from "@/repository/user-profile";
import { AppError } from "@/shared/error/app-error";

type GetTimelineDeps = {
  db: DbClient;
};

type GetTimelineInput = {
  userId: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit: number;
};

type Cursor = {
  createdAt: string;
  id: string;
  type: TimelineEntryType;
};

const encodeCursor = (cursor: Cursor): string => {
  return btoa(JSON.stringify(cursor));
};

const decodeCursor = (encoded: string): Cursor | null => {
  try {
    const decoded = atob(encoded);
    const parsed = JSON.parse(decoded);
    if (
      typeof parsed.createdAt === "string" &&
      typeof parsed.id === "string" &&
      (parsed.type === "user" || parsed.type === "ai")
    ) {
      return parsed as Cursor;
    }
    // 後方互換性: type がない場合は user として扱う
    if (typeof parsed.createdAt === "string" && typeof parsed.id === "string") {
      return { ...parsed, type: "user" } as Cursor;
    }
    return null;
  } catch {
    return null;
  }
};

// 内部用の統合エントリ型
type MergedEntry = {
  type: TimelineEntryType;
  id: string;
  content: string;
  imageUrl: string | null;
  displayAt: Date;
  author: {
    username: string;
    avatarUrl: string | null;
  };
};

export const getTimeline = async (
  deps: GetTimelineDeps,
  input: GetTimelineInput,
): Promise<GetTimelineOutput> => {
  const { db } = deps;
  const { userId, from, to, cursor: cursorStr, limit } = input;

  // プロフィールを取得
  const profile = await getUserProfileByUserId(db, userId);
  if (!profile) {
    throw new AppError("NOT_FOUND", {
      message: "プロフィールが見つかりません",
    });
  }

  // カーソルをデコード
  let cursor: { createdAt: Date; id: string } | undefined;
  if (cursorStr) {
    const decoded = decodeCursor(cursorStr);
    if (!decoded) {
      throw new AppError("BAD_REQUEST", {
        message: "無効なカーソルです",
      });
    }
    cursor = {
      createdAt: new Date(decoded.createdAt),
      id: decoded.id,
    };
  }

  // 日付文字列をDateに変換
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  // 両方のテーブルから取得（各 limit + 1）
  const [userPosts, aiPosts] = await Promise.all([
    getUserPostsForTimeline(db, {
      profileId: profile.id,
      from: fromDate,
      to: toDate,
      cursor,
      limit: limit + 1,
    }),
    getAiPostsForTimeline(db, {
      userProfileId: profile.id,
      from: fromDate,
      to: toDate,
      cursor,
      limit: limit + 1,
    }),
  ]);

  // マージして統一フォーマットに変換
  const merged: MergedEntry[] = [
    ...userPosts.map((p) => ({
      type: "user" as const,
      id: p.id,
      content: p.content,
      imageUrl: p.uploadImageUrl,
      displayAt: p.createdAt,
      author: p.userProfile,
    })),
    ...aiPosts.map((p) => ({
      type: "ai" as const,
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      displayAt: p.publishedAt,
      author: p.aiProfile,
    })),
  ];

  // displayAt（新しい順）、同時刻ならid降順でソート
  merged.sort((a, b) => {
    const timeDiff = b.displayAt.getTime() - a.displayAt.getTime();
    if (timeDiff !== 0) return timeDiff;
    return b.id.localeCompare(a.id);
  });

  // limit + 1 から hasMore を判定
  const hasMore = merged.length > limit;
  const entries = merged.slice(0, limit);

  // 次のカーソルを生成
  let nextCursor: string | null = null;
  if (hasMore && entries.length > 0) {
    const lastEntry = entries[entries.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastEntry.displayAt.toISOString(),
      id: lastEntry.id,
      type: lastEntry.type,
    });
  }

  // レスポンス形式に変換
  const responseEntries: TimelineEntry[] = entries.map((entry) => ({
    type: entry.type,
    id: entry.id,
    content: entry.content,
    uploadImageUrl: entry.imageUrl,
    createdAt: entry.displayAt.toISOString(),
    author: entry.author,
  }));

  return {
    entries: responseEntries,
    nextCursor,
    hasMore,
  };
};
