import { FormEvent, useState } from "react";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Input, Label } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/Feedback";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.patch("/users/me", { name, phone: phone || undefined });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Card>
        <h1 className="text-xl font-semibold text-forest-900">Your profile</h1>
        <p className="mt-1 text-sm text-forest-500">{user.email} · {user.role}</p>

        <form onSubmit={save} className="mt-6 space-y-4">
          {error && <ErrorState message={error} />}
          {saved && <p className="text-sm text-forest-600">Profile updated.</p>}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => { setPhone(e.target.value); setSaved(false); }} />
          </div>
          <Button type="submit">Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
