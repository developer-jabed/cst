import PublicFooter from "@/components/shared/PublicFooter";
import PublicNavbar from "@/components/shared/PublicNavbar";
import React from "react";

// Fixed values so server and client render identically
const GOLD_DUST = [
  { left: "6%", size: 2, dur: 26, delay: 0 },
  { left: "14%", size: 3, dur: 34, delay: 8 },
  { left: "23%", size: 2, dur: 30, delay: 15 },
  { left: "34%", size: 2, dur: 38, delay: 4 },
  { left: "46%", size: 3, dur: 32, delay: 19 },
  { left: "57%", size: 2, dur: 28, delay: 11 },
  { left: "68%", size: 3, dur: 36, delay: 2 },
  { left: "77%", size: 2, dur: 31, delay: 22 },
  { left: "86%", size: 2, dur: 35, delay: 9 },
  { left: "94%", size: 3, dur: 29, delay: 16 },
];

const BG_CSS = `
@keyframes pl-drift-a { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(48px,32px,0) scale(1.08) } }
@keyframes pl-drift-b { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(-56px,-24px,0) scale(1.06) } }
@keyframes pl-drift-c { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(32px,-40px,0) scale(1.1) } }
@keyframes pl-sheen   { from { background-position: 0% 0% } to { background-position: 200% 0% } }
@keyframes pl-spin    { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
@keyframes pl-breathe { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
@keyframes pl-sweep   { 0% { transform: translateX(-130%) skewX(-14deg) } 45%,100% { transform: translateX(330%) skewX(-14deg) } }
@keyframes pl-rise {
  0%   { transform: translate3d(0,0,0); opacity: 0 }
  12%  { opacity: .75 }
  80%  { opacity: .35 }
  100% { transform: translate3d(14px,-105vh,0); opacity: 0 }
}
@keyframes pl-shimmer-x { 0%,100% { opacity: .35 } 50% { opacity: .9 } }

.pl-blob-a { animation: pl-drift-a 32s ease-in-out infinite, pl-breathe 14s ease-in-out infinite }
.pl-blob-b { animation: pl-drift-b 40s ease-in-out infinite, pl-breathe 18s ease-in-out infinite reverse }
.pl-blob-c { animation: pl-drift-c 36s ease-in-out infinite }
.pl-sheen  { background-size: 200% 100%; animation: pl-sheen 18s linear infinite }
.pl-conic-spin { animation: pl-spin 120s linear infinite }
.pl-sweep  { animation: pl-sweep 26s cubic-bezier(.45,.05,.25,1) infinite }
.pl-dust   { animation: pl-rise var(--dur) linear var(--delay) infinite; opacity: 0 }
.pl-edge   { animation: pl-shimmer-x 9s ease-in-out infinite }

.pl-conic {
  background: conic-gradient(from 0deg,
    rgba(5,150,105,.34), rgba(180,140,60,.28), rgba(13,148,136,.30),
    rgba(120,90,30,.22), rgba(5,150,105,.34));
}
.dark .pl-conic {
  background: conic-gradient(from 0deg,
    rgba(16,185,129,.20), rgba(201,162,75,.14), rgba(20,184,166,.18),
    rgba(120,90,30,.10), rgba(16,185,129,.20));
}

.pl-grain {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  background-size: 240px 240px;
}

.pl-linen {
  background-image:
    repeating-linear-gradient(45deg, rgba(6,78,59,.045) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(-45deg, rgba(6,78,59,.035) 0 1px, transparent 1px 4px);
}
.dark .pl-linen {
  background-image:
    repeating-linear-gradient(45deg, rgba(255,255,255,.022) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(-45deg, rgba(255,255,255,.016) 0 1px, transparent 1px 4px);
}

@media (prefers-reduced-motion: reduce) {
  .pl-blob-a, .pl-blob-b, .pl-blob-c, .pl-sheen, .pl-conic-spin,
  .pl-sweep, .pl-dust, .pl-edge { animation: none !important }
  .pl-dust, .pl-sweep { display: none }
}
`;

const PublicBackground = () => (
  <div
    aria-hidden
    className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#efebde] dark:bg-[#040c09]"
  >
    <style>{BG_CSS}</style>

    {/* Base diagonal gradient */}
    <div
      className="absolute inset-0 dark:hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(4,120,87,.14) 0%, rgba(241,238,227,0) 38%, rgba(241,238,227,0) 62%, rgba(180,140,60,.18) 100%)",
      }}
    />
    <div
      className="absolute inset-0 hidden dark:block"
      style={{
        background:
          "linear-gradient(135deg, rgba(16,185,129,.12) 0%, rgba(4,12,9,0) 40%, rgba(4,12,9,0) 60%, rgba(201,162,75,.10) 100%)",
      }}
    />

    {/* Slow rotating conic wash */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="pl-conic-spin pl-conic h-[1200px] w-[1200px] rounded-full opacity-70 blur-[110px] will-change-transform dark:opacity-80" />
    </div>

    {/* Corner radials */}
    <div
      className="absolute inset-0 dark:hidden"
      style={{
        background:
          "radial-gradient(1100px 650px at 100% 0%, rgba(5,120,85,.24), transparent 62%), radial-gradient(1000px 620px at 0% 100%, rgba(180,140,60,.24), transparent 62%), radial-gradient(700px 420px at 0% 0%, rgba(13,148,136,.10), transparent 65%), linear-gradient(180deg, rgba(255,255,255,.30), transparent 40%)",
      }}
    />
    <div
      className="absolute inset-0 hidden dark:block"
      style={{
        background:
          "radial-gradient(1100px 650px at 100% 0%, rgba(16,185,129,.20), transparent 62%), radial-gradient(1000px 620px at 0% 100%, rgba(201,162,75,.14), transparent 62%), radial-gradient(700px 420px at 0% 0%, rgba(20,184,166,.08), transparent 65%), linear-gradient(180deg, rgba(255,255,255,.02), transparent 40%)",
      }}
    />

    {/* Aurora blobs */}
    <div className="pl-blob-a absolute -right-28 -top-28 h-[480px] w-[480px] rounded-full bg-emerald-600/25 blur-[120px] will-change-transform dark:bg-emerald-500/18" />
    <div className="pl-blob-b absolute -bottom-36 left-1/4 h-[520px] w-[520px] rounded-full bg-amber-600/20 blur-[130px] will-change-transform dark:bg-amber-500/12" />
    <div className="pl-blob-c absolute left-1/2 top-1/3 h-[380px] w-[380px] rounded-full bg-teal-700/18 blur-[120px] will-change-transform dark:bg-teal-400/12" />

    {/* Linen weave */}
    <div className="pl-linen absolute inset-0" />

    {/* Brass grid */}
    <div
      className="absolute inset-0 opacity-[0.5] dark:opacity-[0.22]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(160,125,50,.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(160,125,50,.14) 1px, transparent 1px)",
        backgroundSize: "96px 96px",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, #000 20%, transparent 72%)",
        maskImage:
          "radial-gradient(ellipse at center, #000 20%, transparent 72%)",
      }}
    />

    {/* Light sweep */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="pl-sweep absolute -inset-y-1/4 left-0 w-[28%] bg-gradient-to-r from-transparent via-white/30 to-transparent mix-blend-soft-light will-change-transform dark:via-emerald-100/10" />
    </div>

    {/* Gold dust */}
    {GOLD_DUST.map((p, i) => (
      <span
        key={i}
        className="pl-dust absolute bottom-[-12px] rounded-full bg-[#c9a24b] shadow-[0_0_8px_2px_rgba(201,162,75,.45)] will-change-transform"
        style={
          {
            left: p.left,
            width: p.size,
            height: p.size,
            "--dur": `${p.dur}s`,
            "--delay": `${p.delay}s`,
          } as React.CSSProperties
        }
      />
    ))}

    {/* Vignette */}
    <div
      className="absolute inset-0 dark:hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 55%, rgba(30,40,30,.14) 100%)",
      }}
    />
    <div
      className="absolute inset-0 hidden dark:block"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.55) 100%)",
      }}
    />

    {/* Film grain */}
    <div className="pl-grain absolute inset-0 opacity-[0.16] mix-blend-multiply dark:opacity-[0.22] dark:mix-blend-overlay" />

    {/* Gold edges */}
    <div className="pl-sheen absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a24b]/80 to-transparent" />
    <div className="pl-edge absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a24b]/40 to-transparent" />
    <div className="pl-edge absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#c9a24b]/25 to-transparent [animation-delay:4s]" />
  </div>
);

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <PublicBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <PublicNavbar />

        <main className="relative flex-1">
          <div className="mx-auto w-full max-w-screen-2xl px-5 py-8 md:px-8 lg:px-10">
            <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700 motion-reduce:animate-none">
              {children}
            </div>
          </div>
        </main>

        <PublicFooter />
      </div>
    </div>
  );
};

export default CommonLayout;