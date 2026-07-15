import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { data: moments } = await db().from("moments").select("*").order("created_at", { ascending: false }).limit(50);
  const ids = (moments || []).map((m: any) => m.id);
  let comments: any[] = [];
  if (ids.length) { const { data } = await db().from("moment_comments").select("*").in("moment_id", ids).order("created_at", { ascending: true }); comments = data || []; }
  const feed = (moments || []).map((m: any) => ({ id: m.id, user: m.username, caption: m.caption, kind: m.kind, gradient: m.gradient, likes: m.likes, comments: comments.filter((c) => c.moment_id === m.id).map((c) => ({ user: c.username, text: c.body })) }));
  return NextResponse.json({ moments: feed });
}
export async function POST(req: NextRequest) {
  try {
    const { user, caption, kind, gradient } = await req.json();
    const { data, error } = await db().from("moments").insert({ username: (user || "You ⚽").slice(0, 40), caption: (caption || "My World Cup moment!").slice(0, 200), kind: kind === "video" ? "video" : "photo", gradient: gradient || "linear-gradient(135deg,#7B2FF7,#FF2D78)" }).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, moment: { id: data.id, user: data.username, caption: data.caption, kind: data.kind, gradient: data.gradient, likes: 0, comments: [] } });
  } catch { return NextResponse.json({ ok: false }, { status: 500 }); }
}
export async function PATCH(req: NextRequest) {
  try {
    const { id, action, text } = await req.json();
    if (action === "like") { const { data } = await db().from("moments").select("likes").eq("id", id).single(); await db().from("moments").update({ likes: ((data?.likes as number) || 0) + 1 }).eq("id", id); }
    else if (action === "comment" && text) { await db().from("moment_comments").insert({ moment_id: id, username: "You", body: text.slice(0, 140) }); }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false }, { status: 500 }); }
}
