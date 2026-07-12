"use client";

import { useState } from "react";
import { PageHeader, Card, AIBadge } from "@/components/UI";
import { LifeBuoy, Plus, HandHelping, ShieldAlert, MapPin, Loader2, CheckCircle2, X } from "lucide-react";

type SOS = "medical" | "volunteer" | "security" | null;

const CONFIG = {
  medical: { title: "Medical Assistance", color: "#E4002B", icon: Plus, eta: "2–3 min", team: "Nearest medical bay (North)", ask: "Describe the injury or symptoms" },
  volunteer: { title: "Volunteer Help", color: "#F4C430", icon: HandHelping, eta: "3–5 min", team: "Section volunteer team", ask: "What do you need help with?" },
  security: { title: "Security / Distress", color: "#7B2FF7", icon: ShieldAlert, eta: "1–2 min", team: "Stadium security & control room", ask: "Describe the situation or missing person" },
};

export default function HelpPage() {
  const [active, setActive] = useState<SOS>(null);
  const [seat, setSeat] = useState("Sec 210, Row 12, Seat 8");
  const [detail, setDetail] = useState("");
  const [stage, setStage] = useState<"form" | "sending" | "sent">("form");
  const [guidance, setGuidance] = useState<string | null>(null);

  function open(type: SOS) {
    setActive(type);
    setStage("form");
    setDetail("");
    setGuidance(null);
  }

  async function dispatch() {
    setStage("sending");
    // Simulate dispatch + fetch AI first-aid / guidance
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `A fan at ${seat} requested ${active} help. They said: "${detail || "no details"}". In 3 short calm bullet points, tell them what to do while ${CONFIG[active!].team} is on the way. Do not give risky medical procedures — keep it safe and reassuring.`,
        }),
      });
      const data = await res.json();
      setGuidance(data.reply);
    } catch {
      setGuidance("Stay where you are, keep calm, and make yourself visible to the responding team.");
    }
    setTimeout(() => setStage("sent"), 1200);
  }

  return (
    <div>
      <PageHeader
        icon={<LifeBuoy className="h-7 w-7 text-fifa-red" />}
        title="Help & SOS"
        subtitle="One tap connects you to the right team with your exact seat location shared automatically."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(CONFIG) as Exclude<SOS, null>[]).map((k) => {
          const c = CONFIG[k];
          const Icon = c.icon;
          return (
            <button
              key={k}
              onClick={() => open(k)}
              className="glass card-3d relative overflow-hidden rounded-2xl p-5 text-left"
            >
              <span className="absolute right-3 top-3 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-pulseRing rounded-full" style={{ background: c.color }} />
                <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: c.color }} />
              </span>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${c.color}22`, border: `1px solid ${c.color}66` }}>
                <Icon className="h-6 w-6" style={{ color: c.color }} />
              </div>
              <p className="font-bold">{c.title}</p>
              <p className="mt-1 text-xs text-white/50">Avg response {c.eta}</p>
            </button>
          );
        })}
      </div>

      <Card className="mt-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <MapPin className="h-4 w-4 text-fifa-teal" />
          Your location is shared as: <b className="text-white/85">{seat}</b>
        </div>
        <input value={seat} onChange={(e) => setSeat(e.target.value)} className="mt-2 w-full rounded-lg bg-white/8 px-3 py-2 text-sm outline-none" />
      </Card>

      {/* Modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setActive(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-fifa-ink p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: CONFIG[active].color }}>{CONFIG[active].title}</h3>
              <button onClick={() => setActive(null)}><X className="h-5 w-5 text-white/50" /></button>
            </div>

            {stage === "form" && (
              <>
                <p className="mb-2 text-sm text-white/60">{CONFIG[active].ask}</p>
                <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} className="w-full resize-none rounded-lg bg-white/8 p-3 text-sm outline-none" placeholder="Optional details…" />
                <div className="mt-2 rounded-lg bg-white/5 p-2 text-xs text-white/55">
                  <MapPin className="mr-1 inline h-3 w-3 text-fifa-teal" /> {seat} · dispatching to {CONFIG[active].team}
                </div>
                <button onClick={dispatch} className="mt-3 w-full rounded-lg py-3 text-sm font-bold text-black" style={{ background: CONFIG[active].color }}>
                  Send SOS now
                </button>
              </>
            )}

            {stage === "sending" && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: CONFIG[active].color }} />
                <p className="text-sm text-white/70">Alerting {CONFIG[active].team}…</p>
              </div>
            )}

            {stage === "sent" && (
              <div className="py-4">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-pitch" />
                  <div>
                    <p className="font-bold">Help is on the way</p>
                    <p className="text-xs text-white/55">{CONFIG[active].team} · ETA {CONFIG[active].eta}</p>
                  </div>
                </div>
                {guidance && (
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-fifa-teal">While you wait <AIBadge /></p>
                    <p className="whitespace-pre-wrap text-sm text-white/85">{guidance}</p>
                  </div>
                )}
                <button onClick={() => setActive(null)} className="mt-3 w-full rounded-lg bg-white/10 py-2.5 text-sm font-semibold">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
