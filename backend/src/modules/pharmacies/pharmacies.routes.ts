import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as controller from "./pharmacies.controller";

export const pharmaciesRouter = Router();

pharmaciesRouter.get("/", asyncHandler(controller.locate));

pharmaciesRouter.get("/me", requireAuth, requireRole("PHARMACY"), asyncHandler(controller.getMyPharmacy));
pharmaciesRouter.patch("/me", requireAuth, requireRole("PHARMACY"), asyncHandler(controller.updateMyPharmacy));
pharmaciesRouter.post("/me/documents", requireAuth, requireRole("PHARMACY"), asyncHandler(controller.addDocument));
pharmaciesRouter.get("/me/documents", requireAuth, requireRole("PHARMACY"), asyncHandler(controller.listMyDocuments));

pharmaciesRouter.get("/me/inventory", requireAuth, requireRole("PHARMACY"), asyncHandler(controller.listMyInventory));
pharmaciesRouter.post("/me/inventory", requireAuth, requireRole("PHARMACY"), asyncHandler(controller.upsertInventory));
pharmaciesRouter.delete(
  "/me/inventory/:inventoryId",
  requireAuth,
  requireRole("PHARMACY"),
  asyncHandler(controller.deleteInventory)
);

pharmaciesRouter.get(
  "/me/availability-requests",
  requireAuth,
  requireRole("PHARMACY"),
  asyncHandler(controller.listMyAvailabilityRequests)
);
pharmaciesRouter.post(
  "/me/availability-requests/:id/respond",
  requireAuth,
  requireRole("PHARMACY"),
  asyncHandler(controller.respondAvailabilityRequest)
);

// Keep this last: it's a catch-all for /pharmacies/:id and would otherwise
// shadow the /me routes above.
pharmaciesRouter.get("/:id", asyncHandler(controller.getById));
