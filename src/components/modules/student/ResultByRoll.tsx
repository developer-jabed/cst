"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback, useMemo } from "react";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Student {
  id: number;
  name: string;
  roll: string;
  registration: string;
  profilePhoto?: string | null; // added
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



const STATUS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  PASSED: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  FAILED: { bg: "#fff1f2", text: "#be123c", border: "#fecdd3", dot: "#f43f5e" },
  REFERRED: { bg: "#fffbeb", text: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  WITHHELD: { bg: "#fffbeb", text: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  ABSENT: { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", dot: "#94a3b8" },
  INCOMPLETE: { bg: "#faf5ff", text: "#7e22ce", border: "#e9d5ff", dot: "#a855f7" },
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
        letterSpacing: ".04em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function GpaChip({ value, label }: { value: number; label: string }) {
  const color =
    value >= 3.5 ? "#15803d" : value >= 2.5 ? "#0369a1" : value >= 2.0 ? "#b45309" : "#be123c";

    console.log()

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 62,
          height: 62,
          borderRadius: "50%",
          border: `3px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${color}12`,
          boxShadow: `0 4px 12px ${color}22`,
        }}
      >
        <span style={{ fontSize: 14.5, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>
          {value.toFixed(2)}
        </span>
      </div>
      <span
        style={{
          display: "block",
          marginTop: 5,
          fontSize: 10,
          color: "#94a3b8",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".05em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ProgressRing({ completed, total = 7 }: { completed: number; total?: number }) {
  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(completed / total, 1);
  const offset = circumference * (1 - progress);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e40af"
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
        <span style={{ fontSize: 20, fontWeight: 800, color: "#1e40af", lineHeight: 1 }}>
          {completed}
        </span>
        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>/ {total}</span>
      </div>
    </div>
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
    <div style={{ marginTop: 4 }}>
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 11,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: ".07em",
          fontWeight: 700,
        }}
      >
        GPA Trend
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 72 }}>
        {points.map((p) => {
          const height = ((p.value - min) / (max - min)) * 100;
          const color =
            p.value >= 3.5 ? "#22c55e" : p.value >= 2.5 ? "#3b82f6" : p.value >= 2 ? "#f59e0b" : "#f43f5e";
          return (
            <div key={p.order} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>
                {p.value.toFixed(2)}
              </span>
              <div
                style={{
                  width: "100%",
                  maxWidth: 36,
                  height: `${height}%`,
                  minHeight: 8,
                  borderRadius: 8,
                  background: `linear-gradient(180deg, ${color}, ${color}99)`,
                  transition: "height 0.4s ease",
                }}
              />
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>S{p.order}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubjectChip({ subject }: { subject: SubjectBreakdownItem }) {
  const isFailed = subject.type === "FAILED";
  const color = isFailed ? "#be123c" : "#b45309";
  const bg = isFailed ? "#fff1f2" : "#fffbeb";
  const border = isFailed ? "#fecdd3" : "#fde68a";

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
          fontFamily: "monospace",
          fontSize: 12,
          fontWeight: 800,
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
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{subject.name}</div>
        {subject.semesterName && (
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginTop: 1 }}>
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
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#be123c", textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 800 }}>
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
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#b45309", textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 800 }}>
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
          boxShadow: "0 8px 20px rgba(30,64,175,.22)",
          border: "3px solid #fff",
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
        background: "linear-gradient(135deg,#1e40af,#3b82f6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 800,
        color: "#fff",
        boxShadow: "0 8px 20px rgba(30,64,175,.28)",
        border: "3px solid #fff",
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
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        .rc *{box-sizing:border-box}
        .rc{font-family:'Nunito',sans-serif;background:#f1f5f9;min-height:calc(100vh - 72px);color:#0f172a}
        .rc-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;box-shadow:0 1px 2px rgba(0,0,0,.03),0 4px 16px rgba(0,0,0,.04)}
        .rc-input{font-family:'Nunito',sans-serif;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;color:#0f172a;padding:14px 18px;font-size:15px;width:100%;outline:none;transition:border-color .2s,box-shadow .2s}
        .rc-input:focus{border-color:#1e40af;background:#fff;box-shadow:0 0 0 4px rgba(30,64,175,.12)}
        .rc-input::placeholder{color:#94a3b8}
        .rc-btn{font-family:'Nunito',sans-serif;border:none;border-radius:14px;padding:14px 28px;font-size:15px;font-weight:700;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;justify-content:center;gap:8px}
        .rc-btn-primary{background:linear-gradient(135deg,#1e40af,#2563eb);color:#fff;box-shadow:0 4px 16px rgba(30,64,175,.28)}
        .rc-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(30,64,175,.35)}
        .rc-btn-primary:disabled{opacity:.65;cursor:not-allowed;transform:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .35s ease both}
        .fu1{animation-delay:.05s}.fu2{animation-delay:.1s}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:16px;height:16px;border:2.5px solid #bfdbfe;border-top-color:#1e40af;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
      `}</style>

      <div className="rc" style={{ padding: "48px 20px 56px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          {/* Header */}
          <div className="fu" style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
              <div
                style={{
                  width: 6,
                  height: 32,
                  background: "linear-gradient(180deg,#1e40af,#3b82f6)",
                  borderRadius: 4,
                }}
              />
              <h1
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 28,
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-.4px",
                  color: "#0f172a",
                }}
              >
                Diploma Results Portal
              </h1>
            </div>
            <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 0 20px" }}>
              Enter your roll number to view semester-wise results
            </p>
          </div>

          {/* Search */}
          <div
            className="rc-card fu fu1"
            style={{
              padding: 20,
              marginBottom: 28,
              borderLeft: "5px solid #1e40af",
              background: "linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)",
            }}
          >
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
            <div
              className="rc-card"
              style={{
                padding: "72px 32px",
                textAlign: "center",
                borderLeft: "5px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 22,
                  background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                  fontSize: 34,
                }}
              >
                🎓
              </div>
              <p style={{ color: "#0f172a", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
                Search Student Results
              </p>
              <p style={{ color: "#94a3b8", fontSize: 14.5, margin: 0 }}>
                Enter a roll number above to view semester-wise results
              </p>
            </div>
          )}

          {initialRoll && rollResults.length === 0 && (
            <div
              className="rc-card"
              style={{
                padding: "72px 32px",
                textAlign: "center",
                borderLeft: "5px solid #fecdd3",
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 22,
                  background: "#fff1f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                  fontSize: 34,
                }}
              >
                📭
              </div>
              <p style={{ color: "#0f172a", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
                No Results Found
              </p>
              <p style={{ color: "#94a3b8", fontSize: 14.5, margin: 0 }}>
                No results found for roll{" "}
                <strong style={{ color: "#1e40af" }}>{initialRoll}</strong>
              </p>
            </div>
          )}

          {/* Results */}
          {rollResults.length > 0 && stats && (
            <div>
              {/* ── Student Banner (with photo) ── */}
              <div
                className="rc-card fu"
                style={{
                  padding: "24px 26px",
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  flexWrap: "wrap",
                  borderLeft: "5px solid #1e40af",
                  background: "linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* subtle decorative circle */}
                <div
                  style={{
                    position: "absolute",
                    right: -40,
                    top: -40,
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(30,64,175,.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                <StudentAvatar
                  name={student?.name}
                  photo={student?.profilePhoto}
                  size={72}
                />

                <div style={{ flex: 1, minWidth: 180 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      fontSize: 20,
                      color: "#0f172a",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {student?.name}
                  </p>
                  <p style={{ margin: "5px 0 0", fontSize: 14, color: "#64748b" }}>
                    Roll:{" "}
                    <strong style={{ color: "#1e40af" }}>{rollResults[0].roll}</strong>
                    {student?.registration && (
                      <>
                        {" "}
                        · Reg: <strong style={{ color: "#334155" }}>{student.registration}</strong>
                      </>
                    )}
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94a3b8" }}>
                    {rollResults[0].instituteName}
                    <span style={{ margin: "0 6px", opacity: 0.5 }}>•</span>
                    Code: {rollResults[0].instituteCode}
                  </p>
                </div>

                <ProgressRing completed={stats.completed} />
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
                  { label: "Semesters", value: stats.completed, color: "#1e40af", border: "#1e40af" },
                  { label: "Passed", value: stats.passed, color: "#15803d", border: "#22c55e" },
                  { label: "Failed", value: stats.failed, color: "#be123c", border: "#f43f5e" },
                  {
                    label: "Best GPA",
                    value: stats.best != null ? stats.best.toFixed(2) : "—",
                    color: "#b45309",
                    border: "#f59e0b",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rc-card"
                    style={{
                      padding: "16px 18px",
                      borderLeft: `4px solid ${s.border}`,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                        fontWeight: 700,
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: 24,
                        fontWeight: 800,
                        color: s.color,
                      }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* GPA Trend */}
              <div
                className="rc-card fu fu2"
                style={{
                  padding: 20,
                  marginBottom: 20,
                  borderLeft: "4px solid #3b82f6",
                }}
              >
                <GpaTrend results={rollResults} />
              </div>

              {/* Semester cards */}
              <div style={{ display: "grid", gap: 16 }}>
                {rollResults.map((r, i) => {
                  const allGpas = nonNullGpas(r);
                  const { referredCount, failedCount } = splitBreakdown(r);
                  const hasIssues = referredCount > 0 || failedCount > 0;

                  return (
                    <div
                      key={r.id}
                      className="rc-card fu"
                      style={{
                        padding: 22,
                        animationDelay: `${i * 0.04}s`,
                        borderLeft: `4px solid ${STATUS[r.status]?.dot ?? "#94a3b8"}`,
                      }}
                    >
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
                                background: "#eff6ff",
                                color: "#1e40af",
                                border: "1px solid #bfdbfe",
                                borderRadius: 11,
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
                              Exam Year:{" "}
                              <strong style={{ color: "#334155" }}>{r.examYear}</strong>
                            </span>
                            <span>
                              Regulation:{" "}
                              <strong style={{ color: "#334155" }}>{r.regulation}</strong>
                            </span>
                            <span>
                              Group:{" "}
                              <strong style={{ color: "#334155" }}>{r.group?.name}</strong> (
                              {r.group?.session})
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
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
                            borderBottom: allGpas.length > 1 ? "1px solid #f1f5f9" : "none",
                          }}
                        >
                          <SubjectBreakdownBlock r={r} />
                        </div>
                      )}

                      {allGpas.length > 1 && (
                        <div>
                          <p
                            style={{
                              margin: "0 0 10px",
                              fontSize: 11,
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              letterSpacing: ".07em",
                              fontWeight: 700,
                            }}
                          >
                            All GPA Records
                          </p>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {allGpas.map((g) => (
                              <span
                                key={g.label}
                                style={{
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: 11,
                                  padding: "6px 14px",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "#0f172a",
                                }}
                              >
                                {g.label}: {g.value.toFixed(2)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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