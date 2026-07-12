import { NextRequest, NextResponse } from "next/server";
import { askClaude, hasKey } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tiny offline phrasebook so translation demos work with no key.
const PHRASES: Record<string, Record<string, string>> = {
  "where is my seat": {
    Spanish: "¿Dónde está mi asiento?",
    French: "Où est mon siège ?",
    Portuguese: "Onde fica o meu lugar?",
    Arabic: "أين مقعدي؟",
    Japanese: "私の座席はどこですか？",
    German: "Wo ist mein Sitzplatz?",
  },
  "i need help": {
    Spanish: "Necesito ayuda",
    French: "J'ai besoin d'aide",
    Portuguese: "Preciso de ajuda",
    Arabic: "أحتاج للمساعدة",
    Japanese: "助けが必要です",
    German: "Ich brauche Hilfe",
  },
  "go argentina": {
    Spanish: "¡Vamos Argentina!",
    French: "Allez l'Argentine !",
    Portuguese: "Vai Argentina!",
    Arabic: "هيا الأرجنتين!",
    Japanese: "行け、アルゼンチン！",
    German: "Los geht's, Argentinien!",
  },
};

function fallbackTranslate(text: string, target: string): string {
  const key = text.trim().toLowerCase().replace(/[!?.]/g, "");
  const hit = PHRASES[key]?.[target];
  if (hit) return hit;
  return `[${target}] ${text}  —  (demo phrasebook. Add ANTHROPIC_API_KEY in Vercel for unlimited live translation of any language.)`;
}

export async function POST(req: NextRequest) {
  try {
    const { text, target } = await req.json();
    const clean = (text || "").toString().slice(0, 1000);
    const lang = (target || "Spanish").toString();
    const ai = await askClaude(
      `You are a professional real-time translator at a football stadium. Translate the user's text into ${lang}. Reply with ONLY the translation, no notes or quotes.`,
      clean,
      400
    );
    return NextResponse.json({
      translation: ai || fallbackTranslate(clean, lang),
      live: !!ai,
      keyConfigured: hasKey(),
    });
  } catch {
    return NextResponse.json({ translation: "Translation failed — try again.", live: false }, { status: 200 });
  }
}
