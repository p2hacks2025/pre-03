import { createRouter } from "@/config/router";
import { getReflectionCalendarHandler } from "./handlers";
import { getReflectionCalendarRoute } from "./route";

export const reflectionRouter = createRouter().openapi(
  getReflectionCalendarRoute,
  getReflectionCalendarHandler,
);
