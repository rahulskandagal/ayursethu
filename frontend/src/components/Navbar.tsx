import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Menu, Type, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { Button } from "./ui/Button";

const dashboardPathByRole: Record<string, string> = {
  PATIENT: "/patient",
  STUDENT: "/student",
  DOCTOR: "/doctor",
  PHARMACY: "/pharmacy",
  ADMIN: "/admin",
};

export function Navbar() {
  const { user, logout } = useAuth();
  const { largeText, toggleLargeText } = useAccessibility();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/medicines", label: "Medicines" },
    { to: "/pharmacies", label: "Pharmacy Locator" },
    { to: "/plants", label: "Medicinal Plants" },
    { to: "/learning", label: "BAMS Learning" },
    { to: "/ayurbot", label: "AyurBot" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-forest-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-forest-800">
          <div className="rounded-lg bg-forest-600 p-1.5 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">AyurSethu</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-forest-700 hover:text-forest-900">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleLargeText}
            aria-pressed={largeText}
            title="Toggle large-text, high-contrast mode"
            className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium ${largeText ? "border-forest-600 bg-forest-600 text-white" : "border-forest-200 text-forest-600"}`}
          >
            <Type className="h-3.5 w-3.5" /> A+
          </button>
          {user ? (
            <>
              <Link to={dashboardPathByRole[user.role] ?? "/"} className="text-sm font-medium text-forest-700 hover:text-forest-900">
                Dashboard
              </Link>
              <Link to="/profile" className="text-sm font-medium text-forest-700 hover:text-forest-900">
                {user.name}
              </Link>
              <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-forest-700 hover:text-forest-900">
                Log in
              </Link>
              <Button onClick={() => navigate("/register")}>Get started</Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6 text-forest-700" /> : <Menu className="h-6 w-6 text-forest-700" />}
        </button>
      </div>

      {open && (
        <div className="space-y-2 border-t border-forest-100 bg-white px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block py-1 text-sm text-forest-700" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <button
            onClick={toggleLargeText}
            aria-pressed={largeText}
            className="flex items-center gap-1 py-1 text-sm text-forest-700"
          >
            <Type className="h-4 w-4" /> {largeText ? "Disable" : "Enable"} large-text mode
          </button>
          <div className="border-t border-forest-100 pt-2">
            {user ? (
              <>
                <Link to={dashboardPathByRole[user.role] ?? "/"} className="block py-1 text-sm text-forest-700" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <button
                  className="block py-1 text-sm text-red-600"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-1 text-sm text-forest-700" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="block py-1 text-sm text-forest-700" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
