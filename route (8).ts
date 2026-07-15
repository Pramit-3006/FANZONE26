"use client";

import { useState } from "react";
import { PageHeader, Card, AIBadge } from "@/components/UI";
import { Languages, ArrowRightLeft, Loader2, Volume2 } from "lucide-react";

const LANGS = ["Spanish","French","Portuguese","Arabic","Mandarin","Japanese","German","Hindi","Italian","Korean","Russian","Turkish","Swahili","Dutch"];
const QUICK = ["Where is my seat?", "I need help", "Two waters please", "Where is the nearest restroom?", "Which way to Gate C?"];

export default function AssistantPage() {
  const [text, setText] = useState("Where is my seat?");
  const [target, setTarget] = useState("Spanish");
  const [out, setOut] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);

  async function translate() {
    if (!text.trim()) return;
    setLoading(true); setOut(null);
    try {
      const res = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, target }) });
      const data = await res.json(); setOut(data.translation); setLive(!!data.live);
    } catch { setOut("Translation failed — please try again."); } finally { setLoading(false); }
  }
  function speak() { if (!out || typeof window === "undefined" || !window.speechSynthesis) return; window.speechSynthesis.speak(new SpeechSynthesisUtterance(out)); }

  return (
    <div>
      <PageHeader icon={<Languages className="h-7 w-7 text-fifa-teal" />} title="Instant Translation" subtitle="Auto-detects any source language and translates to any of the world's languages, in real time." />
      <Card className="mb-4">
        <div className="mb-3 flex flex-wrap gap-2">{LANGS.map((l) => (<button key={l} onClick={() => setTarget(l)} className={`chip px-3 py-1 text-xs ${target === l ? "bg-fifa-teal/20 text-fifa-teal ring-1 ring-fifa-teal/50" : "text-white/60"}`}>{l}</button>))}</div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full resize-none rounded-xl bg-white/8 p-3 text-sm outline-none" placeholder="Type in any language…" />
        <div className="mt-2 flex flex-wrap gap-2">{QUICK.map((q) => (<button key={q} onClick={() => setText(q)} className="chip px-2.5 py-1 text-[11px] text-white/60">{q}</button>))}</div>
        <button onClick={translate} disabled={loading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fifa-teal to-fifa-blue py-3 text-sm font-semibold disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}Translate to {target} <AIBadge /></button>
        {out && (
          <div className="mt-4 rounded-xl bg-gradient-to-br from-fifa-teal/15 to-fifa-blue/10 p-4 ring-1 ring-fifa-teal/30">
            <div className="mb-1 flex items-center justify-between"><span className="text-[11px] uppercase tracking-wide text-fifa-teal">{target} {live ? "· live AI" : "· demo"}</span><button onClick={speak} className="flex items-center gap-1 text-xs text-white/60 hover:text-white"><Volume2 className="h-4 w-4" /> Speak</button></div>
            <p className="text-lg font-semibold">{out}</p>
          </div>
        )}
      </Card>
      <Card><p className="text-xs text-white/50">💡 Show the card to a vendor, volunteer or fellow fan, or tap <b>Speak</b>. With an API key set, any language pair works live and slang is preserved naturally.</p></Card>
    </div>
  );
}
