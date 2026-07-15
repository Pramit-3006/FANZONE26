"use client";

import Link from "next/link";
import { useMatch } from "@/lib/useMatch";
import { TEAMS, fmtDate } from "@/lib/data";
import MatchPicker from "@/components/MatchPicker";
import { AIBadge } from "@/components/UI";
import { Map, Users, Languages, MessagesSquare, Camera, UtensilsCrossed, LifeBuoy, BarChart3, ArrowRight, MapPin, Sparkles } from "lucide-react";

const FEATURES = [
  { href: "/navigation", label: "Smart Navigation", desc: "Google-style map with live routing to your seat.", icon: Map, from: "#7B2FF7", to: "#1E90FF" },
  { href: "/crowd", label: "Crowd Flow", desc: "Live heatmap — find the calmest routes and gates.", icon: Users, from: "#FF2D78", to: "#F4C430" },
  { href: "/assistant", label: "Instant Translate", desc: "Any language, auto-detected, in real time.", icon: Languages, from: "#00E0C6", to: "#1E90FF" },
  { href: "/community", label: "Fan Community", desc: "Team-themed lounges + a stadium-wide chat.", icon: MessagesSquare, from: "#F4C430", to: "#E4002B" },
  { href: "/moments", label: "Key Moments", desc: "Post, like & comment on the live fan board.", icon: Camera, from: "#7B2FF7", to: "#FF2D78" },
  { href: "/food", label: "Food to Seat", desc: "Illustrated stall menus, delivered to your row.", icon: UtensilsCrossed, from: "#00A651", to: "#00E0C6" },
  { href: "/help", label: "SOS & Help", desc: "One-tap medical, volunteer & security.", icon: LifeBuoy, from: "#E4002B", to: "#FF2D78" },
  { href: "/players", label: "Stats & Lineups", desc: "Broadcast-style formation + AI scouting.", icon: BarChart3, from: "#1E90FF", to: "#7B2FF7" },
];

export default function Home() {
  const [match] = useMatch();
  return (
    <div>
      <section className="relative mt-2 overflow-hidden rounded-3xl border border-white/10 p-6 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-fifa-purple/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-fifa-pink/20 blur-3xl" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-xs text-white/70 ring-1 ring-white/15"><Sparkles className="h-3.5 w-3.5 text-fifa-gold" /> Your match-aware AI fan companion</div>
          <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">The <span className="gradient-text">World Cup 2026</span><br /> in the palm of your hand.</h1>
          <p className="mt-4 max-w-xl text-white/60">Pick your match below — everything adapts: navigation, crowd flow, translation, community, food-to-seat, one-tap help and AI scouting.</p>
          <div className="mt-6 max-w-xl"><MatchPicker /></div>
          <p className="mt-3 flex items-center gap-1 text-xs text-white/50"><MapPin className="h-3 w-3" />{match.stadium}, {match.city} · {fmtDate(match.date)} · Cap. {match.capacity}</p>
          <Link href="/navigation" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fifa-pink to-fifa-purple px-5 py-2.5 text-sm font-semibold">Explore the stadium <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Everything you need <AIBadge /></h2><span className="text-xs text-white/40">Tap a card</span></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {FEATURES.map(({ href, label, desc, icon: Icon, from, to }) => (
            <Link key={href} href={href} className="glass card-3d group rounded-2xl p-4">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}><Icon className="h-5 w-5" /></div>
              <p className="text-sm font-bold">{label}</p><p className="mt-1 text-xs text-white/50">{desc}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-fifa-teal opacity-0 transition group-hover:opacity-100">Open <ArrowRight className="h-3 w-3" /></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
