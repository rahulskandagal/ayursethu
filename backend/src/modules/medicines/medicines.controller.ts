import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { haversineKm } from "../../utils/distance";
import {
  availabilityRequestSchema,
  createReportSchema,
  createReviewSchema,
  medicineSearchSchema,
} from "./medicines.schema";

const searchableTextFilter = (q: string) => ({
  OR: [
    { name: { contains: q, mode: "insensitive" as const } },
    { brandName: { contains: q, mode: "insensitive" as const } },
    { sanskritName: { contains: q, mode: "insensitive" as const } },
    { englishName: { contains: q, mode: "insensitive" as const } },
    { kannadaName: { contains: q, mode: "insensitive" as const } },
    { hindiName: { contains: q, mode: "insensitive" as const } },
    { traditionalIndications: { contains: q, mode: "insensitive" as const } },
    { ingredients: { some: { name: { contains: q, mode: "insensitive" as const } } } },
    { manufacturer: { name: { contains: q, mode: "insensitive" as const } } },
  ],
});

function buildPharmacyOffers(
  medicineId: string,
  inventory: Array<{
    price: unknown;
    stockQty: number;
    inStock: boolean;
    lastUpdated: Date;
    pharmacy: { id: string; name: string; city: string; address: string; latitude: number; longitude: number; phone: string; verificationStatus: string };
  }>,
  lat?: number,
  lng?: number
) {
  return inventory
    .map((inv) => ({
      pharmacyId: inv.pharmacy.id,
      pharmacyName: inv.pharmacy.name,
      city: inv.pharmacy.city,
      address: inv.pharmacy.address,
      phone: inv.pharmacy.phone,
      verified: inv.pharmacy.verificationStatus === "VERIFIED",
      price: Number(inv.price),
      inStock: inv.inStock && inv.stockQty > 0,
      stockQty: inv.stockQty,
      lastUpdated: inv.lastUpdated,
      distanceKm:
        lat !== undefined && lng !== undefined
          ? Math.round(haversineKm(lat, lng, inv.pharmacy.latitude, inv.pharmacy.longitude) * 10) / 10
          : null,
    }))
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      return a.price - b.price;
    });
}

export async function search(req: Request, res: Response) {
  const input = medicineSearchSchema.parse(req.query);

  const where: Record<string, unknown> = {
    ...(input.q ? searchableTextFilter(input.q) : {}),
    ...(input.manufacturer ? { manufacturer: { name: { contains: input.manufacturer, mode: "insensitive" } } } : {}),
    ...(input.dosageForm ? { dosageForm: input.dosageForm } : {}),
    ...(input.formulationCategory ? { formulationCategory: input.formulationCategory } : {}),
    ...(input.verifiedOnly ? { isVerifiedProduct: true } : {}),
  };

  const medicines = await prisma.medicine.findMany({
    where,
    include: {
      manufacturer: true,
      images: { take: 1 },
      inventory: { include: { pharmacy: true } },
    },
    orderBy: { name: "asc" },
  });

  let results = medicines.map((m) => {
    const offers = buildPharmacyOffers(m.id, m.inventory as any, input.lat, input.lng);
    const inRange =
      input.lat !== undefined && input.lng !== undefined
        ? offers.filter((o) => o.distanceKm !== null && o.distanceKm! <= input.radiusKm)
        : offers;
    return {
      id: m.id,
      name: m.name,
      brandName: m.brandName,
      sanskritName: m.sanskritName,
      englishName: m.englishName,
      dosageForm: m.dosageForm,
      formulationCategory: m.formulationCategory,
      manufacturer: m.manufacturer?.name ?? null,
      isVerifiedProduct: m.isVerifiedProduct,
      image: m.images[0]?.url ?? null,
      lowestPrice: offers.length ? Math.min(...offers.map((o) => o.price)) : null,
      nearestDistanceKm: inRange.find((o) => o.distanceKm !== null)?.distanceKm ?? null,
      offerCount: offers.length,
      inStockCount: offers.filter((o) => o.inStock).length,
      offers: offers.slice(0, 5),
    };
  });

  if (input.inStockOnly) results = results.filter((m) => m.inStockCount > 0);
  if (input.priceMin !== undefined) results = results.filter((m) => m.lowestPrice !== null && m.lowestPrice >= input.priceMin!);
  if (input.priceMax !== undefined) results = results.filter((m) => m.lowestPrice !== null && m.lowestPrice <= input.priceMax!);
  if (input.lat !== undefined && input.lng !== undefined) {
    results = results.filter((m) => m.offers.some((o) => o.distanceKm !== null && o.distanceKm <= input.radiusKm));
  }

  const total = results.length;
  const start = (input.page - 1) * input.pageSize;
  const page = results.slice(start, start + input.pageSize);

  res.json({ total, page: input.page, pageSize: input.pageSize, results: page });
}

const medicineDetailInclude = {
  manufacturer: true,
  ingredients: { include: { plant: true } },
  images: true,
  batches: true,
  packageSizes: true,
  classicalRefs: true,
  relatedPlants: { include: { plant: true } },
  inventory: { include: { pharmacy: true } },
  reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" as const }, take: 20 },
} as const;

function serializeMedicineDetail(medicine: any, lat?: number, lng?: number) {
  const offers = buildPharmacyOffers(medicine.id, medicine.inventory as any, lat, lng);
  return {
    id: medicine.id,
    name: medicine.name,
    brandName: medicine.brandName,
    sanskritName: medicine.sanskritName,
    englishName: medicine.englishName,
    kannadaName: medicine.kannadaName,
    hindiName: medicine.hindiName,
    dosageForm: medicine.dosageForm,
    formulationCategory: medicine.formulationCategory,
    description: medicine.description,
    traditionalIndications: medicine.traditionalIndications,
    rasa: medicine.rasa,
    guna: medicine.guna,
    virya: medicine.virya,
    vipaka: medicine.vipaka,
    karma: medicine.karma,
    manufacturer: medicine.manufacturer,
    productLicenseNumber: medicine.productLicenseNumber,
    productCode: medicine.productCode,
    isVerifiedProduct: medicine.isVerifiedProduct,
    isDemoData: medicine.isDemoData,
    ingredients: medicine.ingredients.map((i: any) => ({ name: i.name, quantity: i.quantity, plant: i.plant })),
    images: medicine.images,
    batches: medicine.batches,
    packageSizes: medicine.packageSizes,
    classicalRefs: medicine.classicalRefs,
    relatedPlants: medicine.relatedPlants.map((rp: any) => rp.plant),
    reviews: medicine.reviews,
    offers,
  };
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params;
  const lat = req.query.lat ? Number(req.query.lat) : undefined;
  const lng = req.query.lng ? Number(req.query.lng) : undefined;

  const medicine = await prisma.medicine.findUnique({ where: { id }, include: medicineDetailInclude });
  if (!medicine) throw ApiError.notFound("Medicine not found");

  res.json(serializeMedicineDetail(medicine, lat, lng));
}

export async function getByCode(req: Request, res: Response) {
  const { code } = req.params;
  const lat = req.query.lat ? Number(req.query.lat) : undefined;
  const lng = req.query.lng ? Number(req.query.lng) : undefined;

  const medicine = await prisma.medicine.findUnique({ where: { productCode: code }, include: medicineDetailInclude });
  if (!medicine) throw ApiError.notFound("No medicine found for this barcode/QR code");

  res.json(serializeMedicineDetail(medicine, lat, lng));
}

export async function getAlternatives(req: Request, res: Response) {
  const medicine = await prisma.medicine.findUnique({ where: { id: req.params.id } });
  if (!medicine) throw ApiError.notFound("Medicine not found");

  // "Alternative" here means another product in the same formulation category
  // that shares at least one traditional-indication keyword — it is NOT a
  // claim of clinical equivalence, just a starting point for the patient to
  // compare (see the comparison endpoint for a side-by-side view).
  const indicationWords = (medicine.traditionalIndications ?? "")
    .split(/[\s,.]+/)
    .filter((w) => w.length > 4)
    .slice(0, 6);

  const alternatives = await prisma.medicine.findMany({
    where: {
      id: { not: medicine.id },
      formulationCategory: medicine.formulationCategory,
      ...(indicationWords.length
        ? { OR: indicationWords.map((w) => ({ traditionalIndications: { contains: w, mode: "insensitive" as const } })) }
        : {}),
    },
    include: { manufacturer: true, images: { take: 1 }, inventory: true },
    take: 8,
  });

  res.json(
    alternatives.map((m) => ({
      id: m.id,
      name: m.name,
      brandName: m.brandName,
      manufacturer: m.manufacturer?.name ?? null,
      image: m.images[0]?.url ?? null,
      isVerifiedProduct: m.isVerifiedProduct,
      lowestPrice: m.inventory.length ? Math.min(...m.inventory.map((i) => Number(i.price))) : null,
    }))
  );
}

export async function listStockAlerts(req: Request, res: Response) {
  const alerts = await prisma.stockAlert.findMany({
    where: { userId: req.user!.sub },
    include: { medicine: { include: { images: { take: 1 } } }, pharmacy: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(alerts);
}

export async function createStockAlert(req: Request, res: Response) {
  const medicine = await prisma.medicine.findUnique({ where: { id: req.params.id } });
  if (!medicine) throw ApiError.notFound("Medicine not found");
  const pharmacyId = typeof req.body?.pharmacyId === "string" ? req.body.pharmacyId : null;

  const existing = await prisma.stockAlert.findFirst({
    where: { userId: req.user!.sub, medicineId: medicine.id, pharmacyId },
  });
  if (existing) return res.status(200).json(existing);

  const alert = await prisma.stockAlert.create({
    data: { userId: req.user!.sub, medicineId: medicine.id, pharmacyId },
  });
  res.status(201).json(alert);
}

export async function removeStockAlert(req: Request, res: Response) {
  const pharmacyId = typeof req.query.pharmacyId === "string" ? req.query.pharmacyId : null;
  await prisma.stockAlert.deleteMany({
    where: { userId: req.user!.sub, medicineId: req.params.id, pharmacyId },
  });
  res.status(204).send();
}

export async function compare(req: Request, res: Response) {
  const idsParam = String(req.query.ids ?? "");
  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length < 2) throw ApiError.badRequest("Provide at least two medicine ids to compare, e.g. ?ids=a,b");
  if (ids.length > 4) throw ApiError.badRequest("You can compare at most 4 medicines at a time");

  const medicines = await prisma.medicine.findMany({
    where: { id: { in: ids } },
    include: {
      manufacturer: true,
      ingredients: true,
      packageSizes: true,
      inventory: { include: { pharmacy: true } },
    },
  });

  res.json(
    medicines.map((m) => ({
      id: m.id,
      name: m.name,
      brandName: m.brandName,
      manufacturer: m.manufacturer?.name ?? null,
      manufacturerLicense: m.manufacturer?.licenseNumber ?? null,
      dosageForm: m.dosageForm,
      ingredients: m.ingredients.map((i) => i.name),
      packageSizes: m.packageSizes.map((p) => `${p.size} ${p.unit}`),
      isVerifiedProduct: m.isVerifiedProduct,
      lowestPrice: m.inventory.length ? Math.min(...m.inventory.map((i) => Number(i.price))) : null,
      offerCount: m.inventory.length,
      pharmacies: m.inventory.map((i) => i.pharmacy.name),
    }))
  );
}

export async function addFavorite(req: Request, res: Response) {
  const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: req.user!.sub } });
  if (!patientProfile) throw ApiError.forbidden("Only patients can save favorites");

  const favorite = await prisma.medicineFavorite.upsert({
    where: { patientId_medicineId: { patientId: patientProfile.id, medicineId: req.params.id } },
    create: { patientId: patientProfile.id, medicineId: req.params.id },
    update: {},
  });
  res.status(201).json(favorite);
}

export async function removeFavorite(req: Request, res: Response) {
  const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: req.user!.sub } });
  if (!patientProfile) throw ApiError.forbidden("Only patients can manage favorites");

  await prisma.medicineFavorite
    .delete({ where: { patientId_medicineId: { patientId: patientProfile.id, medicineId: req.params.id } } })
    .catch(() => undefined);
  res.status(204).send();
}

export async function listFavorites(req: Request, res: Response) {
  const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: req.user!.sub } });
  if (!patientProfile) throw ApiError.forbidden("Only patients have favorites");

  const favorites = await prisma.medicineFavorite.findMany({
    where: { patientId: patientProfile.id },
    include: { medicine: { include: { images: { take: 1 }, manufacturer: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(favorites.map((f) => f.medicine));
}

export async function addReview(req: Request, res: Response) {
  const input = createReviewSchema.parse(req.body);
  const medicine = await prisma.medicine.findUnique({ where: { id: req.params.id } });
  if (!medicine) throw ApiError.notFound("Medicine not found");

  const review = await prisma.review.create({
    data: { medicineId: medicine.id, userId: req.user!.sub, rating: input.rating, comment: input.comment },
  });
  res.status(201).json(review);
}

export async function reportMedicine(req: Request, res: Response) {
  const input = createReportSchema.parse(req.body);
  const medicine = await prisma.medicine.findUnique({ where: { id: req.params.id } });
  if (!medicine) throw ApiError.notFound("Medicine not found");

  const report = await prisma.report.create({
    data: { medicineId: medicine.id, userId: req.user!.sub, reason: input.reason },
  });
  res.status(201).json(report);
}

export async function requestAvailability(req: Request, res: Response) {
  const input = availabilityRequestSchema.parse(req.body);
  const medicine = await prisma.medicine.findUnique({ where: { id: req.params.id } });
  if (!medicine) throw ApiError.notFound("Medicine not found");

  const request = await prisma.availabilityRequest.create({
    data: {
      medicineId: medicine.id,
      userId: req.user!.sub,
      pharmacyId: input.pharmacyId,
      message: input.message,
    },
  });
  res.status(201).json(request);
}
