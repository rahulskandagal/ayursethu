import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, GraduationCap, Leaf, Search } from "lucide-react";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { EmptyState, Spinner } from "../../components/ui/Feedback";
import { useAuth } from "../../context/AuthContext";

interface ProgressItem {
  id: string;
  completed: boolean;
  chapter: { id: string; title: string; subject: { id: string; name: string } };
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressItem[] | null>(null);

  useEffect(() => {
    api.get("/learning/progress").then(({ data }) => setProgress(data)).catch(() => setProgress([]));
  }, []);

  const completedCount = progress?.filter((p) => p.completed).length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-forest-900">Welcome, {user?.name}</h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Link to="/learning"><Card className="flex items-center gap-3 hover:border-forest-300"><GraduationCap className="h-6 w-6 text-forest-600" /><span>Learning center</span></Card></Link>
        <Link to="/medicines"><Card className="flex items-center gap-3 hover:border-forest-300"><Search className="h-6 w-6 text-forest-600" /><span>Medicine database</span></Card></Link>
        <Link to="/plants"><Card className="flex items-center gap-3 hover:border-forest-300"><Leaf className="h-6 w-6 text-forest-600" /><span>Plant library</span></Card></Link>
        <Link to="/profile"><Card className="flex items-center gap-3 hover:border-forest-300"><Bookmark className="h-6 w-6 text-forest-600" /><span>My profile</span></Card></Link>
      </div>

      <Card className="mt-6">
        <p className="font-semibold text-forest-900">Your study progress</p>
        <p className="mt-1 text-sm text-forest-500">{completedCount} chapter{completedCount === 1 ? "" : "s"} completed</p>
      </Card>

      <div className="mt-6">
        <h2 className="font-semibold text-forest-900">Recently completed chapters</h2>
        {!progress ? (
          <Spinner />
        ) : progress.filter((p) => p.completed).length === 0 ? (
          <EmptyState title="No chapters completed yet" description="Head to the Learning Center to get started." />
        ) : (
          <div className="mt-3 space-y-2">
            {progress.filter((p) => p.completed).map((p) => (
              <Link key={p.id} to={`/learning/chapters/${p.chapter.id}`}>
                <Card className="hover:border-forest-300">
                  <p className="font-medium text-forest-800">{p.chapter.title}</p>
                  <p className="text-xs text-forest-500">{p.chapter.subject.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
