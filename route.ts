"use client";

import { useMemo, useState } from "react";
import { ZONES, crowdLabel } from "@/lib/data";
import { PageHeader, Card, Badge, AIBadge } from "@/components/UI";
import { Users, TrendingDown, Loader2, Activity } from "lucide-react";

export default function CrowdPage() {
  const [ai, setAi] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sorted = useMemo(() => [...ZONES].sort((a, b) => a.crowd - b.crowd), []);
  const calmest = sorted.slice(0, 3);
  const busiest = [...ZONES].sort((a, b) => b.crowd - a.crowd).slice(0, 3);
  const avg = Math.round(ZONES.reduce((s, z) => s + z.crowd, 0) / ZONES.length);

  // build a 4x3 heat matrix (sides x levels)
  const sides = ["N", "E", "S", "W"];
  const levels = ["Lower", "Club", "Upper"];

  async function suggest() {
    setLoading(true); setAi(null);
    const summary = ZONES.map((z) => `${z.name}: ${z.crowd}% full, ${z.wait}min`).join("; ");
    try {
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `Live section occupancy: ${summary}. As a crowd-flow AI, recommend the calmest exit route and the two best concourse areas to walk through now. 4 short lines.` }) });
      const data = await res.json(); setAi(data.reply);
    } catch { setAi("Couldn't compute a route — please try again."); } finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader icon={<Users className="h-7 w-7 text-fifa-pink" />} title="Crowd Flow" subtitle="Live congestion across every section — see what's open and move smart." />

      <div className="mb-4 grid grid-cols-3 gap-3">
        {[{l:"Avg occupancy",v:`${avg}%`,c:crowdLabel(avg).color},{l:"Calmest",v:calmest[0].id,c:"#00A651"},{l:"Busiest",v:busiest[0].id,c:"#E4002B"}].map((k)=>(
          <Card key={k.l} className="text-center"><p className="text-[11px] text-white/50">{k.l}</p><p className="text-xl font-black" style={{color:k.c}}>{k.v}</p></Card>
        ))}
      </div>

      {/* Heat matrix */}
      <Card className="mb-4">
        <div className="mb-2 flex items-center gap-2"><Activity className="h-4 w-4 text-fifa-pink" /><h3 className="font-bold">Occupancy heatmap</h3></div>
        <div className="grid grid-cols-[auto_repeat(3,1fr)] gap-1.5 text-center text-[11px]">
          <div />{levels.map((l)=>(<div key={l} className="pb-1 text-white/50">{l}</div>))}
          {sides.map((s)=>(
            <FragmentRow key={s} side={s} levels={levels} />
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center gap-2"><TrendingDown className="h-4 w-4 text-pitch" /><h3 className="font-bold">Easiest right now</h3></div>
          {calmest.map((z) => (<div key={z.id} className="flex items-center justify-between border-b border-white/5 py-2 text-sm last:border-0"><span>{z.name}</span><Badge color={crowdLabel(z.crowd).color}>{z.crowd}% · {z.wait}min</Badge></div>))}
          <p className="mt-3 text-xs text-white/45">Busiest to avoid: {busiest.map((b) => b.id).join(", ")}</p>
        </Card>
        <Card>
          <div className="mb-2 flex items-center gap-2"><h3 className="font-bold">AI route planner <AIBadge /></h3></div>
          <p className="text-xs text-white/50">Live recommendation for the calmest way to move or exit.</p>
          <button onClick={suggest} disabled={loading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fifa-pink to-fifa-gold py-2.5 text-sm font-semibold disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Plan my calmest route"}</button>
          {ai && <div className="mt-3 whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-sm text-white/85">{ai}</div>}
        </Card>
      </div>
    </div>
  );
}

function FragmentRow({ side, levels }: { side: string; levels: string[] }) {
  const label: Record<string,string> = { N: "North", E: "East", S: "South", W: "West" };
  return (
    <>
      <div className="flex items-center pr-1 text-white/60">{label[side]}</div>
      {levels.map((lvl) => {
        const z = ZONES.find((x) => x.side === side && x.level === lvl);
        if (!z) return <div key={lvl} />;
        const info = crowdLabel(z.crowd);
        return (
          <div key={lvl} className="rounded-lg py-3 font-bold" style={{ background: `${info.color}2a`, border: `1px solid ${info.color}66`, color: info.color }}>
            {z.crowd}%
          </div>
        );
      })}
    </>
  );
}
