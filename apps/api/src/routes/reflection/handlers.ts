import type { AppRouteHandler } from "@/context";
import { getReflectionCalendar } from "@/usecase/reflection/get-calendar";
import { getWeeklyWorld } from "@/usecase/reflection/get-weekly-world";
import type { getReflectionCalendarRoute, getWeeklyWorldRoute } from "./route";

export const getReflectionCalendarHandler: AppRouteHandler<
  typeof getReflectionCalendarRoute
> = async (c) => {
  const { year, month } = c.req.valid("query");
  const user = c.get("user");
  const db = c.get("db");

  const result = await getReflectionCalendar(
    { db },
    { userId: user.id, year, month },
  );

  return c.json(result);
};

export const getWeeklyWorldHandler: AppRouteHandler<
  typeof getWeeklyWorldRoute
> = async (c) => {
  const { weekStartDate } = c.req.valid("query");
  const user = c.get("user");
  const db = c.get("db");

  const result = await getWeeklyWorld(
    { db },
    { userId: user.id, weekStartDate },
  );

  return c.json(result);
};
