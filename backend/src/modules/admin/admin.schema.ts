import { z } from "zod";

export const verifyDecisionSchema = z.object({
  approve: z.boolean(),
});

export const userStatusSchema = z.object({
  isActive: z.boolean(),
});

export const manufacturerSchema = z.object({
  name: z.string().min(2),
  licenseNumber: z.string().optional(),
  address: z.string().optional(),
});

export const medicineSchema = z.object({
  name: z.string().min(2),
  brandName: z.string().optional(),
  sanskritName: z.string().optional(),
  englishName: z.string().optional(),
  kannadaName: z.string().optional(),
  hindiName: z.string().optional(),
  manufacturerId: z.string().optional(),
  dosageForm: z.enum([
    "TABLET", "CAPSULE", "POWDER", "OIL", "SYRUP", "KASHAYA", "ASAVA_ARISHTA",
    "VATI_GUTIKA", "GHRITA", "AVALEHA", "BHASMA", "OTHER",
  ]),
  formulationCategory: z.enum([
    "CLASSICAL", "PROPRIETARY", "SINGLE_HERB", "HERBAL_OIL", "CHURNA",
    "KASHAYA_KWATHA", "ASAVA_ARISHTA", "VATI_GUTIKA", "GHRITA", "AVALEHA",
    "BHASMA", "RASAYANA",
  ]),
  description: z.string().min(2),
  traditionalIndications: z.string().optional(),
  rasa: z.string().optional(),
  guna: z.string().optional(),
  virya: z.string().optional(),
  vipaka: z.string().optional(),
  karma: z.string().optional(),
  productLicenseNumber: z.string().optional(),
  productCode: z.string().optional(),
  isDemoData: z.boolean().optional(),
  ingredients: z.array(z.object({ name: z.string(), quantity: z.string().optional(), plantId: z.string().optional() })).optional(),
  images: z.array(z.object({ url: z.string().url(), caption: z.string().optional() })).optional(),
  packageSizes: z.array(z.object({ size: z.string(), unit: z.string() })).optional(),
  classicalRefs: z.array(z.object({ sourceText: z.string(), reference: z.string() })).optional(),
});

export const medicineVerifySchema = z.object({
  isVerifiedProduct: z.boolean(),
});

export const plantSchema = z.object({
  name: z.string().min(2),
  botanicalName: z.string().optional(),
  sanskritName: z.string().optional(),
  englishName: z.string().optional(),
  kannadaName: z.string().optional(),
  hindiName: z.string().optional(),
  partsUsed: z.string().optional(),
  description: z.string().min(2),
  ayurvedicProperties: z.string().optional(),
  traditionalUses: z.string().optional(),
  habitat: z.string().optional(),
  isDemoData: z.boolean().optional(),
  images: z.array(z.object({ url: z.string().url(), caption: z.string().optional() })).optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  orderIndex: z.number().int().optional(),
});

export const chapterSchema = z.object({
  title: z.string().min(2),
  orderIndex: z.number().int().optional(),
});

export const studyMaterialSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(2),
  fileUrl: z.string().url().optional(),
});

export const quizSchema = z.object({
  title: z.string().min(2),
  questions: z
    .array(
      z.object({
        text: z.string().min(2),
        options: z.array(z.string()).min(2),
        correctOption: z.number().int().min(0),
        explanation: z.string().optional(),
      })
    )
    .optional(),
});

export const flashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
});

export const reportStatusSchema = z.object({
  status: z.enum(["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]),
});
