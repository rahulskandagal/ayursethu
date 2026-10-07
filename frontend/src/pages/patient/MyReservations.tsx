import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState, ErrorState, Spinner } from "../../components/ui/Feedback";
import { Reservation, ReservationStatus } from "../../types";

const STATUS_TONE: Record<ReservationStatus, "gold" | "green" | "gray" | "red"> = {
  PENDING: "gold",
  CONFIRMED: "green",
  READY_FOR_PICKUP: "green",
  OUT_FOR_DELIVERY: "green",
  COMPLETED: "gray",
  CANCELLED: "red",
};

const STATUS_STEPS: ReservationStatus[] = ["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED"];

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get("/reservations/me").then(({ data }) => setReservations(data)).catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function cancel(id: string) {
    try {
      await api.post(`/reservations/${id}/cancel`);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (error) return <div className="mx-auto max-w-3xl p-6"><ErrorState message={error} /></div>;
  if (!reservations) return <Spinner label="Loading your reservations..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-forest-900">
        <Package className="h-6 w-6" /> My Reservations
      </h1>

      {reservations.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No reservations yet" description="Reserve a medicine from its detail page to pick it up or have it delivered." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reservations.map((r) => {
            const relevantSteps = r.fulfillmentType === "DELIVERY" ? STATUS_STEPS : STATUS_STEPS.filter((s) => s !== "OUT_FOR_DELIVERY");
            const stepIndex = relevantSteps.indexOf(r.status);
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/medicines/${r.medicine.id}`} className="font-medium text-forest-900 hover:underline">
                      {r.medicine.name}
                    </Link>
                    <p className="text-sm text-forest-500">
                      {r.quantity} unit{r.quantity > 1 ? "s" : ""} · {r.pharmacy.name} · {r.fulfillmentType === "DELIVERY" ? "Delivery" : "Pickup"}
                    </p>
                    {r.deliveryAddress && <p className="text-xs text-forest-400">Deliver to: {r.deliveryAddress}</p>}
                    <p className="text-xs text-forest-400">Requested {new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge tone={STATUS_TONE[r.status]}>{r.status.replaceAll("_", " ")}</Badge>
                </div>

                {!["CANCELLED"].includes(r.status) && (
                  <div className="mt-4 flex items-center gap-1">
                    {relevantSteps.map((s, i) => (
                      <div key={s} className="flex flex-1 items-center">
                        <div className={`h-2 flex-1 rounded-full ${i <= stepIndex ? "bg-forest-600" : "bg-forest-100"}`} />
                      </div>
                    ))}
                  </div>
                )}

                {["PENDING", "CONFIRMED"].includes(r.status) && (
                  <Button variant="danger" className="mt-3" onClick={() => cancel(r.id)}>
                    Cancel reservation
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
