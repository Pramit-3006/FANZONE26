import { NextRequest, NextResponse } from "next/server";
import { askClaude, hasKey } from "@/lib/ai";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, sells, category } = await req.json();
    const sys = "You are a stadium food nutritionist. For the given concession item, return a SHORT JSON-free plain-text breakdown with exactly these labelled lines: Calories (approx range), Protein/Carbs/Fat (approx), Common allergens (comma list or 'none typical'), Dietary tags (e.g. halal/vegan/vegetarian if applicable), and a one-line healthier tip. Keep it under 90 words. These are estimates.";
    const msg = `Item: ${name}. Category: ${category}. Sells: ${sells}.`;
    const ai = await askClaude(sys, msg, 300);
    const fallback = `Calories: ~450–700 kcal (varies by portion)\nProtein ~20g · Carbs ~55g · Fat ~25g (estimate)\nCommon allergens: gluten, dairy — ask the vendor to confirm\nTags: ${category}\nTip: Pair with water instead of soda to cut ~150 kcal. (Estimates — add an ANTHROPIC_API_KEY for AI-precise analysis.)`;
    return NextResponse.json({ info: ai || fallback, live: !!ai, keyConfigured: hasKey() });
  } catch { return NextResponse.json({ info: "Could not analyse this item.", live: false }, { status: 200 }); }
}
