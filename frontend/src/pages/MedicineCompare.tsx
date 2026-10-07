import { ReactNode, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { ErrorState, Spinner } from "../components/ui/Feedback";
import { Badge } from "../components/ui/Badge";

interface CompareRow {
  id: string;
  name: string;
  brandName: string | null;
  manufacturer: string | null;
  manufacturerLicense: string | null;
  dosageForm: string;
  ingredients: string[];
  packageSizes: string[];
  isVerifiedProduct: boolean;
  lowestPrice: number | null;
  offerCount: number;
  pharmacies: string[];
}

export default function MedicineCompare() {
  const [params] = useSearchParams();
  const [rows, setRows] = useState<CompareRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ids = params.get("ids") ?? "";

  useEffect(() => {
    api
      .get("/medicines/compare", { params: { ids } })
      .then(({ data }) => setRows(data))
      .catch((err) => setError(err.message));
  }, [ids]);

  if (error) return <div className="mx-auto max-w-5xl p-6"><ErrorState message={error} /></div>;
  if (!rows) return <Spinner label="Loading comparison..." />;

  const fields: Array<[string, (r: CompareRow) => ReactNode]> = [
    ["Brand", (r) => r.brandName ?? "—"],
    ["Manufacturer", (r) => r.manufacturer ?? "Not listed"],
    ["Manufacturer license", (r) => r.manufacturerLicense ?? "Not available"],
    ["Dosage form", (r) => r.dosageForm.replaceAll("_", " ")],
    ["Ingredients", (r) => r.ingredients.join(", ") || "—"],
    ["Package sizes", (r) => r.packageSizes.join(", ") || "—"],
    ["Verified product", (r) => (r.isVerifiedProduct ? <Badge tone="green">Yes</Badge> : <Badge tone="gray">Pending</Badge>)],
    ["Lowest price", (r) => (r.lowestPrice !== null ? `₹${r.lowestPrice}` : "Unavailable")],
    ["Pharmacies stocking it", (r) => `${r.offerCount}`],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-forest-900">Compare medicines</h1>
      <p className="mt-1 text-sm text-forest-500">
        Similar names or ingredients do not mean two products are clinically equivalent — compare details carefully.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl2 border border-forest-100 bg-white shadow-card">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-forest-50 text-left">
              <th className="p-3 font-medium text-forest-700">Attribute</th>
              {rows.map((r) => (
                <th key={r.id} className="p-3 font-medium text-forest-900">{r.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(([label, getValue]) => (
              <tr key={label} className="border-t border-forest-100">
                <td className="p-3 font-medium text-forest-600">{label}</td>
                {rows.map((r) => (
                  <td key={r.id} className="p-3 text-forest-800">{getValue(r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
