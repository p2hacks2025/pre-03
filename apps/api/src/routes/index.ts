import { createRouter } from "@/config/router";
import { authRouter } from "./auth";
import { entriesRouter } from "./entries";
import { healthRouter } from "./health";
import { reflectionRouter } from "./reflection";
import { rootRouter } from "./root";
import { userRouter } from "./user";

export const routes = createRouter()
  .route("/", rootRouter)
  .route("/health", healthRouter)
  .route("/auth", authRouter)
  .route("/user", userRouter)
  .route("/entries", entriesRouter)
  .route("/reflection", reflectionRouter);
