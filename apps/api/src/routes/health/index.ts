import { createRouter } from "@/config/router";
import { dbHealthHandler, healthHandler } from "./handlers";
import { dbHealthRoute, healthRoute } from "./route";

export const healthRouter = createRouter()
  .openapi(healthRoute, healthHandler)
  .openapi(dbHealthRoute, dbHealthHandler);
