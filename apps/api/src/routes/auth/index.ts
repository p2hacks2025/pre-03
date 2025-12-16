import { createRouter } from "@/config/router";
import {
  loginHandler,
  logoutHandler,
  passwordResetHandler,
  refreshHandler,
  signupHandler,
} from "./handlers";
import {
  loginRoute,
  logoutRoute,
  passwordResetRoute,
  refreshRoute,
  signupRoute,
} from "./route";

export const authRouter = createRouter()
  .openapi(signupRoute, signupHandler)
  .openapi(loginRoute, loginHandler)
  .openapi(logoutRoute, logoutHandler)
  .openapi(passwordResetRoute, passwordResetHandler)
  .openapi(refreshRoute, refreshHandler);
