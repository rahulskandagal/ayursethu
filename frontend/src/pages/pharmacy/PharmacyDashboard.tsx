import { FormEvent, useEffect, useRef, useState } from "react";
import { Package, ClipboardList, FileText, ShoppingBag, Store } from "lucide-react";
import { api } from "../../api/client";
import { uploadFile } from "../../api/upload";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input, Label, Select } from "../../components/ui/Input";
import { EmptyState, ErrorState, Spinner } from "../../components/ui/Feedback";
import { PharmacyReservation, ReservationStatus } from "../../types";

interface PharmacyProfile {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  address: string;
  city: string;
  pinCode: string;
  verificationStatus: string;
}

interface InventoryItem {
  id: string;
  price: string;
  stockQty: number;
  inStock: boolean;
  medicine: { id: string; name: string; images: Array<{ url: string }> };
  lastUpdated: string;
}

interface AvailabilityRequestItem {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  medicine: { id: string; name: string };
  user: { name: string; phone: string | null };
}

type Tab = "overview" | "inventory" | "reservations" | "requests" | "documents";

const RESERVATION_STATUSES: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

export default function PharmacyDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState<PharmacyProfile | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[] | null>(null);
  const [requests, setRequests] = useState<AvailabilityRequestItem[] | null>(null);
  const [reservations, setReservations] = useState<PharmacyReservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [medicineId, setMedicineId] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [docType, setDocType] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docFileRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<Array<{ id: string; docType: string; fileUrl: string }>>([]);

  function loadAll() {
    api.get("/pharmacies/me").then(({ data }) => setProfile(data)).catch((err) => setError(err.message));
    api.get("/pharmacies/me/inventory").then(({ data }) => setInventory(data)).catch(() => setInventory([]));
    api.get("/pharmacies/me/availability-requests").then(({ data }) => setRequests(data)).catch(() => setRequests([]));
    api.get("/pharmacies/me/documents").then(({ data }) => setDocs(data)).catch(() => setDocs([]));
    api.get("/reservations/pharmacy").then(({ data }) => setReservations(data)).catch(() => setReservations([]));
  }

  useEffect(loadAll, []);

  async function addInventory(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post("/pharmacies/me/inventory", { medicineId, price: Number(price), stockQty: Number(stockQty) });
      setMedicineId("");
      setPrice("");
      setStockQty("");
      loadAll();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeInventory(id: string) {
    try {
      await api.delete(`/pharmacies/me/inventory/${id}`);
      loadAll();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function respond(id: string) {
    try {
      await api.post(`/pharmacies/me/availability-requests/${id}/respond`, {});
      loadAll();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function addDocument(e: FormEvent) {
    e.preventDefault();
    if (!docFile) return;
    setUploadingDoc(true);
    try {
      const uploaded = await uploadFile(docFile);
      await api.post("/pharmacies/me/documents", { docType, fileUrl: uploaded.url });
      setDocType("");
      setDocFile(null);
      if (docFileRef.current) docFileRef.current.value = "";
      loadAll();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingDoc(false);
    }
  }

  async function updateReservationStatus(id: string, status: ReservationStatus) {
    try {
      await api.patch(`/reservations/${id}/status`, { status });
      loadAll();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const tabs: Array<{ key: Tab; label: string; icon: JSX.Element }> = [
    { key: "overview", label: "Overview", icon: <Store className="h-4 w-4" /> },
    { key: "inventory", label: "Inventory", icon: <Package className="h-4 w-4" /> },
    { key: "reservations", label: "Reservations", icon: <ShoppingBag className="h-4 w-4" /> },
    { key: "requests", label: "Availability requests", icon: <ClipboardList className="h-4 w-4" /> },
    { key: "documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-forest-900">Pharmacy Dashboard</h1>
      {error && <ErrorState message={error} />}

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium ${tab === t.key ? "bg-forest-600 text-white" : "bg-white text-forest-700 border border-forest-200"}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6">
          {!profile ? (
            <Spinner />
          ) : (
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-forest-900">{profile.name}</h2>
                <Badge tone={profile.verificationStatus === "VERIFIED" ? "green" : profile.verificationStatus === "REJECTED" ? "red" : "gold"}>
                  {profile.verificationStatus}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-forest-600">{profile.address}, {profile.city} — {profile.pinCode}</p>
              <p className="text-sm text-forest-600">License: {profile.licenseNumber}</p>
              <p className="text-sm text-forest-600">Phone: {profile.phone}</p>
              {profile.verificationStatus === "PENDING" && (
                <p className="mt-2 text-xs text-gold-600">
                  Your pharmacy is awaiting admin verification. Upload your documents under the Documents tab to speed this up.
                </p>
              )}
            </Card>
          )}
        </div>
      )}

      {tab === "inventory" && (
        <div className="mt-6">
          <Card>
            <h2 className="font-semibold text-forest-900">Add / update stock</h2>
            <form onSubmit={addInventory} className="mt-3 grid gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <Label>Medicine ID</Label>
                <Input value={medicineId} onChange={(e) => setMedicineId(e.target.value)} placeholder="Copy from medicine detail URL" required />
              </div>
              <div>
                <Label>Price (₹)</Label>
                <Input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div>
                <Label>Stock qty</Label>
                <Input type="number" min={0} value={stockQty} onChange={(e) => setStockQty(e.target.value)} required />
              </div>
              <Button type="submit" className="sm:col-span-4 sm:w-fit">Save</Button>
            </form>
          </Card>

          <div className="mt-4">
            {!inventory ? (
              <Spinner />
            ) : inventory.length === 0 ? (
              <EmptyState title="No medicines in your inventory yet" />
            ) : (
              <div className="space-y-2">
                {inventory.map((item) => (
                  <Card key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-forest-800">{item.medicine.name}</p>
                      <p className="text-sm text-forest-500">₹{item.price} · {item.stockQty} units · {item.inStock ? "In stock" : "Out of stock"}</p>
                    </div>
                    <Button variant="danger" onClick={() => removeInventory(item.id)}>Remove</Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "requests" && (
        <div className="mt-6">
          {!requests ? (
            <Spinner />
          ) : requests.length === 0 ? (
            <EmptyState title="No availability requests yet" />
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <Card key={r.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-forest-800">{r.medicine.name}</p>
                    <p className="text-sm text-forest-500">From {r.user.name} {r.user.phone ? `(${r.user.phone})` : ""}</p>
                    {r.message && <p className="text-sm text-forest-500">"{r.message}"</p>}
                  </div>
                  <div className="text-right">
                    <Badge tone={r.status === "OPEN" ? "gold" : r.status === "CLOSED" ? "gray" : "green"}>{r.status}</Badge>
                    {r.status === "OPEN" && (
                      <Button className="mt-2 block" onClick={() => respond(r.id)}>Mark as responded</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "reservations" && (
        <div className="mt-6">
          {!reservations ? (
            <Spinner />
          ) : reservations.length === 0 ? (
            <EmptyState title="No reservations yet" />
          ) : (
            <div className="space-y-2">
              {reservations.map((r) => (
                <Card key={r.id} className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-forest-800">{r.medicine.name} × {r.quantity}</p>
                    <p className="text-sm text-forest-500">
                      {r.user.name} {r.user.phone ? `(${r.user.phone})` : ""} · {r.fulfillmentType === "DELIVERY" ? "Delivery" : "Pickup"}
                    </p>
                    {r.deliveryAddress && <p className="text-xs text-forest-400">To: {r.deliveryAddress}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={r.status === "CANCELLED" ? "red" : r.status === "COMPLETED" ? "gray" : "gold"}>
                      {r.status.replaceAll("_", " ")}
                    </Badge>
                    <Select
                      value={r.status}
                      onChange={(e) => updateReservationStatus(r.id, e.target.value as ReservationStatus)}
                      className="w-auto text-xs"
                    >
                      {RESERVATION_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
                      ))}
                    </Select>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "documents" && (
        <div className="mt-6">
          <Card>
            <h2 className="font-semibold text-forest-900">Upload verification document</h2>
            <form onSubmit={addDocument} className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Document type</Label>
                <Input value={docType} onChange={(e) => setDocType(e.target.value)} placeholder="e.g. Drug License" required />
              </div>
              <div className="sm:col-span-2">
                <Label>File (image or PDF)</Label>
                <input
                  ref={docFileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-forest-700"
                />
              </div>
              <Button type="submit" className="sm:col-span-3 sm:w-fit" disabled={uploadingDoc || !docFile}>
                {uploadingDoc ? "Uploading..." : "Add document"}
              </Button>
            </form>
          </Card>
          <div className="mt-4 space-y-2">
            {docs.map((d) => (
              <Card key={d.id} className="flex items-center justify-between">
                <span className="text-sm text-forest-700">{d.docType}</span>
                <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-forest-600 underline">View</a>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
