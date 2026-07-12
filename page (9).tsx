import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import AIAgent from "@/components/AIAgent";

export const metadata: Metadata = {
  title: "FanZone 26 — FIFA World Cup 2026",
  description:
    "GenAI-powered fan companion for the FIFA World Cup 2026: navigation, crowd flow, live translation, community, SOS and more.",
};

export const viewport: Viewport = {
  themeColor: "#060818",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="wc-bg" />
        <div className="wc-grid" />
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:pb-12">
          {children}
        </main>
        <AIAgent />
      </body>
    </html>
  );
}
