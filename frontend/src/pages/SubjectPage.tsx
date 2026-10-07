import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { EmptyState, ErrorState, Spinner } from "../components/ui/Feedback";

interface SubjectFull {
  id: string;
  name: string;
  description: string | null;
  chapters: Array<{ id: string; title: string }>;
}

export default function SubjectPage() {
  const { id } = useParams();
  const [subject, setSubject] = useState<SubjectFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/learning/subjects/${id}`).then(({ data }) => setSubject(data)).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="mx-auto max-w-3xl p-6"><ErrorState message={error} /></div>;
  if (!subject) return <Spinner label="Loading subject..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/learning" className="text-sm text-forest-500 hover:underline">← All subjects</Link>
      <h1 className="mt-2 text-2xl font-semibold text-forest-900">{subject.name}</h1>
      <p className="mt-1 text-forest-600">{subject.description}</p>

      {subject.chapters.length === 0 ? (
        <EmptyState title="No chapters yet" description="Chapters for this subject will appear here once published." />
      ) : (
        <div className="mt-6 space-y-3">
          {subject.chapters.map((c) => (
            <Link key={c.id} to={`/learning/chapters/${c.id}`}>
              <Card className="flex items-center justify-between hover:border-forest-300">
                <span className="font-medium text-forest-800">{c.title}</span>
                <span className="text-forest-400">→</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
