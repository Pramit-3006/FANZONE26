import { NextRequest, NextResponse } from "next/server";
import { askClaude, hasKey } from "@/lib/ai";
import { db } from "@/lib/supabase";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK: Record<string, string> = {
  form: "He's in sharp form — heavily involved in the final third and a genuine matchwinner on his day.",
  compare: "Both are elite; it comes down to role. One offers more creativity, the other more penalty-box threat.",
  watch: "Watch his movement between the lines and his work off the ball — that's where he hurts defences.",
};
function fb(q: string) {
  const s = q.toLowerCase();
  if (s.includes("compare") || s.includes(" vs ") || s.includes("better")) return FALLBACK.compare;
  if (s.includes("form") || s.includes("playing")) return FALLBACK.form;
  return FALLBACK.watch;
}

export async function GET() {
  const { data } = await db().from("player_questions").select("*").order("created_at", { ascending: false }).limit(20);
  return NextResponse.json({ items: (data || []).map((r: any) => ({ id: r.id, player: r.player, question: r.question, answer: r.answer })) });
}
export async function POST(req: NextRequest) {
  try {
    const { question, player, team, roster } = await req.json();
    const q = (question || "").toString().slice(0, 400);
    const sys = "You are a knowledgeable, concise football pundit for World Cup 2026 fans. Answer questions about players, tactics and matchups in 2-4 sentences. Be specific and fair. If asked to compare or recommend, give a clear pick with a one-line reason.";
    const ctx = `Team: ${team || ""}. Focus player: ${player || "n/a"}. Squad context: ${(roster || "").toString().slice(0, 400)}. Question: ${q}`;
    const ai = await askClaude(sys, ctx, 350);
    const answer = ai || fb(q);
    await db().from("player_questions").insert({ player: (player || "").slice(0, 60), team: (team || "").slice(0, 4), question: q, answer }).then(() => {}, () => {});
    return NextResponse.json({ answer, live: !!ai, keyConfigured: hasKey() });
  } catch { return NextResponse.json({ answer: "Couldn't answer right now — try again.", live: false }, { status: 200 }); }
}
