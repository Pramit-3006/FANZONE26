"use client";

import { useEffect, useState } from "react";
import { LINEUPS, TEAMS } from "@/lib/data";
import { useMatch } from "@/lib/useMatch";
import LineupPitch from "@/components/LineupPitch";
import PlayerAvatar from "@/components/PlayerAvatar";
import Crest from "@/components/Crest";
import { PageHeader, Card, Badge, AIBadge } from "@/components/UI";
import { BarChart3, TrendingUp, TrendingDown, Sparkles, Loader2, Shirt, MessageSquare, Send } from "lucide-react";

const SUGGESTED = ["Who's the biggest threat today?", "Compare the two number 10s", "Best pick for fantasy captain?", "Who should I watch off the ball?"];

export default function PlayersPage() {
  const [match] = useMatch();
  const withLineups = Object.keys(LINEUPS);
  const [team, setTeam] = useState<string>(withLineups[0]);
  const [picked, setPicked] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [qa, setQa] = useState<{ q: string; a: string }[]>([]);
  const [qLoading, setQLoading] = useState(false);

  useEffect(() => { const cand = [match.home, match.away].find((c) => LINEUPS[c]); if (cand) setTeam(cand); }, [match]);
  const lineup = LINEUPS[team]; const t = TEAMS[team];
  const player = lineup?.players.find((p) => p.name === picked) || null;
  const roster = lineup ? lineup.players.map((p) => `${p.name} (${p.pos}) ${p.goals}G ${p.assists}A r${p.rating}`).join("; ") : "";

  async function analyze() {
    setLoading(true); setAnalysis(null);
    try { const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `${t.name} play ${lineup.formation}. Key players: ${roster}. In 4 short lines give a fan-friendly scouting note: main threat, key matchup, one strength, one vulnerability.` }) }); const d = await r.json(); setAnalysis(d.reply); } catch { setAnalysis("A front-foot side — watch the wingers in transition."); } finally { setLoading(false); }
  }
  async function ask(question: string) {
    const text = question.trim(); if (!text) return; setQ(""); setQLoading(true);
    try { const r = await fetch("/api/player-qa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: text, player: picked, team, roster }) }); const d = await r.json(); setQa((prev) => [{ q: text, a: d.answer }, ...prev]); } catch { setQa((prev) => [{ q: text, a: "Couldn't answer right now." }, ...prev]); } finally { setQLoading(false); }
  }

  const tabTeams = Array.from(new Set([match.home, match.away, ...withLineups])).filter((c) => LINEUPS[c]);

  return (
    <div>
      <PageHeader icon={<BarChart3 className="h-7 w-7 text-fifa-blue" />} title="Stats, Lineups & Ask AI" subtitle="Broadcast-style formations, player cards, AI scouting — and ask anything about the players." />
      <div className="mb-4 flex flex-wrap gap-2">{tabTeams.map((c) => (<button key={c} onClick={() => { setTeam(c); setPicked(null); setAnalysis(null); }} className={`chip flex items-center gap-2 px-3 py-1.5 text-sm ${team === c ? "bg-white/15 ring-1 ring-white/30" : "text-white/60"}`}><Crest code={c} size={20} /> {TEAMS[c].name}</button>))}</div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2"><Crest code={team} size={28} /><div><p className="font-bold">{t.name}</p><p className="text-xs text-white/50"><Shirt className="mr-1 inline h-3 w-3" />{lineup.formation}</p></div></div><button onClick={analyze} disabled={loading} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-fifa-blue to-fifa-purple px-3 py-2 text-xs font-semibold">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} AI scout <AIBadge /></button></div>
          <LineupPitch code={team} onPick={setPicked} />
          {analysis && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-sm text-white/85">{analysis}</p>}
        </Card>

        <div className="space-y-4">
          <Card>
            {player ? (<div>
              <div className="flex items-center gap-3"><PlayerAvatar code={team} num={player.num} size={54} /><div><p className="text-lg font-black">{player.name}</p><p className="text-xs text-white/50">{player.pos} · #{player.num}</p></div><Badge color="#F4C430">★ {player.rating}</Badge></div>
              <div className="mt-3 flex gap-4 text-sm"><span><b>{player.goals}</b> <span className="text-white/50">Goals</span></span><span><b>{player.assists}</b> <span className="text-white/50">Assists</span></span></div>
              <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg bg-pitch/10 p-2 ring-1 ring-pitch/25"><p className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-pitch"><TrendingUp className="h-3 w-3" /> Strengths</p>{player.strengths.map((s) => <p key={s} className="text-[11px] text-white/75">• {s}</p>)}</div><div className="rounded-lg bg-fifa-red/10 p-2 ring-1 ring-fifa-red/25"><p className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-fifa-red"><TrendingDown className="h-3 w-3" /> Weaknesses</p>{player.weaknesses.map((s) => <p key={s} className="text-[11px] text-white/75">• {s}</p>)}</div></div>
            </div>) : (<div className="flex flex-col items-center justify-center py-8 text-center text-sm text-white/45"><Shirt className="mb-2 h-8 w-8 text-white/30" />Tap a player on the pitch for their card.</div>)}
            <div className="mt-3 grid grid-cols-3 gap-1.5">{lineup.players.map((p) => (<button key={p.name} onClick={() => setPicked(p.name)} className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] ${picked === p.name ? "bg-white/15" : "bg-white/5 hover:bg-white/10"}`}><span className="font-bold text-white/70">{p.num}</span><span className="truncate">{p.name.split(" ").slice(-1)[0]}</span></button>))}</div>
          </Card>

          {/* GenAI player Q&A */}
          <Card>
            <div className="mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-fifa-teal" /><h3 className="font-bold">Ask about the players <AIBadge /></h3></div>
            <div className="mb-2 flex flex-wrap gap-1.5">{SUGGESTED.map((s) => (<button key={s} onClick={() => ask(s)} className="chip px-2.5 py-1 text-[11px] text-white/60">{s}</button>))}</div>
            <div className="flex items-center gap-2"><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(q)} placeholder={picked ? `Ask about ${picked} or the match…` : "Ask about form, matchups, fantasy picks…"} className="flex-1 rounded-full bg-white/8 px-3 py-2 text-sm outline-none" /><button onClick={() => ask(q)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fifa-teal to-fifa-blue"><Send className="h-4 w-4" /></button></div>
            {qLoading && <div className="mt-3 flex items-center gap-2 text-sm text-white/60"><Loader2 className="h-4 w-4 animate-spin" />Thinking…</div>}
            <div className="mt-3 space-y-2">{qa.map((item, i) => (<div key={i} className="rounded-lg bg-white/5 p-3"><p className="text-xs font-semibold text-fifa-teal">Q: {item.q}</p><p className="mt-1 text-sm text-white/85">{item.a}</p></div>))}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
