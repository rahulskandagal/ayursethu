import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import * as controller from "./prescriptions.controller";

export const prescriptionsRouter = Router();
prescriptionsRouter.use(requireAuth);

prescriptionsRouter.get("/", asyncHandler(controller.list));
prescriptionsRouter.post("/", asyncHandler(controller.create));
prescriptionsRouter.delete("/:id", asyncHandler(controller.remove));
