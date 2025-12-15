import type { RouteConfig } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "@packages/schema/common/error";

const jsonErrorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: ErrorResponseSchema,
    },
  },
});

export const DefaultErrorResponses: RouteConfig["responses"] = {
  400: jsonErrorResponse("Bad Request"),
  401: jsonErrorResponse("Unauthorized"),
  403: jsonErrorResponse("Forbidden"),
  404: jsonErrorResponse("Not Found"),
  409: jsonErrorResponse("Conflict"),
  500: jsonErrorResponse("Internal Server Error"),
};
