import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Leaf, MapPin, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

const categories = ["Churna", "Vati & Gutika", "Kashaya", "Asava & Arishta", "Herbal Oils", "Rasayana"];

export default function Landing() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    navigate(query ? `/medicines?q=${encodeURIComponent(query)}` : "/medicines");
  }

  return (
    <div>
      <section className="bg-gradient-to-b from-forest-50 to-cream-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/20 px-3 py-1 text-xs font-semibold text-gold-600">
              <Sparkles className="h-3.5 w-3.5" /> Genuine Ayurveda, verified
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-forest-900 sm:text-5xl">
              Find genuine Ayurvedic medicines. Learn Ayurveda the right way.
            </h1>
            <p className="mt-4 text-lg text-forest-600">
              AyurSethu connects patients, BAMS students, doctors and verified pharmacies — so you can find real
              medicines nearby and study classical Ayurveda with confidence.
            </p>

            <form onSubmit={onSearch} className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search medicines, e.g. Ashwagandha tablets"
                className="sm:w-96"
              />
              <Button type="submit" className="sm:w-auto">Search medicines</Button>
            </form>
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm">
              <Button variant="outline" onClick={() => navigate("/pharmacies")}>
                <MapPin className="h-4 w-4" /> Find nearby pharmacies
              </Button>
              <Button variant="outline" onClick={() => navigate("/plants")}>
                <Leaf className="h-4 w-4" /> Explore medicinal plants
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-xl font-semibold text-forest-900">Popular medicine categories</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => navigate(`/medicines?q=${encodeURIComponent(c)}`)}
              className="rounded-xl border border-forest-100 bg-white p-4 text-center text-sm font-medium text-forest-700 shadow-card transition hover:border-forest-300 hover:text-forest-900"
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-forest-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-forest-900">BAMS Student Learning</h2>
            <Button variant="ghost" onClick={() => navigate("/learning")}>Explore the learning center →</Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Card>
              <BookOpen className="h-6 w-6 text-forest-600" />
              <p className="mt-2 font-medium">Subject-wise notes</p>
              <p className="mt-1 text-sm text-forest-500">14 BAMS subjects with chapter-wise study material.</p>
            </Card>
            <Card>
              <Sparkles className="h-6 w-6 text-forest-600" />
              <p className="mt-2 font-medium">Flashcards & MCQs</p>
              <p className="mt-1 text-sm text-forest-500">Practice quizzes and flashcards with instant scoring.</p>
            </Card>
            <Card>
              <Stethoscope className="h-6 w-6 text-forest-600" />
              <p className="mt-2 font-medium">Dravyaguna & Bhaishajya Kalpana</p>
              <p className="mt-1 text-sm text-forest-500">Rasa, Guna, Virya, Vipaka, Karma — organized by formulation.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-xl font-semibold text-forest-900">Why choose AyurSethu</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card>
            <ShieldCheck className="h-6 w-6 text-forest-600" />
            <p className="mt-2 font-medium">Transparent verification</p>
            <p className="mt-1 text-sm text-forest-500">
              We clearly label verified sellers, checked manufacturer info and documentation — never a blanket
              "100% genuine" claim.
            </p>
          </Card>
          <Card>
            <MapPin className="h-6 w-6 text-forest-600" />
            <p className="mt-2 font-medium">Real-time pharmacy availability</p>
            <p className="mt-1 text-sm text-forest-500">
              Stock and prices come from pharmacies themselves, with a last-updated timestamp.
            </p>
          </Card>
          <Card>
            <Leaf className="h-6 w-6 text-forest-600" />
            <p className="mt-2 font-medium">Built for the whole ecosystem</p>
            <p className="mt-1 text-sm text-forest-500">
              Separate, purpose-built dashboards for patients, students, doctors, pharmacies and admins.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
