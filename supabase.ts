import { NextRequest, NextResponse } from "next/server";
import { askClaude, hasKey } from "@/lib/ai";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, kind } = await req.json();
    const sys = "You are a merchandise product expert. For the given official-style fan-store item, return a SHORT plain-text spec with labelled lines: Materials (typical fabric/composition), Made-for (climate/use), Care (wash instructions), Sizing tip, and Sustainability note. Keep under 90 words. General guidance, not a specific brand claim.";
    const msg = `Item: ${name}. Type: ${kind}.`;
    const ai = await askClaude(sys, msg, 300);
    const fallback = `Materials: typically 100% recycled polyester (performance jerseys) or cotton blends (casual wear)\nMade-for: warm-weather match days, moisture-wicking\nCare: cold machine wash, inside out, no ironing on prints\nSizing: fan/replica fits true to size; player-issue runs slim\nSustainability: look for recycled-content labelling. (General guidance — add an ANTHROPIC_API_KEY for AI detail.)`;
    return NextResponse.json({ info: ai || fallback, live: !!ai, keyConfigured: hasKey() });
  } catch { return NextResponse.json({ info: "Could not analyse this item.", live: false }, { status: 200 }); }
}
