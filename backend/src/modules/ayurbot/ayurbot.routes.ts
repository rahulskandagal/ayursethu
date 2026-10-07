import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { answerQuestion } from "./ayurbot.service";

export const ayurbotRouter = Router();

const askSchema = z.object({ message: z.string().min(1).max(1000) });

ayurbotRouter.post(
  "/ask",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { message } = askSchema.parse(req.body);
    const result = await answerQuestion(message);
    res.json(result);
  })
);
