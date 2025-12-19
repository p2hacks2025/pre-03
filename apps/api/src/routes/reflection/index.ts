import { createRouter } from "@/config/router";
import {
  getReflectionCalendarHandler,
  getWeeklyWorldHandler,
} from "./handlers";
import { getReflectionCalendarRoute, getWeeklyWorldRoute } from "./route";

export const reflectionRouter = createRouter()
  .openapi(getReflectionCalendarRoute, getReflectionCalendarHandler)
  .openapi(getWeeklyWorldRoute, getWeeklyWorldHandler);
