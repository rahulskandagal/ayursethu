import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mic, MapPin, ScanLine, ShieldCheck } from "lucide-react";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Input, Label, Select } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState, ErrorState, Spinner } from "../components/ui/Feedback";
import { MedicineSummary } from "../types";
import { useVoiceInput, VOICE_LANGUAGES } from "../hooks/useVoiceInput";

const dosageForms = ["TABLET", "CAPSULE", "POWDER", "OIL", "SYRUP", "KASHAYA", "ASAVA_ARISHTA", "VATI_GUTIKA", "GHRITA", "AVALEHA", "BHASMA", "OTHER"];

export default function MedicineSearch() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const voice = useVoiceInput((text) => setQ(text));
  const [dosageForm, setDosageForm] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [useLocation, setUseLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [results, setResults] = useState<MedicineSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  function requestLocation() {
    setUseLocation(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Could not get your location. You can still search without it.")
    );
  }

  async function runSearch() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/medicines", {
        params: {
          q: q || undefined,
          dosageForm: dosageForm || undefined,
          verifiedOnly: verifiedOnly || undefined,
          inStockOnly: inStockOnly || undefined,
          lat: useLocation ? coords?.lat : undefined,
          lng: useLocation ? coords?.lng : undefined,
        },
      });
      setResults(data.results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dosageForm, verifiedOnly, inStockOnly, coords]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setParams(q ? { q } : {});
      runSearch();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function toggleCompare(id: string) {
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-forest-900">Discover Ayurvedic Medicines</h1>

      <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit space-y-4">
          <div>
            <Label>Search</Label>
            <div className="flex gap-1">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, brand, Sanskrit, ingredient..." />
              <button
                type="button"
                onClick={() => (voice.listening ? voice.stop() : voice.start())}
                title="Search by voice"
                className={`shrink-0 rounded-lg border px-2 ${voice.listening ? "border-red-400 bg-red-50 text-red-600" : "border-forest-200 text-forest-600"}`}
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
            {voice.unsupported && (
              <p className="mt-1 text-xs text-forest-400">Voice search isn't supported in this browser.</p>
            )}
            {!voice.unsupported && (
              <Select value={voice.lang} onChange={(e) => voice.setLang(e.target.value)} className="mt-1 text-xs">
                {VOICE_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </Select>
            )}
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate("/scan")}>
            <ScanLine className="h-4 w-4" /> Scan barcode / QR
          </Button>
          <div>
            <Label>Dosage form</Label>
            <Select value={dosageForm} onChange={(e) => setDosageForm(e.target.value)}>
              <option value="">Any</option>
              {dosageForms.map((d) => (
                <option key={d} value={d}>{d.replaceAll("_", " ")}</option>
              ))}
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm text-forest-700">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            Verified products only
          </label>
          <label className="flex items-center gap-2 text-sm text-forest-700">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            In-stock only
          </label>
          <Button variant="outline" className="w-full" onClick={requestLocation}>
            <MapPin className="h-4 w-4" /> {coords ? "Using your location" : "Use my location"}
          </Button>

          {compareIds.length >= 2 && (
            <Link to={`/compare?ids=${compareIds.join(",")}`}>
              <Button className="w-full">Compare {compareIds.length} selected</Button>
            </Link>
          )}
        </Card>

        <div>
          {loading && <Spinner label="Searching medicines..." />}
          {error && <ErrorState message={error} />}
          {!loading && results && results.length === 0 && (
            <EmptyState title="No medicines found" description="Try a different search term or fewer filters." />
          )}
          {!loading && results && results.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((m) => (
                <Card key={m.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/medicines/${m.id}`} className="font-medium text-forest-900 hover:underline">
                        {m.name}
                      </Link>
                      {m.brandName && <p className="text-xs text-forest-500">{m.brandName}</p>}
                    </div>
                    {m.isVerifiedProduct && (
                      <Badge tone="green"><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge>
                    )}
                  </div>
                  {m.image && <img src={m.image} alt={m.name} className="mt-3 h-32 w-full rounded-lg object-cover" />}
                  <p className="mt-2 text-sm text-forest-500">{m.manufacturer ?? "Manufacturer not listed"}</p>
                  <p className="mt-1 text-sm text-forest-700">{m.dosageForm.replaceAll("_", " ")}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-forest-900">
                      {m.lowestPrice !== null ? `From ₹${m.lowestPrice}` : "Price unavailable"}
                    </span>
                    <span className="text-forest-500">{m.inStockCount} pharmacy{m.inStockCount === 1 ? "" : "s"} in stock</span>
                  </div>
                  {m.nearestDistanceKm !== null && (
                    <p className="mt-1 text-xs text-forest-500">Nearest: {m.nearestDistanceKm} km away</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Link to={`/medicines/${m.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">View details</Button>
                    </Link>
                    <label className="flex items-center gap-1 rounded-lg border border-forest-200 px-2 text-xs">
                      <input type="checkbox" checked={compareIds.includes(m.id)} onChange={() => toggleCompare(m.id)} />
                      Compare
                    </label>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
