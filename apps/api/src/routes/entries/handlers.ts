import type { AppRouteHandler } from "@/context";
import { createSupabaseAdminClient } from "@/infrastructure/supabase";
import { AppError } from "@/shared/error/app-error";
import { createEntry } from "@/usecase/entries";
import type { createEntryRoute } from "./route";

export const createEntryHandler: AppRouteHandler<
  typeof createEntryRoute
> = async (c) => {
  const body = await c.req.parseBody();
  const content = body.content;
  const file = body.file;

  // multipart/form-dataなのでバリーデーションは手動で行う
  if (typeof content !== "string" || content.trim() === "") {
    throw new AppError("BAD_REQUEST", { message: "本文は必須です" });
  }

  if (file !== undefined && !(file instanceof File)) {
    throw new AppError("BAD_REQUEST", { message: "無効なファイル形式です" });
  }

  const user = c.get("user");
  const db = c.get("db");

  const supabaseAdmin = createSupabaseAdminClient(c.env);

  const result = await createEntry(
    { supabase: supabaseAdmin, db },
    {
      userId: user.id,
      content: content.trim(),
      file: file instanceof File ? file : undefined,
    },
  );

  return c.json(result, 201);
};
