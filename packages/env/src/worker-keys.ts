import { z } from "zod";
import { dbKeys } from "./db-keys";

export const workerKeys = {
  ...dbKeys,
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
<<<<<<< HEAD
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GOOGLE_API_KEY: z.string().min(1),
=======
  ONESIGNAL_APP_ID: z.uuid(),
  ONESIGNAL_REST_API_KEY: z.string().min(1),
>>>>>>> 73e4509 (任意のユーザーに対してリモートで通知を送信できるようにする (#50))
};

export type WorkerKeys = typeof workerKeys;
