import { z } from "zod";

export const submitQuizSchema = z.object({
  answers: z.array(z.number().int().min(0)),
});

export const flashcardProgressSchema = z.object({
  known: z.boolean(),
});

export const bookmarkSchema = z.object({
  targetType: z.enum(["MEDICINE", "PLANT", "CHAPTER", "STUDY_MATERIAL"]),
  targetId: z.string(),
});
