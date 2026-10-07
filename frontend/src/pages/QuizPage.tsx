import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorState, Spinner } from "../components/ui/Feedback";

interface Quiz {
  id: string;
  title: string;
  questions: Array<{ id: string; text: string; options: string[] }>;
}

interface SubmitResult {
  score: number;
  total: number;
  breakdown: Array<{ questionId: string; correct: boolean; correctOption: number; explanation: string | null }>;
}

export default function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/learning/quizzes/${id}`).then(({ data }) => setQuiz(data)).catch((err) => setError(err.message));
  }, [id]);

  async function submit() {
    if (!quiz) return;
    try {
      const answerArray = quiz.questions.map((q) => answers[q.id] ?? -1);
      const { data } = await api.post(`/learning/quizzes/${id}/submit`, { answers: answerArray });
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (error) return <div className="mx-auto max-w-3xl p-6"><ErrorState message={error} /></div>;
  if (!quiz) return <Spinner label="Loading quiz..." />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-forest-900">{quiz.title}</h1>

      {result && (
        <Card className="mt-4 border-forest-300 bg-forest-50">
          <p className="text-lg font-semibold text-forest-900">Score: {result.score} / {result.total}</p>
        </Card>
      )}

      <div className="mt-6 space-y-5">
        {quiz.questions.map((q, i) => {
          const breakdown = result?.breakdown[i];
          return (
            <Card key={q.id}>
              <p className="font-medium text-forest-900">{i + 1}. {q.text}</p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[q.id] === oi;
                  const isCorrect = breakdown && oi === breakdown.correctOption;
                  const isWrongSelected = breakdown && selected && !breakdown.correct;
                  return (
                    <label
                      key={oi}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-sm ${
                        isCorrect ? "border-forest-500 bg-forest-50" : isWrongSelected ? "border-red-300 bg-red-50" : "border-forest-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        disabled={!!result}
                        checked={selected}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
              {breakdown?.explanation && <p className="mt-2 text-sm text-forest-500">{breakdown.explanation}</p>}
            </Card>
          );
        })}
      </div>

      {!result && (
        <Button className="mt-6" onClick={submit} disabled={Object.keys(answers).length < quiz.questions.length}>
          Submit quiz
        </Button>
      )}
    </div>
  );
}
