import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { createReservationSchema, updateReservationStatusSchema } from "./reservations.schema";

const STATUS_MESSAGE: Record<string, string> = {
  CONFIRMED: "has been confirmed by the pharmacy",
  READY_FOR_PICKUP: "is ready for pickup",
  OUT_FOR_DELIVERY: "is out for delivery",
  COMPLETED: "has been completed",
  CANCELLED: "has been cancelled by the pharmacy",
};

export async function create(req: Request, res: Response) {
  const input = createReservationSchema.parse(req.body);

  const [medicine, pharmacy] = await Promise.all([
    prisma.medicine.findUnique({ where: { id: input.medicineId } }),
    prisma.pharmacy.findUnique({ where: { id: input.pharmacyId } }),
  ]);
  if (!medicine) throw ApiError.notFound("Medicine not found");
  if (!pharmacy) throw ApiError.notFound("Pharmacy not found");
  if (input.fulfillmentType === "DELIVERY" && !input.deliveryAddress) {
    throw ApiError.badRequest("A delivery address is required for delivery fulfillment");
  }

  const reservation = await prisma.reservation.create({
    data: {
      userId: req.user!.sub,
      medicineId: input.medicineId,
      pharmacyId: input.pharmacyId,
      quantity: input.quantity,
      fulfillmentType: input.fulfillmentType,
      deliveryAddress: input.deliveryAddress,
      notes: input.notes,
    },
  });
  res.status(201).json(reservation);
}

export async function listMine(req: Request, res: Response) {
  const reservations = await prisma.reservation.findMany({
    where: { userId: req.user!.sub },
    include: { medicine: { include: { images: { take: 1 } } }, pharmacy: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(reservations);
}

export async function cancelMine(req: Request, res: Response) {
  const reservation = await prisma.reservation.findUnique({ where: { id: req.params.id } });
  if (!reservation || reservation.userId !== req.user!.sub) throw ApiError.notFound("Reservation not found");
  if (["COMPLETED", "CANCELLED"].includes(reservation.status)) {
    throw ApiError.badRequest(`Cannot cancel a reservation that is already ${reservation.status.toLowerCase()}`);
  }
  const updated = await prisma.reservation.update({ where: { id: reservation.id }, data: { status: "CANCELLED" } });
  res.json(updated);
}

export async function listForMyPharmacy(req: Request, res: Response) {
  const pharmacy = await prisma.pharmacy.findUnique({ where: { userId: req.user!.sub } });
  if (!pharmacy) throw ApiError.forbidden("No pharmacy profile for this account");

  const reservations = await prisma.reservation.findMany({
    where: { pharmacyId: pharmacy.id },
    include: { medicine: true, user: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(reservations);
}

export async function updateStatus(req: Request, res: Response) {
  const input = updateReservationStatusSchema.parse(req.body);
  const pharmacy = await prisma.pharmacy.findUnique({ where: { userId: req.user!.sub } });
  if (!pharmacy) throw ApiError.forbidden("No pharmacy profile for this account");

  const reservation = await prisma.reservation.findUnique({ where: { id: req.params.id } });
  if (!reservation || reservation.pharmacyId !== pharmacy.id) throw ApiError.notFound("Reservation not found");

  const updated = await prisma.reservation.update({ where: { id: reservation.id }, data: { status: input.status } });

  const message = STATUS_MESSAGE[input.status];
  if (message) {
    await prisma.notification.create({
      data: {
        userId: reservation.userId,
        type: "RESERVATION_UPDATE",
        message: `Your reservation at ${pharmacy.name} ${message}.`,
      },
    });
  }

  res.json(updated);
}
