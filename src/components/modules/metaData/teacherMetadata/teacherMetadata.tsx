"use client";

import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  Inbox,
  Layers,
  Megaphone,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { IMonthlyAttendance, ITeacherDashboard, ITeacherNotice } from "../../../../service/meta/teacherMeta.service";


interface Props {
  data: ITeacherDashboard;
  greeting: string;
  today: string;
}

// ─── Local item types (remove once exported from meta.service) ────────────────
interface ISubjectGroupItem {
  id: string | number;
  subject: { name: string; code: string; shortName?: string | null };
  group: { name: string; session: string };
  semester: { name: string };
  _count: { practicals: number };
}

interface IRecentSessionItem {
  id: string | number;
  date: string;
  subject: { name: string };
  group: { name: string };
  semester: { name: string };
  _count: { records: number };
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

type NoticeTab = "mine" | "feed";

// ─── Animations (scoped keyframes) ────────────────────────────────────────────
const CSS = `
@keyframes td-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-16px) } }
@keyframes td-fade { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@keyframes td-ping { 0% { transform: scale(.8); opacity: .7 } 100% { transform: scale(2.2); opacity: 0 } }
@keyframes td-shimmer { from { transform: translateX(-130%) } to { transform: translateX(230%) } }
.td-float { animation: td-float 8s ease-in-out infinite }
.td-float-slow { animation: td-float 11s ease-in-out infinite reverse }
.td-fade { animation: td-fade .55s ease both }
.td-ping { animation: td-ping 1.8s ease-out infinite }
.td-shimmer::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.18), transparent); animation: td-shimmer 4.5s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .td-float, .td-float-slow, .td-fade, .td-ping, .td-shimmer::after { animation: none !important }
  .td-anim, .td-anim * { transition: none !important }
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
      // Fallback: defer so setState runs in a callback, not the effect body
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
      className={`td-anim transition-all duration-700 ease-out ${
        seen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CountUp({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
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

function safeDate(d?: string | null): Date | null {
  if (!d) return null;
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? null : x;
}

function fmtDay(d?: string | null): string {
  const x = safeDate(d);
  return x ? x.toLocaleDateString("en-GB", { day: "2-digit", timeZone: TZ }) : "--";
}

function fmtMonth(d?: string | null): string {
  const x = safeDate(d);
  return x
    ? x.toLocaleDateString("en-GB", { month: "short", timeZone: TZ }).toUpperCase()
    : "";
}

function fmtFull(d?: string | null): string {
  const x = safeDate(d);
  return x
    ? x.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: TZ,
      })
    : "—";
}

function labelOf(s?: string | null): string {
  if (!s) return "General";
  return s
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const SUBJECT_PALETTES = [
  { grad: "from-emerald-500 to-teal-500", soft: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500" },
  { grad: "from-sky-500 to-cyan-500", soft: "bg-sky-50 text-sky-700", bar: "bg-sky-500" },
  { grad: "from-amber-500 to-orange-400", soft: "bg-amber-50 text-amber-700", bar: "bg-amber-500" },
  { grad: "from-teal-600 to-emerald-700", soft: "bg-teal-50 text-teal-700", bar: "bg-teal-600" },
  { grad: "from-lime-500 to-green-600", soft: "bg-lime-50 text-lime-700", bar: "bg-lime-500" },
  { grad: "from-slate-700 to-emerald-800", soft: "bg-slate-100 text-slate-700", bar: "bg-slate-700" },
];

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
          <linearGradient id="td-ring" x1="0" y1="0" x2="1" y2="1">
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
          stroke="url(#td-ring)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={seen ? C - (C * pct) / 100 : C}
          className="td-anim transition-[stroke-dashoffset] duration-[1600ms] ease-out"
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
interface ITrendPoint {
  i: number;
  m: IMonthlyAttendance;
  x: number;
  y: number;
}

function TrendChart({ months }: { months: IMonthlyAttendance[] }) {
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
      (m: IMonthlyAttendance, i: number): ITrendPoint => ({
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
          <linearGradient id="td-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="td-line" x1="0" y1="0" x2="1" y2="0">
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

        {months.map((m: IMonthlyAttendance, i: number) => (
          <text key={`${m.year}-${m.month}`} x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">
            {m.label}
          </text>
        ))}

        <path
          d={area}
          fill="url(#td-area)"
          className="td-anim transition-opacity duration-1000"
          style={{ opacity: seen ? 1 : 0, transitionDelay: "500ms" }}
        />

        <path
          d={line}
          pathLength={1}
          fill="none"
          stroke="url(#td-line)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={seen ? 0 : 1}
          className="td-anim transition-[stroke-dashoffset] duration-[1800ms] ease-out"
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
            className="td-anim transition-all duration-300"
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
          className="pointer-events-none absolute z-10 w-44 -translate-x-1/2 -translate-y-full rounded-2xl bg-slate-900/95 p-3 text-xs text-white shadow-2xl backdrop-blur"
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
            <span>Sessions</span>
            <b className="text-right text-white">{hovered.m.sessions}</b>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Donut ────────────────────────────────────────────────────────────────────
interface IDonutSeg {
  label: string;
  value: number;
  color: string;
  text: string;
}

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
              className="td-anim transition-[stroke-dasharray] duration-[1400ms] ease-out"
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

// ─── Notice list ──────────────────────────────────────────────────────────────
function NoticeList({ items, empty }: { items: ITeacherNotice[]; empty: string }) {
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
      {items.map((n: ITeacherNotice, i: number) => {
        const pr = priorityUI(n.priority);
        return (
          <li
            key={n.id}
            style={{ animationDelay: `${i * 70}ms` }}
            className="td-fade group flex gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 transition hover:border-emerald-200 hover:shadow-md"
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
                {n.student && (
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700">
                    {n.student.name}
                  </span>
                )}
                {n.isPublished === false && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                    Draft
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
export default function TeacherDashboardClient({ data, greeting, today }: Props) {
  const [tab, setTab] = useState<NoticeTab>("mine");

  const o = data.overview;

  const subjectGroups = data.subjectGroups as unknown as ISubjectGroupItem[];
  const recentSessions = data.recentSessions as unknown as IRecentSessionItem[];

  const months: IMonthlyAttendance[] = useMemo(
    () => (data.monthly?.attendance ?? []) as IMonthlyAttendance[],
    [data]
  );

  const totals: IAttendanceTotals = useMemo(
    () =>
      months.reduce<IAttendanceTotals>(
        (a: IAttendanceTotals, m: IMonthlyAttendance) => ({
          present: a.present + m.present,
          absent: a.absent + m.absent,
          late: a.late + m.late,
        }),
        { present: 0, absent: 0, late: 0 }
      ),
    [months]
  );

  const totalRecords = totals.present + totals.absent + totals.late;
  // Backend may send 0 until it is calculated — fall back to the 12-month figure
  const rate =
    o.overallAttendanceRate > 0
      ? o.overallAttendanceRate
      : totalRecords > 0
      ? Math.round((totals.present / totalRecords) * 100)
      : 0;

  const withData: IMonthlyAttendance[] = months.filter(
    (m: IMonthlyAttendance) => m.total > 0
  );
  const best: IMonthlyAttendance | null = withData.length
    ? withData.reduce((a: IMonthlyAttendance, b: IMonthlyAttendance) =>
        b.attendanceRate > a.attendanceRate ? b : a
      )
    : null;
  const avg = withData.length
    ? Math.round(
        withData.reduce(
          (s: number, m: IMonthlyAttendance) => s + m.attendanceRate,
          0
        ) / withData.length
      )
    : 0;

  const stats: IStatCard[] = [
    { label: "Subject Groups", value: o.totalSubjectGroups, icon: Layers, grad: "from-emerald-500 to-teal-500", glow: "shadow-emerald-200" },
    { label: "Students Taught", value: o.totalStudentsTaught, icon: Users, grad: "from-sky-500 to-cyan-500", glow: "shadow-sky-200" },
    { label: "Sessions Taken", value: o.totalSessionsTaken, icon: CalendarCheck, grad: "from-amber-500 to-orange-400", glow: "shadow-amber-200" },
    { label: "Practicals & Jobs", value: o.totalPracticals, icon: FlaskConical, grad: "from-teal-600 to-emerald-700", glow: "shadow-teal-200" },
    { label: "Notices Created", value: o.totalNoticesCreated, icon: Megaphone, grad: "from-lime-500 to-green-600", glow: "shadow-lime-200" },
    { label: "Attendance Rate", value: rate, suffix: "%", icon: TrendingUp, grad: "from-slate-700 to-emerald-800", glow: "shadow-slate-300" },
  ];

  const tabs: { key: NoticeTab; label: string; count: number }[] = [
    { key: "mine", label: "My Notices", count: data.recent.myNotices.length },
    { key: "feed", label: "Notice Feed", count: data.recent.feedNotices.length },
  ];

  return (
    <div className="space-y-10">
      <style>{CSS}</style>

      {/* ───────── Hero ───────── */}
      <section className="td-shimmer relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-950 via-emerald-900 to-emerald-600 p-6 text-white shadow-2xl shadow-emerald-900/20 sm:p-10">
        <div className="td-float pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="td-float-slow pointer-events-none absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
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
                <span className="td-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </span>
              Teacher Dashboard
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {greeting}{" "}
              <span className="bg-gradient-to-r from-amber-200 to-yellow-100 bg-clip-text text-transparent">
                👋
              </span>
            </h1>
            <p className="mt-2 text-emerald-100">
              Here&apos;s your teaching overview — classes, students and notices at a glance.
            </p>
            <p className="mt-1 text-sm text-emerald-200/80">{today}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <Layers className="h-4 w-4 text-emerald-300" />
                <b>{o.totalSubjectGroups}</b> subject groups
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <Users className="h-4 w-4 text-amber-300" />
                <b>{o.totalStudentsTaught}</b> students
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

      {/* ───────── Subject groups ───────── */}
      <section>
        <Reveal>
          <SectionTitle
            icon={GraduationCap}
            title="My Subject Groups"
            subtitle={`${subjectGroups.length} assigned`}
          />
        </Reveal>

        {subjectGroups.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center text-slate-400">
            <span className="text-5xl">📚</span>
            <p className="mt-2 text-sm">No subject groups assigned yet</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {subjectGroups.map((sg: ISubjectGroupItem, i: number) => {
              const pal =
                SUBJECT_PALETTES[
                  hash(sg.subject.code || sg.subject.name) % SUBJECT_PALETTES.length
                ];
              return (
                <Reveal key={sg.id} delay={(i % 3) * 90}>
                  <article className="group relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-md transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                    <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${pal.grad}`} />

                    <div className="flex items-start gap-4">
                      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${pal.grad} text-sm font-extrabold text-white shadow-lg transition group-hover:scale-110 group-hover:-rotate-3`}>
                        {(sg.subject.shortName || sg.subject.code).slice(0, 3).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 font-bold leading-snug text-slate-900 transition group-hover:text-emerald-700">
                          {sg.subject.name}
                        </h3>
                        <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pal.soft}`}>
                          Code {sg.subject.code}
                        </span>
                      </div>
                    </div>

                    <dl className="mt-5 space-y-2.5 text-sm">
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <dt className="flex items-center gap-2 text-slate-500">
                          <Layers className="h-4 w-4 text-emerald-600" /> Group
                        </dt>
                        <dd className="font-semibold text-slate-800">
                          {sg.group.name} <span className="text-slate-400">({sg.group.session})</span>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <dt className="flex items-center gap-2 text-slate-500">
                          <GraduationCap className="h-4 w-4 text-amber-600" /> Semester
                        </dt>
                        <dd className="font-semibold text-slate-800">{sg.semester.name}</dd>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <dt className="flex items-center gap-2 text-slate-500">
                          <FlaskConical className="h-4 w-4 text-sky-600" /> Practicals
                        </dt>
                        <dd className="font-semibold text-slate-800">{sg._count.practicals}</dd>
                      </div>
                    </dl>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* ───────── Sessions + Notices ───────── */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent sessions */}
        <Reveal>
          <div className="h-full rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
            <SectionTitle icon={ClipboardList} title="Recent Sessions" subtitle="Your last attendance sessions" />

            {recentSessions.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-slate-400">
                <CalendarCheck className="h-10 w-10" />
                <p className="mt-2 text-sm">No sessions taken yet</p>
              </div>
            ) : (
              <ol className="relative space-y-4 before:absolute before:bottom-3 before:left-[27px] before:top-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-300 before:to-transparent">
                {recentSessions.map((s: IRecentSessionItem, i: number) => (
                  <li
                    key={s.id}
                    style={{ animationDelay: `${i * 90}ms` }}
                    className="td-fade group relative flex items-center gap-4"
                  >
                    <div className="relative z-10 flex h-14 w-14 shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-100 transition group-hover:scale-110 group-hover:shadow-lg">
                      <span className="w-full bg-emerald-600 py-0.5 text-center text-[9px] font-bold tracking-widest text-white">
                        {fmtMonth(s.date)}
                      </span>
                      <span className="text-lg font-extrabold leading-tight text-slate-900">
                        {fmtDay(s.date)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition group-hover:border-emerald-200 group-hover:bg-white group-hover:shadow-md">
                      <p className="truncate font-semibold text-slate-800">{s.subject.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {s.group.name} · {s.semester.name}
                      </p>
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <Users className="h-3 w-3" /> {s._count.records} students marked
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Reveal>

        {/* Notices */}
        <Reveal delay={120}>
          <div className="h-full rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
            <SectionTitle icon={Bell} title="Notices" subtitle="What you posted and what concerns you" />

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
              {tab === "mine" ? (
                <NoticeList items={data.recent.myNotices} empty="You haven't created any notices yet" />
              ) : (
                <NoticeList items={data.recent.feedNotices} empty="No notices for you right now" />
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <p className="flex items-center justify-center gap-2 pb-2 text-xs text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        Dinajpur Polytechnic Institute · Teacher Portal
      </p>
    </div>
  );
}