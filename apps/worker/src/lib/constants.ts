import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const ASSETS_DIR = resolve(__dirname, "../../assets");
export const TIMEZONE = "Asia/Tokyo";
export const JST_OFFSET = 9 * 60 * 60 * 1000;
export const FIELD_ID_MIN = 0;
export const FIELD_ID_MAX = 8;
export const ONESIGNAL_API_URL = "https://api.onesignal.com/notifications";
