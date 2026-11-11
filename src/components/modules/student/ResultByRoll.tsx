"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback, useMemo } from "react";
import Image from "next/image";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  cream: "#faf8f3",
  sand: "#f7f3ea",
  line: "#e8e0d0",
  lineSoft: "#f0ebe3",
  emerald: "#064e3b",
  teal: "#0f766e",
  green: "#059669",
  gold: "#c9a24b",
  goldDeep: "#b8923f",
  ink: "#0f172a",
  slate: "#475569",
  muted: "#94a3b8",
  rose: "#be123c",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Student {
  id: number;
  name: string;
  roll: string;
  registration: string;
  profilePhoto?: string | null;
}
interface Semester {
  id: number;
  name: string;
  order: number;
}
interface Group {
  id: number;
  name: string;
  session: string;
}
interface SubjectBreakdownItem {
  code: string;
  name: string;
  shortName: string | null;
  semesterName: string | null;
  semesterOrder: number | null;
  type: "REFERRED" | "FAILED";
}
interface DiplomaResult {
  id: number;
  roll: string;
  studentId: number;
  semesterId: number;
  semesterName: string;
  groupId: number;
  examYear: number;
  regulation: string;
  instituteName: string;
  instituteCode: string;
  status: string;
  gpa1: number | null;
  gpa2: number | null;
  gpa3: number | null;
  gpa4: number | null;
  gpa5: number | null;
  gpa6: number | null;
  gpa7: number | null;
  failedSubjects: unknown[];
  referredSubjects: unknown[];
  subjectBreakdown?: SubjectBreakdownItem[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  student: Student;
  semester: Semester | null;
  group: Group | null;
}
interface Props {
  rollResults: DiplomaResult[];
  initialRoll: string;
}

/** One card = one semester */
interface SemEntry {
  order: number;
  gpa: number | null;
  status: string;
  /** true when this card is the semester the result row was published for */
  isOwn: boolean;
  result: DiplomaResult;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const GPA_KEYS = ["gpa1", "gpa2", "gpa3", "gpa4", "gpa5", "gpa6", "gpa7"] as const;
const TOTAL_SEMESTERS = GPA_KEYS.length;
const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];

const gpasOf = (r: DiplomaResult) =>
  GPA_KEYS.flatMap((k, i) => (r[k] != null ? [{ order: i + 1, value: r[k] as number }] : []));

/** Flatten all result rows into one entry per semester (deduped, sorted). */
function buildEntries(results: DiplomaResult[]): SemEntry[] {
  const map = new Map<number, SemEntry>();

  for (const r of results) {
    const gpas = gpasOf(r);
    const ownOrder = r.semester?.order ?? gpas.at(-1)?.order ?? null;

    for (const g of gpas) {
      const isOwn = g.order === ownOrder;
      const prev = map.get(g.order);
      if (!prev || (isOwn && !prev.isOwn)) {
        map.set(g.order, {
          order: g.order,
          gpa: g.value,
          status: isOwn ? r.status : "PASSED",
          isOwn,
          result: r,
        });
      }
    }

    // Failed / referred semester with no GPA yet → still show a card
    if (ownOrder != null && !map.has(ownOrder)) {
      map.set(ownOrder, { order: ownOrder, gpa: null, status: r.status, isOwn: true, result: r });
    }
  }

  return [...map.values()].sort((a, b) => a.order - b.order);
}

function gpaColor(v: number) {
  if (v >= 3.5) return C.green;
  if (v >= 2.5) return C.teal;
  if (v >= 2.0) return C.goldDeep;
  return C.rose;
}

function getInitials(name?: string) {
  if (!name) return "S";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const STATUS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  PASSED: { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0", dot: C.green },
  FAILED: { bg: "#fff1f2", text: C.rose, border: "#fecdd3", dot: "#f43f5e" },
  REFERRED: { bg: "#fbf6e8", text: "#8a6a1f", border: "#ecd9a6", dot: C.gold },
  WITHHELD: { bg: "#fbf6e8", text: "#8a6a1f", border: "#ecd9a6", dot: C.gold },
  ABSENT: { bg: "#f8fafc", text: C.slate, border: "#e2e8f0", dot: C.muted },
  INCOMPLETE: { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe", dot: "#8b5cf6" },
};

// ── Sub components ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const c = STATUS[status] ?? STATUS.ABSENT;
  return (
    <span
      className="rc-badge"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      <span className="rc-dot" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function GpaCircle({ value }: { value: number | null }) {
  if (value == null) {
    return (
      <div className="rc-gpa" style={{ borderColor: C.line, color: C.muted, background: C.sand }}>
        —
      </div>
    );
  }
  const color = gpaColor(value);
  return (
    <div
      className="rc-gpa"
      style={{ borderColor: color, color, background: `${color}10`, boxShadow: `0 4px 12px ${color}1f` }}
    >
      {value.toFixed(2)}
    </div>
  );
}

function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const size = 88;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(completed / total, 1));

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.emerald} />
            <stop offset="100%" stopColor={C.teal} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.lineSoft} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div className="rc-ring-center">
        <span style={{ fontSize: 20, fontWeight: 800, color: C.emerald, lineHeight: 1 }}>{completed}</span>
        <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>/ {total}</span>
      </div>
    </div>
  );
}

function GpaTrend({ entries }: { entries: SemEntry[] }) {
  const points = entries.filter((e) => e.gpa != null) as (SemEntry & { gpa: number })[];
  if (points.length < 2) return null;

  return (
    <div className="rc-card fu fu2" style={{ padding: 22, marginBottom: 22 }}>
      <p className="rc-eyebrow">GPA Trend</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 84 }}>
        {points.map((p) => {
          const color = gpaColor(p.gpa);
          return (
            <div key={p.order} className="rc-trend-col">
              <span style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>{p.gpa.toFixed(2)}</span>
              <div
                style={{
                  width: "100%",
                  maxWidth: 36,
                  height: `${(p.gpa / 4) * 100}%`,
                  minHeight: 8,
                  borderRadius: 8,
                  background: `linear-gradient(180deg, ${color}, ${color}aa)`,
                }}
              />
              <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>S{p.order}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubjectGroup({
  title,
  color,
  items,
  failed,
}: {
  title: string;
  color: string;
  items: SubjectBreakdownItem[];
  failed: boolean;
}) {
  if (!items.length) return null;
  const bg = failed ? "#fff7f8" : "#fdf9ee";
  const border = failed ? "#fecdd3" : "#ecd9a6";

  return (
    <div>
      <p className="rc-sub-title" style={{ color }}>
        {title} ({items.length})
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((s) => (
          <div key={s.code} className="rc-subject" style={{ background: bg, border: `1px solid ${border}` }}>
            <span className="rc-code" style={{ color, border: `1px solid ${border}` }}>
              {s.code}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{s.name}</div>
              {s.semesterName && (
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 1 }}>
                  {s.semesterName} Semester
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SemesterCard({ entry, index }: { entry: SemEntry; index: number }) {
  const { order, gpa, status, isOwn, result: r } = entry;
  const dot = STATUS[status]?.dot ?? C.muted;

  const { failed, referred } = useMemo(() => {
    if (!isOwn) return { failed: [], referred: [] };
    const list = r.subjectBreakdown ?? [];
    return {
      failed: list.filter((s) => s.type === "FAILED"),
      referred: list.filter((s) => s.type === "REFERRED"),
    };
  }, [isOwn, r.subjectBreakdown]);

  const hasIssues = failed.length > 0 || referred.length > 0;

  return (
    <div className="rc-card rc-sem fu" style={{ animationDelay: `${index * 0.05}s` }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <span style={{ width: 6, flexShrink: 0, background: dot }} />
        <div style={{ padding: 22, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span className="rc-sem-pill">Semester {ORDINALS[order - 1] ?? order}</span>
                <StatusBadge status={status} />
              </div>

              {isOwn && (
                <div className="rc-meta">
                  <span>
                    Exam Year: <strong>{r.examYear}</strong>
                  </span>
                  <span>
                    Regulation: <strong>{r.regulation}</strong>
                  </span>
                  {r.group?.name && (
                    <span>
                      Group: <strong>{r.group.name}</strong>
                      {r.group.session && ` (${r.group.session})`}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <GpaCircle value={gpa} />
              <span className="rc-gpa-label">GPA</span>
            </div>
          </div>

          {hasIssues && (
            <div className="rc-issues">
              <SubjectGroup title="Failed Subjects" color={C.rose} items={failed} failed />
              <SubjectGroup title="Referred Subjects" color="#8a6a1f" items={referred} failed={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentAvatar({ name, photo, size = 72 }: { name?: string; photo?: string | null; size?: number }) {
  const base = {
    width: size,
    height: size,
    borderRadius: 18,
    flexShrink: 0,
    border: `3px solid ${C.gold}`,
  } as const;

  if (photo) {
    return (
      <div style={{ ...base, position: "relative", overflow: "hidden", boxShadow: "0 8px 20px rgba(6,78,59,.22)" }}>
        <Image src={photo} alt={name || "Student"} fill className="object-cover" sizes={`${size}px`} />
      </div>
    );
  }

  return (
    <div
      style={{
        ...base,
        background: `linear-gradient(135deg,${C.emerald},${C.teal})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 800,
        color: "#fff",
        boxShadow: "0 8px 20px rgba(6,78,59,.25)",
        letterSpacing: "-0.5px",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function EmptyState({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rc-card" style={{ padding: "72px 32px", textAlign: "center" }}>
      <div className="rc-empty-icon">{icon}</div>
      <p style={{ color: C.ink, fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>{title}</p>
      <p style={{ color: C.muted, fontSize: 14.5, margin: 0 }}>{children}</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ResultsByRoll({ rollResults, initialRoll }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [rollInput, setRollInput] = useState(initialRoll);

  const handleSearch = useCallback(() => {
    const roll = rollInput.trim();
    if (!roll) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("roll", roll);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }, [rollInput, searchParams, pathname, router]);

  const entries = useMemo(() => buildEntries(rollResults), [rollResults]);

  const stats = useMemo(() => {
    const gpas = entries.flatMap((e) => (e.gpa != null ? [e.gpa] : []));
    return {
      completed: gpas.length,
      passed: entries.filter((e) => e.status === "PASSED").length,
      failed: entries.filter((e) => e.status === "FAILED").length,
      best: gpas.length ? Math.max(...gpas) : null,
      avg: gpas.length ? gpas.reduce((a, b) => a + b, 0) / gpas.length : null,
    };
  }, [entries]);

  const first = rollResults[0];
  const student = first?.student;

  const statCards = [
    { label: "Semesters", value: stats.completed, color: C.emerald, bar: C.emerald },
    { label: "Passed", value: stats.passed, color: C.green, bar: C.green },
    { label: "Failed", value: stats.failed, color: C.rose, bar: "#f43f5e" },
    { label: "Best GPA", value: stats.best?.toFixed(2) ?? "—", color: C.goldDeep, bar: C.gold },
    { label: "Average CGPA", value: stats.avg?.toFixed(2) ?? "—", color: C.teal, bar: C.teal },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&display=swap');
        .rc *{box-sizing:border-box}
        .rc{background:${C.cream};min-height:calc(100vh - 72px);color:${C.ink}}
        .rc-card{background:#fff;border:1px solid ${C.line};border-radius:18px;box-shadow:0 4px 24px rgba(6,78,59,.06);overflow:hidden;position:relative}
        .rc-bar{height:4px;width:100%;background:linear-gradient(90deg,${C.emerald},${C.gold},${C.teal})}
        .rc-input{font:inherit;background:#fff;border:1px solid ${C.line};border-radius:12px;color:#1e293b;padding:12px 16px;font-size:15px;width:100%;outline:none;transition:border-color .2s,box-shadow .2s;box-shadow:0 1px 2px rgba(0,0,0,.04)}
        .rc-input:focus{border-color:${C.gold};box-shadow:0 0 0 3px rgba(201,162,75,.2)}
        .rc-input::placeholder{color:${C.muted}}
        .rc-btn{font:inherit;border:none;border-radius:12px;padding:12px 26px;font-size:14.5px;font-weight:700;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,${C.emerald},${C.teal});color:#fff;box-shadow:0 4px 14px rgba(6,78,59,.25)}
        .rc-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(6,78,59,.32)}
        .rc-btn:disabled{opacity:.65;cursor:not-allowed}
        .rc-sem:hover{background:${C.cream}}
        .rc-eyebrow{margin:0 0 10px;font-size:11px;color:${C.goldDeep};text-transform:uppercase;letter-spacing:.18em;font-weight:800}
        .rc-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.06em;white-space:nowrap}
        .rc-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        .rc-gpa{width:64px;height:64px;border-radius:50%;border:2.5px solid;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;font-variant-numeric:tabular-nums}
        .rc-gpa-label{display:block;margin-top:5px;font-size:10px;color:${C.muted};font-weight:700;text-transform:uppercase;letter-spacing:.06em}
        .rc-ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
        .rc-trend-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end}
        .rc-sem-pill{background:${C.sand};color:${C.emerald};border:1px solid ${C.line};border-radius:10px;padding:5px 14px;font-size:13.5px;font-weight:800}
        .rc-meta{margin-top:10px;font-size:13.5px;color:#64748b;display:flex;flex-wrap:wrap;gap:4px 16px}
        .rc-meta strong{color:#334155}
        .rc-issues{display:grid;gap:12px;margin-top:16px;padding-top:16px;border-top:1px solid ${C.lineSoft}}
        .rc-sub-title{margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:.1em;font-weight:800}
        .rc-subject{display:flex;align-items:center;gap:10px;border-radius:12px;padding:8px 14px}
        .rc-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:700;background:#fff;border-radius:8px;padding:2px 8px;flex-shrink:0}
        .rc-stat{padding:16px 18px 16px 22px;display:flex;flex-direction:column;justify-content:center}
        .rc-stat-bar{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:5px;height:36px;border-radius:999px}
        .rc-stat-label{margin:0;font-size:11px;color:${C.muted};text-transform:uppercase;letter-spacing:.1em;font-weight:700}
        .rc-stat-value{margin:5px 0 0;font-size:26px;font-weight:800}
        .rc-empty-icon{width:64px;height:64px;border-radius:18px;background:${C.sand};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:30px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .35s ease both}
        .fu1{animation-delay:.05s}.fu2{animation-delay:.1s}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:16px;height:16px;border:2.5px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
      `}</style>

      <div className="rc" style={{ padding: "56px 20px 64px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          {/* Header */}
          <div className="fu" style={{ marginBottom: 32 }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: ".22em",
                color: C.goldDeep,
              }}
            >
              Academics
            </p>
            <h1
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 34,
                fontWeight: 700,
                margin: "8px 0 0",
                letterSpacing: "-.5px",
              }}
            >
              Diploma Results Portal
            </h1>
            <p style={{ color: C.slate, fontSize: 15, margin: "8px 0 0", maxWidth: 440 }}>
              Enter your roll number to view semester-wise results.
            </p>
          </div>

          {/* Search */}
          <div className="rc-card fu fu1" style={{ marginBottom: 28 }}>
            <div className="rc-bar" />
            <div style={{ padding: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                className="rc-input"
                style={{ flex: 1, minWidth: 220 }}
                placeholder="Enter roll number (e.g. 802810)"
                value={rollInput}
                onChange={(e) => setRollInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="rc-btn" onClick={handleSearch} disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="spinner" /> Searching…
                  </>
                ) : (
                  "Search Results"
                )}
              </button>
            </div>
          </div>

          {/* Empty states */}
          {!initialRoll && (
            <EmptyState icon="🎓" title="Search Student Results">
              Enter a roll number above to view semester-wise results
            </EmptyState>
          )}

          {initialRoll && rollResults.length === 0 && (
            <EmptyState icon="📭" title="No Results Found">
              No results found for roll <strong style={{ color: C.emerald }}>{initialRoll}</strong>
            </EmptyState>
          )}

          {/* Results */}
          {first && (
            <div>
              {/* Student banner */}
              <div className="rc-card fu" style={{ marginBottom: 18 }}>
                <div className="rc-bar" />
                <div
                  style={{
                    padding: "24px 28px",
                    display: "flex",
                    alignItems: "center",
                    gap: 22,
                    flexWrap: "wrap",
                    background: `linear-gradient(135deg,#ffffff 0%,${C.sand} 100%)`,
                  }}
                >
                  <StudentAvatar name={student?.name} photo={student?.profilePhoto} />

                  <div style={{ flex: 1, minWidth: 180 }}>
                    {student?.name && (
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 21, letterSpacing: "-0.3px" }}>
                        {student.name}
                      </p>
                    )}
                    <p style={{ margin: "5px 0 0", fontSize: 14, color: "#64748b" }}>
                      Roll: <strong style={{ color: C.emerald }}>{first.roll}</strong>
                      {student?.registration && (
                        <>
                          {" "}
                          · Reg: <strong style={{ color: "#334155" }}>{student.registration}</strong>
                        </>
                      )}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: C.muted }}>
                      {first.instituteName}
                      <span style={{ margin: "0 6px", opacity: 0.5 }}>•</span>
                      Code: {first.instituteCode}
                    </p>
                  </div>

                  <ProgressRing completed={stats.completed} total={TOTAL_SEMESTERS} />
                </div>
              </div>

              {/* Stats row */}
              <div
                className="fu fu1"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                {statCards.map((s) => (
                  <div key={s.label} className="rc-card rc-stat">
                    <span className="rc-stat-bar" style={{ background: s.bar }} />
                    <p className="rc-stat-label">{s.label}</p>
                    <p className="rc-stat-value" style={{ color: s.color }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              <GpaTrend entries={entries} />

              {/* One card per semester */}
              <div style={{ display: "grid", gap: 16 }}>
                {entries.map((e, i) => (
                  <SemesterCard key={e.order} entry={e} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}