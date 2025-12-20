import type { TimelineEntry } from "@packages/schema/entry";

export type TimelineItemProps = Omit<TimelineEntry, "type" | "id">;
export type AiTimelineItemProps = TimelineItemProps;
export type UserTimelineItemProps = TimelineItemProps;
