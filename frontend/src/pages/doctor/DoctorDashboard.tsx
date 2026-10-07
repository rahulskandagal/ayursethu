import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookMarked, MapPin, Search, Stethoscope } from "lucide-react";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { EmptyState, Spinner } from "../../components/ui/Feedback";
import { useAuth } from "../../context/AuthContext";

interface BookmarkItem {
  id: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[] | null>(null);

  useEffect(() => {
    api.get("/learning/bookmarks").then(({ data }) => setBookmarks(data)).catch(() => setBookmarks([]));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-forest-900">Welcome, Dr. {user?.name}</h1>
      <p className="mt-1 text-sm text-forest-500">
        Explore the structured formulation database and reference library. AyurBot's suggestions here are
        educational, not clinical recommendations or prescriptions.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link to="/medicines"><Card className="flex items-center gap-3 hover:border-forest-300"><Search className="h-6 w-6 text-forest-600" /><span>Search formulations</span></Card></Link>
        <Link to="/pharmacies"><Card className="flex items-center gap-3 hover:border-forest-300"><MapPin className="h-6 w-6 text-forest-600" /><span>Locate pharmacies & suppliers</span></Card></Link>
        <Link to="/ayurbot"><Card className="flex items-center gap-3 hover:border-forest-300"><Stethoscope className="h-6 w-6 text-forest-600" /><span>Ask AyurBot</span></Card></Link>
      </div>

      <div className="mt-8">
        <h2 className="flex items-center gap-2 font-semibold text-forest-900"><BookMarked className="h-5 w-5" /> Your reference library</h2>
        {!bookmarks ? (
          <Spinner />
        ) : bookmarks.length === 0 ? (
          <EmptyState title="No bookmarks yet" description="Bookmark medicines, plants or chapters to build your personal reference library." />
        ) : (
          <div className="mt-3 space-y-2">
            {bookmarks.map((b) => (
              <Card key={b.id} className="flex items-center justify-between">
                <span className="text-sm text-forest-700">{b.targetType}</span>
                <Link
                  to={b.targetType === "MEDICINE" ? `/medicines/${b.targetId}` : b.targetType === "PLANT" ? `/plants/${b.targetId}` : `/learning/chapters/${b.targetId}`}
                  className="text-sm text-forest-600 underline"
                >
                  View
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
