export type Role = "PATIENT" | "STUDENT" | "DOCTOR" | "PHARMACY" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
}

export interface MedicineOffer {
  pharmacyId: string;
  pharmacyName: string;
  city: string;
  address: string;
  phone: string;
  verified: boolean;
  price: number;
  inStock: boolean;
  stockQty: number;
  lastUpdated: string;
  distanceKm: number | null;
}

export interface MedicineSummary {
  id: string;
  name: string;
  brandName?: string | null;
  sanskritName?: string | null;
  englishName?: string | null;
  dosageForm: string;
  formulationCategory: string;
  manufacturer: string | null;
  isVerifiedProduct: boolean;
  image: string | null;
  lowestPrice: number | null;
  nearestDistanceKm: number | null;
  offerCount: number;
  inStockCount: number;
  offers: MedicineOffer[];
}

export interface MedicineDetail extends Omit<MedicineSummary, "manufacturer" | "offers"> {
  description: string;
  traditionalIndications?: string | null;
  rasa?: string | null;
  guna?: string | null;
  virya?: string | null;
  vipaka?: string | null;
  karma?: string | null;
  manufacturer: { id: string; name: string; licenseNumber: string | null; verificationStatus: string } | null;
  productLicenseNumber?: string | null;
  productCode?: string | null;
  isDemoData: boolean;
  ingredients: Array<{ name: string; quantity: string | null; plant: PlantSummary | null }>;
  images: Array<{ id: string; url: string; caption: string | null }>;
  batches: Array<{ id: string; batchNumber: string; manufactureDate: string | null; expiryDate: string | null }>;
  packageSizes: Array<{ id: string; size: string; unit: string }>;
  classicalRefs: Array<{ id: string; sourceText: string; reference: string }>;
  relatedPlants: PlantSummary[];
  reviews: Array<{ id: string; rating: number; comment: string | null; createdAt: string; user: { name: string } }>;
  offers: MedicineOffer[];
}

export interface PlantSummary {
  id: string;
  name: string;
  botanicalName?: string | null;
  sanskritName?: string | null;
  englishName?: string | null;
  image?: string | null;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  pinCode: string;
  phone: string;
  latitude: number;
  longitude: number;
  openingTime?: string | null;
  closingTime?: string | null;
  verified: boolean;
  distanceKm: number | null;
}

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  chapterCount: number;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type ReservationStatus = "PENDING" | "CONFIRMED" | "READY_FOR_PICKUP" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED";
export type FulfillmentType = "PICKUP" | "DELIVERY";

export interface Reservation {
  id: string;
  quantity: number;
  fulfillmentType: FulfillmentType;
  deliveryAddress: string | null;
  status: ReservationStatus;
  notes: string | null;
  createdAt: string;
  medicine: { id: string; name: string; images?: Array<{ url: string }> };
  pharmacy: { id: string; name: string; phone: string; city: string };
}

export interface PharmacyReservation extends Omit<Reservation, "pharmacy"> {
  user: { name: string; phone: string | null };
}

export interface StockAlert {
  id: string;
  notified: boolean;
  createdAt: string;
  medicine: { id: string; name: string; images?: Array<{ url: string }> };
  pharmacy: { id: string; name: string } | null;
}

export interface Prescription {
  id: string;
  title: string;
  fileUrl: string;
  issuedBy: string | null;
  issuedDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface MedicineAlternative {
  id: string;
  name: string;
  brandName: string | null;
  manufacturer: string | null;
  image: string | null;
  isVerifiedProduct: boolean;
  lowestPrice: number | null;
}
