import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, Spinner } from "../components/ui/Feedback";
import { PlantSummary } from "../types";

export default function PlantsLibrary() {
  const [q, setQ] = useState("");
  const [plants, setPlants] = useState<PlantSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idDescription, setIdDescription] = useState("");
  const [idResult, setIdResult] = useState<{ disclaimer: string; candidates: PlantSummary[] } | null>(null);
  const [idLoading, setIdLoading] = useState(false);

  function load(query?: string) {
    setLoading(true);
    api
      .get("/plants", { params: { q: query || undefined } })
      .then(({ data }) => setPlants(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    load(q);
  }

  async function identify(e: FormEvent) {
    e.preventDefault();
    setIdLoading(true);
    try {
      const { data } = await api.post("/plants/identify", { description: idDescription });
      setIdResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIdLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-forest-900">Medicinal Plants Library</h1>

      <form onSubmit={onSearch} className="mt-4 flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, botanical or regional name" />
        <Button type="submit">Search</Button>
      </form>

      <Card className="mt-6">
        <p className="flex items-center gap-1 font-medium text-forest-900"><Sparkles className="h-4 w-4" /> Preliminary plant identification</p>
        <p className="mt-1 text-xs text-forest-500">
          Describe visible features (leaf shape, flower color, habitat...). This is a preliminary, AI-assisted
          suggestion only — always get an expert to confirm before any medicinal use.
        </p>
        <form onSubmit={identify} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Textarea rows={2} className="sm:flex-1" value={idDescription} onChange={(e) => setIdDescription(e.target.value)} placeholder="e.g. small shrub, grey-green leaves, red berries..." />
          <Button type="submit" variant="outline" disabled={idLoading || !idDescription}>
            {idLoading ? "Checking..." : "Identify"}
          </Button>
        </form>
        {idResult && (
          <div className="mt-3 rounded-lg bg-gold-400/10 p-3 text-sm">
            <p className="text-gold-600">{idResult.disclaimer}</p>
            {idResult.candidates.length === 0 ? (
              <p className="mt-2 text-forest-600">No close matches found in our database.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {idResult.candidates.map((c) => (
                  <li key={c.id}>
                    <Link to={`/plants/${c.id}`} className="font-medium text-forest-800 hover:underline">{c.name}</Link>
                    {c.botanicalName && <span className="text-forest-500"> — {c.botanicalName}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>

      {loading && <Spinner label="Loading plants..." />}
      {error && <ErrorState message={error} />}
      {!loading && plants && plants.length === 0 && <EmptyState title="No plants found" />}
      {!loading && plants && plants.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plants.map((p) => (
            <Link key={p.id} to={`/plants/${p.id}`}>
              <Card className="h-full">
                {p.image && <img src={p.image} alt={p.name} className="h-32 w-full rounded-lg object-cover" />}
                <p className="mt-2 font-medium text-forest-900">{p.name}</p>
                {p.botanicalName && <p className="text-xs italic text-forest-500">{p.botanicalName}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
