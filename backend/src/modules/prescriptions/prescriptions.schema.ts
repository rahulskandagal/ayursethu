import { z } from "zod";

export const createPrescriptionSchema = z.object({
  title: z.string().min(2).max(200),
  fileUrl: z.string().min(1),
  issuedBy: z.string().max(200).optional(),
  issuedDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
});
