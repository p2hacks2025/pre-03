import { client } from "@/lib/api";
import { logger } from "@/lib/logger";

import { HealthContent } from "./_components/health-content";

type HealthResult = {
  ok: boolean;
  message: string;
  environment?: string;
};

const checkApiHealth = async (): Promise<HealthResult> => {
  try {
    const res = await client.health.$get();
    if (res.ok) {
      const data = await res.json();
      logger.info("API health check succeeded", {
        environment: data.environment,
      });
      return {
        ok: true,
        message: "Operational",
        environment: data.environment,
      };
    }
    logger.warn("API health check failed", { status: res.status });
    return { ok: false, message: `HTTP ${res.status}` };
  } catch (error) {
    logger.error(
      "API health check error",
      {},
      error instanceof Error ? error : undefined,
    );
    return { ok: false, message: "Connection failed" };
  }
};

const checkDbHealth = async (): Promise<HealthResult> => {
  try {
    const res = await client.health.db.$get();
    if (res.ok) {
      const data = await res.json();
      logger.info("DB health check succeeded", { database: data.database });
      return { ok: true, message: data.database };
    }
    logger.warn("DB health check failed", { status: res.status });
    return { ok: false, message: `HTTP ${res.status}` };
  } catch (error) {
    logger.error(
      "DB health check error",
      {},
      error instanceof Error ? error : undefined,
    );
    return { ok: false, message: "Connection failed" };
  }
};

const HealthPage = async () => {
  const [api, db] = await Promise.all([checkApiHealth(), checkDbHealth()]);

  return <HealthContent api={api} db={db} />;
};

export default HealthPage;
