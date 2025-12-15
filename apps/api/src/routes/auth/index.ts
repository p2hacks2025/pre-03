import { createRouter } from "@/config/router";
import {
  loginHandler,
  logoutHandler,
  passwordResetHandler,
  signupHandler,
} from "./handlers";
import {
  loginRoute,
  logoutRoute,
  passwordResetRoute,
  signupRoute,
} from "./route";

export const authRouter = createRouter()
  .openapi(signupRoute, signupHandler)
  .openapi(loginRoute, loginHandler)
  .openapi(logoutRoute, logoutHandler)
  .openapi(passwordResetRoute, passwordResetHandler);
