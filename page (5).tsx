"use client";

import { useMemo, useState } from "react";
import StadiumMap from "@/components/StadiumMap";
import { FACILITIES, buildDirections } from "@/lib/data";
import { useMatch } from "@/lib/useMatch";
import { PageHeader, Card, Badge, AIBadge } from "@/components/UI";
import { Map, Navigation2, Loader2, MapPin, Clock, Footprints } from "lucide-react";

export default function NavigationPage() {
  const [match] = useMatch();
  const [selected, setSelected] = useState<string | undefined>();
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const facility = FACILITIES.find((f) => f.id === selected);

  // Deterministic wayfinding — always correct, works with no AI.
  const route = useMemo(() => (selected ? buildDirections(selected) : null), [selected]);

  async function aiEnhance() {
    if (!facility || !route) return;
    setLoading(true); setAiNote(null);
    try {
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context: `Stadium: ${match.stadium}. Route: ${route.steps.join(" ")} (~${route.minutes} min, ${route.congestion.label} en route).`, message: `Rewrite these directions to ${facility.name} as one friendly, encouraging tip (max 2 sentences) and suggest the calmest time or side to go.` }) });
      const d = await res.json(); setAiNote(d.reply);
    } catch { setAiNote(null); } finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader icon={<Map className="h-7 w-7 text-fifa-blue" />} title="Smart Navigation" subtitle={`3D map of ${match.stadium} — tap a pin for a congestion-aware route and written directions.`} />
      <Card className="mb-4"><StadiumMap selectedId={selected} onSelect={(id) => { setSelected(id); setAiNote(null); }} routeColor={route?.congestion.color || "#1E90FF"} /></Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2"><Navigation2 className="h-4 w-4 text-fifa-teal" /><h3 className="font-bold">Directions</h3></div>
            {route && <Badge color={route.congestion.color}>{route.congestion.label} en route</Badge>}
          </div>
          {!facility ? (
            <p className="py-8 text-center text-sm text-white/45"><MapPin className="mx-auto mb-2 h-6 w-6 text-white/30" />Tap any pin on the map to get turn-by-turn directions from your seat (Sec 210).</p>
          ) : (
            <div>
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${route!.congestion.color}22`, color: route!.congestion.color }}><Footprints className="h-5 w-5" /></div>
                <div><p className="font-bold">{facility.name}</p><p className="flex items-center gap-2 text-xs text-white/55"><Clock className="h-3 w-3" />~{route!.minutes} min walk · {route!.congestion.label}</p></div>
              </div>
              <ol className="space-y-2">
                {route!.steps.map((s, i) => (<li key={i} className="flex gap-2 text-sm"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fifa-blue/30 text-[11px] font-bold">{i + 1}</span><span className="text-white/85">{s}</span></li>))}
              </ol>
              <button onClick={aiEnhance} disabled={loading} className="mt-3 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "✦"} AI tip for this route <AIBadge /></button>
              {aiNote && <p className="mt-2 rounded-lg bg-fifa-teal/10 p-3 text-sm text-white/85 ring-1 ring-fifa-teal/25">{aiNote}</p>}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="mb-2 font-bold">Places</h3>
          <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto no-scrollbar">
            {FACILITIES.filter(f=>f.id!=="seat").map((f) => (<button key={f.id} onClick={() => { setSelected(f.id); setAiNote(null); }} className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${selected === f.id ? "bg-white/15" : "bg-white/5 hover:bg-white/10"}`}><span>{f.name}</span><span className="text-xs text-white/45">{f.type}</span></button>))}
          </div>
        </Card>
      </div>
    </div>
  );
}
