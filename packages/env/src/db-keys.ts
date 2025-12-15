import { z } from "zod";

export const dbKeys = {
  DATABASE_URL: z.url(),
};

export type DbKeys = typeof dbKeys;
