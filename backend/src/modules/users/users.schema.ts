import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

export const updatePatientProfileSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
});

export const updateStudentProfileSchema = z.object({
  college: z.string().optional(),
  yearOfStudy: z.number().int().optional(),
});

export const updateDoctorProfileSchema = z.object({
  registrationNumber: z.string().optional(),
  specialization: z.string().optional(),
  clinicName: z.string().optional(),
});
