"use client";

import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Inbox,
  TrendingUp,
  UserCheck,
  UserX,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  IStudentDashboard,
  IStudentMonthlyAttendance,
  IStudentNotice,
} from "@/service/meta/studentMeta.service";

interface Props {
  data: IStudentDashboard;
  greeting: string;
  today: string;
}

interface IAttendanceTotals {
  present: number;
  absent: number;
  late: number;
}

interface IStatCard {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  grad: string;
  glow: string;
}

interface ITrendPoint {
  i: number;
  m: IStudentMonthlyAttendance;
  x: number;
  y: number;
}

interface IDonutSeg {
  label: string;
  value: number;
  color: string;
  text: string;
}

type NoticeTab = "mine" | "feed";

// ─── Animations (scoped keyframes) ────────────────────────────────────────────
const CSS = `
@keyframes sd-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-16px) } }
@keyframes sd-fade { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@keyframes sd-ping { 0% { transform: scale(.8); opacity: .7 } 100% { transform: scale(2.2); opacity: 0 } }
@keyframes sd-shimmer { from { transform: translateX(-130%) } to { transform: translateX(230%) } }
.sd-float { animation: sd-float 8s ease-in-out infinite }
.sd-float-slow { animation: sd-float 11s ease-in-out infinite reverse }
.sd-fade { animation: sd-fade .55s ease both }
.sd-ping { animation: sd-ping 1.8s ease-out infinite }
.sd-shimmer::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.18), transparent); animation: sd-shimmer 4.5s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .sd-float, .sd-float-slow, .sd-fade, .sd-ping, .sd-shimmer::after { animation: none !important }
  .sd-anim, .sd-anim * { transition: none !important }
}
`;

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = setTimeout(() => setSeen(true), 0);
      return () => clearTimeout(id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, seen] as const;
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`sd-anim transition-all duration-700 ease-out ${
        seen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen) return;
    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let raf = 0;
    const start = performance.now();
    const dur = reduced ? 0 : 1300;
    const tick = (t: number) => {
      const p = dur === 0 ? 1 : Math.min(1, (t - start) / dur);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);

  return (
    <span ref={ref}>
      {Math.round(n).toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TZ = "Asia/Dhaka";

function fmtFull(d?: string | null): string {
  if (!d) return "—";
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "—";
  return x.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });
}

function labelOf(s?: string | null): string {
  if (!s) return "General";
  return s
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function priorityUI(p?: string | null): { cls: string; dot: string } {
  const t = (p || "").toLowerCase();
  if (/urgent|high|critical|important/.test(t))
    return { cls: "bg-rose-100 text-rose-700", dot: "bg-rose-500" };
  if (/medium|normal/.test(t))
    return { cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" };
  if (/low/.test(t)) return { cls: "bg-sky-100 text-sky-700", dot: "bg-sky-500" };
  return { cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
}

// ─── Section title ────────────────────────────────────────────────────────────
function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  right,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

// ─── Ring (hero) ──────────────────────────────────────────────────────────────
function Ring({ value }: { value: number }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.1);
  const R = 54;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div ref={ref} className="relative flex h-40 w-40 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl" />
      <svg viewBox="0 0 132 132" className="relative h-full w-full -rotate-90">
        <defs>
          <linearGradient id="sd-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="55%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
        </defs>
        <circle cx="66" cy="66" r={R} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="11" />
        <circle
          cx="66"
          cy="66"
          r={R}
          fill="none"
          stroke="url(#sd-ring)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={seen ? C - (C * pct) / 100 : C}
          className="sd-anim transition-[stroke-dashoffset] duration-[1600ms] ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-extrabold text-white">
          <CountUp value={pct} suffix="%" />
        </p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-100">
          Attendance
        </p>
      </div>
    </div>
  );
}

// ─── Trend chart ──────────────────────────────────────────────────────────────
function TrendChart({ months }: { months: IStudentMonthlyAttendance[] }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const [hover, setHover] = useState<number | null>(null);

  const W = 680;
  const H = 250;
  const L = 40;
  const R = 16;
  const T = 20;
  const B = 34;
  const innerW = W - L - R;
  const innerH = H - T - B;
  const n = months.length;

  const x = (i: number): number =>
    n <= 1 ? L + innerW / 2 : L + (innerW * i) / (n - 1);
  const y = (v: number): number =>
    T + innerH - (innerH * Math.max(0, Math.min(100, v))) / 100;

  const pts: ITrendPoint[] = months
    .map(
      (m: IStudentMonthlyAttendance, i: number): ITrendPoint => ({
        i,
        m,
        x: x(i),
        y: y(m.attendanceRate),
      })
    )
    .filter((p: ITrendPoint) => p.m.total > 0);

  const line = pts
    .map((p: ITrendPoint, k: number) => {
      if (k === 0) return `M${p.x},${p.y}`;
      const prev = pts[k - 1];
      const mx = (prev.x + p.x) / 2;
      return `C${mx},${prev.y} ${mx},${p.y} ${p.x},${p.y}`;
    })
    .join(" ");

  const area = pts.length
    ? `${line} L${pts[pts.length - 1].x},${T + innerH} L${pts[0].x},${T + innerH} Z`
    : "";

  const hovered: ITrendPoint | null =
    pts.find((p: ITrendPoint) => p.i === hover) ?? null;

  if (pts.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center text-slate-400">
        <span className="text-4xl">📉</span>
        <p className="mt-2 text-sm">No attendance data in the last 12 months</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Monthly attendance rate">
        <defs>
          <linearGradient id="sd-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sd-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((g: number) => (
          <g key={g}>
            <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} stroke="#e2e8f0" strokeDasharray="4 6" />
            <text x={L - 8} y={y(g) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
              {g}%
            </text>
          </g>
        ))}

        {months.map((m: IStudentMonthlyAttendance, i: number) => (
          <text key={`${m.year}-${m.month}`} x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">
            {m.label}
          </text>
        ))}

        <path
          d={area}
          fill="url(#sd-area)"
          className="sd-anim transition-opacity duration-1000"
          style={{ opacity: seen ? 1 : 0, transitionDelay: "500ms" }}
        />

        <path
          d={line}
          pathLength={1}
          fill="none"
          stroke="url(#sd-line)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={seen ? 0 : 1}
          className="sd-anim transition-[stroke-dashoffset] duration-[1800ms] ease-out"
        />

        {hovered && (
          <line x1={hovered.x} x2={hovered.x} y1={T} y2={T + innerH} stroke="#10b981" strokeOpacity="0.35" strokeDasharray="3 4" />
        )}

        {pts.map((p: ITrendPoint, k: number) => (
          <circle
            key={p.i}
            cx={p.x}
            cy={p.y}
            r={hover === p.i ? 7 : 4.5}
            fill="#fff"
            stroke="#059669"
            strokeWidth="3"
            className="sd-anim transition-all duration-300"
            style={{ opacity: seen ? 1 : 0, transitionDelay: `${700 + k * 90}ms` }}
          />
        ))}

        {pts.map((p: ITrendPoint) => (
          <rect
            key={`hit-${p.i}`}
            x={p.x - innerW / Math.max(1, n - 1) / 2}
            y={T}
            width={innerW / Math.max(1, n - 1)}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(p.i)}
          />
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 w-40 -translate-x-1/2 -translate-y-full rounded-2xl bg-slate-900/95 p-3 text-xs text-white shadow-2xl backdrop-blur"
          style={{
            left: `${Math.max(14, Math.min(86, (hovered.x / W) * 100))}%`,
            top: `${(hovered.y / H) * 100}%`,
            marginTop: "-12px",
          }}
        >
          <p className="font-bold text-emerald-300">{hovered.m.label}</p>
          <p className="mt-0.5 text-lg font-extrabold">{hovered.m.attendanceRate}%</p>
          <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-300">
            <span>Present</span>
            <b className="text-right text-emerald-300">{hovered.m.present}</b>
            <span>Absent</span>
            <b className="text-right text-rose-300">{hovered.m.absent}</b>
            <span>Late</span>
            <b className="text-right text-amber-300">{hovered.m.late}</b>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Donut ────────────────────────────────────────────────────────────────────
function Donut({ present, absent, late }: IAttendanceTotals) {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const total = present + absent + late;
  const r = 52;
  const C = 2 * Math.PI * r;

  const segs: IDonutSeg[] = [
    { label: "Present", value: present, color: "#10b981", text: "text-emerald-600" },
    { label: "Absent", value: absent, color: "#f43f5e", text: "text-rose-600" },
    { label: "Late", value: late, color: "#f59e0b", text: "text-amber-600" },
  ];

  let acc = 0;
  const drawn = segs.map((s: IDonutSeg) => {
    const len = total > 0 ? (s.value / total) * C : 0;
    const out = { ...s, len, offset: acc };
    acc += len;
    return out;
  });

  if (total === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center text-slate-400">
        <span className="text-4xl">🍩</span>
        <p className="mt-2 text-sm">No records yet</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="flex flex-col items-center gap-5">
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90">
          <circle cx="66" cy="66" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
          {drawn.map((s, i: number) => (
            <circle
              key={s.label}
              cx="66"
              cy="66"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeLinecap="butt"
              strokeDasharray={`${seen ? Math.max(0, s.len - 2) : 0} ${C}`}
              strokeDashoffset={-s.offset}
              className="sd-anim transition-[stroke-dasharray] duration-[1400ms] ease-out"
              style={{ transitionDelay: `${i * 250}ms` }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-extrabold text-slate-900">
            <CountUp value={Math.round((present / total) * 100)} suffix="%" />
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Present
          </p>
        </div>
      </div>

      <ul className="grid w-full grid-cols-3 gap-2 text-center">
        {segs.map((s: IDonutSeg) => (
          <li key={s.label} className="rounded-xl bg-slate-50 px-2 py-2">
            <span className="mx-auto mb-1 block h-1.5 w-6 rounded-full" style={{ background: s.color }} />
            <p className={`text-base font-extrabold ${s.text}`}>{s.value.toLocaleString("en-US")}</p>
            <p className="text-[11px] text-slate-500">{s.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Monthly breakdown bars ───────────────────────────────────────────────────
function MonthlyBars({ months }: { months: IStudentMonthlyAttendance[] }) {
  const rows = months.filter((m: IStudentMonthlyAttendance) => m.total > 0).slice(-6).reverse();

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-slate-400">
        <CalendarCheck className="h-10 w-10" />
        <p className="mt-2 text-sm">No monthly records yet</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {rows.map((m: IStudentMonthlyAttendance, i: number) => (
        <li key={`${m.year}-${m.month}`} style={{ animationDelay: `${i * 70}ms` }} className="sd-fade">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-800">{m.label}</span>
            <span className="text-xs text-slate-500">
              <b className="text-emerald-600">{m.present}</b> P ·{" "}
              <b className="text-rose-600">{m.absent}</b> A ·{" "}
              <b className="text-amber-600">{m.late}</b> L
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              style={{ width: `${Math.max(0, Math.min(100, m.attendanceRate))}%` }}
            />
          </div>
          <p className="mt-1 text-right text-[11px] font-semibold text-slate-500">
            {m.attendanceRate}%
          </p>
        </li>
      ))}
    </ul>
  );
}

// ─── Notice list ──────────────────────────────────────────────────────────────
function NoticeList({ items, empty }: { items: IStudentNotice[]; empty: string }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-slate-400">
        <Inbox className="h-10 w-10" />
        <p className="mt-2 text-sm">{empty}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((n: IStudentNotice, i: number) => {
        const pr = priorityUI(n.priority);
        return (
          <li
            key={n.id}
            style={{ animationDelay: `${i * 70}ms` }}
            className="sd-fade group flex gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 transition hover:border-emerald-200 hover:shadow-md"
          >
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${pr.dot}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800 transition group-hover:text-emerald-700">
                {n.title}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className={`rounded-full px-2 py-0.5 font-semibold ${pr.cls}`}>
                  {labelOf(n.priority)}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  {labelOf(n.audienceType)}
                </span>
                {n.group && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                    {n.group.name}
                  </span>
                )}
                <span className="text-slate-400">{fmtFull(n.createdAt)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentDashboardClient({ data, greeting, today }: Props) {
  const [tab, setTab] = useState<NoticeTab>("feed");

  const months: IStudentMonthlyAttendance[] = useMemo(
    () => data.monthly?.attendance ?? [],
    [data]
  );

  const myNotices: IStudentNotice[] = data.recent?.myNotices ?? [];
  const feedNotices: IStudentNotice[] = data.recent?.feedNotices ?? [];

  const totals: IAttendanceTotals = useMemo(
    () =>
      months.reduce<IAttendanceTotals>(
        (a: IAttendanceTotals, m: IStudentMonthlyAttendance) => ({
          present: a.present + m.present,
          absent: a.absent + m.absent,
          late: a.late + m.late,
        }),
        { present: 0, absent: 0, late: 0 }
      ),
    [months]
  );

  const totalRecords = totals.present + totals.absent + totals.late;

  // Prefer the backend's overall rate when provided, else use the 12-month figure
  const apiRate =
    typeof data.overview?.overallAttendanceRate === "number"
      ? (data.overview.overallAttendanceRate as number)
      : 0;
  const rate =
    apiRate > 0
      ? apiRate
      : totalRecords > 0
      ? Math.round((totals.present / totalRecords) * 100)
      : 0;

  const withData: IStudentMonthlyAttendance[] = months.filter(
    (m: IStudentMonthlyAttendance) => m.total > 0
  );
  const best: IStudentMonthlyAttendance | null = withData.length
    ? withData.reduce((a: IStudentMonthlyAttendance, b: IStudentMonthlyAttendance) =>
        b.attendanceRate > a.attendanceRate ? b : a
      )
    : null;
  const avg = withData.length
    ? Math.round(
        withData.reduce(
          (s: number, m: IStudentMonthlyAttendance) => s + m.attendanceRate,
          0
        ) / withData.length
      )
    : 0;

  const stats: IStatCard[] = [
    { label: "Present", value: totals.present, icon: UserCheck, grad: "from-emerald-500 to-teal-500", glow: "shadow-emerald-200" },
    { label: "Absent", value: totals.absent, icon: UserX, grad: "from-rose-500 to-pink-500", glow: "shadow-rose-200" },
    { label: "Late", value: totals.late, icon: Clock, grad: "from-amber-500 to-orange-400", glow: "shadow-amber-200" },
    { label: "Total Records", value: totalRecords, icon: CalendarCheck, grad: "from-sky-500 to-cyan-500", glow: "shadow-sky-200" },
    { label: "Active Months", value: withData.length, icon: CheckCircle2, grad: "from-lime-500 to-green-600", glow: "shadow-lime-200" },
    { label: "Attendance Rate", value: rate, suffix: "%", icon: TrendingUp, grad: "from-slate-700 to-emerald-800", glow: "shadow-slate-300" },
  ];

  const tabs: { key: NoticeTab; label: string; count: number }[] = [
    { key: "feed", label: "Notice Feed", count: feedNotices.length },
    { key: "mine", label: "My Notices", count: myNotices.length },
  ];

  return (
    <div className="space-y-10">
      <style>{CSS}</style>

      {/* ───────── Hero ───────── */}
      <section className="sd-shimmer relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-950 via-emerald-900 to-emerald-600 p-6 text-white shadow-2xl shadow-emerald-900/20 sm:p-10">
        <div className="sd-float pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="sd-float-slow pointer-events-none absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
              <span className="relative flex h-2.5 w-2.5">
                <span className="sd-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </span>
              Student Dashboard
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {greeting}{" "}
              <span className="bg-gradient-to-r from-amber-200 to-yellow-100 bg-clip-text text-transparent">
                👋
              </span>
            </h1>
            <p className="mt-2 text-emerald-100">
              Here&apos;s your attendance and notices at a glance.
            </p>
            <p className="mt-1 text-sm text-emerald-200/80">{today}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <UserCheck className="h-4 w-4 text-emerald-300" />
                <b>{totals.present}</b> present
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <UserX className="h-4 w-4 text-rose-300" />
                <b>{totals.absent}</b> absent
              </span>
            </div>
          </div>

          <div className="mx-auto md:mx-0">
            <Ring value={rate} />
          </div>
        </div>
      </section>

      {/* ───────── Stat cards ───────── */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s: IStatCard, i: number) => (
          <Reveal key={s.label} delay={i * 80}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-md transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.grad} opacity-10 transition duration-500 group-hover:scale-150 group-hover:opacity-20`} />
              <span className={`relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.grad} text-white shadow-lg ${s.glow} transition group-hover:rotate-6 group-hover:scale-110`}>
                <s.icon className="h-5 w-5" />
              </span>
              <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
                <CountUp value={s.value} suffix={s.suffix} />
              </p>
              <p className="relative mt-0.5 text-xs font-medium text-slate-500">{s.label}</p>
              <span className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${s.grad} transition duration-500 group-hover:scale-x-100`} />
            </div>
          </Reveal>
        ))}
      </section>

      {/* ───────── Charts ───────── */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <div className="h-full rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
            <SectionTitle
              icon={TrendingUp}
              title="Attendance Trend"
              subtitle="Monthly attendance rate · last 12 months"
              right={
                withData.length > 0 ? (
                  <div className="hidden gap-2 text-xs sm:flex">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                      Avg {avg}%
                    </span>
                    {best && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                        Best {best.label} · {best.attendanceRate}%
                      </span>
                    )}
                  </div>
                ) : undefined
              }
            />
            <TrendChart months={months} />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="h-full rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
            <SectionTitle
              icon={CheckCircle2}
              title="Attendance Split"
              subtitle="All records, last 12 months"
            />
            <Donut present={totals.present} absent={totals.absent} late={totals.late} />
          </div>
        </Reveal>
      </section>

      {/* ───────── Monthly + Notices ───────── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
            <SectionTitle
              icon={CalendarCheck}
              title="Recent Months"
              subtitle="Last 6 months with records"
            />
            <MonthlyBars months={months} />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="h-full rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
            <SectionTitle icon={Bell} title="Notices" subtitle="Latest updates for you" />

            <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                    tab === t.key
                      ? "bg-white text-emerald-700 shadow"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      tab === t.key ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            <div key={tab}>
              {tab === "feed" ? (
                <NoticeList items={feedNotices} empty="No notices for you right now" />
              ) : (
                <NoticeList items={myNotices} empty="No personal notices yet" />
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <p className="flex items-center justify-center gap-2 pb-2 text-xs text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        Dinajpur Polytechnic Institute · Student Portal
      </p>
    </div>
  );
}