import { z } from "zod";

export const medicineSearchSchema = z.object({
  q: z.string().optional(),
  manufacturer: z.string().optional(),
  dosageForm: z.string().optional(),
  formulationCategory: z.string().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  inStockOnly: z.coerce.boolean().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional().default(25),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const createReportSchema = z.object({
  reason: z.string().min(5).max(2000),
});

export const availabilityRequestSchema = z.object({
  pharmacyId: z.string().optional(),
  message: z.string().max(1000).optional(),
});

export type MedicineSearchInput = z.infer<typeof medicineSearchSchema>;
