import { z } from "zod";

export const createReservationSchema = z.object({
  medicineId: z.string(),
  pharmacyId: z.string(),
  quantity: z.number().int().min(1).max(50).default(1),
  fulfillmentType: z.enum(["PICKUP", "DELIVERY"]).default("PICKUP"),
  deliveryAddress: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

export const updateReservationStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"]),
});
