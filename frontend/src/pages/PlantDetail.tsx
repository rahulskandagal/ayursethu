import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { ErrorState, Spinner } from "../components/ui/Feedback";

interface PlantFull {
  id: string;
  name: string;
  botanicalName: string | null;
  sanskritName: string | null;
  englishName: string | null;
  kannadaName: string | null;
  hindiName: string | null;
  partsUsed: string | null;
  description: string;
  ayurvedicProperties: string | null;
  traditionalUses: string | null;
  habitat: string | null;
  images: Array<{ id: string; url: string; caption: string | null }>;
  classicalRefs: Array<{ id: string; sourceText: string; reference: string }>;
  relatedMedicines: Array<{ id: string; name: string }>;
}

export default function PlantDetail() {
  const { id } = useParams();
  const [plant, setPlant] = useState<PlantFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/plants/${id}`)
      .then(({ data }) => setPlant(data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="mx-auto max-w-3xl p-6"><ErrorState message={error} /></div>;
  if (!plant) return <Spinner label="Loading plant..." />;

  const names = [
    ["Botanical", plant.botanicalName],
    ["Sanskrit", plant.sanskritName],
    ["English", plant.englishName],
    ["Kannada", plant.kannadaName],
    ["Hindi", plant.hindiName],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {plant.images[0] ? (
          <img src={plant.images[0].url} alt={plant.name} className="w-full rounded-xl2 object-cover" />
        ) : (
          <div className="flex h-56 items-center justify-center rounded-xl2 bg-forest-50 text-forest-400">No image</div>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-forest-900">{plant.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-forest-500">
            {names.map(([label, value]) => (
              <span key={label} className="rounded-full bg-forest-50 px-2 py-0.5">{label}: {value}</span>
            ))}
          </div>
          <p className="mt-4 text-forest-700">{plant.description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {plant.partsUsed && (
          <Card>
            <p className="font-medium text-forest-900">Parts used</p>
            <p className="mt-1 text-sm text-forest-600">{plant.partsUsed}</p>
          </Card>
        )}
        {plant.habitat && (
          <Card>
            <p className="font-medium text-forest-900">Habitat & distribution</p>
            <p className="mt-1 text-sm text-forest-600">{plant.habitat}</p>
          </Card>
        )}
        {plant.ayurvedicProperties && (
          <Card>
            <p className="font-medium text-forest-900">Ayurvedic properties</p>
            <p className="mt-1 text-sm text-forest-600">{plant.ayurvedicProperties}</p>
          </Card>
        )}
        {plant.traditionalUses && (
          <Card>
            <p className="font-medium text-forest-900">Traditional applications</p>
            <p className="mt-1 text-sm text-forest-600">{plant.traditionalUses}</p>
          </Card>
        )}
      </div>

      {plant.classicalRefs.length > 0 && (
        <Card className="mt-6">
          <p className="font-medium text-forest-900">Classical references</p>
          <ul className="mt-2 space-y-1 text-sm text-forest-600">
            {plant.classicalRefs.map((r) => (
              <li key={r.id}>{r.sourceText} — <span className="italic">{r.reference}</span></li>
            ))}
          </ul>
        </Card>
      )}

      {plant.relatedMedicines.length > 0 && (
        <Card className="mt-6">
          <p className="font-medium text-forest-900">Related formulations</p>
          <ul className="mt-2 space-y-1 text-sm">
            {plant.relatedMedicines.map((m) => (
              <li key={m.id}>
                <Link to={`/medicines/${m.id}`} className="text-forest-700 hover:underline">{m.name}</Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
