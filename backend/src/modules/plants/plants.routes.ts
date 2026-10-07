import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./plants.controller";

export const plantsRouter = Router();

plantsRouter.get("/", asyncHandler(controller.search));
plantsRouter.post("/identify", asyncHandler(controller.identifyPreliminary));
plantsRouter.get("/:id", asyncHandler(controller.getById));
