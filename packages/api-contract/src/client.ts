import { hc } from "hono/client";
import type { AppType } from "./types";

export type ApiClient = ReturnType<typeof hc<AppType>>;

export const createClient = (
  baseUrl: string,
  options?: {
    credentials?: RequestCredentials;
    fetch?: typeof fetch;
  },
): ApiClient =>
  hc<AppType>(baseUrl, {
    fetch: options?.fetch
      ? options.fetch
      : options?.credentials
        ? (url: URL | RequestInfo, init?: RequestInit) =>
            fetch(url, { ...init, credentials: options.credentials })
        : undefined,
  });
