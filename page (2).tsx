@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --glass: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.12);
}

* { -webkit-tap-highlight-color: transparent; }

html, body { max-width: 100vw; }

body {
  color: #EAF0FF;
  background: #060818;
  font-family: var(--font-display), system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

/* Animated multicolor World Cup backdrop */
.wc-bg {
  position: fixed;
  inset: 0;
  z-index: -2;
  background:
    radial-gradient(1200px 600px at 10% -10%, rgba(123,47,247,0.28), transparent 60%),
    radial-gradient(1000px 500px at 100% 0%, rgba(255,45,120,0.22), transparent 55%),
    radial-gradient(900px 700px at 50% 120%, rgba(0,224,198,0.20), transparent 55%),
    linear-gradient(180deg, #070A1F 0%, #060818 100%);
}
.wc-grid {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(circle at 50% 30%, black, transparent 80%);
  animation: gridDrift 22s linear infinite;
}
@keyframes gridDrift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 44px 44px, 44px 44px; }
}

.glass {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.card-3d {
  transform-style: preserve-3d;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  will-change: transform;
}
.card-3d:hover {
  transform: perspective(900px) rotateX(4deg) rotateY(-4deg) translateZ(8px);
  box-shadow: 0 24px 60px -20px rgba(123,47,247,0.5);
}

.gradient-text {
  background: linear-gradient(90deg, #FF2D78, #F4C430, #00E0C6, #1E90FF, #7B2FF7);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 8s ease infinite;
}
@keyframes shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.chip {
  border: 1px solid var(--glass-border);
  background: rgba(255,255,255,0.05);
  border-radius: 999px;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Pitch stripes for map */
.pitch-stripes {
  background:
    repeating-linear-gradient(90deg, #0b7a3b 0 40px, #0e8a44 40px 80px);
}

button, a { transition: all 0.18s ease; }
