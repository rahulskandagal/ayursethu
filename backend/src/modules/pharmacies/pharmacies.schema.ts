import { z } from "zod";

export const locatorSchema = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional().default(25),
  city: z.string().optional(),
  pinCode: z.string().optional(),
  medicineId: z.string().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
});

export const updatePharmacySchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(5).optional(),
  address: z.string().min(2).optional(),
  city: z.string().min(1).optional(),
  pinCode: z.string().min(3).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
});

export const addDocumentSchema = z.object({
  docType: z.string().min(2),
  fileUrl: z.string().url(),
});

export const upsertInventorySchema = z.object({
  medicineId: z.string(),
  price: z.number().positive(),
  stockQty: z.number().int().min(0),
  inStock: z.boolean().optional(),
  batch: z
    .object({
      batchNumber: z.string(),
      manufactureDate: z.string().optional(),
      expiryDate: z.string().optional(),
    })
    .optional(),
});

export const respondAvailabilitySchema = z.object({
  message: z.string().max(1000).optional(),
  close: z.boolean().optional(),
});
