"use client";

import {
  CheckmarkCircleOutline,
  CloseCircleOutline,
  FileTrayStackedOutline,
  GlobeOutline,
  ServerOutline,
} from "react-ionicons";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import Link from "next/link";

type HealthResult = {
  ok: boolean;
  message: string;
  environment?: string;
};

interface HealthContentProps {
  api: HealthResult;
  db: HealthResult;
}

const StatusIcon = ({ ok }: { ok: boolean }) => {
  return ok ? (
    <CheckmarkCircleOutline color="#22C55E" width="20px" height="20px" />
  ) : (
    <CloseCircleOutline color="#EF4444" width="20px" height="20px" />
  );
};

export const HealthContent = ({ api, db }: HealthContentProps) => {
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
              <CheckmarkCircleOutline
                color="#16A34A"
                width="24px"
                height="24px"
              />
            ) : (
              <CloseCircleOutline color="#DC2626" width="24px" height="24px" />
            )}
          </div>
          <h1 className="font-semibold text-lg">
            {allOk ? "All Systems Operational" : "System Issues Detected"}
          </h1>
        </div>

        <Card>
          <CardBody className="divide-y divide-divider p-0">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <ServerOutline color="#71717A" width="16px" height="16px" />
                <div>
                  <p className="font-medium text-sm">API Server</p>
                  <p className="text-default-500 text-xs">{api.message}</p>
                </div>
              </div>
              <StatusIcon ok={api.ok} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <GlobeOutline color="#71717A" width="16px" height="16px" />
                <div>
                  <p className="font-medium text-sm">Environment</p>
                  <p className="text-default-500 text-xs">API runtime</p>
                </div>
              </div>
              <Chip
                color={api.environment === "production" ? "primary" : "default"}
                variant="flat"
                size="sm"
              >
                {api.environment ?? "unknown"}
              </Chip>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FileTrayStackedOutline
                  color="#71717A"
                  width="16px"
                  height="16px"
                />
                <div>
                  <p className="font-medium text-sm">Database</p>
                  <p className="text-default-500 text-xs">{db.message}</p>
                </div>
              </div>
              <StatusIcon ok={db.ok} />
            </div>
          </CardBody>
        </Card>

        <Button as={Link} href="/" variant="light" fullWidth>
          Back to Home
        </Button>
      </div>
    </div>
  );
};
