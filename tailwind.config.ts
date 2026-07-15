import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  icon,
}: {
  title: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-5 mt-2">
      <div className="flex items-center gap-2">
        {icon}
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
      </div>
      {subtitle && <p className="mt-1 text-sm text-white/55">{subtitle}</p>}
    </div>
  );
}

export function Card({
  children,
  className = "",
  tilt = false,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  return (
    <div className={`glass rounded-2xl p-4 ${tilt ? "card-3d" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{
        background: color ? `${color}22` : "rgba(255,255,255,0.08)",
        color: color || "#fff",
        border: `1px solid ${color || "rgba(255,255,255,0.15)"}55`,
      }}
    >
      {children}
    </span>
  );
}

export function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fifa-pink/20 to-fifa-purple/20 px-2 py-0.5 text-[10px] font-semibold text-fifa-teal ring-1 ring-fifa-purple/40">
      ✦ GenAI
    </span>
  );
}
