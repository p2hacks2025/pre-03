import { OpenAPIHono } from "@hono/zod-openapi";
import type { Bindings, Variables } from "@/context";
import { fromZodError } from "@/shared/error/zod-error";

/**
 * defaultHook が設定された OpenAPIHono インスタンスを作成
 *
 * @hono/zod-openapi では、各ルーターインスタンスが独自の defaultHook を持つ必要があるため、
 * 共通のファクトリー関数を使用して一貫したエラーハンドリングを実現する
 */
export const createRouter = () => {
  return new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>({
    defaultHook(result, c) {
      if (!result.success) {
        const logger = c.get("logger");
        logger.debug("Validation failed in defaultHook", {
          errors: result.error.issues,
        });
        const appError = fromZodError(result.error);
        return appError.getResponse();
      }
    },
  });
};
