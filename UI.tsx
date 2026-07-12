"use client";

import { useState } from "react";
import { PageHeader, Card, AIBadge } from "@/components/UI";
import { Camera, Heart, Upload, Sparkles, Loader2, Video } from "lucide-react";

type Moment = {
  id: number;
  user: string;
  caption: string;
  likes: number;
  liked: boolean;
  media?: string;
  kind: "photo" | "video";
  gradient: string;
};

const GRADS = [
  "linear-gradient(135deg,#7B2FF7,#FF2D78)",
  "linear-gradient(135deg,#00E0C6,#1E90FF)",
  "linear-gradient(135deg,#F4C430,#E4002B)",
  "linear-gradient(135deg,#1E90FF,#7B2FF7)",
];

const SEED: Moment[] = [
  { id: 1, user: "Diego 🇦🇷", caption: "GOOOAL! The whole section erupted 🔥", likes: 342, liked: false, kind: "photo", gradient: GRADS[0] },
  { id: 2, user: "Aisha 🇲🇦", caption: "Best atmosphere of my life ❤️", likes: 189, liked: false, kind: "video", gradient: GRADS[1] },
  { id: 3, user: "Luc 🇫🇷", caption: "Tifo unveiling in the West stand 🎆", likes: 275, liked: false, kind: "photo", gradient: GRADS[2] },
];

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>(SEED);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [kind, setKind] = useState<"photo" | "video">("photo");
  const [loading, setLoading] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setKind(file.type.startsWith("video") ? "video" : "photo");
  }

  function post() {
    if (!caption.trim() && !preview) return;
    setMoments((m) => [
      { id: Date.now(), user: "You ⚽", caption: caption || "My World Cup moment!", likes: 0, liked: false, media: preview || undefined, kind, gradient: GRADS[Math.floor(Math.random() * GRADS.length)] },
      ...m,
    ]);
    setCaption("");
    setPreview(null);
  }

  function like(id: number) {
    setMoments((m) => m.map((x) => (x.id === id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x)));
  }

  async function aiCaption() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Write one short, exciting World Cup 2026 photo caption with 1-2 emojis, max 12 words. Just the caption." }),
      });
      const data = await res.json();
      setCaption(data.reply.replace(/^["']|["']$/g, ""));
    } catch {
      setCaption("Living the World Cup dream! ⚽🔥");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        icon={<Camera className="h-7 w-7 text-fifa-pink" />}
        title="Key Moments Board"
        subtitle="Share the photos and clips you capture — build the live scrapbook of the match."
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 text-white/50 hover:border-fifa-pink/50 sm:w-40">
            {preview ? (
              kind === "video" ? <video src={preview} className="h-full w-full rounded-xl object-cover" /> : <img src={preview} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              <><Upload className="mb-1 h-6 w-6" /><span className="text-xs">Add photo / video</span></>
            )}
            <input type="file" accept="image/*,video/*" className="hidden" onChange={onFile} />
          </label>
          <div className="flex-1">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="Caption your moment…"
              className="w-full resize-none rounded-xl bg-white/8 p-3 text-sm outline-none"
            />
            <div className="mt-2 flex gap-2">
              <button onClick={aiCaption} disabled={loading} className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-fifa-gold" />} AI caption <AIBadge />
              </button>
              <button onClick={post} className="flex-1 rounded-lg bg-gradient-to-r from-fifa-pink to-fifa-purple py-2 text-sm font-semibold">
                Post to board
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="columns-1 gap-3 sm:columns-2 md:columns-3">
        {moments.map((m) => (
          <div key={m.id} className="glass mb-3 break-inside-avoid overflow-hidden rounded-2xl">
            <div className="relative flex h-40 items-center justify-center" style={{ background: m.media ? undefined : m.gradient }}>
              {m.media ? (
                m.kind === "video" ? <video src={m.media} controls className="h-full w-full object-cover" /> : <img src={m.media} alt="" className="h-full w-full object-cover" />
              ) : (
                m.kind === "video" ? <Video className="h-10 w-10 text-white/80" /> : <Camera className="h-10 w-10 text-white/80" />
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-white/70">{m.user}</p>
              <p className="mt-0.5 text-sm">{m.caption}</p>
              <button onClick={() => like(m.id)} className="mt-2 flex items-center gap-1 text-xs text-white/60">
                <Heart className={`h-4 w-4 ${m.liked ? "fill-fifa-red text-fifa-red" : ""}`} /> {m.likes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
