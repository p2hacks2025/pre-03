import { createRouter } from "@/config/router";
import { getMeHandler, uploadAvatarHandler } from "./handlers";
import { getMeRoute, uploadAvatarRoute } from "./route";

export const userRouter = createRouter()
  .openapi(getMeRoute, getMeHandler)
  .openapi(uploadAvatarRoute, uploadAvatarHandler);
