import { createRouter } from "@/config/router";
import {
  getMeHandler,
  getProfileStatsHandler,
  updateProfileHandler,
  uploadAvatarHandler,
} from "./handlers";
import {
  getMeRoute,
  getProfileStatsRoute,
  updateProfileRoute,
  uploadAvatarRoute,
} from "./route";

export const userRouter = createRouter()
  .openapi(getMeRoute, getMeHandler)
  .openapi(getProfileStatsRoute, getProfileStatsHandler)
  .openapi(updateProfileRoute, updateProfileHandler)
  .openapi(uploadAvatarRoute, uploadAvatarHandler);
