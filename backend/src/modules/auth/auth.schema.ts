import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["PATIENT", "STUDENT", "DOCTOR", "PHARMACY"]),
  phone: z.string().optional(),
  // Role-specific extras, all optional and validated loosely here;
  // the controller only reads the fields relevant to the chosen role.
  pharmacy: z
    .object({
      name: z.string().min(2),
      licenseNumber: z.string().min(2),
      address: z.string().min(2),
      city: z.string().min(1),
      pinCode: z.string().min(3),
      latitude: z.number(),
      longitude: z.number(),
      openingTime: z.string().optional(),
      closingTime: z.string().optional(),
    })
    .optional(),
  doctor: z
    .object({
      registrationNumber: z.string().optional(),
      specialization: z.string().optional(),
      clinicName: z.string().optional(),
    })
    .optional(),
  student: z
    .object({
      college: z.string().optional(),
      yearOfStudy: z.number().int().optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
