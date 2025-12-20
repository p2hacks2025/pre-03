import type { GetWeeklyWorldOutput } from "@packages/schema/reflection";

export interface DiaryEntry {
  id: string;
  content: string;
  createdAt: string;
  uploadImageUrl: string | null;
}

export interface AiTimelineItem {
  id: string;
  content: string;
  createdAt: string;
  uploadImageUrl: string | null;
  author: {
    username: string;
    avatarUrl: string | null;
  };
}

export interface WeeklyWorldData {
  weeklyWorld: GetWeeklyWorldOutput["weeklyWorld"] | null;
  userPosts: GetWeeklyWorldOutput["userPosts"];
  aiPosts: GetWeeklyWorldOutput["aiPosts"];
}

export type WeekChangeDirection = "prev" | "next";
