import DashboardNavbar from "@/components/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import React from "react";

// Fixed values (no Math.random) so server and client render identically.
// left = horizontal position, size = px, dur = seconds, delay = seconds.
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

// Scoped keyframes + texture layers.
const BG_CSS = `
@keyframes dl-drift-a { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(48px,32px,0) scale(1.08) } }
@keyframes dl-drift-b { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(-56px,-24px,0) scale(1.06) } }
@keyframes dl-drift-c { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(32px,-40px,0) scale(1.1) } }
@keyframes dl-sheen   { from { background-position: 0% 0% } to { background-position: 200% 0% } }
@keyframes dl-spin    { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
@keyframes dl-breathe { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
@keyframes dl-sweep   { 0% { transform: translateX(-130%) skewX(-14deg) } 45%,100% { transform: translateX(330%) skewX(-14deg) } }
@keyframes dl-rise {
  0%   { transform: translate3d(0,0,0); opacity: 0 }
  12%  { opacity: .75 }
  80%  { opacity: .35 }
  100% { transform: translate3d(14px,-105vh,0); opacity: 0 }
}
@keyframes dl-shimmer-x { 0%,100% { opacity: .35 } 50% { opacity: .9 } }

.dl-blob-a { animation: dl-drift-a 32s ease-in-out infinite, dl-breathe 14s ease-in-out infinite }
.dl-blob-b { animation: dl-drift-b 40s ease-in-out infinite, dl-breathe 18s ease-in-out infinite reverse }
.dl-blob-c { animation: dl-drift-c 36s ease-in-out infinite }
.dl-sheen  { background-size: 200% 100%; animation: dl-sheen 18s linear infinite }
.dl-conic-spin { animation: dl-spin 120s linear infinite }
.dl-sweep  { animation: dl-sweep 26s cubic-bezier(.45,.05,.25,1) infinite }
.dl-dust   { animation: dl-rise var(--dur) linear var(--delay) infinite; opacity: 0 }
.dl-edge   { animation: dl-shimmer-x 9s ease-in-out infinite }

/* Slowly rotating conic wash — the main source of gradient richness */
.dl-conic {
  background: conic-gradient(from 0deg,
    rgba(5,150,105,.34), rgba(180,140,60,.28), rgba(13,148,136,.30),
    rgba(120,90,30,.22), rgba(5,150,105,.34));
}
.dark .dl-conic {
  background: conic-gradient(from 0deg,
    rgba(16,185,129,.20), rgba(201,162,75,.14), rgba(20,184,166,.18),
    rgba(120,90,30,.10), rgba(16,185,129,.20));
}

/* Film grain */
.dl-grain {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  background-size: 240px 240px;
}

/* Fine linen weave */
.dl-linen {
  background-image:
    repeating-linear-gradient(45deg, rgba(6,78,59,.045) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(-45deg, rgba(6,78,59,.035) 0 1px, transparent 1px 4px);
}
.dark .dl-linen {
  background-image:
    repeating-linear-gradient(45deg, rgba(255,255,255,.022) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(-45deg, rgba(255,255,255,.016) 0 1px, transparent 1px 4px);
}

@media (prefers-reduced-motion: reduce) {
  .dl-blob-a, .dl-blob-b, .dl-blob-c, .dl-sheen, .dl-conic-spin,
  .dl-sweep, .dl-dust, .dl-edge { animation: none !important }
  .dl-dust, .dl-sweep { display: none }
}
`;

/** Shared background — sits behind sidebar, navbar and content */
const DashboardBackground = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 overflow-hidden bg-[#efebde] dark:bg-[#040c09]"
  >
    <style>{BG_CSS}</style>

    {/* Base diagonal gradient — emerald tint to cream to brass tint */}
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
      <div className="dl-conic-spin dl-conic h-[1200px] w-[1200px] rounded-full opacity-70 blur-[110px] will-change-transform dark:opacity-80" />
    </div>

    {/* Deep colour wash — stronger radial corners */}
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

    {/* Drifting + breathing aurora blobs */}
    <div className="dl-blob-a absolute -right-28 -top-28 h-[480px] w-[480px] rounded-full bg-emerald-600/25 blur-[120px] will-change-transform dark:bg-emerald-500/18" />
    <div className="dl-blob-b absolute -bottom-36 left-1/4 h-[520px] w-[520px] rounded-full bg-amber-600/20 blur-[130px] will-change-transform dark:bg-amber-500/12" />
    <div className="dl-blob-c absolute left-1/2 top-1/3 h-[380px] w-[380px] rounded-full bg-teal-700/18 blur-[120px] will-change-transform dark:bg-teal-400/12" />

    {/* Linen weave texture */}
    <div className="dl-linen absolute inset-0" />

    {/* Fine brass hairline grid, fading toward the edges */}
    <div
      className="absolute inset-0 opacity-[0.5] dark:opacity-[0.22]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(160,125,50,.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(160,125,50,.14) 1px, transparent 1px)",
        backgroundSize: "96px 96px",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, #000 20%, transparent 72%)",
        maskImage: "radial-gradient(ellipse at center, #000 20%, transparent 72%)",
      }}
    />

    {/* Light sweep — a soft beam crossing the surface every ~26s */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="dl-sweep absolute -inset-y-1/4 left-0 w-[28%] bg-gradient-to-r from-transparent via-white/30 to-transparent mix-blend-soft-light will-change-transform dark:via-emerald-100/10" />
    </div>

    {/* Floating gold dust — tiny motes rising slowly */}
    {GOLD_DUST.map((p, i) => (
      <span
        key={i}
        className="dl-dust absolute bottom-[-12px] rounded-full bg-[#c9a24b] shadow-[0_0_8px_2px_rgba(201,162,75,.45)] will-change-transform"
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
    <div className="dl-grain absolute inset-0 opacity-[0.16] mix-blend-multiply dark:opacity-[0.22] dark:mix-blend-overlay" />

    {/* Gold sheen along the top, breathing hairlines on the bottom and left */}
    <div className="dl-sheen absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a24b]/80 to-transparent" />
    <div className="dl-edge absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a24b]/40 to-transparent" />
    <div className="dl-edge absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#c9a24b]/25 to-transparent [animation-delay:4s]" />
  </div>
);

const CommonDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* Shared background */}
      <DashboardBackground />

      {/* Sidebar */}
      <div className="relative z-10">
        <DashboardSidebar />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <DashboardNavbar />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-transparent [scrollbar-color:rgba(201,162,75,0.45)_transparent] [scrollbar-width:thin]">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 md:px-6 lg:px-8">
            {/* Gentle page entrance */}
            <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700 motion-reduce:animate-none">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommonDashboardLayout;