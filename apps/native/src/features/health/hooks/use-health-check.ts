import { useCallback, useEffect, useState } from "react";
import { client } from "@/lib/api";
import { logger } from "@/lib/logger";
import type { HealthCheckState, HealthResult } from "../types";

const checkApiHealth = async (): Promise<HealthResult> => {
  try {
    logger.debug("Checking API health");
    const res = await client.health.$get();
    if (res.ok) {
      const data = await res.json();
      logger.info("API health check passed", { environment: data.environment });
      return {
        ok: true,
        message: "Operational",
        environment: data.environment,
      };
    }
    logger.warn("API health check returned non-OK status", {
      status: res.status,
    });
    return { ok: false, message: `HTTP ${res.status}` };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("API health check failed", { endpoint: "/health" }, err);
    return { ok: false, message: "Connection failed" };
  }
};

const checkDbHealth = async (): Promise<HealthResult> => {
  try {
    logger.debug("Checking DB health");
    const res = await client.health.db.$get();
    if (res.ok) {
      const data = await res.json();
      logger.info("DB health check passed", { database: data.database });
      return { ok: true, message: data.database };
    }
    logger.warn("DB health check returned non-OK status", {
      status: res.status,
    });
    return { ok: false, message: `HTTP ${res.status}` };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("DB health check failed", { endpoint: "/health/db" }, err);
    return { ok: false, message: "Connection failed" };
  }
};

export const useHealthCheck = () => {
  const [state, setState] = useState<HealthCheckState>({
    api: null,
    db: null,
    isLoading: true,
    error: null,
    allOk: false,
  });

  const runHealthCheck = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    logger.debug("Starting health check");

    try {
      const [api, db] = await Promise.all([checkApiHealth(), checkDbHealth()]);

      const allOk = api.ok && db.ok;
      logger.info("Health check completed", { allOk, api: api.ok, db: db.ok });

      setState({
        api,
        db,
        isLoading: false,
        error: null,
        allOk,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Health check failed unexpectedly", {}, err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to check health status",
      }));
    }
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  return { ...state, refresh: runHealthCheck };
};
