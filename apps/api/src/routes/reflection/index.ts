import { createRouter } from "@/config/router";
import { getDateUpdateHandler, getReflectionCalendarHandler } from "./handlers";
import { getDateUpdateRoute, getReflectionCalendarRoute } from "./route";

export const reflectionRouter = createRouter()
  .openapi(getReflectionCalendarRoute, getReflectionCalendarHandler)
  .openapi(getDateUpdateRoute, getDateUpdateHandler);
