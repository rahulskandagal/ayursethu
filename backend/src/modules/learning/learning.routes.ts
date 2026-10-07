import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import * as controller from "./learning.controller";

export const learningRouter = Router();

learningRouter.get("/subjects", asyncHandler(controller.listSubjects));
learningRouter.get("/subjects/:id", asyncHandler(controller.getSubject));
learningRouter.get("/chapters/:id", asyncHandler(controller.getChapter));
learningRouter.post("/chapters/:id/progress", requireAuth, asyncHandler(controller.markChapterProgress));
learningRouter.get("/progress", requireAuth, asyncHandler(controller.myProgress));

learningRouter.get("/quizzes/:id", asyncHandler(controller.getQuiz));
learningRouter.post("/quizzes/:id/submit", requireAuth, asyncHandler(controller.submitQuiz));

learningRouter.get("/flashcards/chapter/:chapterId", asyncHandler(controller.listFlashcards));
learningRouter.post("/flashcards/:id/progress", requireAuth, asyncHandler(controller.markFlashcardProgress));

learningRouter.get("/bookmarks", requireAuth, asyncHandler(controller.listBookmarks));
learningRouter.post("/bookmarks", requireAuth, asyncHandler(controller.addBookmark));
learningRouter.delete("/bookmarks/:id", requireAuth, asyncHandler(controller.removeBookmark));
