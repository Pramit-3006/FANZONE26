"use client";

import { useMemo, useState } from "react";
import { ZONES, crowdLabel } from "@/lib/data";
import { PageHeader, Card, Badge, AIBadge } from "@/components/UI";
import { Users, TrendingDown, Loader2 } from "lucide-react";

export default function CrowdPage() {
  const [ai, setAi] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sorted = useMemo(() => [...ZONES].sort((a, b) => a.crowd - b.crowd), []);
  const calmest = sorted.slice(0, 3);
  const busiest = [...ZONES].sort((a, b) => b.crowd - a.crowd).slice(0, 3);

  async function suggest() {
    setLoading(true);
    setAi(null);
    const summary = ZONES.map((z) => `${z.name}: ${z.crowd}% full, ${z.wait}min wait`).join("; ");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Live section occupancy: ${summary}. As a crowd-flow assistant, recommend the calmest route to leave the stadium and the two best concourse areas to walk through right now. Keep it to 4 short lines.`,
        }),
      });
      const data = await res.json();
      setAi(data.reply);
    } catch {
      setAi("Couldn't compute a route — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        icon={<Users className="h-7 w-7 text-fifa-pink" />}
        title="Crowd Flow"
        subtitle="Live congestion across every section — see what's open and move smart."
      />

      {/* Heatmap grid */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {ZONES.map((z) => {
            const info = crowdLabel(z.crowd);
            return (
              <div
                key={z.id}
                className="relative overflow-hidden rounded-xl p-3"
                style={{ background: `${info.color}1f`, border: `1px solid ${info.color}55` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{z.id}</span>
                  <Badge color={info.color}>{info.label}</Badge>
                </div>
                <p className="mt-1 text-[11px] text-white/60">{z.name}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${z.crowd}%`, background: info.color }} />
                </div>
                <p className="mt-1 text-[10px] text-white/45">{z.crowd}% · {z.wait}min entry</p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-pitch" />
            <h3 className="font-bold">Easiest right now</h3>
          </div>
          {calmest.map((z) => (
            <div key={z.id} className="flex items-center justify-between border-b border-white/5 py-2 text-sm last:border-0">
              <span>{z.name}</span>
              <Badge color={crowdLabel(z.crowd).color}>{z.crowd}% · {z.wait}min</Badge>
            </div>
          ))}
          <p className="mt-3 text-xs text-white/45">Busiest to avoid: {busiest.map((b) => b.id).join(", ")}</p>
        </Card>

        <Card>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="font-bold">AI route planner <AIBadge /></h3>
          </div>
          <p className="text-xs text-white/50">Get a live recommendation for the calmest way to move or exit.</p>
          <button
            onClick={suggest}
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fifa-pink to-fifa-gold py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Plan my calmest route"}
          </button>
          {ai && <div className="mt-3 whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-sm text-white/85">{ai}</div>}
        </Card>
      </div>
    </div>
  );
}
