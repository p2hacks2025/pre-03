import { z } from "@hono/zod-openapi";

export const HealthSchema = z
  .object({
    status: z.enum(["healthy", "unhealthy"]),
    timestamp: z.string(),
    environment: z.enum(["development", "staging", "production"]).optional(),
    error: z.string().optional(),
  })
  .openapi("Health");

export type Health = z.infer<typeof HealthSchema>;

/**
 * Input / Output Schemas
 */
export const GetHealthOutputSchema = HealthSchema.openapi("GetHealthOutput");
export type GetHealthOutput = z.infer<typeof GetHealthOutputSchema>;

export const GetDbHealthOutputSchema = HealthSchema.extend({
  database: z.enum(["connected", "disconnected"]),
}).openapi("GetDbHealthOutput");
export type GetDbHealthOutput = z.infer<typeof GetDbHealthOutputSchema>;
