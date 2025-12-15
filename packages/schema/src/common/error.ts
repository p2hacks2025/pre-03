import { z } from "@hono/zod-openapi";

export const ErrorCodeSchema = z
  .enum([
    "BAD_REQUEST",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "NOT_FOUND",
    "CONFLICT",
    "INTERNAL_SERVER_ERROR",
  ])
  .openapi("ErrorCode");

export const ErrorDetailSchema = z
  .object({
    field: z.string().optional().openapi({ example: "email" }),
    message: z.string().openapi({
      example: "Please enter a valid email address",
    }),
  })
  .openapi("ErrorDetail");

export const ErrorResponseSchema = z
  .object({
    error: z
      .object({
        code: ErrorCodeSchema,
        message: z.string().openapi({
          example: "Invalid input data",
        }),
        details: z.array(ErrorDetailSchema).optional(),
      })
      .openapi("ErrorObject"),
  })
  .openapi("ErrorResponse");

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
