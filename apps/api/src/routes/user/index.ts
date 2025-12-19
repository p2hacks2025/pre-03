import { createRouter } from "@/config/router";
import {
  getMeHandler,
  updateProfileHandler,
  uploadAvatarHandler,
} from "./handlers";
import { getMeRoute, updateProfileRoute, uploadAvatarRoute } from "./route";

export const userRouter = createRouter()
  .openapi(getMeRoute, getMeHandler)
  .openapi(updateProfileRoute, updateProfileHandler)
  .openapi(uploadAvatarRoute, uploadAvatarHandler);
