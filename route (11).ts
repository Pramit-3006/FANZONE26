"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, AIBadge } from "@/components/UI";
import { Camera, Heart, Upload, Sparkles, Loader2, Video, MessageCircle, Send, Share2, ThumbsUp } from "lucide-react";

type Cmt = { user: string; text: string };
type Moment = { id: number; user: string; caption: string; kind: "photo" | "video"; gradient: string; likes: number; comments: Cmt[]; media?: string };
const GRADS = ["linear-gradient(135deg,#7B2FF7,#FF2D78)","linear-gradient(135deg,#00E0C6,#1E90FF)","linear-gradient(135deg,#F4C430,#E4002B)","linear-gradient(135deg,#1E90FF,#7B2FF7)"];

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [kind, setKind] = useState<"photo" | "video">("photo");
  const [loading, setLoading] = useState(false);
  const [openC, setOpenC] = useState<number | null>(null);
  const [cText, setCText] = useState("");
  const [localMedia, setLocalMedia] = useState<Record<number, string>>({});
  const [likedLocal, setLikedLocal] = useState<Record<number, boolean>>({});

  async function load() { try { const r = await fetch("/api/moments"); const d = await r.json(); setMoments(d.moments || []); } catch {} }
  useEffect(() => { load(); }, []);
  function onFile(e: React.ChangeEvent<HTMLInputElement>) { const f = e.target.files?.[0]; if (!f) return; setPreview(URL.createObjectURL(f)); setKind(f.type.startsWith("video") ? "video" : "photo"); }

  async function post() {
    if (!caption.trim() && !preview) return;
    const gradient = GRADS[Math.floor(Math.random() * GRADS.length)];
    try { const r = await fetch("/api/moments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: "You ⚽", caption, kind, gradient }) }); const d = await r.json(); if (d.moment && preview) setLocalMedia((m) => ({ ...m, [d.moment.id]: preview })); setCaption(""); setPreview(null); load(); } catch {}
  }
  async function like(id: number) { setLikedLocal((l) => ({ ...l, [id]: true })); setMoments((ms) => ms.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))); try { await fetch("/api/moments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "like" }) }); } catch {} }
  async function comment(id: number) { const t = cText.trim(); if (!t) return; setCText(""); setMoments((ms) => ms.map((m) => (m.id === id ? { ...m, comments: [...m.comments, { user: "You", text: t }] } : m))); try { await fetch("/api/moments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "comment", text: t }) }); } catch {} }
  async function aiCaption() { setLoading(true); try { const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "Write one short exciting World Cup 2026 photo caption with 1-2 emojis, max 12 words. Just the caption." }) }); const d = await r.json(); setCaption(d.reply.replace(/^["']|["']$/g, "")); } catch { setCaption("Living the World Cup dream! ⚽🔥"); } finally { setLoading(false); } }

  return (
    <div>
      <PageHeader icon={<Camera className="h-7 w-7 text-fifa-pink" />} title="Moments Feed" subtitle="Share match moments and react — a live social feed for everyone in the ground." />

      {/* FB-style composer */}
      <Card className="mb-4">
        <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fifa-pink to-fifa-purple text-sm">⚽</span><input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What's the moment, fan?" className="flex-1 rounded-full bg-white/8 px-4 py-2.5 text-sm outline-none" /></div>
        {preview && <div className="mt-3 overflow-hidden rounded-xl">{kind === "video" ? <video src={preview} className="max-h-56 w-full object-cover" controls /> : <img src={preview} alt="" className="max-h-56 w-full object-cover" />}</div>}
        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
          <label className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"><Upload className="h-4 w-4 text-fifa-teal" />Photo/Video<input type="file" accept="image/*,video/*" className="hidden" onChange={onFile} /></label>
          <button onClick={aiCaption} disabled={loading} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-fifa-gold" />}AI caption <AIBadge /></button>
          <button onClick={post} className="ml-auto rounded-lg bg-gradient-to-r from-fifa-pink to-fifa-purple px-5 py-1.5 text-sm font-semibold">Post</button>
        </div>
      </Card>

      {moments.length === 0 && <p className="py-8 text-center text-sm text-white/40">No moments yet — post the first! 📸</p>}
      <div className="mx-auto max-w-xl space-y-4">
        {moments.map((m) => { const media = m.media || localMedia[m.id]; return (
          <Card key={m.id} className="p-0">
            <div className="flex items-center gap-2 p-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fifa-blue to-fifa-purple text-sm">⚽</span><div><p className="text-sm font-semibold">{m.user}</p><p className="text-[11px] text-white/45">MetLife Stadium · just now</p></div></div>
            {m.caption && <p className="px-3 pb-2 text-sm">{m.caption}</p>}
            <div className="flex h-52 items-center justify-center" style={{ background: media ? undefined : m.gradient }}>{media ? (m.kind === "video" ? <video src={media} controls className="h-full w-full object-cover" /> : <img src={media} alt="" className="h-full w-full object-cover" />) : (m.kind === "video" ? <Video className="h-12 w-12 text-white/80" /> : <Camera className="h-12 w-12 text-white/80" />)}</div>
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-white/45"><span>❤️ {m.likes}</span><span>{m.comments.length} comments</span></div>
            <div className="grid grid-cols-3 border-t border-white/10 text-sm text-white/60">
              <button onClick={() => like(m.id)} className={`flex items-center justify-center gap-1 py-2 hover:bg-white/5 ${likedLocal[m.id] ? "text-fifa-red" : ""}`}><ThumbsUp className="h-4 w-4" />Like</button>
              <button onClick={() => setOpenC(openC === m.id ? null : m.id)} className="flex items-center justify-center gap-1 py-2 hover:bg-white/5"><MessageCircle className="h-4 w-4" />Comment</button>
              <button className="flex items-center justify-center gap-1 py-2 hover:bg-white/5"><Share2 className="h-4 w-4" />Share</button>
            </div>
            {(m.comments.length > 0 || openC === m.id) && (
              <div className="space-y-1.5 border-t border-white/10 p-3">
                {m.comments.map((c, i) => (<div key={i} className="rounded-2xl bg-white/5 px-3 py-1.5 text-[13px]"><b className="text-white/85">{c.user}</b> {c.text}</div>))}
                {openC === m.id && (<div className="mt-1 flex items-center gap-1"><input value={cText} onChange={(e) => setCText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && comment(m.id)} placeholder="Write a comment…" className="flex-1 rounded-full bg-white/8 px-3 py-1.5 text-xs outline-none" /><button onClick={() => comment(m.id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-fifa-pink/30"><Send className="h-3.5 w-3.5" /></button></div>)}
              </div>
            )}
          </Card>
        ); })}
      </div>
    </div>
  );
}
