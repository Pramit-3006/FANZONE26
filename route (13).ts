"use client";

import { useEffect, useRef, useState } from "react";
import { TEAM_LIST, TEAMS } from "@/lib/data";
import { useMatch } from "@/lib/useMatch";
import Crest from "@/components/Crest";
import { PageHeader, Card, AIBadge } from "@/components/UI";
import { Send, Sparkles, Loader2, Globe, Heart } from "lucide-react";

type Msg = { id: number; user: string; text: string; team?: string };

export default function CommunityPage() {
  const [match] = useMatch();
  const [room, setRoom] = useState("STADIUM");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function load(r: string) { try { const res = await fetch(`/api/chat?room=${r}`); const d = await res.json(); setMsgs(d.messages || []); } catch {} }
  useEffect(() => { load(room); const t = setInterval(() => load(room), 5000); return () => clearInterval(t); }, [room]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [msgs]);

  async function send(text: string) {
    const t = text.trim(); if (!t) return; setInput("");
    setMsgs((m) => [...m, { id: Date.now(), user: "You", text: t, team: match.home }]);
    try { await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ room, user: "You", text: t, team: match.home }) }); load(room); } catch {}
  }
  async function makeIcebreaker() {
    setLoading(true); setIcebreaker(null);
    const label = room === "STADIUM" ? "the whole stadium" : TEAMS[room]?.name + " fans";
    try { const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `Write one short friendly icebreaker (max 15 words) to post in ${label}'s World Cup chat. Just the message.` }) }); const d = await res.json(); setIcebreaker(d.reply); } catch { setIcebreaker("Who's here for their first World Cup? Let's celebrate! ⚽"); } finally { setLoading(false); }
  }

  const theme = room === "STADIUM" ? { p: "#1E90FF", s: "#7B2FF7" } : { p: TEAMS[room]?.primary || "#1E90FF", s: TEAMS[room]?.secondary || "#7B2FF7" };
  const featured = [match.home, match.away].filter(Boolean);
  const rooms = ["STADIUM", ...featured, ...TEAM_LIST.map((t) => t.code).filter((c) => !featured.includes(c))];

  return (
    <div>
      <PageHeader icon={<Globe className="h-7 w-7 text-fifa-gold" />} title="Fan Community" subtitle="Team-themed lounges styled like your favourite social app — tap a story to join." />

      {/* Instagram-style stories bar */}
      <div className="mb-4 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {rooms.map((c) => { const active = room === c; const ring = c === "STADIUM" ? "linear-gradient(135deg,#1E90FF,#7B2FF7)" : `linear-gradient(135deg,${TEAMS[c].primary},${TEAMS[c].secondary})`; return (
          <button key={c} onClick={() => setRoom(c)} className="flex w-16 shrink-0 flex-col items-center gap-1">
            <span className="rounded-full p-[2.5px]" style={{ background: ring, opacity: active ? 1 : 0.55 }}><span className="flex h-14 w-14 items-center justify-center rounded-full bg-fifa-ink">{c === "STADIUM" ? <Globe className="h-7 w-7 text-fifa-teal" /> : <Crest code={c} size={38} />}</span></span>
            <span className="w-full truncate text-center text-[10px] text-white/60">{c === "STADIUM" ? "Stadium" : c}</span>
          </button>
        ); })}
      </div>

      <Card className="flex h-[520px] flex-col overflow-hidden p-0">
        <div className="flex items-center gap-3 p-4" style={{ background: `linear-gradient(120deg, ${theme.p}, ${theme.s})` }}>
          {room === "STADIUM" ? <Globe className="h-9 w-9" /> : <Crest code={room} size={38} />}
          <div><h3 className="font-black leading-tight">{room === "STADIUM" ? "Whole Stadium" : TEAMS[room].name + " Lounge"}</h3><p className="text-[11px] text-white/85">{msgs.length} posts · live</p></div>
        </div>
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3 no-scrollbar">
          {msgs.length === 0 && <p className="mt-16 text-center text-sm text-white/40">No posts yet — start the conversation 👋</p>}
          {msgs.map((m) => { const t = m.team ? TEAMS[m.team] : null; const me = m.user === "You"; return (
            <div key={m.id} className="glass rounded-2xl p-3">
              <div className="mb-1.5 flex items-center gap-2">{t ? <Crest code={m.team!} size={26} /> : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px]">👤</span>}<span className="text-sm font-semibold">{m.user}</span>{t && <span className="text-[11px] text-white/40">· {t.name}</span>}{me && <span className="ml-auto text-[10px] text-fifa-teal">you</span>}</div>
              <p className="text-sm text-white/90">{m.text}</p>
              <button onClick={() => setLiked((l) => ({ ...l, [m.id]: !l[m.id] }))} className="mt-2 flex items-center gap-1 text-xs text-white/50"><Heart className={`h-4 w-4 ${liked[m.id] ? "fill-fifa-red text-fifa-red" : ""}`} /> {liked[m.id] ? "Liked" : "Like"}</button>
            </div>
          ); })}
        </div>
        {icebreaker && <button onClick={() => send(icebreaker)} className="mx-3 mb-2 rounded-lg bg-fifa-gold/15 px-3 py-2 text-left text-xs text-fifa-gold ring-1 ring-fifa-gold/30">✦ Tap to post: “{icebreaker}”</button>}
        <div className="flex items-center gap-2 border-t border-white/10 p-2">
          <button onClick={makeIcebreaker} disabled={loading} title="AI icebreaker" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-fifa-gold" />}</button>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder="Share something…" className="flex-1 rounded-full bg-white/8 px-3 py-2 text-sm outline-none" />
          <button onClick={() => send(input)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: `linear-gradient(120deg, ${theme.p}, ${theme.s})` }}><Send className="h-4 w-4" /></button>
        </div>
      </Card>
      <p className="mt-2 text-center text-[11px] text-white/35">AI icebreaker <AIBadge /> · shared live chat stored on Supabase</p>
    </div>
  );
}
