import path from "node:path";
import fs from "node:fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { medicinesRouter } from "./modules/medicines/medicines.routes";
import { pharmaciesRouter } from "./modules/pharmacies/pharmacies.routes";
import { plantsRouter } from "./modules/plants/plants.routes";
import { learningRouter } from "./modules/learning/learning.routes";
import { ayurbotRouter } from "./modules/ayurbot/ayurbot.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { usersRouter } from "./modules/users/users.routes";
import { uploadsRouter } from "./modules/uploads/uploads.routes";
import { reservationsRouter } from "./modules/reservations/reservations.routes";
import { prescriptionsRouter } from "./modules/prescriptions/prescriptions.routes";

export const app = express();

// contentSecurityPolicy is disabled because this process also serves the
// built frontend (see the static block below), which loads fonts/tiles/marker
// icons from a few external CDNs (Google Fonts, OpenStreetMap, unpkg) —
// simpler than hand-maintaining an allowlist for a demo deployment.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(UPLOADS_DIR));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false });
app.use("/api", apiLimiter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/medicines", medicinesRouter);
app.use("/api/pharmacies", pharmaciesRouter);
app.use("/api/plants", plantsRouter);
app.use("/api/learning", learningRouter);
app.use("/api/ayurbot", ayurbotRouter);
app.use("/api/admin", adminRouter);
app.use("/api/users", usersRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/prescriptions", prescriptionsRouter);

// Optional: serve the built frontend from this same process when deployed as
// a single combined service (see deploy/Dockerfile). Local dev always runs
// the Vite dev server separately, so this directory won't exist there.
const PUBLIC_DIR = path.join(__dirname, "../public");
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
  app.get(/^\/(?!api\/|uploads\/|health$).*/, (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);
