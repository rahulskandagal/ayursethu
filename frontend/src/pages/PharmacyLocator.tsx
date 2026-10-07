import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Phone } from "lucide-react";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Input, Label } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState, ErrorState, Spinner } from "../components/ui/Feedback";
import { Pharmacy } from "../types";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India

export default function PharmacyLocator() {
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function useMyLocation() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Could not access your location.")
    );
  }

  async function search() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/pharmacies", {
        params: { city: city || undefined, pinCode: pinCode || undefined, lat: coords?.lat, lng: coords?.lng },
      });
      setPharmacies(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  const center: [number, number] = coords ? [coords.lat, coords.lng] : DEFAULT_CENTER;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-forest-900">Find a Nearby Ayurvedic Pharmacy</h1>

      <div className="mt-4 grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit space-y-3">
          <div>
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Bengaluru" />
          </div>
          <div>
            <Label>PIN code</Label>
            <Input value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="e.g. 560001" />
          </div>
          <Button className="w-full" onClick={search}>Search</Button>
          <Button variant="outline" className="w-full" onClick={useMyLocation}>
            <MapPin className="h-4 w-4" /> Use my current location
          </Button>
        </Card>

        <div className="space-y-4">
          <div className="h-[360px] overflow-hidden rounded-xl2 border border-forest-100 shadow-card">
            <MapContainer center={center} zoom={coords ? 13 : 5} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap center={center} />
              {coords && (
                <Marker position={[coords.lat, coords.lng]} icon={icon}>
                  <Popup>You are here</Popup>
                </Marker>
              )}
              {pharmacies?.map((p) => (
                <Marker key={p.id} position={[p.latitude, p.longitude]} icon={icon}>
                  <Popup>
                    <strong>{p.name}</strong>
                    <br />
                    {p.address}
                    <br />
                    {p.phone}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {loading && <Spinner label="Finding pharmacies..." />}
          {error && <ErrorState message={error} />}
          {!loading && pharmacies && pharmacies.length === 0 && (
            <EmptyState title="No pharmacies found" description="Try a different city, PIN code, or search radius." />
          )}
          {!loading && pharmacies && pharmacies.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {pharmacies.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-forest-900">{p.name}</p>
                    {p.verified && <Badge tone="green">Verified</Badge>}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-forest-600"><MapPin className="h-3.5 w-3.5" />{p.address}, {p.city}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-forest-600"><Phone className="h-3.5 w-3.5" />{p.phone}</p>
                  {p.openingTime && <p className="mt-1 text-xs text-forest-500">{p.openingTime} – {p.closingTime}</p>}
                  {p.distanceKm !== null && <p className="mt-1 text-xs font-medium text-forest-700">{p.distanceKm} km away</p>}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
