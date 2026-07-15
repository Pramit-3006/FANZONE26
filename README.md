"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { getStoredMatch } from "@/lib/useMatch";

type Msg = { role: "user" | "bot"; text: string };
const SUGGESTIONS = ["Where's the nearest exit?", "Shortest food line?", "How do I avoid the crowd?", "Who should I watch today?"];

export default function AIAgent() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: "Hi! I'm your FanZone 26 AI concierge ⚽ Ask me anything about the stadium, crowds, food, translation or the match." }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput(""); setLoading(true);
    const mt = getStoredMatch();
    const context = `Match: ${mt.home} vs ${mt.away}, ${mt.stage}, ${mt.stadium} (${mt.city}).`;
    try {
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q, context }) });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "bot", text: data.reply }]);
    } catch {
      setMsgs((m) => [...m, { role: "bot", text: "I couldn't reach the server — please try again." }]);
    } finally { setLoading(false); }
  }

  return (
    <>
      <button onClick={() => setOpen((o) => !o)} aria-label="Open AI concierge" className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fifa-pink via-fifa-purple to-fifa-blue shadow-lg shadow-fifa-purple/40 md:bottom-6">
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6 animate-float" />}
      </button>
      {open && (
        <div className="fixed bottom-40 right-4 z-50 flex h-[70vh] max-h-[520px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/15 bg-fifa-ink/95 backdrop-blur-xl md:bottom-24">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
            <Bot className="h-5 w-5 text-fifa-teal" />
            <div><p className="text-sm font-semibold">FanZone AI Concierge</p><p className="text-[11px] text-white/50">Match-aware · Generative AI</p></div>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3 no-scrollbar">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-gradient-to-br from-fifa-blue to-fifa-purple text-white" : "glass text-white/90"}`}>{m.text}</div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="glass rounded-2xl px-3 py-2 text-sm text-white/60">Thinking…</div></div>}
          </div>
          {msgs.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-2">{SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="chip px-2.5 py-1 text-[11px] text-white/70 hover:text-white">{s}</button>)}</div>
          )}
          <div className="flex items-center gap-2 border-t border-white/10 p-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder="Ask anything…" className="flex-1 rounded-full bg-white/8 px-3 py-2 text-sm outline-none placeholder:text-white/40" />
            <button onClick={() => send(input)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fifa-pink to-fifa-purple"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </>
  );
}
