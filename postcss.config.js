"use client";

import { useMemo, useState } from "react";
import { STALLS } from "@/lib/data";
import { PageHeader, Card, Badge, AIBadge } from "@/components/UI";
import { UtensilsCrossed, ShoppingCart, Plus, Minus, MapPin, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

const CATS = ["All", "Food", "Halal", "Vegan", "Coffee", "Drinks", "Merch"];

export default function FoodPage() {
  const [cat, setCat] = useState("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [seat, setSeat] = useState("Sec 210, Row 12, Seat 8");
  const [placed, setPlaced] = useState(false);
  const [rec, setRec] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const list = useMemo(() => (cat === "All" ? STALLS : STALLS.filter((s) => s.category === cat)), [cat]);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  function add(id: string) { setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 })); }
  function sub(id: string) { setCart((c) => { const n = { ...c }; if (!n[id]) return n; n[id]--; if (n[id] <= 0) delete n[id]; return n; }); }

  async function recommend() {
    setLoading(true);
    setRec(null);
    const menu = STALLS.map((s) => `${s.name} (${s.category}, ${s.wait}min wait): ${s.sells}`).join("; ");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Stalls available: ${menu}. Recommend the best quick bite for someone who wants to be back before kickoff, and one option each for halal and vegan diets. 3 short lines.` }),
      });
      const data = await res.json();
      setRec(data.reply);
    } catch {
      setRec("Try Hydration Station (2 min) for drinks, Halal Kitchen 26 for halal, and Green Card Vegan for plant-based.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        icon={<UtensilsCrossed className="h-7 w-7 text-pitch" />}
        title="Food & Stalls"
        subtitle="See every stall, what they sell, and order straight to your seat — no more missing the action."
      />

      {/* AI rec */}
      <Card className="mb-4">
        <button onClick={recommend} disabled={loading} className="flex items-center gap-2 text-sm font-semibold">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-fifa-gold" />}
          Ask AI what to eat <AIBadge />
        </button>
        {rec && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-sm text-white/85">{rec}</p>}
      </Card>

      {/* Category filter */}
      <div className="mb-3 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`chip px-3 py-1 text-xs ${cat === c ? "bg-pitch/20 text-pitch ring-1 ring-pitch/50" : "text-white/60"}`}>{c}</button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((s) => (
          <Card key={s.id} tilt>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/8 text-2xl">{s.emoji}</div>
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-xs text-white/50">{s.sells}</p>
                </div>
              </div>
              <Badge>{s.price}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-white/45"><MapPin className="mr-1 inline h-3 w-3" />{s.side} · {s.concourse} · {s.wait}min</span>
              {cart[s.id] ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => sub(s.id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10"><Minus className="h-4 w-4" /></button>
                  <span className="w-4 text-center text-sm font-bold">{cart[s.id]}</span>
                  <button onClick={() => add(s.id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-pitch/30"><Plus className="h-4 w-4" /></button>
                </div>
              ) : (
                <button onClick={() => add(s.id)} className="rounded-full bg-gradient-to-r from-pitch to-fifa-teal px-3 py-1.5 text-xs font-semibold">Add to seat</button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Cart bar */}
      {count > 0 && !placed && (
        <div className="fixed bottom-24 left-1/2 z-40 w-[92vw] max-w-md -translate-x-1/2 md:bottom-6">
          <div className="glass flex items-center gap-3 rounded-2xl p-3">
            <ShoppingCart className="h-5 w-5 text-fifa-gold" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">{count} item{count > 1 ? "s" : ""} → your seat</p>
              <input value={seat} onChange={(e) => setSeat(e.target.value)} className="w-full rounded bg-white/8 px-2 py-1 text-xs outline-none" />
            </div>
            <button onClick={() => setPlaced(true)} className="rounded-full bg-gradient-to-r from-pitch to-fifa-teal px-4 py-2 text-sm font-bold">Deliver</button>
          </div>
        </div>
      )}

      {placed && (
        <div className="fixed bottom-24 left-1/2 z-40 w-[92vw] max-w-md -translate-x-1/2 md:bottom-6">
          <div className="glass flex items-center gap-3 rounded-2xl p-4">
            <CheckCircle2 className="h-6 w-6 text-pitch" />
            <div className="flex-1 text-sm">
              <p className="font-bold">Order on its way to {seat}!</p>
              <p className="text-xs text-white/55">A runner will bring it in ~12 min. Track in notifications.</p>
            </div>
            <button onClick={() => { setPlaced(false); setCart({}); }} className="text-xs text-white/60">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
