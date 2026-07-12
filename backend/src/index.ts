import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./db.js";
import { corsOptions } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { globalLimiter } from "./middleware/rate-limit.js";
import { authRoutes } from "./routes/auth.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { salonRoutes } from "./routes/salons.routes.js";
import { bookingRoutes } from "./routes/bookings.routes.js";
import { serviceRoutes } from "./routes/services.routes.js";
import { staffRoutes } from "./routes/staff.routes.js";
import { commentRoutes } from "./routes/comments.routes.js";
import { reviewRoutes } from "./routes/reviews.routes.js";
import { favoriteRoutes } from "./routes/favorites.routes.js";
import { notificationRoutes } from "./routes/notifications.routes.js";
import { subscriptionRoutes } from "./routes/subscription.routes.js";
import { loyaltyRoutes } from "./routes/loyalty.routes.js";
import { analyticsRoutes } from "./routes/analytics.routes.js";
import { uploadRoutes } from "./routes/upload.routes.js";
import { userRoutes } from "./routes/users.routes.js";
import { categoryCityRoutes } from "./routes/categories-cities.routes.js";
import { supportRoutes } from "./routes/support.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Render (and Cloudflare in front of it) sits between us and the client,
// so req.ip must come from X-Forwarded-For or every request looks like it's
// from the proxy - which would make IP-based rate limiting either useless
// or lock out every visitor at once.
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/salons", salonRoutes);
app.use("/bookings", bookingRoutes);
app.use("/services", serviceRoutes);
app.use("/staff", staffRoutes);
app.use("/comments", commentRoutes);
app.use("/reviews", reviewRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/notifications", notificationRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/loyalty", loyaltyRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/upload", uploadRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryCityRoutes);
app.use("/cities", categoryCityRoutes);
app.use("/support", supportRoutes);

app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[API] Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[API] Failed to start:", err);
  process.exit(1);
});
