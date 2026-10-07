import { prisma } from "../../config/prisma";
import { env } from "../../config/env";

const SYSTEM_PROMPT = `You are AyurBot, the educational assistant embedded in AyurSethu, an Ayurvedic
medicine discovery and BAMS learning platform.

Rules you must always follow:
- You provide educational information only. You are NOT a doctor and this is NOT a
  medical consultation.
- Never prescribe a medicine, a dosage, or a treatment plan to a patient.
- Never tell anyone to stop, delay, or replace modern medical treatment.
- Always encourage the user to consult a qualified Ayurvedic practitioner or doctor
  for diagnosis, treatment, or before using any medicine.
- Only use the "Platform context" given to you below as factual grounding about
  specific medicines, plants, or BAMS subjects. Do not invent ingredients,
  classical references, certifications, or clinical claims that are not present
  in that context.
- If the platform context does not contain the answer, say so plainly instead of
  guessing.
- Clearly flag uncertainty rather than asserting things you are not sure of.
- You may explain Ayurvedic terminology, concepts (Rasa, Guna, Virya, Vipaka,
  Karma), and help BAMS students study, including generating practice MCQs from
  the given context.`;

interface RetrievedContext {
  medicines: Array<{ id: string; name: string; description: string; traditionalIndications: string | null }>;
  plants: Array<{ id: string; name: string; botanicalName: string | null; description: string }>;
  subjects: Array<{ id: string; name: string; description: string | null }>;
}

async function retrieve(query: string): Promise<RetrievedContext> {
  const words = query.split(/\s+/).filter((w) => w.length > 2).slice(0, 8);
  const textFilter = (fields: string[]) => ({
    OR: words.flatMap((w) => fields.map((f) => ({ [f]: { contains: w, mode: "insensitive" as const } }))),
  });

  const [medicines, plants, subjects] = await Promise.all([
    words.length
      ? prisma.medicine.findMany({
          where: textFilter(["name", "description", "traditionalIndications", "sanskritName", "englishName"]) as any,
          select: { id: true, name: true, description: true, traditionalIndications: true },
          take: 5,
        })
      : [],
    words.length
      ? prisma.medicinalPlant.findMany({
          where: textFilter(["name", "description", "botanicalName", "sanskritName"]) as any,
          select: { id: true, name: true, botanicalName: true, description: true },
          take: 5,
        })
      : [],
    words.length
      ? prisma.subject.findMany({
          where: textFilter(["name", "description"]) as any,
          select: { id: true, name: true, description: true },
          take: 3,
        })
      : [],
  ]);

  return { medicines, plants, subjects };
}

function formatContext(ctx: RetrievedContext): string {
  const parts: string[] = [];
  if (ctx.medicines.length) {
    parts.push(
      "Medicines:\n" +
        ctx.medicines
          .map((m) => `- ${m.name}: ${m.description}${m.traditionalIndications ? ` (Traditional use: ${m.traditionalIndications})` : ""}`)
          .join("\n")
    );
  }
  if (ctx.plants.length) {
    parts.push(
      "Medicinal plants:\n" +
        ctx.plants.map((p) => `- ${p.name}${p.botanicalName ? ` (${p.botanicalName})` : ""}: ${p.description}`).join("\n")
    );
  }
  if (ctx.subjects.length) {
    parts.push("BAMS subjects:\n" + ctx.subjects.map((s) => `- ${s.name}: ${s.description ?? ""}`).join("\n"));
  }
  return parts.length ? parts.join("\n\n") : "No matching entries were found in the AyurSethu database.";
}

async function callClaude(userMessage: string, context: string): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Platform context (only verified facts you may rely on):\n${context}\n\nUser question: ${userMessage}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${await response.text()}`);
  }
  const data = (await response.json()) as { content: Array<{ type: string; text?: string }> };
  return data.content.find((c) => c.type === "text")?.text ?? "I couldn't generate a response just now.";
}

function fallbackAnswer(context: RetrievedContext): string {
  const lines = [
    "AyurBot is running in local-database mode (no ANTHROPIC_API_KEY configured), so here is what AyurSethu's own records say:",
  ];
  if (!context.medicines.length && !context.plants.length && !context.subjects.length) {
    lines.push("No matching medicines, plants, or subjects were found for that question.");
  } else {
    if (context.medicines.length) lines.push("\nMedicines:", ...context.medicines.map((m) => `- ${m.name}: ${m.description}`));
    if (context.plants.length) lines.push("\nMedicinal plants:", ...context.plants.map((p) => `- ${p.name}: ${p.description}`));
    if (context.subjects.length) lines.push("\nBAMS subjects:", ...context.subjects.map((s) => `- ${s.name}: ${s.description ?? ""}`));
  }
  lines.push(
    "\nThis is educational information only, not a medical consultation. Please consult a qualified Ayurvedic practitioner or doctor before using any medicine."
  );
  return lines.join("\n");
}

export async function answerQuestion(userMessage: string): Promise<{ answer: string; usedLiveModel: boolean; sources: RetrievedContext }> {
  const context = await retrieve(userMessage);

  if (!env.anthropicApiKey) {
    return { answer: fallbackAnswer(context), usedLiveModel: false, sources: context };
  }

  try {
    const answer = await callClaude(userMessage, formatContext(context));
    return { answer, usedLiveModel: true, sources: context };
  } catch (err) {
    console.error("AyurBot Claude call failed, falling back to local mode:", err);
    return { answer: fallbackAnswer(context), usedLiveModel: false, sources: context };
  }
}
