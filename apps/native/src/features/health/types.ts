export type HealthResult = {
  ok: boolean;
  message: string;
  environment?: string;
};

export type HealthCheckState = {
  api: HealthResult | null;
  db: HealthResult | null;
  isLoading: boolean;
  error: string | null;
  allOk: boolean;
};
