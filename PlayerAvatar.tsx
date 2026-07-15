import { NextRequest, NextResponse } from "next/server";
import { askClaude, hasKey } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHRASES: Record<string, Record<string, string>> = {
  "where is my seat": { Spanish: "¿Dónde está mi asiento?", French: "Où est mon siège ?", Portuguese: "Onde fica o meu lugar?", Arabic: "أين مقعدي؟", Japanese: "私の座席はどこですか？", German: "Wo ist mein Sitzplatz?", Hindi: "मेरी सीट कहाँ है?", Korean: "제 자리는 어디인가요?", Italian: "Dov'è il mio posto?", Mandarin: "我的座位在哪里？" },
  "i need help": { Spanish: "Necesito ayuda", French: "J'ai besoin d'aide", Portuguese: "Preciso de ajuda", Arabic: "أحتاج للمساعدة", Japanese: "助けが必要です", German: "Ich brauche Hilfe", Hindi: "मुझे मदद चाहिए", Korean: "도움이 필요해요", Italian: "Ho bisogno di aiuto", Mandarin: "我需要帮助" },
  "two waters please": { Spanish: "Dos aguas, por favor", French: "Deux eaux, s'il vous plaît", Portuguese: "Duas águas, por favor", Arabic: "زجاجتا ماء من فضلك", Japanese: "水を2本お願いします", German: "Zwei Wasser, bitte", Hindi: "दो पानी दीजिए", Korean: "물 두 개 주세요", Italian: "Due acque, per favore", Mandarin: "请给我两瓶水" },
};

function fallbackTranslate(text: string, target: string): string {
  const key = text.trim().toLowerCase().replace(/[!?.]/g, "");
  const hit = PHRASES[key]?.[target];
  if (hit) return hit;
  return `[${target}] ${text}  —  (offline phrasebook. Add ANTHROPIC_API_KEY in Vercel for unlimited live translation of ANY language.)`;
}

export async function POST(req: NextRequest) {
  try {
    const { text, target } = await req.json();
    const clean = (text || "").toString().slice(0, 1200);
    const lang = (target || "Spanish").toString();
    const ai = await askClaude(
      `You are a professional real-time interpreter at a football stadium. Auto-detect the source language and translate the user's text into ${lang}. Preserve tone and football slang naturally. Reply with ONLY the translation — no notes, no quotes, no source text.`,
      clean, 500
    );
    return NextResponse.json({ translation: ai || fallbackTranslate(clean, lang), live: !!ai, keyConfigured: hasKey() });
  } catch {
    return NextResponse.json({ translation: "Translation failed — try again.", live: false }, { status: 200 });
  }
}
