import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { bookmarkSchema, flashcardProgressSchema, submitQuizSchema } from "./learning.schema";

export async function listSubjects(_req: Request, res: Response) {
  const subjects = await prisma.subject.findMany({
    orderBy: { orderIndex: "asc" },
    include: { chapters: { select: { id: true } } },
  });
  res.json(
    subjects.map((s) => ({ id: s.id, name: s.name, description: s.description, chapterCount: s.chapters.length }))
  );
}

export async function getSubject(req: Request, res: Response) {
  const subject = await prisma.subject.findUnique({
    where: { id: req.params.id },
    include: { chapters: { orderBy: { orderIndex: "asc" } } },
  });
  if (!subject) throw ApiError.notFound("Subject not found");
  res.json(subject);
}

export async function getChapter(req: Request, res: Response) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: req.params.id },
    include: {
      subject: true,
      studyMaterials: true,
      quizzes: { select: { id: true, title: true, questions: { select: { id: true } } } },
      flashcards: true,
    },
  });
  if (!chapter) throw ApiError.notFound("Chapter not found");

  res.json({
    ...chapter,
    quizzes: chapter.quizzes.map((q) => ({ id: q.id, title: q.title, questionCount: q.questions.length })),
  });
}

export async function markChapterProgress(req: Request, res: Response) {
  const chapter = await prisma.chapter.findUnique({ where: { id: req.params.id } });
  if (!chapter) throw ApiError.notFound("Chapter not found");

  const progress = await prisma.studyProgress.upsert({
    where: { userId_chapterId: { userId: req.user!.sub, chapterId: chapter.id } },
    create: { userId: req.user!.sub, chapterId: chapter.id, completed: true },
    update: { completed: true },
  });
  res.json(progress);
}

export async function myProgress(req: Request, res: Response) {
  const progress = await prisma.studyProgress.findMany({
    where: { userId: req.user!.sub },
    include: { chapter: { include: { subject: true } } },
  });
  res.json(progress);
}

export async function getQuiz(req: Request, res: Response) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: req.params.id },
    include: { questions: { select: { id: true, text: true, options: true } } },
  });
  if (!quiz) throw ApiError.notFound("Quiz not found");
  res.json(quiz);
}

export async function submitQuiz(req: Request, res: Response) {
  const input = submitQuizSchema.parse(req.body);
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id }, include: { questions: true } });
  if (!quiz) throw ApiError.notFound("Quiz not found");

  let score = 0;
  const breakdown = quiz.questions.map((q, i) => {
    const correct = input.answers[i] === q.correctOption;
    if (correct) score += 1;
    return { questionId: q.id, correct, correctOption: q.correctOption, explanation: q.explanation };
  });

  const attempt = await prisma.quizAttempt.create({
    data: { userId: req.user!.sub, quizId: quiz.id, score, total: quiz.questions.length },
  });

  res.json({ attemptId: attempt.id, score, total: quiz.questions.length, breakdown });
}

export async function listFlashcards(req: Request, res: Response) {
  const flashcards = await prisma.flashcard.findMany({ where: { chapterId: req.params.chapterId } });
  res.json(flashcards);
}

export async function markFlashcardProgress(req: Request, res: Response) {
  const input = flashcardProgressSchema.parse(req.body);
  const flashcard = await prisma.flashcard.findUnique({ where: { id: req.params.id } });
  if (!flashcard) throw ApiError.notFound("Flashcard not found");

  const progress = await prisma.flashcardProgress.upsert({
    where: { userId_flashcardId: { userId: req.user!.sub, flashcardId: flashcard.id } },
    create: { userId: req.user!.sub, flashcardId: flashcard.id, known: input.known },
    update: { known: input.known },
  });
  res.json(progress);
}

export async function listBookmarks(req: Request, res: Response) {
  const bookmarks = await prisma.bookmark.findMany({ where: { userId: req.user!.sub }, orderBy: { createdAt: "desc" } });
  res.json(bookmarks);
}

export async function addBookmark(req: Request, res: Response) {
  const input = bookmarkSchema.parse(req.body);
  const bookmark = await prisma.bookmark.upsert({
    where: {
      userId_targetType_targetId: { userId: req.user!.sub, targetType: input.targetType, targetId: input.targetId },
    },
    create: { userId: req.user!.sub, targetType: input.targetType, targetId: input.targetId },
    update: {},
  });
  res.status(201).json(bookmark);
}

export async function removeBookmark(req: Request, res: Response) {
  await prisma.bookmark.deleteMany({ where: { id: req.params.id, userId: req.user!.sub } });
  res.status(204).send();
}
