import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, Layers, ListChecks } from "lucide-react";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorState, Spinner } from "../components/ui/Feedback";
import { useAuth } from "../context/AuthContext";

interface ChapterFull {
  id: string;
  title: string;
  subject: { id: string; name: string };
  studyMaterials: Array<{ id: string; title: string; content: string; fileUrl: string | null }>;
  quizzes: Array<{ id: string; title: string; questionCount: number }>;
  flashcards: Array<{ id: string }>;
}

export default function ChapterPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [chapter, setChapter] = useState<ChapterFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    api.get(`/learning/chapters/${id}`).then(({ data }) => setChapter(data)).catch((err) => setError(err.message));
  }, [id]);

  async function markComplete() {
    try {
      await api.post(`/learning/chapters/${id}/progress`);
      setCompleted(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (error) return <div className="mx-auto max-w-3xl p-6"><ErrorState message={error} /></div>;
  if (!chapter) return <Spinner label="Loading chapter..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to={`/learning/subjects/${chapter.subject.id}`} className="text-sm text-forest-500 hover:underline">
        ← {chapter.subject.name}
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-forest-900">{chapter.title}</h1>
        {user && (
          <Button variant={completed ? "outline" : "primary"} onClick={markComplete} disabled={completed}>
            <CheckCircle className="h-4 w-4" /> {completed ? "Marked complete" : "Mark as complete"}
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {chapter.studyMaterials.map((m) => (
          <Card key={m.id}>
            <p className="font-medium text-forest-900">{m.title}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-forest-700">{m.content}</p>
            {m.fileUrl && (
              <a href={m.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-forest-600 underline">
                Download resource
              </a>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {chapter.flashcards.length > 0 && (
          <Link to={`/learning/chapters/${chapter.id}/flashcards`}>
            <Card className="flex items-center gap-3 hover:border-forest-300">
              <Layers className="h-6 w-6 text-forest-600" />
              <div>
                <p className="font-medium text-forest-900">Flashcards</p>
                <p className="text-sm text-forest-500">{chapter.flashcards.length} cards</p>
              </div>
            </Card>
          </Link>
        )}
        {chapter.quizzes.map((q) => (
          <Link key={q.id} to={`/learning/quizzes/${q.id}`}>
            <Card className="flex items-center gap-3 hover:border-forest-300">
              <ListChecks className="h-6 w-6 text-forest-600" />
              <div>
                <p className="font-medium text-forest-900">{q.title}</p>
                <p className="text-sm text-forest-500">{q.questionCount} questions</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
