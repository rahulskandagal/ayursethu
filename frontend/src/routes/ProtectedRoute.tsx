import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";

export function ProtectedRoute({ roles, children }: { roles?: Role[]; children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center text-forest-600">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
