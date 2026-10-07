import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as controller from "./reservations.controller";

export const reservationsRouter = Router();
reservationsRouter.use(requireAuth);

reservationsRouter.post("/", requireRole("PATIENT"), asyncHandler(controller.create));
reservationsRouter.get("/me", requireRole("PATIENT"), asyncHandler(controller.listMine));
reservationsRouter.post("/:id/cancel", requireRole("PATIENT"), asyncHandler(controller.cancelMine));

reservationsRouter.get("/pharmacy", requireRole("PHARMACY"), asyncHandler(controller.listForMyPharmacy));
reservationsRouter.patch("/:id/status", requireRole("PHARMACY"), asyncHandler(controller.updateStatus));
