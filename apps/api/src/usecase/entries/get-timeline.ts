import type { DbClient } from "@packages/db";
import type { GetTimelineOutput } from "@packages/schema/entry";
import { getUserPostsByProfileId } from "@/repository/user-post";
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
};

const encodeCursor = (cursor: Cursor): string => {
  return btoa(JSON.stringify(cursor));
};

const decodeCursor = (encoded: string): Cursor | null => {
  try {
    const decoded = atob(encoded);
    const parsed = JSON.parse(decoded);
    if (typeof parsed.createdAt === "string" && typeof parsed.id === "string") {
      return parsed as Cursor;
    }
    return null;
  } catch {
    return null;
  }
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

  // limit + 1 で取得して、余分があれば hasMore = true
  const posts = await getUserPostsByProfileId(db, {
    profileId: profile.id,
    from: fromDate,
    to: toDate,
    cursor,
    limit: limit + 1,
  });

  const hasMore = posts.length > limit;
  const entries = posts.slice(0, limit);

  // 次のカーソルを生成
  let nextCursor: string | null = null;
  if (hasMore && entries.length > 0) {
    const lastEntry = entries[entries.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastEntry.createdAt.toISOString(),
      id: lastEntry.id,
    });
  }

  return {
    entries: entries.map((entry) => ({
      id: entry.id,
      content: entry.content,
      uploadImageUrl: entry.uploadImageUrl,
      createdAt: entry.createdAt.toISOString(),
    })),
    nextCursor,
    hasMore,
  };
};
