import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import {
  updateDoctorProfileSchema,
  updatePatientProfileSchema,
  updateProfileSchema,
  updateStudentProfileSchema,
} from "./users.schema";

export async function updateProfile(req: Request, res: Response) {
  const input = updateProfileSchema.parse(req.body);
  const user = await prisma.user.update({ where: { id: req.user!.sub }, data: input });
  res.json({ id: user.id, name: user.name, phone: user.phone });
}

export async function updatePatientProfile(req: Request, res: Response) {
  const input = updatePatientProfileSchema.parse(req.body);
  const profile = await prisma.patientProfile.update({ where: { userId: req.user!.sub }, data: input }).catch(() => {
    throw ApiError.notFound("Patient profile not found");
  });
  res.json(profile);
}

export async function updateStudentProfile(req: Request, res: Response) {
  const input = updateStudentProfileSchema.parse(req.body);
  const profile = await prisma.studentProfile.update({ where: { userId: req.user!.sub }, data: input }).catch(() => {
    throw ApiError.notFound("Student profile not found");
  });
  res.json(profile);
}

export async function updateDoctorProfile(req: Request, res: Response) {
  const input = updateDoctorProfileSchema.parse(req.body);
  const profile = await prisma.doctorProfile.update({ where: { userId: req.user!.sub }, data: input }).catch(() => {
    throw ApiError.notFound("Doctor profile not found");
  });
  res.json(profile);
}

export async function listNotifications(req: Request, res: Response) {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(notifications);
}

export async function markNotificationRead(req: Request, res: Response) {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.sub },
    data: { isRead: true },
  });
  res.status(204).send();
}

export async function markAllNotificationsRead(req: Request, res: Response) {
  await prisma.notification.updateMany({ where: { userId: req.user!.sub, isRead: false }, data: { isRead: true } });
  res.status(204).send();
}

export async function listMyReports(req: Request, res: Response) {
  const reports = await prisma.report.findMany({
    where: { userId: req.user!.sub },
    include: { medicine: { select: { id: true, name: true } }, pharmacy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(reports);
}
