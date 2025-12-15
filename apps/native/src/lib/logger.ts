import type { LogLevel } from "@packages/logger";
import { createLogger } from "@packages/logger";
import { env } from "./env";

export const logger = createLogger({
  level: (env.LOG_LEVEL as LogLevel | undefined) ?? "info",
  isProduction: env.ENVIRONMENT === "production",
  environment: env.ENVIRONMENT,
  context: { app: "native" },
});
