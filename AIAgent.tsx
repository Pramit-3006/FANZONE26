import { NextRequest, NextResponse } from "next/server";
import { askClaude, hasKey } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are FanZone 26, the official GenAI concierge for fans at the FIFA World Cup 2026.
You help with wayfinding, avoiding crowds, food & stalls, seat info, accessibility, medical/volunteer/security help, translation, match tactics and general questions.
Be concise, warm and practical. Prefer short paragraphs or tight bullets. Use any live CONTEXT provided (selected match, stadium, page) to ground answers.
If a fan describes an emergency (injury, missing person, threat), tell them exactly which in-app SOS button to tap (Medical, Volunteer, or Security) and to stay where they are.`;

function fallback(message: string, ctx: string): string {
  const m = message.toLowerCase();
  if (m.includes("bathroom") || m.includes("restroom") || m.includes("toilet"))
    return "Nearest restrooms: North-East concourse (near Gate A) and South-West (near Gate E). Open Navigate and tap the 🚻 pin to route you from your seat.";
  if (m.includes("hungry") || m.includes("food") || m.includes("eat") || m.includes("stall"))
    return "Shortest lines right now: Hydration Station (2 min) and Green Card Vegan (3 min). Want a burger? Golden Boot Grill ~8 min. Order to your seat from the Food tab.";
  if (m.includes("crowd") || m.includes("busy") || m.includes("exit") || m.includes("leave"))
    return "Least congested route is via the South Upper concourse to Gate E/F. Check the Crowd tab for the live heatmap and calmest gate.";
  if (m.includes("hurt") || m.includes("injured") || m.includes("dizzy") || m.includes("medical"))
    return "Tap the red Medical SOS on the Help tab — it shares your seat with the nearest medical bay. Stay put; a responder will come to you.";
  if (m.includes("lost") || m.includes("missing"))
    return "For a missing person tap Security SOS on the Help tab and describe them. Security and the control room are alerted instantly with your location.";
  if (m.includes("who") || m.includes("win") || m.includes("score") || m.includes("line"))
    return `I can talk tactics! Open the Players tab for the lineups, ratings and AI scouting. ${ctx ? "Today: " + ctx : ""}`;
  return "I'm your FanZone 26 concierge ⚽ Ask me to find your seat, dodge crowds, order food, get help, translate, or break down the match. (Add ANTHROPIC_API_KEY in Vercel for full live AI.)";
}

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    const text = (message || "").toString().slice(0, 2000);
    const ctx = (context || "").toString().slice(0, 500);
    const user = ctx ? `CONTEXT: ${ctx}\n\nFAN: ${text}` : text;
    const ai = await askClaude(SYSTEM, user, 600);
    return NextResponse.json({ reply: ai || fallback(text, ctx), live: !!ai, keyConfigured: hasKey() });
  } catch {
    return NextResponse.json({ reply: "Something went wrong — please try again.", live: false, keyConfigured: hasKey() }, { status: 200 });
  }
}
