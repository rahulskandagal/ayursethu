import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

export async function search(req: Request, res: Response) {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;

  const plants = await prisma.medicinalPlant.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { botanicalName: { contains: q, mode: "insensitive" } },
            { sanskritName: { contains: q, mode: "insensitive" } },
            { englishName: { contains: q, mode: "insensitive" } },
            { kannadaName: { contains: q, mode: "insensitive" } },
            { hindiName: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { images: { take: 1 } },
    orderBy: { name: "asc" },
  });

  res.json(
    plants.map((p) => ({
      id: p.id,
      name: p.name,
      botanicalName: p.botanicalName,
      sanskritName: p.sanskritName,
      englishName: p.englishName,
      image: p.images[0]?.url ?? null,
    }))
  );
}

export async function getById(req: Request, res: Response) {
  const plant = await prisma.medicinalPlant.findUnique({
    where: { id: req.params.id },
    include: {
      images: true,
      properties: true,
      classicalRefs: true,
      medicines: { include: { medicine: true } },
    },
  });
  if (!plant) throw ApiError.notFound("Plant not found");

  res.json({
    ...plant,
    relatedMedicines: plant.medicines.map((m) => m.medicine),
    medicines: undefined,
  });
}

/**
 * Preliminary, non-authoritative plant identification.
 *
 * There is no real image-recognition model wired in here (that needs a
 * trained vision model and a licensed/verified reference image set, which is
 * out of scope for this MVP). This endpoint instead does a keyword match
 * against known plant names/characteristics the caller describes, and always
 * returns the identification as preliminary — callers must not treat it as
 * a confirmed botanical identification.
 */
export async function identifyPreliminary(req: Request, res: Response) {
  const description = String(req.body?.description ?? "").trim();
  if (!description) throw ApiError.badRequest("Provide a short description of the plant's visible features");

  const candidates = await prisma.medicinalPlant.findMany({
    where: {
      OR: description
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .map((word) => ({ description: { contains: word, mode: "insensitive" as const } })),
    },
    include: { images: { take: 1 } },
    take: 5,
  });

  res.json({
    disclaimer:
      "This is a preliminary, AI/keyword-assisted suggestion only. It is NOT a confirmed botanical identification. Please have a qualified botanist or Ayurvedic practitioner verify the plant before any medicinal use.",
    candidates: candidates.map((p) => ({ id: p.id, name: p.name, botanicalName: p.botanicalName, image: p.images[0]?.url ?? null })),
  });
}
