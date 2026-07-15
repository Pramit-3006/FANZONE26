import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room") || "STADIUM";
  const { data } = await db().from("chat_messages").select("*").eq("room", room).order("created_at", { ascending: false }).limit(80);
  const messages = (data || []).reverse().map((m: any) => ({ id: m.id, user: m.username, text: m.body, team: m.team }));
  return NextResponse.json({ messages });
}
export async function POST(req: NextRequest) {
  try {
    const { room, user, text, team } = await req.json();
    if (!text || !text.trim()) return NextResponse.json({ ok: false }, { status: 400 });
    const { data, error } = await db().from("chat_messages").insert({ room: room || "STADIUM", username: (user || "You").slice(0, 40), team: (team || "").slice(0, 4), body: text.slice(0, 500) }).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, message: { id: data.id, user: data.username, text: data.body, team: data.team } });
  } catch { return NextResponse.json({ ok: false }, { status: 500 }); }
}
