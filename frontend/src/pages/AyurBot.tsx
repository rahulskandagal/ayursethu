import { FormEvent, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { api } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

interface Message {
  role: "user" | "bot";
  text: string;
  usedLiveModel?: boolean;
}

export default function AyurBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Namaste! I'm AyurBot. Ask me about Ayurvedic medicines, medicinal plants, or BAMS subjects on AyurSethu. I provide educational information only — not medical advice or a prescription.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((m) => [...m, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/ayurbot/ask", { message: userMessage });
      setMessages((m) => [...m, { role: "bot", text: data.answer, usedLiveModel: data.usedLiveModel }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "bot", text: `Sorry, I ran into an error: ${(err as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-180px)] max-w-3xl flex-col px-4 py-6 sm:px-6">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-forest-600 p-2 text-white"><Bot className="h-5 w-5" /></div>
        <div>
          <h1 className="text-xl font-semibold text-forest-900">AyurBot</h1>
          <p className="text-xs text-forest-500">Educational assistant — not a substitute for professional medical advice.</p>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-xl2 border border-forest-100 bg-white p-4 shadow-card">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "bot" && <Bot className="mt-1 h-5 w-5 shrink-0 text-forest-500" />}
            <div className={`max-w-[80%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "bg-forest-600 text-white" : "bg-forest-50 text-forest-800"}`}>
              {m.text}
            </div>
            {m.role === "user" && <User className="mt-1 h-5 w-5 shrink-0 text-forest-500" />}
          </div>
        ))}
        {loading && <p className="text-sm text-forest-400">AyurBot is thinking...</p>}
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a medicine, plant, or BAMS topic..." />
        <Button type="submit" disabled={loading}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
