import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input, Label } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/Feedback";
import { useAuth } from "../context/AuthContext";

const dashboardPathByRole: Record<string, string> = {
  PATIENT: "/patient",
  STUDENT: "/student",
  DOCTOR: "/doctor",
  PHARMACY: "/pharmacy",
  ADMIN: "/admin",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(dashboardPathByRole[user.role] ?? "/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <Card>
        <h1 className="text-2xl font-semibold text-forest-900">Welcome back</h1>
        <p className="mt-1 text-sm text-forest-500">Log in to your AyurSethu account.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <ErrorState message={error} />}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-forest-500">
          Don't have an account? <Link to="/register" className="font-medium text-forest-700 underline">Register</Link>
        </p>
        <p className="mt-4 rounded-lg bg-forest-50 p-3 text-xs text-forest-500">
          Demo logins: patient@ayursethu.demo / student@ayursethu.demo / doctor@ayursethu.demo /
          pharmacy@ayursethu.demo / admin@ayursethu.demo — all use their respective demo password from the seed
          script output.
        </p>
      </Card>
    </div>
  );
}
