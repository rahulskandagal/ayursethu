import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import { api } from "../api/client";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, Spinner } from "../components/ui/Feedback";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export default function FlashcardsPage() {
  const { chapterId } = useParams();
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/learning/flashcards/chapter/${chapterId}`)
      .then(({ data }) => setCards(data))
      .catch((err) => setError(err.message));
  }, [chapterId]);

  async function mark(known: boolean) {
    if (!cards) return;
    try {
      await api.post(`/learning/flashcards/${cards[index].id}/progress`, { known });
    } catch {
      // non-blocking
    }
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, cards.length));
  }

  if (error) return <div className="mx-auto max-w-3xl p-6"><ErrorState message={error} /></div>;
  if (!cards) return <Spinner label="Loading flashcards..." />;
  if (cards.length === 0) return <div className="mx-auto max-w-3xl p-6"><EmptyState title="No flashcards for this chapter yet" /></div>;
  if (index >= cards.length) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-forest-900">You've gone through all {cards.length} cards.</h1>
        <Button className="mt-4" onClick={() => setIndex(0)}>Review again</Button>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <p className="text-sm text-forest-500">Card {index + 1} of {cards.length}</p>
      <button
        onClick={() => setFlipped((f) => !f)}
        className="mt-4 flex h-64 w-full items-center justify-center rounded-xl2 border border-forest-200 bg-white p-6 text-center shadow-card"
      >
        <p className="text-lg font-medium text-forest-900">{flipped ? card.back : card.front}</p>
      </button>
      <p className="mt-2 text-xs text-forest-400">Tap the card to flip</p>

      <div className="mt-6 flex gap-4">
        <Button variant="outline" onClick={() => mark(false)}><X className="h-4 w-4 text-red-500" /> Still learning</Button>
        <Button variant="outline" onClick={() => mark(true)}><Check className="h-4 w-4 text-forest-600" /> I know this</Button>
      </div>
    </div>
  );
}
