import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { haversineKm } from "../../utils/distance";
import {
  addDocumentSchema,
  locatorSchema,
  respondAvailabilitySchema,
  updatePharmacySchema,
  upsertInventorySchema,
} from "./pharmacies.schema";

async function getOwnPharmacyOrThrow(userId: string) {
  const pharmacy = await prisma.pharmacy.findUnique({ where: { userId } });
  if (!pharmacy) throw ApiError.notFound("No pharmacy profile for this account");
  return pharmacy;
}

export async function locate(req: Request, res: Response) {
  const input = locatorSchema.parse(req.query);

  const where: Record<string, unknown> = {
    ...(input.city ? { city: { contains: input.city, mode: "insensitive" } } : {}),
    ...(input.pinCode ? { pinCode: input.pinCode } : {}),
    ...(input.verifiedOnly ? { verificationStatus: "VERIFIED" } : {}),
    ...(input.medicineId
      ? { inventory: { some: { medicineId: input.medicineId, inStock: true, stockQty: { gt: 0 } } } }
      : {}),
  };

  const pharmacies = await prisma.pharmacy.findMany({ where });

  let results = pharmacies.map((p) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    city: p.city,
    pinCode: p.pinCode,
    phone: p.phone,
    latitude: p.latitude,
    longitude: p.longitude,
    openingTime: p.openingTime,
    closingTime: p.closingTime,
    verified: p.verificationStatus === "VERIFIED",
    distanceKm:
      input.lat !== undefined && input.lng !== undefined
        ? Math.round(haversineKm(input.lat, input.lng, p.latitude, p.longitude) * 10) / 10
        : null,
  }));

  if (input.lat !== undefined && input.lng !== undefined) {
    results = results.filter((p) => p.distanceKm !== null && p.distanceKm <= input.radiusKm);
    results.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  } else {
    results.sort((a, b) => a.name.localeCompare(b.name));
  }

  res.json(results);
}

export async function getById(req: Request, res: Response) {
  const pharmacy = await prisma.pharmacy.findUnique({
    where: { id: req.params.id },
    include: { inventory: { include: { medicine: { include: { images: { take: 1 } } } } } },
  });
  if (!pharmacy) throw ApiError.notFound("Pharmacy not found");

  res.json({
    id: pharmacy.id,
    name: pharmacy.name,
    address: pharmacy.address,
    city: pharmacy.city,
    pinCode: pharmacy.pinCode,
    phone: pharmacy.phone,
    latitude: pharmacy.latitude,
    longitude: pharmacy.longitude,
    openingTime: pharmacy.openingTime,
    closingTime: pharmacy.closingTime,
    verified: pharmacy.verificationStatus === "VERIFIED",
    medicines: pharmacy.inventory.map((inv) => ({
      medicineId: inv.medicine.id,
      name: inv.medicine.name,
      image: inv.medicine.images[0]?.url ?? null,
      price: Number(inv.price),
      inStock: inv.inStock && inv.stockQty > 0,
      lastUpdated: inv.lastUpdated,
    })),
  });
}

export async function getMyPharmacy(req: Request, res: Response) {
  const pharmacy = await getOwnPharmacyOrThrow(req.user!.sub);
  res.json(pharmacy);
}

export async function updateMyPharmacy(req: Request, res: Response) {
  const input = updatePharmacySchema.parse(req.body);
  const pharmacy = await getOwnPharmacyOrThrow(req.user!.sub);
  const updated = await prisma.pharmacy.update({ where: { id: pharmacy.id }, data: input });
  res.json(updated);
}

export async function addDocument(req: Request, res: Response) {
  const input = addDocumentSchema.parse(req.body);
  const pharmacy = await getOwnPharmacyOrThrow(req.user!.sub);
  const doc = await prisma.pharmacyDocument.create({
    data: { pharmacyId: pharmacy.id, docType: input.docType, fileUrl: input.fileUrl },
  });
  res.status(201).json(doc);
}

export async function listMyDocuments(req: Request, res: Response) {
  const pharmacy = await getOwnPharmacyOrThrow(req.user!.sub);
  const docs = await prisma.pharmacyDocument.findMany({ where: { pharmacyId: pharmacy.id } });
  res.json(docs);
}

export async function listMyInventory(req: Request, res: Response) {
  const pharmacy = await getOwnPharmacyOrThrow(req.user!.sub);
  const inventory = await prisma.inventory.findMany({
    where: { pharmacyId: pharmacy.id },
    include: { medicine: { include: { images: { take: 1 } } }, batch: true },
    orderBy: { lastUpdated: "desc" },
  });
  res.json(inventory);
}

export async function upsertInventory(req: Request, res: Response) {
  const input = upsertInventorySchema.parse(req.body);
  const pharmacy = await getOwnPharmacyOrThrow(req.user!.sub);

  const medicine = await prisma.medicine.findUnique({ where: { id: input.medicineId } });
  if (!medicine) throw ApiError.notFound("Medicine not found");

  let batchId: string | undefined;
  if (input.batch) {
    const batch = await prisma.medicineBatch.create({
      data: {
        medicineId: medicine.id,
        batchNumber: input.batch.batchNumber,
        manufactureDate: input.batch.manufactureDate ? new Date(input.batch.manufactureDate) : undefined,
        expiryDate: input.batch.expiryDate ? new Date(input.batch.expiryDate) : undefined,
      },
    });
    batchId = batch.id;
  }

  const existing = await prisma.inventory.findUnique({
    where: { pharmacyId_medicineId: { pharmacyId: pharmacy.id, medicineId: medicine.id } },
  });
  const wasInStock = existing ? existing.inStock && existing.stockQty > 0 : false;
  const nowInStock = (input.inStock ?? input.stockQty > 0) && input.stockQty > 0;

  const inventory = await prisma.inventory.upsert({
    where: { pharmacyId_medicineId: { pharmacyId: pharmacy.id, medicineId: medicine.id } },
    create: {
      pharmacyId: pharmacy.id,
      medicineId: medicine.id,
      batchId,
      price: input.price,
      stockQty: input.stockQty,
      inStock: input.inStock ?? input.stockQty > 0,
    },
    update: {
      ...(batchId ? { batchId } : {}),
      price: input.price,
      stockQty: input.stockQty,
      inStock: input.inStock ?? input.stockQty > 0,
    },
  });

  if (!wasInStock && nowInStock) {
    await notifyStockAlerts(medicine.id, pharmacy.id, pharmacy.name, medicine.name);
  }

  res.status(201).json(inventory);
}

async function notifyStockAlerts(medicineId: string, pharmacyId: string, pharmacyName: string, medicineName: string) {
  const alerts = await prisma.stockAlert.findMany({
    where: {
      medicineId,
      notified: false,
      OR: [{ pharmacyId }, { pharmacyId: null }],
    },
  });
  if (alerts.length === 0) return;

  await prisma.$transaction([
    prisma.notification.createMany({
      data: alerts.map((a) => ({
        userId: a.userId,
        type: "STOCK_ALERT" as const,
        message: `${medicineName} is back in stock at ${pharmacyName}.`,
      })),
    }),
    prisma.stockAlert.updateMany({
      where: { id: { in: alerts.map((a) => a.id) } },
      data: { notified: true },
    }),
  ]);
}

export async function deleteInventory(req: Request, res: Response) {
  const pharmacy = await getOwnPharmacyOrThrow(req.user!.sub);
  const item = await prisma.inventory.findUnique({ where: { id: req.params.inventoryId } });
  if (!item || item.pharmacyId !== pharmacy.id) throw ApiError.notFound("Inventory item not found");
  await prisma.inventory.delete({ where: { id: item.id } });
  res.status(204).send();
}

export async function listMyAvailabilityRequests(req: Request, res: Response) {
  const pharmacy = await getOwnPharmacyOrThrow(req.user!.sub);
  const requests = await prisma.availabilityRequest.findMany({
    where: { OR: [{ pharmacyId: pharmacy.id }, { pharmacyId: null }] },
    include: { medicine: true, user: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(requests);
}

export async function respondAvailabilityRequest(req: Request, res: Response) {
  const input = respondAvailabilitySchema.parse(req.body);
  const pharmacy = await getOwnPharmacyOrThrow(req.user!.sub);
  const request = await prisma.availabilityRequest.findUnique({ where: { id: req.params.id } });
  if (!request) throw ApiError.notFound("Request not found");

  const updated = await prisma.availabilityRequest.update({
    where: { id: request.id },
    data: {
      pharmacyId: pharmacy.id,
      status: input.close ? "CLOSED" : "RESPONDED",
    },
  });

  await prisma.notification.create({
    data: {
      userId: request.userId,
      type: "AVAILABILITY_RESPONSE",
      message: input.message
        ? `${pharmacy.name} responded: ${input.message}`
        : `${pharmacy.name} responded to your availability request.`,
    },
  });

  res.json(updated);
}
