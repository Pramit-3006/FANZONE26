"use client";

import { useState } from "react";
import StadiumMap from "@/components/StadiumMap";
import { FACILITIES } from "@/lib/data";
import { PageHeader, Card, AIBadge } from "@/components/UI";
import { Map, Navigation2, Loader2 } from "lucide-react";

export default function NavigationPage() {
  const [selected, setSelected] = useState<string | undefined>();
  const [seat, setSeat] = useState("Sec 210, Row 12, Seat 8");
  const [dest, setDest] = useState("");
  const [route, setRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const facility = FACILITIES.find((f) => f.id === selected);

  async function getRoute() {
    const target = facility?.name || dest;
    if (!target) return;
    setLoading(true);
    setRoute(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `I'm at seat ${seat}. Give me short step-by-step walking directions to reach: ${target}. Mention concourse level, direction (left/right), and estimated walking time. Keep it under 6 steps.`,
        }),
      });
      const data = await res.json();
      setRoute(data.reply);
    } catch {
      setRoute("Couldn't fetch directions — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        icon={<Map className="h-7 w-7 text-fifa-blue" />}
        title="Smart Navigation"
        subtitle="A full 3D plan of the stadium and surrounding area, with AI wayfinding from your exact seat."
      />

      <Card className="mb-4">
        <StadiumMap selectedId={selected} onSelect={setSelected} />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center gap-2">
            <Navigation2 className="h-4 w-4 text-fifa-teal" />
            <h3 className="font-bold">AI Wayfinding <AIBadge /></h3>
          </div>
          <label className="text-xs text-white/50">Your seat</label>
          <input
            value={seat}
            onChange={(e) => setSeat(e.target.value)}
            className="mb-3 mt-1 w-full rounded-lg bg-white/8 px-3 py-2 text-sm outline-none"
          />
          <label className="text-xs text-white/50">Destination</label>
          <input
            value={facility?.name || dest}
            onChange={(e) => { setDest(e.target.value); setSelected(undefined); }}
            placeholder="Tap a pin on the map or type a place"
            className="mb-3 mt-1 w-full rounded-lg bg-white/8 px-3 py-2 text-sm outline-none placeholder:text-white/35"
          />
          <button
            onClick={getRoute}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fifa-blue to-fifa-purple py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation2 className="h-4 w-4" />}
            Get directions
          </button>
          {route && (
            <div className="mt-3 whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-sm text-white/85">
              {route}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-2 font-bold">Key facilities</h3>
          <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto no-scrollbar">
            {FACILITIES.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                  selected === f.id ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <span>{f.name}</span>
                <span className="text-xs text-white/45">{f.type} · {f.side}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
