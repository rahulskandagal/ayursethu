import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input, Label, Select } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/Feedback";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";

const dashboardPathByRole: Record<string, string> = {
  PATIENT: "/patient",
  STUDENT: "/student",
  DOCTOR: "/doctor",
  PHARMACY: "/pharmacy",
  ADMIN: "/admin",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Exclude<Role, "ADMIN">>("PATIENT");
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    pharmacyName: "", licenseNumber: "", address: "", city: "", pinCode: "", latitude: "", longitude: "",
    registrationNumber: "", specialization: "", clinicName: "",
    college: "", yearOfStudy: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role,
      };
      if (role === "PHARMACY") {
        payload.pharmacy = {
          name: form.pharmacyName,
          licenseNumber: form.licenseNumber,
          address: form.address,
          city: form.city,
          pinCode: form.pinCode,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        };
      }
      if (role === "DOCTOR") {
        payload.doctor = {
          registrationNumber: form.registrationNumber || undefined,
          specialization: form.specialization || undefined,
          clinicName: form.clinicName || undefined,
        };
      }
      if (role === "STUDENT") {
        payload.student = {
          college: form.college || undefined,
          yearOfStudy: form.yearOfStudy ? Number(form.yearOfStudy) : undefined,
        };
      }
      const user = await register(payload);
      navigate(dashboardPathByRole[user.role] ?? "/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card>
        <h1 className="text-2xl font-semibold text-forest-900">Create your account</h1>
        <p className="mt-1 text-sm text-forest-500">Choose the role that best describes you.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <ErrorState message={error} />}

          <div>
            <Label>I am a...</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
              <option value="PATIENT">Patient</option>
              <option value="STUDENT">BAMS Student</option>
              <option value="DOCTOR">Ayurvedic Doctor</option>
              <option value="PHARMACY">Pharmacy / Medicine Seller</option>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} />
          </div>

          {role === "STUDENT" && (
            <div className="grid gap-4 rounded-lg bg-forest-50 p-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="college">College</Label>
                <Input id="college" value={form.college} onChange={(e) => set("college", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="year">Year of study</Label>
                <Input id="year" type="number" min={1} max={5} value={form.yearOfStudy} onChange={(e) => set("yearOfStudy", e.target.value)} />
              </div>
            </div>
          )}

          {role === "DOCTOR" && (
            <div className="grid gap-4 rounded-lg bg-forest-50 p-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="reg">Registration number</Label>
                <Input id="reg" value={form.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="spec">Specialization</Label>
                <Input id="spec" value={form.specialization} onChange={(e) => set("specialization", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="clinic">Clinic name</Label>
                <Input id="clinic" value={form.clinicName} onChange={(e) => set("clinicName", e.target.value)} />
              </div>
            </div>
          )}

          {role === "PHARMACY" && (
            <div className="grid gap-4 rounded-lg bg-forest-50 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="pname">Pharmacy name</Label>
                <Input id="pname" required value={form.pharmacyName} onChange={(e) => set("pharmacyName", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="lic">License number</Label>
                <Input id="lic" required value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pin">PIN code</Label>
                <Input id="pin" required value={form.pinCode} onChange={(e) => set("pinCode", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="addr">Address</Label>
                <Input id="addr" required value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div />
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input id="lat" type="number" step="any" required value={form.latitude} onChange={(e) => set("latitude", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input id="lng" type="number" step="any" required value={form.longitude} onChange={(e) => set("longitude", e.target.value)} />
              </div>
              <p className="text-xs text-forest-500 sm:col-span-2">
                Tip: open your pharmacy in Google Maps, right-click the location, and copy the latitude/longitude
                shown. Your pharmacy will be reviewed by our admin team before it appears as verified.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-forest-500">
          Already have an account? <Link to="/login" className="font-medium text-forest-700 underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
