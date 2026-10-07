import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { optionalAuth, requireAuth, requireRole } from "../../middleware/auth";
import * as controller from "./medicines.controller";

export const medicinesRouter = Router();

medicinesRouter.get("/", optionalAuth, asyncHandler(controller.search));
medicinesRouter.get("/compare", asyncHandler(controller.compare));
medicinesRouter.get("/favorites", requireAuth, requireRole("PATIENT"), asyncHandler(controller.listFavorites));
medicinesRouter.get("/stock-alerts", requireAuth, requireRole("PATIENT"), asyncHandler(controller.listStockAlerts));
medicinesRouter.get("/by-code/:code", asyncHandler(controller.getByCode));
medicinesRouter.get("/:id", optionalAuth, asyncHandler(controller.getById));
medicinesRouter.get("/:id/alternatives", asyncHandler(controller.getAlternatives));
medicinesRouter.post("/:id/favorite", requireAuth, requireRole("PATIENT"), asyncHandler(controller.addFavorite));
medicinesRouter.delete("/:id/favorite", requireAuth, requireRole("PATIENT"), asyncHandler(controller.removeFavorite));
medicinesRouter.post("/:id/reviews", requireAuth, asyncHandler(controller.addReview));
medicinesRouter.post("/:id/report", requireAuth, asyncHandler(controller.reportMedicine));
medicinesRouter.post(
  "/:id/availability-request",
  requireAuth,
  requireRole("PATIENT", "DOCTOR"),
  asyncHandler(controller.requestAvailability)
);
medicinesRouter.post(
  "/:id/stock-alert",
  requireAuth,
  requireRole("PATIENT"),
  asyncHandler(controller.createStockAlert)
);
medicinesRouter.delete(
  "/:id/stock-alert",
  requireAuth,
  requireRole("PATIENT"),
  asyncHandler(controller.removeStockAlert)
);
