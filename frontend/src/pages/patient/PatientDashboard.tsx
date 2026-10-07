import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, FileLock2, Flag, Heart, MapPin, Package, ScanLine, Search } from "lucide-react";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState, Spinner } from "../../components/ui/Feedback";
import { useAuth } from "../../context/AuthContext";
import { MedicineSummary, Notification } from "../../types";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<MedicineSummary[] | null>(null);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  useEffect(() => {
    api.get("/medicines/favorites").then(({ data }) => setFavorites(data)).catch(() => setFavorites([]));
    api.get("/users/me/notifications").then(({ data }) => setNotifications(data)).catch(() => setNotifications([]));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-forest-900">Welcome, {user?.name}</h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Link to="/medicines"><Card className="flex items-center gap-3 hover:border-forest-300"><Search className="h-6 w-6 text-forest-600" /><span>Search medicines</span></Card></Link>
        <Link to="/pharmacies"><Card className="flex items-center gap-3 hover:border-forest-300"><MapPin className="h-6 w-6 text-forest-600" /><span>Find pharmacies</span></Card></Link>
        <Link to="/scan"><Card className="flex items-center gap-3 hover:border-forest-300"><ScanLine className="h-6 w-6 text-forest-600" /><span>Scan barcode</span></Card></Link>
        <Link to="/patient/reservations"><Card className="flex items-center gap-3 hover:border-forest-300"><Package className="h-6 w-6 text-forest-600" /><span>My reservations</span></Card></Link>
        <Link to="/patient/prescriptions"><Card className="flex items-center gap-3 hover:border-forest-300"><FileLock2 className="h-6 w-6 text-forest-600" /><span>Prescription vault</span></Card></Link>
        <Link to="/patient/reports"><Card className="flex items-center gap-3 hover:border-forest-300"><Flag className="h-6 w-6 text-forest-600" /><span>My reports</span></Card></Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-forest-900"><Heart className="h-5 w-5" /> Favorite medicines</h2>
          {!favorites ? (
            <Spinner />
          ) : favorites.length === 0 ? (
            <EmptyState title="No favorites yet" description="Save medicines you care about from their detail page." />
          ) : (
            <div className="mt-3 space-y-2">
              {favorites.map((m) => (
                <Link key={m.id} to={`/medicines/${m.id}`}>
                  <Card className="flex items-center justify-between hover:border-forest-300">
                    <span className="font-medium text-forest-800">{m.name}</span>
                    {m.isVerifiedProduct && <Badge tone="green">Verified</Badge>}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="flex items-center gap-2 font-semibold text-forest-900"><Bell className="h-5 w-5" /> Notifications</h2>
          {!notifications ? (
            <Spinner />
          ) : notifications.length === 0 ? (
            <EmptyState title="No notifications yet" />
          ) : (
            <div className="mt-3 space-y-2">
              {notifications.map((n) => (
                <Card key={n.id} className={n.isRead ? "" : "border-forest-300"}>
                  <p className="text-sm text-forest-700">{n.message}</p>
                  <p className="mt-1 text-xs text-forest-400">{new Date(n.createdAt).toLocaleString()}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
