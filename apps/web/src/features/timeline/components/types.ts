import type { TimelineEntry } from "@packages/schema/entry";

export type TimelineItemProps = Omit<TimelineEntry, "type" | "id"> & {
  index?: number;
};
export type AiTimelineItemProps = TimelineItemProps;
export type UserTimelineItemProps = TimelineItemProps;
