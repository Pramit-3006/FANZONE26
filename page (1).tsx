"use client";

import { useState } from "react";
import { LINEUPS, TEAMS, MATCH } from "@/lib/data";
import { PageHeader, Card, Badge, AIBadge } from "@/components/UI";
import { BarChart3, TrendingUp, TrendingDown, Sparkles, Loader2, Shirt } from "lucide-react";

export default function PlayersPage() {
  const codes = Object.keys(LINEUPS);
  const [team, setTeam] = useState(MATCH.home);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lineup = LINEUPS[team] || LINEUPS[codes[0]];
  const t = TEAMS.find((x) => x.code === team);

  async function analyze() {
    setLoading(true);
    setAnalysis(null);
    const roster = lineup.players.map((p) => `${p.name} (${p.pos}): ${p.goals}G ${p.assists}A, rating ${p.rating}`).join("; ");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `${t?.name} play ${lineup.formation}. Key players: ${roster}. In 4 short lines, give a fan-friendly tactical scouting note: main threat, key matchup to watch, one strength, one vulnerability.` }),
      });
      const data = await res.json();
      setAnalysis(data.reply);
    } catch {
      setAnalysis("A pacey, front-foot side. Watch the wingers in transition; vulnerable to balls in behind the full-backs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        icon={<BarChart3 className="h-7 w-7 text-fifa-blue" />}
        title="Stats & Lineups"
        subtitle="Live player stats plus AI-scouted strengths and weaknesses for every star."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {codes.map((c) => {
          const tm = TEAMS.find((x) => x.code === c)!;
          return (
            <button key={c} onClick={() => { setTeam(c); setAnalysis(null); }} className={`chip flex items-center gap-2 px-3 py-1.5 text-sm ${team === c ? "bg-white/15 ring-1 ring-white/30" : "text-white/60"}`}>
              <span>{tm.flag}</span> {tm.name}
            </button>
          );
        })}
      </div>

      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{t?.flag}</span>
            <div>
              <p className="font-bold">{t?.name}</p>
              <p className="text-xs text-white/50"><Shirt className="mr-1 inline h-3 w-3" />Formation {lineup.formation}</p>
            </div>
          </div>
          <button onClick={analyze} disabled={loading} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-fifa-blue to-fifa-purple px-3 py-2 text-xs font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} AI scout report <AIBadge />
          </button>
        </div>
        {analysis && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-sm text-white/85">{analysis}</p>}
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {lineup.players.map((p) => (
          <Card key={p.name} tilt>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-fifa-blue/40 to-fifa-purple/40 text-sm font-black">{p.num}</div>
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-white/50">{p.pos}</p>
                </div>
              </div>
              <Badge color="#F4C430">★ {p.rating}</Badge>
            </div>

            <div className="mt-3 flex gap-4 text-sm">
              <span><b>{p.goals}</b> <span className="text-white/50">Goals</span></span>
              <span><b>{p.assists}</b> <span className="text-white/50">Assists</span></span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-pitch/10 p-2 ring-1 ring-pitch/25">
                <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-pitch"><TrendingUp className="h-3 w-3" /> Strengths</p>
                {p.strengths.map((s) => <p key={s} className="text-[11px] text-white/75">• {s}</p>)}
              </div>
              <div className="rounded-lg bg-fifa-red/10 p-2 ring-1 ring-fifa-red/25">
                <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-fifa-red"><TrendingDown className="h-3 w-3" /> Weaknesses</p>
                {p.weaknesses.map((s) => <p key={s} className="text-[11px] text-white/75">• {s}</p>)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
