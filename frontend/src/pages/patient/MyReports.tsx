import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flag } from "lucide-react";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState, ErrorState, Spinner } from "../../components/ui/Feedback";

interface ReportItem {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  medicine: { id: string; name: string } | null;
  pharmacy: { id: string; name: string } | null;
}

const STATUS_TONE: Record<string, "gold" | "green" | "gray" | "red"> = {
  OPEN: "gold",
  REVIEWING: "gold",
  RESOLVED: "green",
  DISMISSED: "gray",
};

export default function MyReports() {
  const [reports, setReports] = useState<ReportItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/users/me/reports").then(({ data }) => setReports(data)).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="mx-auto max-w-3xl p-6"><ErrorState message={error} /></div>;
  if (!reports) return <Spinner label="Loading your reports..." />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-forest-900">
        <Flag className="h-6 w-6" /> My Reports
      </h1>
      <p className="mt-1 text-sm text-forest-500">Complaints and reports you've filed about listings.</p>

      {reports.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No reports filed" description="Use the 'Report this listing' button on a medicine page to flag suspicious products." />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-forest-700">{r.reason}</p>
                  <p className="mt-1 text-xs text-forest-500">
                    {r.medicine && (
                      <>
                        Re:{" "}
                        <Link to={`/medicines/${r.medicine.id}`} className="underline">
                          {r.medicine.name}
                        </Link>{" "}
                      </>
                    )}
                    {r.pharmacy && <>Re: {r.pharmacy.name} </>}
                    · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[r.status] ?? "gray"}>{r.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
