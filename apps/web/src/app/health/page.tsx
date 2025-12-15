import { CheckCircle2, Database, Globe, Server, XCircle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { client } from "@/lib/api";
import { logger } from "@/lib/logger";

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

const StatusIcon = ({ ok }: { ok: boolean }) => {
  return ok ? (
    <CheckCircle2 className="h-5 w-5 text-green-500" />
  ) : (
    <XCircle className="h-5 w-5 text-red-500" />
  );
};

const HealthPage = async () => {
  const [api, db] = await Promise.all([checkApiHealth(), checkDbHealth()]);
  const allOk = api.ok && db.ok;

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
              allOk ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {allOk ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          <h1 className="font-semibold text-lg">
            {allOk ? "All Systems Operational" : "System Issues Detected"}
          </h1>
        </div>

        <Card>
          <CardContent className="divide-y p-0">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Server className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">API Server</p>
                  <p className="text-muted-foreground text-xs">{api.message}</p>
                </div>
              </div>
              <StatusIcon ok={api.ok} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Environment</p>
                  <p className="text-muted-foreground text-xs">API runtime</p>
                </div>
              </div>
              <Badge
                variant={
                  api.environment === "production" ? "default" : "secondary"
                }
              >
                {api.environment ?? "unknown"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Database</p>
                  <p className="text-muted-foreground text-xs">{db.message}</p>
                </div>
              </div>
              <StatusIcon ok={db.ok} />
            </div>
          </CardContent>
        </Card>

        <Button asChild variant="ghost" className="w-full">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default HealthPage;
