import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import * as controller from "./users.controller";

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.patch("/me", asyncHandler(controller.updateProfile));
usersRouter.patch("/me/patient-profile", asyncHandler(controller.updatePatientProfile));
usersRouter.patch("/me/student-profile", asyncHandler(controller.updateStudentProfile));
usersRouter.patch("/me/doctor-profile", asyncHandler(controller.updateDoctorProfile));

usersRouter.get("/me/notifications", asyncHandler(controller.listNotifications));
usersRouter.patch("/me/notifications/:id/read", asyncHandler(controller.markNotificationRead));
usersRouter.patch("/me/notifications/read-all", asyncHandler(controller.markAllNotificationsRead));
usersRouter.get("/me/reports", asyncHandler(controller.listMyReports));
