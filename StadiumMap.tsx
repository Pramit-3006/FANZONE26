"use client";

import { useEffect, useRef, useState } from "react";
import { TEAMS } from "@/lib/data";
import { PageHeader, Card, AIBadge } from "@/components/UI";
import { MessagesSquare, Send, Sparkles, Loader2, Globe } from "lucide-react";

type Msg = { id: number; user: string; text: string; team?: string; me?: boolean };

const SEED: Record<string, Msg[]> = {
  STADIUM: [
    { id: 1, user: "Aisha", text: "First World Cup final ever — I'm shaking! 🙌", team: "MAR" },
    { id: 2, user: "Diego", text: "Section 210 is BOUNCING. Come say hi!", team: "ARG" },
    { id: 3, user: "Kenji", text: "Anyone trading pins? I've got a Japan set 🇯🇵", team: "JPN" },
  ],
  ARG: [
    { id: 1, user: "Sofia", text: "VAMOS ARGENTINA!!! 🇦🇷", team: "ARG" },
    { id: 2, user: "Mateo", text: "Meeting at Gate A pre-match, wear the blue!", team: "ARG" },
  ],
  FRA: [
    { id: 1, user: "Luc", text: "Allez les Bleus! Who's near West Upper?", team: "FRA" },
  ],
};

export default function CommunityPage() {
  const [room, setRoom] = useState("STADIUM");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("You");
  const [myTeam, setMyTeam] = useState("ARG");
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(`chat_${room}`) : null;
    setMsgs(saved ? JSON.parse(saved) : SEED[room] || []);
  }, [room]);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(`chat_${room}`, JSON.stringify(msgs));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, room]);

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { id: Date.now(), user: name || "You", text: t, team: myTeam, me: true }]);
    setInput("");
  }

  async function makeIcebreaker() {
    setLoading(true);
    setIcebreaker(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Write one short, friendly icebreaker message (max 15 words) I can post in the ${room === "STADIUM" ? "whole-stadium" : room + " fans"} World Cup chat to make new friends. Just the message.`,
        }),
      });
      const data = await res.json();
      setIcebreaker(data.reply);
    } catch {
      setIcebreaker("Who's here for their first World Cup? Let's celebrate together! ⚽");
    } finally {
      setLoading(false);
    }
  }

  const rooms = [{ code: "STADIUM", name: "Whole Stadium", flag: "🌍" }, ...TEAMS.map((t) => ({ code: t.code, name: t.name, flag: t.flag }))];

  return (
    <div>
      <PageHeader
        icon={<MessagesSquare className="h-7 w-7 text-fifa-gold" />}
        title="Fan Community"
        subtitle="Join your team's lounge or the stadium-wide chat and make friends from around the world."
      />

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        {/* Rooms */}
        <Card className="h-fit">
          <p className="mb-2 text-xs font-semibold text-white/50">Rooms</p>
          <div className="flex max-h-[420px] flex-col gap-1 overflow-y-auto no-scrollbar">
            {rooms.map((r) => (
              <button
                key={r.code}
                onClick={() => setRoom(r.code)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                  room === r.code ? "bg-white/15" : "hover:bg-white/8"
                }`}
              >
                <span>{r.flag}</span>
                <span className="truncate">{r.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat */}
        <Card className="flex h-[480px] flex-col">
          <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
            {room === "STADIUM" ? <Globe className="h-4 w-4 text-fifa-teal" /> : <span>{TEAMS.find(t=>t.code===room)?.flag}</span>}
            <h3 className="font-bold">{room === "STADIUM" ? "Whole Stadium" : TEAMS.find(t=>t.code===room)?.name + " Lounge"}</h3>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto py-2 no-scrollbar">
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.me ? "bg-gradient-to-br from-fifa-purple to-fifa-blue" : "glass"}`}>
                  <p className="mb-0.5 text-[11px] text-white/50">{TEAMS.find(t=>t.code===m.team)?.flag} {m.user}</p>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {icebreaker && (
            <button onClick={() => send(icebreaker)} className="mb-2 rounded-lg bg-fifa-gold/15 px-3 py-2 text-left text-xs text-fifa-gold ring-1 ring-fifa-gold/30">
              ✦ Tap to post: “{icebreaker}”
            </button>
          )}

          <div className="flex items-center gap-2 border-t border-white/10 pt-2">
            <button onClick={makeIcebreaker} disabled={loading} title="AI icebreaker" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-fifa-gold" />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Say something nice…"
              className="flex-1 rounded-full bg-white/8 px-3 py-2 text-sm outline-none"
            />
            <button onClick={() => send(input)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fifa-pink to-fifa-purple">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-center text-[10px] text-white/35"><Sparkles className="mr-1 inline h-3 w-3" />AI icebreaker <AIBadge /> · messages saved on this device</p>
        </Card>
      </div>
    </div>
  );
}
