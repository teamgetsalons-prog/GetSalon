import type { CorsOptions } from "cors";
import { getEnv } from "../config.js";

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    const allowed = [getEnv().CORS_ORIGIN, getEnv().APP_URL, "http://localhost:3000"];
    if (!origin || allowed.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
