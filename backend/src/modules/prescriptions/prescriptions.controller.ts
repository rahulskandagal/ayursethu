import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { createPrescriptionSchema } from "./prescriptions.schema";

// Prescriptions are private to the uploading user — there is no sharing/
// authorization workflow yet (see ROADMAP.md, Compliance section), so every
// query here is scoped to req.user!.sub and nothing else can read them.

export async function list(req: Request, res: Response) {
  const prescriptions = await prisma.prescription.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: "desc" },
  });
  res.json(prescriptions);
}

export async function create(req: Request, res: Response) {
  const input = createPrescriptionSchema.parse(req.body);
  const prescription = await prisma.prescription.create({
    data: {
      userId: req.user!.sub,
      title: input.title,
      fileUrl: input.fileUrl,
      issuedBy: input.issuedBy,
      issuedDate: input.issuedDate ? new Date(input.issuedDate) : undefined,
      notes: input.notes,
    },
  });
  res.status(201).json(prescription);
}

export async function remove(req: Request, res: Response) {
  const prescription = await prisma.prescription.findUnique({ where: { id: req.params.id } });
  if (!prescription || prescription.userId !== req.user!.sub) throw ApiError.notFound("Prescription not found");
  await prisma.prescription.delete({ where: { id: prescription.id } });
  res.status(204).send();
}
