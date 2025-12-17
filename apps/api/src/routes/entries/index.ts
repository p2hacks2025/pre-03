import { createRouter } from "@/config/router";
import { createEntryHandler, getTimelineHandler } from "./handlers";
import { createEntryRoute, getTimelineRoute } from "./route";

export const entriesRouter = createRouter()
  .openapi(createEntryRoute, createEntryHandler)
  .openapi(getTimelineRoute, getTimelineHandler);
