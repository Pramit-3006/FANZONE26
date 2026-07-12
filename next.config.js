"use client";

import Link from "next/link";
import { MATCH, TEAMS } from "@/lib/data";
import { AIBadge } from "@/components/UI";
import {
  Map, Users, Languages, MessagesSquare, Camera,
  UtensilsCrossed, LifeBuoy, BarChart3, ArrowRight, Trophy, Sparkles,
} from "lucide-react";

const FEATURES = [
  { href: "/navigation", label: "Smart Navigation", desc: "3D stadium & area map with AI wayfinding to your seat.", icon: Map, from: "#7B2FF7", to: "#1E90FF" },
  { href: "/crowd", label: "Crowd Flow", desc: "Live heatmap — find the calmest routes and gates.", icon: Users, from: "#FF2D78", to: "#F4C430" },
  { href: "/assistant", label: "Instant Translate", desc: "Speak with any fan in any language, instantly.", icon: Languages, from: "#00E0C6", to: "#1E90FF" },
  { href: "/community", label: "Fan Community", desc: "Team lounges + a stadium-wide chat to make friends.", icon: MessagesSquare, from: "#F4C430", to: "#E4002B" },
  { href: "/moments", label: "Key Moments", desc: "Post your photos & clips to the live fan board.", icon: Camera, from: "#7B2FF7", to: "#FF2D78" },
  { href: "/food", label: "Food to Seat", desc: "Order from stalls, delivered to your row.", icon: UtensilsCrossed, from: "#00A651", to: "#00E0C6" },
  { href: "/help", label: "SOS & Help", desc: "One-tap medical, volunteer & security assistance.", icon: LifeBuoy, from: "#E4002B", to: "#FF2D78" },
  { href: "/players", label: "Stats & Lineups", desc: "AI-scouted strengths, weaknesses & live stats.", icon: BarChart3, from: "#1E90FF", to: "#7B2FF7" },
];

export default function Home() {
  const home = TEAMS.find((t) => t.code === MATCH.home)!;
  const away = TEAMS.find((t) => t.code === MATCH.away)!;
  return (
    <div>
      {/* Hero */}
      <section className="relative mt-2 overflow-hidden rounded-3xl border border-white/10 p-6 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-fifa-purple/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-fifa-pink/20 blur-3xl" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-xs text-white/70 ring-1 ring-white/15">
            <Sparkles className="h-3.5 w-3.5 text-fifa-gold" /> Your AI-powered fan companion
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
            The <span className="gradient-text">World Cup 2026</span><br /> in the palm of your hand.
          </h1>
          <p className="mt-4 max-w-xl text-white/60">
            Navigate the stadium, dodge the crowds, translate any language, order food to your seat,
            and get help in one tap — all guided by Generative AI.
          </p>

          {/* Match card */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="glass card-3d flex items-center gap-4 rounded-2xl px-5 py-4">
              <div className="text-center">
                <div className="text-3xl">{home.flag}</div>
                <div className="text-xs font-semibold">{home.code}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-fifa-gold"><Trophy className="h-4 w-4" /><span className="text-[11px] font-bold uppercase tracking-wide">{MATCH.stage}</span></div>
                <div className="text-lg font-black">VS</div>
                <div className="text-[11px] text-white/50">Jul 19 · 8:00 PM</div>
              </div>
              <div className="text-center">
                <div className="text-3xl">{away.flag}</div>
                <div className="text-xs font-semibold">{away.code}</div>
              </div>
            </div>
            <div className="text-sm text-white/55">
              <p className="font-semibold text-white/80">{MATCH.stadium}</p>
              <p>Attendance: {MATCH.attendance} · Gates open 3h before kickoff</p>
            </div>
          </div>

          <Link href="/navigation" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fifa-pink to-fifa-purple px-5 py-2.5 text-sm font-semibold">
            Explore the stadium <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Everything you need <AIBadge /></h2>
          <span className="text-xs text-white/40">Tap a card</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {FEATURES.map(({ href, label, desc, icon: Icon, from, to }) => (
            <Link key={href} href={href} className="glass card-3d group rounded-2xl p-4">
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold">{label}</p>
              <p className="mt-1 text-xs text-white/50">{desc}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-fifa-teal opacity-0 transition group-hover:opacity-100">
                Open <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
