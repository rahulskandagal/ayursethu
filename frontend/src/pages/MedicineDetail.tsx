import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BellRing, Flag, Heart, MapPin, Package, ShieldCheck, Star } from "lucide-react";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { ErrorState, Spinner } from "../components/ui/Feedback";
import { useAuth } from "../context/AuthContext";
import { MedicineAlternative, MedicineDetail as MedicineDetailType } from "../types";

export default function MedicineDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [medicine, setMedicine] = useState<MedicineDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [requestSent, setRequestSent] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<MedicineAlternative[]>([]);
  const [reservingPharmacyId, setReservingPharmacyId] = useState<string | null>(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveFulfillment, setReserveFulfillment] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [reserveAddress, setReserveAddress] = useState("");
  const [reservedPharmacyIds, setReservedPharmacyIds] = useState<string[]>([]);
  const [alertSet, setAlertSet] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/medicines/${id}`)
      .then(({ data }) => setMedicine(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    api
      .get(`/medicines/${id}/alternatives`)
      .then(({ data }) => setAlternatives(data))
      .catch(() => setAlternatives([]));
  }, [id]);

  async function toggleFavorite() {
    try {
      if (favorited) {
        await api.delete(`/medicines/${id}/favorite`);
      } else {
        await api.post(`/medicines/${id}/favorite`);
      }
      setFavorited((v) => !v);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function submitReport(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post(`/medicines/${id}/report`, { reason: reportReason });
      setReportSent(true);
      setReportReason("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function submitReview(e: FormEvent) {
    e.preventDefault();
    try {
      const { data } = await api.post(`/medicines/${id}/reviews`, { rating: reviewRating, comment: reviewComment || undefined });
      setMedicine((m) => (m ? { ...m, reviews: [{ ...data, user: { name: user?.name ?? "You" } }, ...m.reviews] } : m));
      setReviewComment("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function requestAvailability(pharmacyId?: string) {
    try {
      await api.post(`/medicines/${id}/availability-request`, { pharmacyId });
      setRequestSent(pharmacyId ?? "any");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function submitReservation(e: FormEvent, pharmacyId: string) {
    e.preventDefault();
    try {
      await api.post("/reservations", {
        medicineId: id,
        pharmacyId,
        quantity: reserveQty,
        fulfillmentType: reserveFulfillment,
        deliveryAddress: reserveFulfillment === "DELIVERY" ? reserveAddress : undefined,
      });
      setReservedPharmacyIds((prev) => [...prev, pharmacyId]);
      setReservingPharmacyId(null);
      setReserveQty(1);
      setReserveAddress("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function notifyWhenInStock() {
    try {
      await api.post(`/medicines/${id}/stock-alert`, {});
      setAlertSet(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading) return <Spinner label="Loading medicine..." />;
  if (error && !medicine) return <div className="mx-auto max-w-3xl p-6"><ErrorState message={error} /></div>;
  if (!medicine) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {error && <ErrorState message={error} />}
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div>
          {medicine.images[0] ? (
            <img src={medicine.images[0].url} alt={medicine.name} className="w-full rounded-xl2 object-cover" />
          ) : (
            <div className="flex h-56 w-full items-center justify-center rounded-xl2 bg-forest-50 text-forest-400">No image</div>
          )}
        </div>
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-semibold text-forest-900">{medicine.name}</h1>
              {medicine.brandName && <p className="text-forest-500">{medicine.brandName}</p>}
              <div className="mt-2 flex flex-wrap gap-1 text-sm text-forest-500">
                {medicine.sanskritName && <Badge tone="gray">Sanskrit: {medicine.sanskritName}</Badge>}
                {medicine.englishName && <Badge tone="gray">English: {medicine.englishName}</Badge>}
              </div>
            </div>
            {medicine.isVerifiedProduct ? (
              <Badge tone="green"><ShieldCheck className="mr-1 h-3 w-3" />Verified product</Badge>
            ) : (
              <Badge tone="gold">Verification pending</Badge>
            )}
          </div>

          {medicine.isDemoData && (
            <p className="mt-2 text-xs text-gold-600">This listing is demonstration data, not a real product.</p>
          )}

          <p className="mt-4 text-forest-700">{medicine.description}</p>

          {user?.role === "PATIENT" && (
            <Button variant="outline" className="mt-4" onClick={toggleFavorite}>
              <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
              {favorited ? "Saved to favorites" : "Save to favorites"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-forest-900">Classical properties</h2>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {[["Rasa", medicine.rasa], ["Guna", medicine.guna], ["Virya", medicine.virya], ["Vipaka", medicine.vipaka], ["Karma", medicine.karma]].map(
              ([label, value]) =>
                value && (
                  <div key={label}>
                    <dt className="text-forest-500">{label}</dt>
                    <dd className="font-medium text-forest-800">{value}</dd>
                  </div>
                )
            )}
          </dl>
          {medicine.traditionalIndications && (
            <p className="mt-3 text-sm text-forest-600">
              <span className="font-medium">Traditional indication: </span>{medicine.traditionalIndications}
            </p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-forest-900">Manufacturer & authenticity</h2>
          <p className="mt-2 text-sm text-forest-700">{medicine.manufacturer?.name ?? "Not listed"}</p>
          {medicine.manufacturer && (
            <Badge tone={medicine.manufacturer.verificationStatus === "VERIFIED" ? "green" : "gray"} className="mt-1">
              Manufacturer {medicine.manufacturer.verificationStatus.toLowerCase()}
            </Badge>
          )}
          {medicine.productLicenseNumber && <p className="mt-2 text-sm text-forest-600">License: {medicine.productLicenseNumber}</p>}
          {medicine.productCode && <p className="mt-1 text-sm text-forest-600">Barcode/QR code: {medicine.productCode}</p>}
          {medicine.batches.length > 0 && (
            <div className="mt-2 text-sm text-forest-600">
              <p className="font-medium">Batches on record:</p>
              {medicine.batches.map((b) => (
                <p key={b.id}>
                  #{b.batchNumber} {b.expiryDate ? `— expires ${new Date(b.expiryDate).toLocaleDateString()}` : ""}
                </p>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-forest-500">
            "Verified" reflects AyurSethu's own checks on seller registration and submitted documentation — not an
            independent guarantee of authenticity.
          </p>
          <form onSubmit={submitReport} className="mt-4 border-t border-forest-100 pt-4">
            <p className="flex items-center gap-1 text-sm font-medium text-forest-800"><Flag className="h-4 w-4" />Report this listing</p>
            {reportSent ? (
              <p className="mt-2 text-sm text-forest-600">Thanks — our team will review this report.</p>
            ) : (
              <>
                <Textarea className="mt-2" rows={2} placeholder="Describe the issue" value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
                <Button type="submit" variant="outline" className="mt-2" disabled={!reportReason}>Submit report</Button>
              </>
            )}
          </form>
        </Card>
      </div>

      {medicine.ingredients.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-semibold text-forest-900">Ingredients</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-forest-700">
            {medicine.ingredients.map((ing, i) => (
              <li key={i}>
                {ing.name} {ing.quantity ? `(${ing.quantity})` : ""}
                {ing.plant && <span className="text-forest-500"> — see plant profile</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mt-6">
        <h2 className="font-semibold text-forest-900">Available at pharmacies</h2>
        {medicine.offers.length === 0 && <p className="mt-2 text-sm text-forest-500">No pharmacy has listed this medicine yet.</p>}
        <div className="mt-3 space-y-3">
          {medicine.offers.map((o) => (
            <div key={o.pharmacyId} className="rounded-lg border border-forest-100 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-forest-800">
                    {o.pharmacyName} {o.verified && <Badge tone="green" className="ml-1"><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge>}
                  </p>
                  <p className="text-sm text-forest-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{o.address}, {o.city}</p>
                  <p className="text-xs text-forest-400">Updated {new Date(o.lastUpdated).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-forest-900">₹{o.price}</p>
                  <Badge tone={o.inStock ? "green" : "red"}>{o.inStock ? "In stock" : "Out of stock"}</Badge>
                  {o.distanceKm !== null && <p className="text-xs text-forest-500">{o.distanceKm} km away</p>}
                </div>
              </div>

              {user?.role === "PATIENT" && o.inStock && (
                <div className="mt-2 border-t border-forest-100 pt-2">
                  {reservedPharmacyIds.includes(o.pharmacyId) ? (
                    <p className="text-sm text-forest-600">Reserved — track it from "My Reservations".</p>
                  ) : reservingPharmacyId === o.pharmacyId ? (
                    <form onSubmit={(e) => submitReservation(e, o.pharmacyId)} className="mt-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={reserveQty}
                          onChange={(e) => setReserveQty(Number(e.target.value))}
                          className="w-20"
                        />
                        <Select
                          value={reserveFulfillment}
                          onChange={(e) => setReserveFulfillment(e.target.value as "PICKUP" | "DELIVERY")}
                          className="w-36"
                        >
                          <option value="PICKUP">Pickup</option>
                          <option value="DELIVERY">Delivery</option>
                        </Select>
                      </div>
                      {reserveFulfillment === "DELIVERY" && (
                        <Input
                          required
                          placeholder="Delivery address"
                          value={reserveAddress}
                          onChange={(e) => setReserveAddress(e.target.value)}
                        />
                      )}
                      <div className="flex gap-2">
                        <Button type="submit" variant="secondary">Confirm reservation</Button>
                        <Button type="button" variant="ghost" onClick={() => setReservingPharmacyId(null)}>Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <Button variant="outline" onClick={() => setReservingPharmacyId(o.pharmacyId)}>
                      <Package className="h-4 w-4" /> Reserve
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {user?.role === "PATIENT" && medicine.offers.length > 0 && medicine.offers.every((o) => !o.inStock) && (
          <div className="mt-4 border-t border-forest-100 pt-4">
            {alertSet ? (
              <p className="flex items-center gap-1 text-sm text-forest-600"><BellRing className="h-4 w-4" /> We'll notify you when it's back in stock.</p>
            ) : (
              <Button variant="outline" onClick={notifyWhenInStock}>
                <BellRing className="h-4 w-4" /> Notify me when back in stock
              </Button>
            )}
          </div>
        )}

        {(user?.role === "PATIENT" || user?.role === "DOCTOR") && (
          <div className="mt-4 border-t border-forest-100 pt-4">
            {requestSent ? (
              <p className="text-sm text-forest-600">Request sent — pharmacies will be notified.</p>
            ) : (
              <Button variant="outline" onClick={() => requestAvailability()}>
                Ask nearby pharmacies about availability
              </Button>
            )}
          </div>
        )}
      </Card>

      {alternatives.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-semibold text-forest-900">Alternatives to compare</h2>
          <p className="mt-1 text-xs text-forest-500">
            Same formulation category / indication area — not a claim of clinical equivalence. Compare details
            before switching.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {alternatives.map((alt) => (
              <Link
                key={alt.id}
                to={`/medicines/${alt.id}`}
                className="flex items-center justify-between rounded-lg border border-forest-100 p-3 hover:border-forest-300"
              >
                <div>
                  <p className="font-medium text-forest-800">{alt.name}</p>
                  <p className="text-xs text-forest-500">{alt.manufacturer ?? "Manufacturer not listed"}</p>
                </div>
                <div className="text-right">
                  {alt.isVerifiedProduct && <Badge tone="green">Verified</Badge>}
                  {alt.lowestPrice !== null && <p className="mt-1 text-sm font-semibold text-forest-900">₹{alt.lowestPrice}</p>}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <h2 className="font-semibold text-forest-900">Reviews</h2>
        {user && (
          <form onSubmit={submitReview} className="mt-3 space-y-2 border-b border-forest-100 pb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setReviewRating(n)}>
                  <Star className={`h-5 w-5 ${n <= reviewRating ? "fill-gold-400 text-gold-500" : "text-forest-200"}`} />
                </button>
              ))}
            </div>
            <Textarea rows={2} placeholder="Share your experience (optional)" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
            <Button type="submit" variant="outline">Submit review</Button>
          </form>
        )}
        <div className="mt-4 space-y-3">
          {medicine.reviews.length === 0 && <p className="text-sm text-forest-500">No reviews yet.</p>}
          {medicine.reviews.map((r) => (
            <div key={r.id} className="text-sm">
              <p className="font-medium text-forest-800">{r.user.name} · {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
              {r.comment && <p className="text-forest-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
