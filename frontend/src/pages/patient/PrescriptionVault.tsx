import { FormEvent, useEffect, useRef, useState } from "react";
import { FileLock2, Trash2, Upload } from "lucide-react";
import { api } from "../../api/client";
import { uploadFile } from "../../api/upload";
import { Card } from "../../components/ui/Card";
import { Input, Label } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { EmptyState, ErrorState, Spinner } from "../../components/ui/Feedback";
import { Prescription } from "../../types";

export default function PrescriptionVault() {
  const [prescriptions, setPrescriptions] = useState<Prescription[] | null>(null);
  const [title, setTitle] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    api.get("/prescriptions").then(({ data }) => setPrescriptions(data)).catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadFile(file);
      await api.post("/prescriptions", { title, fileUrl: uploaded.url, issuedBy: issuedBy || undefined });
      setTitle("");
      setIssuedBy("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    try {
      await api.delete(`/prescriptions/${id}`);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-forest-900">
        <FileLock2 className="h-6 w-6" /> Prescription Vault
      </h1>
      <p className="mt-1 text-sm text-forest-500">
        Private to your account only — nobody else on AyurSethu can see these files.
      </p>

      <Card className="mt-6">
        <h2 className="font-medium text-forest-900">Add a prescription</h2>
        <form onSubmit={submit} className="mt-3 space-y-3">
          {error && <ErrorState message={error} />}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dr. Sharma — Oct 2026 visit" />
          </div>
          <div>
            <Label htmlFor="issuedBy">Issued by (optional)</Label>
            <Input id="issuedBy" value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="file">File (image or PDF)</Label>
            <input
              id="file"
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-forest-700"
            />
          </div>
          <Button type="submit" disabled={uploading || !file}>
            <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Save to vault"}
          </Button>
        </form>
      </Card>

      <div className="mt-6">
        {!prescriptions ? (
          <Spinner />
        ) : prescriptions.length === 0 ? (
          <EmptyState title="No prescriptions saved yet" />
        ) : (
          <div className="space-y-2">
            {prescriptions.map((p) => (
              <Card key={p.id} className="flex items-center justify-between">
                <div>
                  <a href={p.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-forest-800 hover:underline">
                    {p.title}
                  </a>
                  <p className="text-xs text-forest-500">
                    {p.issuedBy ? `${p.issuedBy} · ` : ""}Added {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="danger" onClick={() => remove(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
