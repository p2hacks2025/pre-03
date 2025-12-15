import type { ErrorDetail } from "@packages/schema/common/error";
import type { ZodError } from "zod";
import { AppError } from "./app-error";

const zodIssuesToDetails = (err: ZodError): ErrorDetail[] => {
  return err.issues.map((issue) => ({
    field: issue.path.join(".") || undefined,
    message: issue.message,
  }));
};

export const fromZodError = (err: ZodError): AppError => {
  return new AppError("BAD_REQUEST", {
    message: "Validation error.",
    details: zodIssuesToDetails(err),
    cause: err,
  });
};
