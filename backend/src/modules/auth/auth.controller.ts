import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { signToken } from "../../middleware/auth";
import { ApiError } from "../../utils/ApiError";
import { loginSchema, registerSchema } from "./auth.schema";

function sanitizeUser(user: { id: string; name: string; email: string; role: string; phone: string | null }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone };
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      phone: input.phone,
      ...(input.role === "PATIENT" ? { patientProfile: { create: {} } } : {}),
      ...(input.role === "STUDENT"
        ? { studentProfile: { create: { college: input.student?.college, yearOfStudy: input.student?.yearOfStudy } } }
        : {}),
      ...(input.role === "DOCTOR"
        ? {
            doctorProfile: {
              create: {
                registrationNumber: input.doctor?.registrationNumber,
                specialization: input.doctor?.specialization,
                clinicName: input.doctor?.clinicName,
              },
            },
          }
        : {}),
      ...(input.role === "PHARMACY"
        ? {
            pharmacy: {
              create: (() => {
                if (!input.pharmacy) {
                  throw ApiError.badRequest("Pharmacy details are required for pharmacy accounts");
                }
                return {
                  name: input.pharmacy.name,
                  licenseNumber: input.pharmacy.licenseNumber,
                  phone: input.phone ?? "",
                  address: input.pharmacy.address,
                  city: input.pharmacy.city,
                  pinCode: input.pharmacy.pinCode,
                  latitude: input.pharmacy.latitude,
                  longitude: input.pharmacy.longitude,
                  openingTime: input.pharmacy.openingTime,
                  closingTime: input.pharmacy.closingTime,
                };
              })(),
            },
          }
        : {}),
    },
  });

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  res.status(201).json({ token, user: sanitizeUser(user) });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) throw ApiError.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  res.json({ token, user: sanitizeUser(user) });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    include: {
      patientProfile: true,
      studentProfile: true,
      doctorProfile: true,
      pharmacy: true,
    },
  });
  if (!user) throw ApiError.notFound("User not found");
  const { passwordHash: _passwordHash, ...safe } = user;
  res.json(safe);
}
