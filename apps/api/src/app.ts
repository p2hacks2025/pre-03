import { swaggerUI } from "@hono/swagger-ui";
import { createRouter } from "@/config/router";
import { corsMiddleware } from "@/middleware/cors";
import { envMiddleware } from "@/middleware/env";
import { loggerMiddleware } from "@/middleware/logger";
import { routes } from "@/routes";
import { createErrorHandler } from "@/shared/error/error-handler";

const app = createRouter();

app.onError(createErrorHandler());

app.use("*", envMiddleware);
app.use("*", loggerMiddleware);
app.use("*", corsMiddleware);

// ルートをマウント
app.route("/", routes);

// OpenAPI設定
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Supabase Auth JWT token",
});

app.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Hono API",
    description: "Hono API with OpenAPI documentation",
  },
});

app.get("/docs", swaggerUI({ url: "/openapi" }));

export default app;
export { routes };
