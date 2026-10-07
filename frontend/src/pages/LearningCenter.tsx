import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { ErrorState, Spinner } from "../components/ui/Feedback";
import { Subject } from "../types";

export default function LearningCenter() {
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/learning/subjects").then(({ data }) => setSubjects(data)).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="mx-auto max-w-3xl p-6"><ErrorState message={error} /></div>;
  if (!subjects) return <Spinner label="Loading subjects..." />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-forest-900">BAMS Student Learning Center</h1>
      <p className="mt-1 text-sm text-forest-500">Subject-wise notes, flashcards and quizzes across all 14 BAMS subjects.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <Link key={s.id} to={`/learning/subjects/${s.id}`}>
            <Card className="h-full">
              <BookOpen className="h-6 w-6 text-forest-600" />
              <p className="mt-2 font-medium text-forest-900">{s.name}</p>
              <p className="mt-1 text-sm text-forest-500">{s.description}</p>
              <p className="mt-2 text-xs text-forest-400">{s.chapterCount} chapter{s.chapterCount === 1 ? "" : "s"}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
