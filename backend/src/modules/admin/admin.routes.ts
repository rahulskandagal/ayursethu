import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as controller from "./admin.controller";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/stats", asyncHandler(controller.dashboardStats));

adminRouter.get("/users", asyncHandler(controller.listUsers));
adminRouter.patch("/users/:id/status", asyncHandler(controller.setUserStatus));

adminRouter.get("/pharmacies/pending", asyncHandler(controller.listPendingPharmacies));
adminRouter.post("/pharmacies/:id/verify", asyncHandler(controller.verifyPharmacy));

adminRouter.get("/manufacturers", asyncHandler(controller.listManufacturers));
adminRouter.post("/manufacturers", asyncHandler(controller.createManufacturer));
adminRouter.post("/manufacturers/:id/verify", asyncHandler(controller.verifyManufacturer));

adminRouter.post("/medicines", asyncHandler(controller.createMedicine));
adminRouter.patch("/medicines/:id", asyncHandler(controller.updateMedicine));
adminRouter.delete("/medicines/:id", asyncHandler(controller.deleteMedicine));
adminRouter.post("/medicines/:id/verify", asyncHandler(controller.verifyMedicine));

adminRouter.post("/plants", asyncHandler(controller.createPlant));
adminRouter.patch("/plants/:id", asyncHandler(controller.updatePlant));
adminRouter.delete("/plants/:id", asyncHandler(controller.deletePlant));

adminRouter.post("/subjects", asyncHandler(controller.createSubject));
adminRouter.post("/subjects/:subjectId/chapters", asyncHandler(controller.createChapter));
adminRouter.post("/chapters/:chapterId/materials", asyncHandler(controller.createStudyMaterial));
adminRouter.post("/chapters/:chapterId/quizzes", asyncHandler(controller.createQuiz));
adminRouter.post("/chapters/:chapterId/flashcards", asyncHandler(controller.createFlashcard));

adminRouter.get("/reports", asyncHandler(controller.listReports));
adminRouter.patch("/reports/:id/status", asyncHandler(controller.updateReportStatus));

adminRouter.get("/audit-logs", asyncHandler(controller.listAuditLogs));
