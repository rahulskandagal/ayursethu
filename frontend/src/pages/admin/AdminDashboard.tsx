import { useEffect, useState } from "react";
import { AlertTriangle, FileClock, ShieldCheck, Store, Users } from "lucide-react";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState, ErrorState, Spinner } from "../../components/ui/Feedback";

interface Stats {
  users: number;
  pharmaciesPending: number;
  medicines: number;
  plants: number;
  reportsOpen: number;
}

interface PendingPharmacy {
  id: string;
  name: string;
  city: string;
  licenseNumber: string;
  user: { name: string; email: string };
  documents: Array<{ id: string; docType: string; fileUrl: string }>;
}

interface ReportItem {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  medicine: { id: string; name: string } | null;
  pharmacy: { id: string; name: string } | null;
}

type Tab = "overview" | "pharmacies" | "reports" | "audit";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<PendingPharmacy[] | null>(null);
  const [reports, setReports] = useState<ReportItem[] | null>(null);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; targetType: string; targetId: string; createdAt: string; admin: { name: string } }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadAll() {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch((err) => setError(err.message));
    api.get("/admin/pharmacies/pending").then(({ data }) => setPending(data)).catch(() => setPending([]));
    api.get("/admin/reports").then(({ data }) => setReports(data)).catch(() => setReports([]));
    api.get("/admin/audit-logs").then(({ data }) => setAuditLogs(data)).catch(() => setAuditLogs([]));
  }

  useEffect(loadAll, []);

  async function verifyPharmacy(id: string, approve: boolean) {
    try {
      await api.post(`/admin/pharmacies/${id}/verify`, { approve });
      loadAll();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function updateReport(id: string, status: string) {
    try {
      await api.patch(`/admin/reports/${id}/status`, { status });
      loadAll();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "overview", label: "Overview" },
    { key: "pharmacies", label: "Pending pharmacies" },
    { key: "reports", label: "Reports" },
    { key: "audit", label: "Audit log" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-forest-900">Admin Dashboard</h1>
      {error && <ErrorState message={error} />}

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === t.key ? "bg-forest-600 text-white" : "border border-forest-200 bg-white text-forest-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6">
          {!stats ? (
            <Spinner />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Card className="flex items-center gap-3"><Users className="h-6 w-6 text-forest-600" /><div><p className="text-xl font-semibold">{stats.users}</p><p className="text-xs text-forest-500">Users</p></div></Card>
              <Card className="flex items-center gap-3"><Store className="h-6 w-6 text-forest-600" /><div><p className="text-xl font-semibold">{stats.pharmaciesPending}</p><p className="text-xs text-forest-500">Pharmacies pending</p></div></Card>
              <Card className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-forest-600" /><div><p className="text-xl font-semibold">{stats.medicines}</p><p className="text-xs text-forest-500">Medicines</p></div></Card>
              <Card className="flex items-center gap-3"><FileClock className="h-6 w-6 text-forest-600" /><div><p className="text-xl font-semibold">{stats.plants}</p><p className="text-xs text-forest-500">Plants</p></div></Card>
              <Card className="flex items-center gap-3"><AlertTriangle className="h-6 w-6 text-forest-600" /><div><p className="text-xl font-semibold">{stats.reportsOpen}</p><p className="text-xs text-forest-500">Open reports</p></div></Card>
            </div>
          )}
          <p className="mt-6 text-sm text-forest-500">
            Manage the medicine and plant catalog, BAMS learning content, and manufacturer verification via the
            admin API endpoints (<code>/api/admin/*</code>) — wire up dedicated catalog-editing screens here as the
            next iteration.
          </p>
        </div>
      )}

      {tab === "pharmacies" && (
        <div className="mt-6">
          {!pending ? (
            <Spinner />
          ) : pending.length === 0 ? (
            <EmptyState title="No pending pharmacy registrations" />
          ) : (
            <div className="space-y-3">
              {pending.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-forest-900">{p.name}</p>
                      <p className="text-sm text-forest-500">{p.city} · License {p.licenseNumber}</p>
                      <p className="text-sm text-forest-500">Owner: {p.user.name} ({p.user.email})</p>
                      {p.documents.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.documents.map((d) => (
                            <a key={d.id} href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-forest-600 underline">
                              {d.docType}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => verifyPharmacy(p.id, true)}>Approve</Button>
                      <Button variant="danger" onClick={() => verifyPharmacy(p.id, false)}>Reject</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "reports" && (
        <div className="mt-6">
          {!reports ? (
            <Spinner />
          ) : reports.length === 0 ? (
            <EmptyState title="No reports filed" />
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <Card key={r.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-forest-700">{r.reason}</p>
                      <p className="mt-1 text-xs text-forest-500">
                        By {r.user.name} ({r.user.email}) on {new Date(r.createdAt).toLocaleDateString()}
                        {r.medicine && ` — medicine: ${r.medicine.name}`}
                        {r.pharmacy && ` — pharmacy: ${r.pharmacy.name}`}
                      </p>
                    </div>
                    <select
                      value={r.status}
                      onChange={(e) => updateReport(r.id, e.target.value)}
                      className="rounded-lg border border-forest-200 px-2 py-1 text-xs"
                    >
                      {["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "audit" && (
        <div className="mt-6">
          {!auditLogs ? (
            <Spinner />
          ) : auditLogs.length === 0 ? (
            <EmptyState title="No admin actions logged yet" />
          ) : (
            <div className="space-y-2">
              {auditLogs.map((l) => (
                <Card key={l.id} className="flex items-center justify-between text-sm">
                  <span><Badge tone="gray">{l.action}</Badge> {l.targetType} #{l.targetId.slice(0, 8)}</span>
                  <span className="text-xs text-forest-500">{l.admin.name} · {new Date(l.createdAt).toLocaleString()}</span>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
