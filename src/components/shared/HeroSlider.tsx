"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const INTERVAL = 6500; // ms per slide

// Put your 5 photos in /public/slides/ (slide-1.jpg … slide-5.jpg).
// If an image is missing, the gradient fallback still looks good.
const SLIDES = [
  {
    image: "/slides/slide-1.jpg",
    eyebrow: "Est. 1964 · Balubari, Dinajpur",
    title: "Where Future",
    accent: "Technologists Rise",
    text: "One of the oldest and most reputed government polytechnics in Bangladesh — building skilled, industry-ready professionals for over 60 years.",
    cta: { label: "Explore Institute", href: "/login" },
    tab: "Welcome",
    fallback: "from-[#064e3b] via-[#065f46] to-[#0f766e]",
  },
  {
    image: "/slides/slide-2.jpg",
    eyebrow: "Computer Science & Technology",
    title: "Code. Network.",
    accent: "Build The Web",
    text: "Modern labs for programming, databases, networking and web development — real skills for real industry jobs.",
    cta: { label: "View Programs", href: "/login" },
    tab: "CST Labs",
    fallback: "from-[#0f172a] via-[#064e3b] to-[#0f766e]",
  },
  {
    image: "/slides/slide-3.jpg",
    eyebrow: "Campus Life",
    title: "16+ Acres of",
    accent: "Pure Learning",
    text: "Academic buildings, workshops, hostels, mosque, auditorium and playground — everything a student needs, in one green campus.",
    cta: { label: "Life at DPI", href: "/login" },
    tab: "Campus",
    fallback: "from-[#065f46] via-[#0f766e] to-[#134e4a]",
  },
  {
    image: "/slides/slide-4.jpg",
    eyebrow: "6 Technologies · BTEB",
    title: "Six Paths.",
    accent: "One Great Future",
    text: "Computer, Electrical, Civil, Mechanical, Power and Architecture — four-year diploma programs with industry-aligned curriculum.",
    cta: { label: "Our Technologies", href: "/login" },
    tab: "Programs",
    fallback: "from-[#1a1508] via-[#064e3b] to-[#065f46]",
  },
  {
    image: "/slides/slide-5.jpg",
    eyebrow: "Admissions Open",
    title: "Start Your",
    accent: "Technical Career",
    text: "1100+ new students join every year. Apply now and become part of a trusted polytechnic in northern Bangladesh.",
    cta: { label: "Apply Now", href: "/login" },
    tab: "Admission",
    fallback: "from-[#0f766e] via-[#065f46] to-[#064e3b]",
  },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const [touchX, setTouchX] = useState<number | null>(null);

  const total = SLIDES.length;
  const go = useCallback((i: number) => setIndex((i + total) % total), [total]);
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  // keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <section
      className={`hs relative isolate overflow-hidden bg-[#04231b] text-white ${paused ? "hs-paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX == null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        setTouchX(null);
      }}
      aria-roledescription="carousel"
      aria-label="Dinajpur Polytechnic highlights"
    >
      <style>{`
        @keyframes hs-kb{from{transform:scale(1.04)}to{transform:scale(1.22)}}
        @keyframes hs-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes hs-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        .hs-kb{animation:hs-kb 10s ease-out forwards}
        .hs-fill{transform-origin:left;animation:hs-fill ${INTERVAL}ms linear forwards}
        .hs-orb{animation:hs-float 7s ease-in-out infinite}
        .hs-paused .hs-kb,.hs-paused .hs-fill{animation-play-state:paused}
        @media (prefers-reduced-motion:reduce){.hs-kb,.hs-orb{animation:none}}
      `}</style>

      <div className="relative h-[82vh] min-h-[560px] max-h-[820px]">
        {/* ── Slides ─────────────────────────────────────── */}
        {SLIDES.map((s, i) => {
          const active = i === index;
          const d = (ms: number) => ({ transitionDelay: active ? `${ms}ms` : "0ms" });
          const reveal = active ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0";

          return (
            <div
              key={s.tab}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
              }`}
            >
              {/* background: gradient fallback + photo with Ken Burns zoom */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.fallback}`} />
              {!failed.has(i) && (
                <div
                  key={active ? "on" : "off"}
                  className={`absolute inset-0 ${active ? "hs-kb" : ""}`}
                  style={{ transformOrigin: i % 2 ? "70% 40%" : "30% 60%" }}
                >
                  <Image
                    src={s.image}
                    alt={`${s.title} ${s.accent}`}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover"
                    onError={() => setFailed((f) => new Set(f).add(i))}
                  />
                </div>
              )}

              {/* overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#031a14]/95 via-[#052e22]/70 to-[#064e3b]/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031a14]/90 via-transparent to-[#031a14]/40" />
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px,#fff 1px,transparent 0)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="hs-orb absolute -right-24 top-10 h-[26rem] w-[26rem] rounded-full bg-[#c9a24b]/20 blur-3xl" />
              <div className="hs-orb absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl [animation-delay:2s]" />

              {/* giant outlined number */}
              <div
                className={`pointer-events-none absolute -right-2 bottom-24 select-none text-[11rem] font-black leading-none transition-all duration-1000 sm:text-[16rem] lg:text-[22rem] ${
                  active ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ WebkitTextStroke: "2px rgba(201,162,75,.35)", color: "transparent", ...d(200) }}
              >
                {pad(i + 1)}
              </div>

              {/* copy */}
              <div className="relative mx-auto flex h-full max-w-screen-2xl items-center px-5 pb-28 sm:px-8 md:px-12 lg:px-16">
                <div className="max-w-2xl">
                  <div
                    className={`mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md transition-all duration-700 ${reveal}`}
                    style={d(300)}
                  >
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a24b]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-50">
                      {s.eyebrow}
                    </span>
                  </div>

                  <h2
                    className={`text-[2.5rem] font-black leading-[1.05] tracking-tight transition-all duration-700 sm:text-6xl lg:text-7xl ${reveal}`}
                    style={d(450)}
                  >
                    {s.title}
                    <span className="mt-1 block bg-gradient-to-r from-[#f0e6c8] via-[#c9a24b] to-[#e8d5a3] bg-clip-text text-transparent">
                      {s.accent}
                    </span>
                  </h2>

                  <div
                    className={`mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#c9a24b] to-transparent transition-all duration-1000 ${
                      active ? "w-24 opacity-100" : "w-0 opacity-0"
                    }`}
                    style={d(600)}
                  />

                  <p
                    className={`mt-6 max-w-xl text-[15px] leading-relaxed text-emerald-50/90 transition-all duration-700 sm:text-lg ${reveal}`}
                    style={d(700)}
                  >
                    {s.text}
                  </p>

                  <div
                    className={`mt-9 flex flex-wrap gap-3 transition-all duration-700 ${reveal}`}
                    style={d(850)}
                  >
                    <Link
                      href={s.cta.href}
                      tabIndex={active ? 0 : -1}
                      className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a24b] to-[#b8923f] px-7 py-3.5 text-sm font-bold text-[#1a1508] shadow-xl shadow-black/30 transition hover:brightness-110 active:scale-[0.98]"
                    >
                      {s.cta.label}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/login"
                      tabIndex={active ? 0 : -1}
                      className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold backdrop-blur-md transition hover:bg-white/20"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Arrows ─────────────────────────────────────── */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 backdrop-blur-md transition hover:border-[#c9a24b] hover:bg-[#c9a24b] hover:text-[#1a1508] md:flex lg:left-6"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 backdrop-blur-md transition hover:border-[#c9a24b] hover:bg-[#c9a24b] hover:text-[#1a1508] md:flex lg:right-6"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* ── Bottom bar: segmented progress tabs ─────────── */}
        <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-gradient-to-t from-black/60 to-transparent">
          <div className="mx-auto flex max-w-screen-2xl items-end gap-3 px-5 pb-5 pt-8 sm:px-8 md:px-12 lg:px-16">
            <div className="grid flex-1 grid-cols-5 gap-2 sm:gap-4">
              {SLIDES.map((s, i) => {
                const active = i === index;
                const done = i < index;
                return (
                  <button
                    key={s.tab}
                    onClick={() => go(i)}
                    aria-label={`Go to slide ${i + 1}: ${s.tab}`}
                    aria-current={active}
                    className="group text-left"
                  >
                    <span
                      className={`mb-2 hidden items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] transition sm:flex ${
                        active ? "text-[#c9a24b]" : "text-white/50 group-hover:text-white/80"
                      }`}
                    >
                      <span className="tabular-nums">{pad(i + 1)}</span>
                      {s.tab}
                    </span>
                    <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/20">
                      {active ? (
                        <span
                          key={`fill-${index}`}
                          className="hs-fill block h-full w-full rounded-full bg-gradient-to-r from-[#c9a24b] to-[#f0e6c8]"
                          onAnimationEnd={next}
                        />
                      ) : (
                        <span
                          className={`block h-full rounded-full bg-[#c9a24b]/70 ${done ? "w-full" : "w-0"}`}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              className="mb-[-4px] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition hover:bg-white/20"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* gold top line */}
      <div className="absolute inset-x-0 top-0 z-20 h-[3px] bg-gradient-to-r from-transparent via-[#c9a24b] to-transparent" />
    </section>
  );
}