import type { AppRouteHandler } from "@/context";
import { getReflectionCalendar } from "@/usecase/reflection/get-calendar";
import type { getReflectionCalendarRoute } from "./route";

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
