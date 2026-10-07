import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import {
  chapterSchema,
  flashcardSchema,
  manufacturerSchema,
  medicineSchema,
  medicineVerifySchema,
  plantSchema,
  quizSchema,
  reportStatusSchema,
  studyMaterialSchema,
  subjectSchema,
  userStatusSchema,
  verifyDecisionSchema,
} from "./admin.schema";

async function logAction(adminId: string, action: string, targetType: string, targetId: string, details?: string) {
  await prisma.auditLog.create({ data: { adminId, action, targetType, targetId, details } });
}

// --- Users -----------------------------------------------------------------

export async function listUsers(req: Request, res: Response) {
  const role = typeof req.query.role === "string" ? req.query.role : undefined;
  const users = await prisma.user.findMany({
    where: role ? { role: role as any } : undefined,
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
}

export async function setUserStatus(req: Request, res: Response) {
  const input = userStatusSchema.parse(req.body);
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: input.isActive } });
  await logAction(req.user!.sub, input.isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER", "User", user.id);
  res.json({ id: user.id, isActive: user.isActive });
}

// --- Pharmacies --------------------------------------------------------------

export async function listPendingPharmacies(_req: Request, res: Response) {
  const pharmacies = await prisma.pharmacy.findMany({
    where: { verificationStatus: "PENDING" },
    include: { documents: true, user: { select: { email: true, name: true } } },
  });
  res.json(pharmacies);
}

export async function verifyPharmacy(req: Request, res: Response) {
  const input = verifyDecisionSchema.parse(req.body);
  const pharmacy = await prisma.pharmacy.findUnique({ where: { id: req.params.id } });
  if (!pharmacy) throw ApiError.notFound("Pharmacy not found");

  const updated = await prisma.pharmacy.update({
    where: { id: pharmacy.id },
    data: { verificationStatus: input.approve ? "VERIFIED" : "REJECTED" },
  });

  await prisma.notification.create({
    data: {
      userId: pharmacy.userId,
      type: input.approve ? "PHARMACY_APPROVED" : "PHARMACY_REJECTED",
      message: input.approve
        ? "Your pharmacy has been verified and is now live on AyurSethu."
        : "Your pharmacy registration was not approved. Please check your submitted documents and contact support.",
    },
  });

  await logAction(req.user!.sub, "VERIFY_PHARMACY", "Pharmacy", pharmacy.id, String(input.approve));
  res.json(updated);
}

// --- Manufacturers -----------------------------------------------------------

export async function listManufacturers(_req: Request, res: Response) {
  res.json(await prisma.manufacturer.findMany({ orderBy: { name: "asc" } }));
}

export async function createManufacturer(req: Request, res: Response) {
  const input = manufacturerSchema.parse(req.body);
  const manufacturer = await prisma.manufacturer.create({ data: input });
  await logAction(req.user!.sub, "CREATE_MANUFACTURER", "Manufacturer", manufacturer.id);
  res.status(201).json(manufacturer);
}

export async function verifyManufacturer(req: Request, res: Response) {
  const input = verifyDecisionSchema.parse(req.body);
  const manufacturer = await prisma.manufacturer.update({
    where: { id: req.params.id },
    data: { verificationStatus: input.approve ? "VERIFIED" : "REJECTED" },
  });
  await logAction(req.user!.sub, "VERIFY_MANUFACTURER", "Manufacturer", manufacturer.id, String(input.approve));
  res.json(manufacturer);
}

// --- Medicines ----------------------------------------------------------------

export async function createMedicine(req: Request, res: Response) {
  const input = medicineSchema.parse(req.body);
  const { ingredients, images, packageSizes, classicalRefs, ...rest } = input;

  const medicine = await prisma.medicine.create({
    data: {
      ...rest,
      ingredients: ingredients ? { create: ingredients } : undefined,
      images: images ? { create: images } : undefined,
      packageSizes: packageSizes ? { create: packageSizes } : undefined,
      classicalRefs: classicalRefs ? { create: classicalRefs } : undefined,
    },
  });
  await logAction(req.user!.sub, "CREATE_MEDICINE", "Medicine", medicine.id);
  res.status(201).json(medicine);
}

export async function updateMedicine(req: Request, res: Response) {
  const input = medicineSchema.partial().parse(req.body);
  const { ingredients, images, packageSizes, classicalRefs, ...rest } = input;
  const medicine = await prisma.medicine.update({ where: { id: req.params.id }, data: rest });
  await logAction(req.user!.sub, "UPDATE_MEDICINE", "Medicine", medicine.id);
  res.json(medicine);
}

export async function deleteMedicine(req: Request, res: Response) {
  await prisma.medicine.delete({ where: { id: req.params.id } });
  await logAction(req.user!.sub, "DELETE_MEDICINE", "Medicine", req.params.id);
  res.status(204).send();
}

export async function verifyMedicine(req: Request, res: Response) {
  const input = medicineVerifySchema.parse(req.body);
  const medicine = await prisma.medicine.update({
    where: { id: req.params.id },
    data: { isVerifiedProduct: input.isVerifiedProduct },
  });
  await logAction(req.user!.sub, "VERIFY_MEDICINE", "Medicine", medicine.id, String(input.isVerifiedProduct));
  res.json(medicine);
}

// --- Medicinal plants -----------------------------------------------------------

export async function createPlant(req: Request, res: Response) {
  const input = plantSchema.parse(req.body);
  const { images, ...rest } = input;
  const plant = await prisma.medicinalPlant.create({ data: { ...rest, images: images ? { create: images } : undefined } });
  await logAction(req.user!.sub, "CREATE_PLANT", "MedicinalPlant", plant.id);
  res.status(201).json(plant);
}

export async function updatePlant(req: Request, res: Response) {
  const input = plantSchema.partial().parse(req.body);
  const { images, ...rest } = input;
  const plant = await prisma.medicinalPlant.update({ where: { id: req.params.id }, data: rest });
  await logAction(req.user!.sub, "UPDATE_PLANT", "MedicinalPlant", plant.id);
  res.json(plant);
}

export async function deletePlant(req: Request, res: Response) {
  await prisma.medicinalPlant.delete({ where: { id: req.params.id } });
  await logAction(req.user!.sub, "DELETE_PLANT", "MedicinalPlant", req.params.id);
  res.status(204).send();
}

// --- Learning content -----------------------------------------------------------

export async function createSubject(req: Request, res: Response) {
  const input = subjectSchema.parse(req.body);
  const subject = await prisma.subject.create({ data: input });
  await logAction(req.user!.sub, "CREATE_SUBJECT", "Subject", subject.id);
  res.status(201).json(subject);
}

export async function createChapter(req: Request, res: Response) {
  const input = chapterSchema.parse(req.body);
  const subject = await prisma.subject.findUnique({ where: { id: req.params.subjectId } });
  if (!subject) throw ApiError.notFound("Subject not found");
  const chapter = await prisma.chapter.create({ data: { ...input, subjectId: subject.id } });
  await logAction(req.user!.sub, "CREATE_CHAPTER", "Chapter", chapter.id);
  res.status(201).json(chapter);
}

export async function createStudyMaterial(req: Request, res: Response) {
  const input = studyMaterialSchema.parse(req.body);
  const chapter = await prisma.chapter.findUnique({ where: { id: req.params.chapterId } });
  if (!chapter) throw ApiError.notFound("Chapter not found");
  const material = await prisma.studyMaterial.create({ data: { ...input, chapterId: chapter.id } });
  await logAction(req.user!.sub, "CREATE_STUDY_MATERIAL", "StudyMaterial", material.id);
  res.status(201).json(material);
}

export async function createQuiz(req: Request, res: Response) {
  const input = quizSchema.parse(req.body);
  const chapter = await prisma.chapter.findUnique({ where: { id: req.params.chapterId } });
  if (!chapter) throw ApiError.notFound("Chapter not found");
  const quiz = await prisma.quiz.create({
    data: {
      title: input.title,
      chapterId: chapter.id,
      questions: input.questions ? { create: input.questions } : undefined,
    },
  });
  await logAction(req.user!.sub, "CREATE_QUIZ", "Quiz", quiz.id);
  res.status(201).json(quiz);
}

export async function createFlashcard(req: Request, res: Response) {
  const input = flashcardSchema.parse(req.body);
  const chapter = await prisma.chapter.findUnique({ where: { id: req.params.chapterId } });
  if (!chapter) throw ApiError.notFound("Chapter not found");
  const flashcard = await prisma.flashcard.create({ data: { ...input, chapterId: chapter.id } });
  await logAction(req.user!.sub, "CREATE_FLASHCARD", "Flashcard", flashcard.id);
  res.status(201).json(flashcard);
}

// --- Reports -----------------------------------------------------------------

export async function listReports(_req: Request, res: Response) {
  const reports = await prisma.report.findMany({
    include: { user: { select: { name: true, email: true } }, medicine: true, pharmacy: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(reports);
}

export async function updateReportStatus(req: Request, res: Response) {
  const input = reportStatusSchema.parse(req.body);
  const report = await prisma.report.update({ where: { id: req.params.id }, data: { status: input.status } });
  await logAction(req.user!.sub, "UPDATE_REPORT_STATUS", "Report", report.id, input.status);
  res.json(report);
}

// --- Audit log -----------------------------------------------------------------

export async function listAuditLogs(_req: Request, res: Response) {
  const logs = await prisma.auditLog.findMany({
    include: { admin: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json(logs);
}

// --- Dashboard stats -------------------------------------------------------------

export async function dashboardStats(_req: Request, res: Response) {
  const [users, pharmaciesPending, medicines, plants, reportsOpen] = await Promise.all([
    prisma.user.count(),
    prisma.pharmacy.count({ where: { verificationStatus: "PENDING" } }),
    prisma.medicine.count(),
    prisma.medicinalPlant.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);
  res.json({ users, pharmaciesPending, medicines, plants, reportsOpen });
}
