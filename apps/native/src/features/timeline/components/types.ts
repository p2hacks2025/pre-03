import type { TimelineEntry } from "@packages/schema/entry";

/**
 * タイムラインアイテム共通Props
 * TimelineEntry から type と id を除いた形式
 */
export type TimelineItemProps = Omit<TimelineEntry, "type" | "id">;

/**
 * AI投稿用Props（TimelineItemProps と同じ）
 */
export type AiTimelineItemProps = TimelineItemProps;

/**
 * ユーザー投稿用Props（TimelineItemProps と同じ）
 */
export type UserTimelineItemProps = TimelineItemProps;
