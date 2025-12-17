import { createRouter } from "@/config/router";
import { createEntryHandler } from "./handlers";
import { createEntryRoute } from "./route";

export const entriesRouter = createRouter().openapi(
  createEntryRoute,
  createEntryHandler,
);
