import { createRouter } from "@/config/router";
import {
  getDateUpdateHandler,
  getReflectionCalendarHandler,
  getWeeklyWorldHandler,
} from "./handlers";
import {
  getDateUpdateRoute,
  getReflectionCalendarRoute,
  getWeeklyWorldRoute,
} from "./route";

export const reflectionRouter = createRouter()
  .openapi(getReflectionCalendarRoute, getReflectionCalendarHandler)
  .openapi(getDateUpdateRoute, getDateUpdateHandler)
  .openapi(getWeeklyWorldRoute, getWeeklyWorldHandler);
