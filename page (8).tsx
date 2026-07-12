"use client";

import { useState } from "react";
import { PageHeader, Card, AIBadge } from "@/components/UI";
import { Languages, ArrowRightLeft, Loader2, Volume2 } from "lucide-react";

const LANGS = ["Spanish", "French", "Portuguese", "Arabic", "Japanese", "German", "Hindi", "Italian", "Korean"];
const QUICK = ["Where is my seat?", "I need help", "Go Argentina!", "Where is the nearest restroom?", "Two waters please"];

export default function AssistantPage() {
  const [text, setText] = useState("Where is my seat?");
  const [target, setTarget] = useState("Spanish");
  const [out, setOut] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function translate() {
    if (!text.trim()) return;
    setLoading(true);
    setOut(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target }),
      });
      const data = await res.json();
      setOut(data.translation);
    } catch {
      setOut("Translation failed — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function speak() {
    if (!out || typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(out);
    window.speechSynthesis.speak(u);
  }

  return (
    <div>
      <PageHeader
        icon={<Languages className="h-7 w-7 text-fifa-teal" />}
        title="Instant Translation"
        subtitle="Break the language barrier — talk to fans from all 48 nations in real time."
      />

      <Card className="mb-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setTarget(l)}
              className={`chip px-3 py-1 text-xs ${target === l ? "bg-fifa-teal/20 text-fifa-teal ring-1 ring-fifa-teal/50" : "text-white/60"}`}
            >
              {l}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl bg-white/8 p-3 text-sm outline-none"
          placeholder="Type anything to translate…"
        />

        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button key={q} onClick={() => setText(q)} className="chip px-2.5 py-1 text-[11px] text-white/60">
              {q}
            </button>
          ))}
        </div>

        <button
          onClick={translate}
          disabled={loading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fifa-teal to-fifa-blue py-3 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
          Translate to {target} <AIBadge />
        </button>

        {out && (
          <div className="mt-4 rounded-xl bg-gradient-to-br from-fifa-teal/15 to-fifa-blue/10 p-4 ring-1 ring-fifa-teal/30">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wide text-fifa-teal">{target}</span>
              <button onClick={speak} className="flex items-center gap-1 text-xs text-white/60 hover:text-white">
                <Volume2 className="h-4 w-4" /> Speak
              </button>
            </div>
            <p className="text-lg font-semibold">{out}</p>
          </div>
        )}
      </Card>

      <Card>
        <p className="text-xs text-white/50">
          💡 Tip: Show the translated card to a stall vendor, a volunteer, or a fellow fan. Tap <b>Speak</b> to
          play it aloud. With an Anthropic API key configured, any language pair is supported live.
        </p>
      </Card>
    </div>
  );
}
