"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback, useMemo } from "react";
import Image from "next/image";

// ── Palette (matches Course Catalog) ──────────────────────────────────────────
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
  amber: "#b45309",
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const GPA_KEYS = ["gpa1", "gpa2", "gpa3", "gpa4", "gpa5", "gpa6", "gpa7"] as const;

function nonNullGpas(r: DiplomaResult) {
  return GPA_KEYS.map((k, i) => ({
    label: `Sem ${i + 1}`,
    value: r[k],
    order: i + 1,
  })).filter((g) => g.value != null) as { label: string; value: number; order: number }[];
}

function getBestGpa(results: DiplomaResult[]): number | null {
  let best: number | null = null;
  for (const r of results) {
    for (const g of nonNullGpas(r)) {
      if (best === null || g.value > best) best = g.value;
    }
  }
  return best;
}

function countCompletedSemesters(results: DiplomaResult[]): number {
  const set = new Set<number>();
  results.forEach((r) => nonNullGpas(r).forEach((g) => set.add(g.order)));
  return set.size;
}

function splitBreakdown(r: DiplomaResult) {
  const list = r.subjectBreakdown ?? [];
  return {
    referred: list.filter((s) => s.type === "REFERRED"),
    failed: list.filter((s) => s.type === "FAILED"),
    referredCount: list.length
      ? list.filter((s) => s.type === "REFERRED").length
      : (r.referredSubjects?.length ?? 0),
    failedCount: list.length
      ? list.filter((s) => s.type === "FAILED").length
      : (r.failedSubjects?.length ?? 0),
  };
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

function gpaColor(value: number) {
  if (value >= 3.5) return C.green;
  if (value >= 2.5) return C.teal;
  if (value >= 2.0) return C.goldDeep;
  return C.rose;
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 999,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".06em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function GpaChip({ value, label }: { value: number; label: string }) {
  const color = gpaColor(value);
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: `2.5px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${color}10`,
          boxShadow: `0 4px 12px ${color}1f`,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>
          {value.toFixed(2)}
        </span>
      </div>
      <span
        style={{
          display: "block",
          marginTop: 5,
          fontSize: 10,
          color: C.muted,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".06em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ProgressRing({ completed, total = 7 }: { completed: number; total?: number }) {
  const size = 88;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(completed / total, 1);
  const offset = circumference * (1 - progress);

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
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 800, color: C.emerald, lineHeight: 1 }}>
          {completed}
        </span>
        <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>/ {total}</span>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 10px",
        fontSize: 11,
        color: C.goldDeep,
        textTransform: "uppercase",
        letterSpacing: ".18em",
        fontWeight: 800,
      }}
    >
      {children}
    </p>
  );
}

function GpaTrend({ results }: { results: DiplomaResult[] }) {
  const points = useMemo(() => {
    const map = new Map<number, number>();
    results.forEach((r) => {
      nonNullGpas(r).forEach((g) => map.set(g.order, g.value));
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([order, value]) => ({ order, value }));
  }, [results]);

  if (points.length < 2) return null;

  const max = 4;
  const min = 0;

  return (
    <div>
      <Eyebrow>GPA Trend</Eyebrow>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 84 }}>
        {points.map((p) => {
          const height = ((p.value - min) / (max - min)) * 100;
          const color = gpaColor(p.value);
          return (
            <div
              key={p.order}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>{p.value.toFixed(2)}</span>
              <div
                style={{
                  width: "100%",
                  maxWidth: 36,
                  height: `${height}%`,
                  minHeight: 8,
                  borderRadius: 8,
                  background: `linear-gradient(180deg, ${color}, ${color}aa)`,
                  transition: "height 0.4s ease",
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

function SubjectChip({ subject }: { subject: SubjectBreakdownItem }) {
  const isFailed = subject.type === "FAILED";
  const color = isFailed ? C.rose : "#8a6a1f";
  const bg = isFailed ? "#fff7f8" : "#fdf9ee";
  const border = isFailed ? "#fecdd3" : "#ecd9a6";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: "8px 14px",
      }}
    >
      <span
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          fontWeight: 700,
          color,
          background: "#fff",
          border: `1px solid ${border}`,
          borderRadius: 8,
          padding: "2px 8px",
          flexShrink: 0,
        }}
      >
        {subject.code}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{subject.name}</div>
        {subject.semesterName && (
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 1 }}>
            {subject.semesterName} Semester
          </div>
        )}
      </div>
    </div>
  );
}

function SubjectBreakdownBlock({ r }: { r: DiplomaResult }) {
  const { referred, failed } = splitBreakdown(r);
  if (!referred.length && !failed.length) return null;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {failed.length > 0 && (
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11,
              color: C.rose,
              textTransform: "uppercase",
              letterSpacing: ".1em",
              fontWeight: 800,
            }}
          >
            Failed Subjects ({failed.length})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {failed.map((s) => (
              <SubjectChip key={`f-${s.code}`} subject={s} />
            ))}
          </div>
        </div>
      )}
      {referred.length > 0 && (
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11,
              color: "#8a6a1f",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              fontWeight: 800,
            }}
          >
            Referred Subjects ({referred.length})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {referred.map((s) => (
              <SubjectChip key={`r-${s.code}`} subject={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Avatar (photo + elegant fallback) ─────────────────────────────────────────
function StudentAvatar({
  name,
  photo,
  size = 64,
}: {
  name?: string;
  photo?: string | null;
  size?: number;
}) {
  const initials = getInitials(name);

  if (photo) {
    return (
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: 18,
          overflow: "hidden",
          flexShrink: 0,
          boxShadow: "0 8px 20px rgba(6,78,59,.22)",
          border: `3px solid ${C.gold}`,
        }}
      >
        <Image
          src={photo}
          alt={name || "Student"}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 18,
        background: `linear-gradient(135deg,${C.emerald},${C.teal})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 800,
        color: "#fff",
        boxShadow: "0 8px 20px rgba(6,78,59,.25)",
        border: `3px solid ${C.gold}`,
        flexShrink: 0,
        letterSpacing: "-0.5px",
      }}
    >
      {initials}
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

  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) =>
        v ? params.set(k, v) : params.delete(k)
      );
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [pathname, router, searchParams]
  );

  const handleSearch = () => {
    if (!rollInput.trim()) return;
    pushParams({ roll: rollInput.trim() });
  };

  const stats = useMemo(() => {
    if (!rollResults.length) return null;
    const completed = countCompletedSemesters(rollResults);
    const failedRows = rollResults.filter((r) => r.status === "FAILED").length;
    const best = getBestGpa(rollResults);
    return {
      completed,
      passed: completed,
      failed: failedRows,
      best,
    };
  }, [rollResults]);

  const student = rollResults[0]?.student;

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
        .rc-btn{font:inherit;border:none;border-radius:12px;padding:12px 26px;font-size:14.5px;font-weight:700;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;justify-content:center;gap:8px}
        .rc-btn-primary{background:linear-gradient(135deg,${C.emerald},${C.teal});color:#fff;box-shadow:0 4px 14px rgba(6,78,59,.25)}
        .rc-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(6,78,59,.32)}
        .rc-btn-primary:disabled{opacity:.65;cursor:not-allowed;transform:none}
        .rc-sem:hover{background:${C.cream}}
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
                color: "#0f172a",
              }}
            >
              Diploma Results Portal
            </h1>
            <p style={{ color: "#475569", fontSize: 15, margin: "8px 0 0", maxWidth: 440 }}>
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
              <button className="rc-btn rc-btn-primary" onClick={handleSearch} disabled={isPending}>
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
            <div className="rc-card" style={{ padding: "72px 32px", textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: C.sand,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: 30,
                }}
              >
                🎓
              </div>
              <p style={{ color: C.ink, fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
                Search Student Results
              </p>
              <p style={{ color: C.muted, fontSize: 14.5, margin: 0 }}>
                Enter a roll number above to view semester-wise results
              </p>
            </div>
          )}

          {initialRoll && rollResults.length === 0 && (
            <div className="rc-card" style={{ padding: "72px 32px", textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: C.sand,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: 30,
                }}
              >
                📭
              </div>
              <p style={{ color: C.ink, fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
                No Results Found
              </p>
              <p style={{ color: C.muted, fontSize: 14.5, margin: 0 }}>
                No results found for roll{" "}
                <strong style={{ color: C.emerald }}>{initialRoll}</strong>
              </p>
            </div>
          )}

          {/* Results */}
          {rollResults.length > 0 && stats && (
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
                  <StudentAvatar name={student?.name} photo={student?.profilePhoto} size={72} />

                  <div style={{ flex: 1, minWidth: 180 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 800,
                        fontSize: 21,
                        color: C.ink,
                        letterSpacing: "-0.3px",
                      }}
                    >
                      {student?.name}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: 14, color: "#64748b" }}>
                      Roll: <strong style={{ color: C.emerald }}>{rollResults[0].roll}</strong>
                      {student?.registration && (
                        <>
                          {" "}
                          · Reg: <strong style={{ color: "#334155" }}>{student.registration}</strong>
                        </>
                      )}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: C.muted }}>
                      {rollResults[0].instituteName}
                      <span style={{ margin: "0 6px", opacity: 0.5 }}>•</span>
                      Code: {rollResults[0].instituteCode}
                    </p>
                  </div>

                  <ProgressRing completed={stats.completed} />
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
                {[
                  { label: "Semesters", value: stats.completed, color: C.emerald, bar: C.emerald },
                  { label: "Passed", value: stats.passed, color: C.green, bar: C.green },
                  { label: "Failed", value: stats.failed, color: C.rose, bar: "#f43f5e" },
                  {
                    label: "Best GPA",
                    value: stats.best != null ? stats.best.toFixed(2) : "—",
                    color: C.goldDeep,
                    bar: C.gold,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rc-card"
                    style={{
                      padding: "16px 18px 16px 22px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 5,
                        height: 36,
                        borderRadius: 999,
                        background: s.bar,
                      }}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: C.muted,
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        fontWeight: 700,
                      }}
                    >
                      {s.label}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: 26, fontWeight: 800, color: s.color }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* GPA Trend */}
              <div className="rc-card fu fu2" style={{ padding: 22, marginBottom: 22 }}>
                <GpaTrend results={rollResults} />
              </div>

              {/* Semester cards */}
              <div style={{ display: "grid", gap: 16 }}>
                {rollResults.map((r, i) => {
                  const allGpas = nonNullGpas(r);
                  const { referredCount, failedCount } = splitBreakdown(r);
                  const hasIssues = referredCount > 0 || failedCount > 0;
                  const dot = STATUS[r.status]?.dot ?? C.muted;

                  return (
                    <div
                      key={r.id}
                      className="rc-card rc-sem fu"
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <div style={{ display: "flex", alignItems: "stretch" }}>
                        <span
                          style={{
                            width: 6,
                            flexShrink: 0,
                            background: dot,
                          }}
                        />
                        <div style={{ padding: 22, flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 16,
                              alignItems: "flex-start",
                              marginBottom: hasIssues || allGpas.length > 1 ? 16 : 0,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 180 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  marginBottom: 10,
                                  flexWrap: "wrap",
                                }}
                              >
                                <span
                                  style={{
                                    background: C.sand,
                                    color: C.emerald,
                                    border: `1px solid ${C.line}`,
                                    borderRadius: 10,
                                    padding: "5px 14px",
                                    fontSize: 13.5,
                                    fontWeight: 800,
                                  }}
                                >
                                  Semester {r.semester?.name ?? r.semesterName}
                                </span>
                                <StatusBadge status={r.status} />
                              </div>
                              <div
                                style={{
                                  fontSize: 13.5,
                                  color: "#64748b",
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "4px 16px",
                                }}
                              >
                                <span>
                                  Exam Year: <strong style={{ color: "#334155" }}>{r.examYear}</strong>
                                </span>
                                <span>
                                  Regulation: <strong style={{ color: "#334155" }}>{r.regulation}</strong>
                                </span>
                                <span>
                                  Group: <strong style={{ color: "#334155" }}>{r.group?.name}</strong> (
                                  {r.group?.session})
                                </span>
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: 12, flexShrink: 0, flexWrap: "wrap" }}>
                              {allGpas.map((g) => (
                                <GpaChip key={g.label} value={g.value} label={g.label} />
                              ))}
                            </div>
                          </div>

                          {hasIssues && (
                            <div
                              style={{
                                marginBottom: allGpas.length > 1 ? 14 : 0,
                                paddingBottom: allGpas.length > 1 ? 14 : 0,
                                borderBottom: allGpas.length > 1 ? `1px solid ${C.lineSoft}` : "none",
                              }}
                            >
                              <SubjectBreakdownBlock r={r} />
                            </div>
                          )}

                          {allGpas.length > 1 && (
                            <div>
                              <Eyebrow>All GPA Records</Eyebrow>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {allGpas.map((g) => (
                                  <span
                                    key={g.label}
                                    style={{
                                      background: C.sand,
                                      border: `1px solid ${C.line}`,
                                      borderRadius: 10,
                                      padding: "6px 14px",
                                      fontSize: 13,
                                      fontWeight: 700,
                                      color: C.ink,
                                    }}
                                  >
                                    {g.label}: {g.value.toFixed(2)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}