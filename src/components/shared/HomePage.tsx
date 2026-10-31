import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Cpu,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";

export const revalidate = 1800;

const STATS = [
  { number: "4,500+", label: "Students", icon: Users },
  { number: "60+", label: "Years of Excellence", icon: Award },
  { number: "100+", label: "Faculty Members", icon: GraduationCap },
  { number: "6", label: "Technologies", icon: Cpu },
];

const PROGRAMS = [
  {
    short: "CST",
    name: "Computer Science & Technology",
    seats: "200",
    duration: "4 Years",
    description:
      "Programming, databases, networking, web development and software engineering.",
    tags: ["Programming", "Networking", "Web", "Database"],
  },
  {
    short: "ET",
    name: "Electrical Technology",
    seats: "200",
    duration: "4 Years",
    description:
      "Power systems, machines, electronics, industrial control and renewables.",
    tags: ["Power", "Machines", "Electronics", "Control"],
  },
  {
    short: "CT",
    name: "Civil Technology",
    seats: "200",
    duration: "4 Years",
    description:
      "Structural design, surveying, construction and environmental engineering.",
    tags: ["Structure", "Survey", "Construction", "Environment"],
  },
  {
    short: "MT",
    name: "Mechanical Technology",
    seats: "200",
    duration: "4 Years",
    description:
      "Machine design, manufacturing, thermodynamics and industrial automation.",
    tags: ["Design", "Manufacturing", "Thermo", "Automation"],
  },
  {
    short: "PT",
    name: "Power Technology",
    seats: "200",
    duration: "4 Years",
    description:
      "Thermal power, engines, plant operation, maintenance and energy management.",
    tags: ["Plant", "Engines", "Maintenance", "Energy"],
  },
  {
    short: "AIDT",
    name: "Architecture & Interior Design",
    seats: "100",
    duration: "4 Years",
    description:
      "Architectural drafting, building design, interior planning and 3D modeling.",
    tags: ["Drafting", "Design", "3D", "Interior"],
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen font-sans text-slate-900">
      {/* ═══════════════════════════════════════════
          HERO — deep emerald (pops off public bg)
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="relative bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#0f766e]">
          {/* texture + orbs */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#c9a24b]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

          {/* gold top line */}
          <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#c9a24b] to-transparent" />

          <div className="relative mx-auto max-w-screen-2xl px-5 py-14 sm:px-8 md:px-12 lg:px-16 lg:py-20">
            <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
              {/* Copy */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a24b]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-50">
                    Est. 1964 · Balubari, Dinajpur
                  </span>
                </div>

                <h1 className="text-[2.25rem] font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                  Department of{" "}
                  <span className="bg-gradient-to-r from-[#f0e6c8] via-[#c9a24b] to-[#e8d5a3] bg-clip-text text-transparent">
                    Computer Science &amp; Technology
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-emerald-50/85 sm:text-base">
                  Dinajpur Polytechnic Institute — one of the oldest and most
                  reputed government polytechnics in Bangladesh. Building skilled
                  technologists and industry-ready professionals since 1964.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a24b] to-[#b8923f] px-6 py-3 text-sm font-bold text-[#1a1508] shadow-lg shadow-black/20 transition hover:brightness-110 active:scale-[0.98]"
                  >
                    Apply for Admission
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                  >
                    View Programs
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap gap-6 border-t border-white/10 pt-8 sm:gap-10">
                  {[
                    { n: "4,500+", l: "Students" },
                    { n: "6", l: "Technologies" },
                    { n: "60+", l: "Years" },
                  ].map((s) => (
                    <div key={s.l}>
                      <div className="text-2xl font-black tabular-nums text-white">
                        {s.n}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-emerald-100/70">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logo card */}
              <div className="relative mx-auto w-full max-w-[320px] lg:max-w-none">
                <div className="rounded-3xl border border-white/15 bg-white p-6 shadow-2xl shadow-black/25 sm:p-8">
                  <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-[#f8f6ef] to-emerald-50">
                    <div className="relative h-36 w-36 sm:h-44 sm:w-44">
                      <Image
                        src="/dpi-logo.png"
                        alt="Dinajpur Polytechnic Institute"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  <div className="mt-5 text-center">
                    <p className="text-base font-bold text-slate-900">
                      Dinajpur Polytechnic Institute
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Government Polytechnic · BTEB
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-3 -right-2 rounded-xl border border-[#c9a24b]/40 bg-[#1a1508] px-4 py-2.5 shadow-xl sm:-bottom-4 sm:-right-3">
                  <div className="text-xl font-black text-[#c9a24b]">1100+</div>
                  <div className="text-[10px] font-medium text-white/60">
                    New students / year
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS — warm ivory strip
      ═══════════════════════════════════════════ */}
      <section className="border-b border-[#e8e0d0] bg-[#f7f3ea]">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-2 md:grid-cols-4">
          {STATS.map(({ number, label, icon: Icon }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3.5 px-6 py-8 md:justify-center ${
                i < 3 ? "md:border-r md:border-[#e8e0d0]" : ""
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#064e3b]/10 text-[#064e3b]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-black tabular-nums text-slate-900 sm:text-2xl">
                  {number}
                </div>
                <div className="text-xs font-medium text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PROGRAMS — clean white on ivory page feel
      ═══════════════════════════════════════════ */}
      <section className="bg-[#faf8f3] py-16 md:py-20">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b8923f]">
                Academic Programs
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                Our Technologies
              </h2>
              <p className="mt-2 max-w-lg text-sm text-slate-600 sm:text-[15px]">
                Four-year Diploma in Engineering under BTEB — modern labs and
                industry-aligned curriculum.
              </p>
            </div>
            <Link
              href="/login"
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#064e3b] hover:text-emerald-800"
            >
              View all
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((p) => (
              <article
                key={p.short}
                className="group overflow-hidden rounded-2xl border border-[#e8e0d0] bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:border-[#c9a24b]/40 hover:shadow-lg"
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#064e3b] to-[#c9a24b]" />
                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#064e3b]/8 px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#064e3b]">
                      {p.short}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {p.seats} seats · {p.duration}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold leading-snug text-slate-900 group-hover:text-[#064e3b] sm:text-base">
                    {p.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {p.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[#f7f3ea] px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CAMPUS
      ═══════════════════════════════════════════ */}
      <section className="border-t border-[#e8e0d0] bg-[#f7f3ea] py-16 md:py-20">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-8 text-center sm:mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b8923f]">
              Campus Life
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
              Life at DPI
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-12">
            <div className="rounded-2xl border border-[#e8e0d0] bg-white p-7 shadow-sm md:col-span-7 md:p-9">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#064e3b]/10 text-[#064e3b]">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Modern Computer Laboratories
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                High-speed labs for programming, networking, databases and web
                development — built for real industry skills.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Programming", "Networking", "Web Dev", "Database"].map(
                  (t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#f7f3ea] px-2.5 py-1 text-[11px] font-semibold text-[#064e3b]"
                    >
                      {t}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#0f766e] p-7 text-white shadow-lg md:col-span-5 md:p-9">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#c9a24b]/20 blur-2xl" />
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-100/80">
                Campus
              </p>
              <p className="mt-3 text-3xl font-black sm:text-4xl">16+ Acres</p>
              <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
                Academic buildings, workshops, labs, hostels, mosque, auditorium
                and playground.
              </p>
              <div className="mt-6 border-t border-white/15 pt-4">
                <p className="flex items-center gap-1.5 text-xs text-emerald-100/80">
                  <MapPin className="h-3.5 w-3.5" />
                  Under BTEB · Ministry of Education
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA — ivory + gold, not black
      ═══════════════════════════════════════════ */}
      <section className="bg-[#faf8f3] pb-16 pt-4 md:pb-20">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 md:px-12 lg:px-16">
          <div className="relative overflow-hidden rounded-2xl border border-[#c9a24b]/30 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#0f766e] px-6 py-12 text-center shadow-xl md:px-12 md:py-14">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a24b] to-transparent" />
            <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-[#c9a24b]/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-teal-300/10 blur-3xl" />

            <div className="relative">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#c9a24b] text-[#1a1508] shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">
                Ready to start your technical career?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-emerald-50/85 sm:text-base">
                Admissions open for the next session. Join a trusted polytechnic
                in northern Bangladesh.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a24b] to-[#b8923f] px-7 py-3 text-sm font-bold text-[#1a1508] shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-xl border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}