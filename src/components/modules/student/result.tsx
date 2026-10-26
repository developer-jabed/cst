"use client";

import { Fragment, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Student {
  id: number;
  name: string;
  roll: string;
  registration: string;
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

interface Meta {
  page: number;
  limit: number;
  total: number;
}
interface Filters {
  searchTerm: string;
  semesterName: string;
  examYear: string;
  regulation: string;
  status: string;
}

interface Props {
  mode: "all" | "roll";
  results: DiplomaResult[];
  meta: Meta;
  rollResults: DiplomaResult[];
  initialRoll: string;
  page: number;
  filters: Filters;
}

// ── GPA helpers ───────────────────────────────────────────────────────────────
const GPA_KEYS = ["gpa1", "gpa2", "gpa3", "gpa4", "gpa5", "gpa6", "gpa7"] as const;
type GpaKey = (typeof GPA_KEYS)[number];

function getSemesterGpa(r: DiplomaResult): number | null {
  const order = r.semester?.order;
  if (order && order >= 1 && order <= 7) {
    return r[`gpa${order}` as GpaKey] ?? null;
  }
  return null;
}

function nonNullGpas(r: DiplomaResult) {
  return GPA_KEYS.map((k, i) => ({
    label: `Sem ${i + 1}`,
    value: r[k],
    order: i + 1,
  })).filter((g) => g.value != null) as {
    label: string;
    value: number;
    order: number;
  }[];
}

function getBestGpaFromResults(results: DiplomaResult[]): number | null {
  let best: number | null = null;
  for (const r of results) {
    for (const g of nonNullGpas(r)) {
      if (best === null || g.value > best) best = g.value;
    }
  }
  return best;
}

/** Count unique completed semesters from GPA fields (not result rows) */
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

const STATUS: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  PASSED: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  FAILED: { bg: "#fff1f2", text: "#be123c", border: "#fecdd3", dot: "#f43f5e" },
  REFERRED: { bg: "#fffbeb", text: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  WITHHELD: { bg: "#fffbeb", text: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  ABSENT: { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", dot: "#94a3b8" },
  INCOMPLETE: { bg: "#faf5ff", text: "#7e22ce", border: "#e9d5ff", dot: "#a855f7" },
};

const EMPTY_FILTERS: Filters = {
  searchTerm: "",
  semesterName: "",
  examYear: "",
  regulation: "",
  status: "",
};

// ── Sub-components ────────────────────────────────────────────────────────────
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
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}

function GpaChip({ value, label }: { value: number | null; label: string }) {
  const color =
    value == null
      ? "#94a3b8"
      : value >= 3.5
      ? "#15803d"
      : value >= 2.5
      ? "#0369a1"
      : value >= 1.0
      ? "#b45309"
      : "#be123c";

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 62,
          height: 62,
          borderRadius: "50%",
          border: `3px solid ${value != null ? color : "#e2e8f0"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: value != null ? `${color}12` : "#f8fafc",
          boxShadow: value != null ? `0 4px 12px ${color}20` : "none",
        }}
      >
        <span
          style={{
            fontSize: 14.5,
            fontWeight: 800,
            color,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value != null ? value.toFixed(2) : "—"}
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
  const size = 84;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(completed / total, 1);
  const offset = circumference * (1 - progress);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
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
          style={{ transition: "stroke-dashoffset 0.55s ease" }}
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
        <span style={{ fontSize: 18, fontWeight: 800, color: "#1e40af", lineHeight: 1 }}>
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

  return (
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
        GPA Trend
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 70 }}>
        {points.map((p) => {
          const height = (p.value / 4) * 100;
          const color =
            p.value >= 3.5 ? "#22c55e" : p.value >= 2.5 ? "#3b82f6" : p.value >= 2 ? "#f59e0b" : "#f43f5e";
          return (
            <div
              key={p.order}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>
                {p.value.toFixed(2)}
              </span>
              <div
                style={{
                  width: "100%",
                  maxWidth: 34,
                  height: `${Math.max(height, 8)}%`,
                  borderRadius: 8,
                  background: `linear-gradient(180deg, ${color}, ${color}99)`,
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
        minWidth: 0,
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
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1e293b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subject.name}
        </div>
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
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11,
              color: "#be123c",
              textTransform: "uppercase",
              letterSpacing: ".07em",
              fontWeight: 800,
            }}
          >
            Failed Subjects ({failed.length})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {failed.map((s) => (
              <SubjectChip key={`${s.type}-${s.code}`} subject={s} />
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
              color: "#b45309",
              textTransform: "uppercase",
              letterSpacing: ".07em",
              fontWeight: 800,
            }}
          >
            Referred Subjects ({referred.length})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {referred.map((s) => (
              <SubjectChip key={`${s.type}-${s.code}`} subject={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ResultsClient({
  mode,
  results,
  meta,
  rollResults,
  initialRoll,
  page,
  filters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [rollInput, setRollInput] = useState(initialRoll);
  const [filterState, setFilterState] = useState<Filters>(filters);
  const [activeTab, setActiveTab] = useState<"all" | "roll">(mode);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  const handleTabSwitch = (tab: "all" | "roll") => {
    setActiveTab(tab);
    setFilterState(EMPTY_FILTERS);
    setRollInput("");
    setExpandedId(null);
    pushParams({ ...EMPTY_FILTERS, roll: "", page: "1" });
  };

  const handleRollSearch = () => {
    if (!rollInput.trim()) return;
    pushParams({ roll: rollInput.trim(), page: "1", ...EMPTY_FILTERS });
  };

  const handleFilter = () => {
    pushParams({ ...filterState, roll: "", page: "1" });
  };

  const handleClear = () => {
    setFilterState(EMPTY_FILTERS);
    pushParams({ ...EMPTY_FILTERS, roll: "", page: "1" });
  };

  const totalPages = Math.ceil(meta.total / meta.limit);

  // ✅ Fixed stats for roll tab
  const rollStats = useMemo(() => {
    if (!rollResults.length) return null;
    const completed = countCompletedSemesters(rollResults);
    return {
      completed,
      passed: completed,
      failed: rollResults.filter((r) => r.status === "FAILED").length,
      best: getBestGpaFromResults(rollResults),
    };
  }, [rollResults]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        .rc *{box-sizing:border-box}
        .rc{font-family:'Nunito',sans-serif;background:#f8fafc;min-height:100vh;color:#0f172a}
        .rc-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 1px 3px rgba(0,0,0,.04),0 4px 12px rgba(0,0,0,.03)}
        .rc-input{font-family:'Nunito',sans-serif;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;color:#0f172a;padding:12px 16px;font-size:14.5px;width:100%;outline:none;transition:border-color .2s,background .2s,box-shadow .2s}
        .rc-input:focus{border-color:#3b82f6;background:#fff;box-shadow:0 0 0 3px rgba(59,130,246,.12)}
        .rc-input::placeholder{color:#94a3b8}
        select.rc-input option{background:#fff;color:#0f172a}
        .rc-btn{font-family:'Nunito',sans-serif;border:none;border-radius:12px;padding:12px 24px;font-size:14.5px;font-weight:700;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;justify-content:center;gap:7px}
        .rc-btn-primary{background:#1e40af;color:#fff;box-shadow:0 4px 14px rgba(30,64,175,.25)}
        .rc-btn-primary:hover:not(:disabled){background:#1d4ed8;transform:translateY(-1px);box-shadow:0 6px 18px rgba(30,64,175,.3)}
        .rc-btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .rc-btn-ghost{background:#f1f5f9;color:#475569;border:1.5px solid #e2e8f0}
        .rc-btn-ghost:hover{background:#e2e8f0;color:#1e293b}
        .rc-tab{font-family:'Nunito',sans-serif;padding:10px 22px;border-radius:12px;border:none;font-size:14.5px;font-weight:700;cursor:pointer;transition:all .15s}
        .rc-tab-active{background:#1e40af;color:#fff;box-shadow:0 4px 14px rgba(30,64,175,.25)}
        .rc-tab-inactive{background:transparent;color:#64748b}
        .rc-tab-inactive:hover{background:#e2e8f0;color:#1e293b}
        .rc-table{width:100%;border-collapse:collapse}
        .rc-table th{text-align:left;padding:14px 18px;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;border-bottom:2px solid #f1f5f9;white-space:nowrap;background:#f8fafc}
        .rc-table td{padding:15px 18px;font-size:13.5px;border-bottom:1px solid #f1f5f9;color:#374151;vertical-align:middle}
        .rc-table tbody tr{cursor:pointer;transition:background .12s}
        .rc-table tbody tr:hover td{background:#f8fafc}
        .rc-table tbody tr.rc-expanded td{background:#eff6ff}
        .rc-page-btn{width:36px;height:36px;border-radius:10px;border:1.5px solid #e2e8f0;background:#fff;color:#475569;font-size:13px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}
        .rc-page-btn:hover:not(:disabled){background:#f1f5f9;border-color:#cbd5e1}
        .rc-page-btn.active{background:#1e40af;color:#fff;border-color:#1e40af;box-shadow:0 2px 8px rgba(30,64,175,.25)}
        .rc-page-btn:disabled{opacity:.3;cursor:not-allowed}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .35s ease both}
        .fu1{animation-delay:.05s}.fu2{animation-delay:.1s}.fu3{animation-delay:.15s}.fu4{animation-delay:.2s}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:15px;height:15px;border:2.5px solid #bfdbfe;border-top-color:#1e40af;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;flex-shrink:0}
      `}</style>

      <div className="rc" style={{ padding: "32px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div className="fu" style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div
                style={{
                  width: 5,
                  height: 32,
                  background: "linear-gradient(180deg,#1e40af,#3b82f6)",
                  borderRadius: 3,
                }}
              />
              <h1
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 26,
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-.3px",
                  color: "#0f172a",
                }}
              >
                Diploma Results Portal
              </h1>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14.5, margin: "0 0 0 17px" }}>
              Browse all exam results or look up a student by roll number
            </p>
          </div>

          {/* Tabs */}
          <div className="fu fu1" style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {(["all", "roll"] as const).map((t) => (
              <button
                key={t}
                className={`rc-tab rc-tab-${t === activeTab ? "active" : "inactive"}`}
                onClick={() => handleTabSwitch(t)}
              >
                {t === "all" ? "All Results" : "Search by Roll"}
              </button>
            ))}
          </div>

          {/* ═══ ROLL TAB ═══ */}
          {activeTab === "roll" && (
            <div>
              <div
                className="rc-card fu fu1"
                style={{ padding: 20, marginBottom: 22, borderLeft: "4px solid #1e40af" }}
              >
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    className="rc-input"
                    style={{ flex: 1, minWidth: 220 }}
                    placeholder="Enter roll number (e.g. 802810)"
                    value={rollInput}
                    onChange={(e) => setRollInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRollSearch()}
                  />
                  <button
                    className="rc-btn rc-btn-primary"
                    onClick={handleRollSearch}
                    disabled={isPending}
                  >
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

              {!initialRoll && (
                <div
                  className="rc-card"
                  style={{
                    padding: "64px 32px",
                    textAlign: "center",
                    borderLeft: "4px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 18,
                      background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      fontSize: 30,
                    }}
                  >
                    🎓
                  </div>
                  <p style={{ color: "#0f172a", fontSize: 16.5, fontWeight: 700, margin: "0 0 4px" }}>
                    Search Student Results
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
                    Enter a roll number above to view semester-wise results
                  </p>
                </div>
              )}

              {initialRoll && rollResults.length === 0 && (
                <div
                  className="rc-card"
                  style={{
                    padding: "64px 32px",
                    textAlign: "center",
                    borderLeft: "4px solid #fecdd3",
                  }}
                >
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 18,
                      background: "#fff1f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      fontSize: 30,
                    }}
                  >
                    📭
                  </div>
                  <p style={{ color: "#0f172a", fontSize: 16.5, fontWeight: 700, margin: "0 0 4px" }}>
                    No Results Found
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
                    No results found for roll{" "}
                    <strong style={{ color: "#1e40af" }}>{initialRoll}</strong>
                  </p>
                </div>
              )}

              {rollResults.length > 0 && rollStats && (
                <div>
                  {/* Student banner + progress ring */}
                  <div
                    className="rc-card fu"
                    style={{
                      padding: 22,
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                      borderLeft: "4px solid #1e40af",
                      background: "linear-gradient(135deg,#fff 0%,#f8fafc 100%)",
                    }}
                  >
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: "linear-gradient(135deg,#1e40af,#3b82f6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#fff",
                        boxShadow: "0 6px 16px rgba(30,64,175,.28)",
                      }}
                    >
                      {rollResults[0].student?.name?.[0]?.toUpperCase() ?? "S"}
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 17.5, color: "#0f172a" }}>
                        {rollResults[0].student?.name}
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: 13.5, color: "#64748b" }}>
                        Roll:{" "}
                        <strong style={{ color: "#1e40af" }}>{rollResults[0].roll}</strong>
                        {rollResults[0].student?.registration && (
                          <> · Reg: {rollResults[0].student.registration}</>
                        )}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", marginRight: 4 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#374151", fontWeight: 700 }}>
                        {rollResults[0].instituteName}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
                        Code: {rollResults[0].instituteCode}
                      </p>
                    </div>
                    <ProgressRing completed={rollStats.completed} />
                  </div>

                  {/* Stats — FIXED counts */}
                  <div
                    className="fu fu1"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    {[
                      {
                        label: "Semesters",
                        value: rollStats.completed,
                        color: "#1e40af",
                        border: "#1e40af",
                      },
                      {
                        label: "Passed",
                        value: rollStats.passed,
                        color: "#15803d",
                        border: "#22c55e",
                      },
                      {
                        label: "Failed",
                        value: rollStats.failed,
                        color: "#be123c",
                        border: "#f43f5e",
                      },
                      {
                        label: "Best GPA",
                        value:
                          rollStats.best != null ? rollStats.best.toFixed(2) : "—",
                        color: "#b45309",
                        border: "#f59e0b",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rc-card"
                        style={{
                          padding: "14px 16px",
                          borderLeft: `4px solid ${s.border}`,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 10.5,
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
                            margin: "4px 0 0",
                            fontSize: 23,
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
                      padding: 18,
                      marginBottom: 16,
                      borderLeft: "4px solid #3b82f6",
                    }}
                  >
                    <GpaTrend results={rollResults} />
                  </div>

                  {/* Semester cards */}
                  <div style={{ display: "grid", gap: 14 }}>
                    {rollResults.map((r, i) => {
                      const allGpas = nonNullGpas(r);
                      const { referredCount, failedCount } = splitBreakdown(r);
                      const hasSubjectIssues =
                        referredCount > 0 || failedCount > 0;

                      return (
                        <div
                          key={r.id}
                          className="rc-card fu"
                          style={{
                            padding: 20,
                            animationDelay: `${i * 0.05}s`,
                            borderLeft: `4px solid ${
                              STATUS[r.status]?.dot ?? "#94a3b8"
                            }`,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 14,
                              alignItems: "flex-start",
                              marginBottom:
                                hasSubjectIssues || allGpas.length > 1 ? 14 : 0,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  marginBottom: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                <span
                                  style={{
                                    background: "#eff6ff",
                                    color: "#1e40af",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: 10,
                                    padding: "4px 12px",
                                    fontSize: 13,
                                    fontWeight: 800,
                                  }}
                                >
                                  Semester {r.semester?.name ?? r.semesterName}
                                </span>
                                <StatusBadge status={r.status} />
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: "#64748b",
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "4px 14px",
                                }}
                              >
                                <span>
                                  Exam Year:{" "}
                                  <strong style={{ color: "#374151" }}>
                                    {r.examYear}
                                  </strong>
                                </span>
                                <span>
                                  Regulation:{" "}
                                  <strong style={{ color: "#374151" }}>
                                    {r.regulation}
                                  </strong>
                                </span>
                                <span>
                                  Group:{" "}
                                  <strong style={{ color: "#374151" }}>
                                    {r.group?.name}
                                  </strong>{" "}
                                  ({r.group?.session})
                                </span>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                              {allGpas.map((g) => (
                                <GpaChip
                                  key={g.label}
                                  value={g.value}
                                  label={g.label}
                                />
                              ))}
                            </div>
                          </div>

                          {hasSubjectIssues && (
                            <div
                              style={{
                                marginBottom: allGpas.length > 1 ? 12 : 0,
                                paddingBottom: allGpas.length > 1 ? 12 : 0,
                                borderBottom:
                                  allGpas.length > 1
                                    ? "1px solid #f1f5f9"
                                    : "none",
                              }}
                            >
                              <SubjectBreakdownBlock r={r} />
                            </div>
                          )}

                          {allGpas.length > 1 && (
                            <div>
                              <p
                                style={{
                                  margin: "0 0 8px",
                                  fontSize: 11,
                                  color: "#94a3b8",
                                  textTransform: "uppercase",
                                  letterSpacing: ".07em",
                                  fontWeight: 700,
                                }}
                              >
                                All GPA Records
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                {allGpas.map((g) => (
                                  <span
                                    key={g.label}
                                    style={{
                                      background: "#f8fafc",
                                      border: "1px solid #e2e8f0",
                                      borderRadius: 10,
                                      padding: "5px 12px",
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
          )}

          {/* ═══ ALL TAB (unchanged logic) ═══ */}
          {activeTab === "all" && (
            <div>
              <div
                className="rc-card fu fu1"
                style={{
                  padding: 20,
                  marginBottom: 20,
                  borderLeft: "4px solid #1e40af",
                }}
              >
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 11,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    fontWeight: 700,
                  }}
                >
                  Filters
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                    gap: 10,
                  }}
                >
                  <input
                    className="rc-input"
                    placeholder="Search roll / institute…"
                    value={filterState.searchTerm}
                    onChange={(e) =>
                      setFilterState((s) => ({
                        ...s,
                        searchTerm: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="rc-input"
                    placeholder="Semester (e.g. 3)"
                    value={filterState.semesterName}
                    onChange={(e) =>
                      setFilterState((s) => ({
                        ...s,
                        semesterName: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="rc-input"
                    placeholder="Exam year (e.g. 2025)"
                    value={filterState.examYear}
                    onChange={(e) =>
                      setFilterState((s) => ({
                        ...s,
                        examYear: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="rc-input"
                    placeholder="Regulation (e.g. 2022)"
                    value={filterState.regulation}
                    onChange={(e) =>
                      setFilterState((s) => ({
                        ...s,
                        regulation: e.target.value,
                      }))
                    }
                  />
                  <select
                    className="rc-input"
                    value={filterState.status}
                    onChange={(e) =>
                      setFilterState((s) => ({
                        ...s,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="">All Statuses</option>
                    {["PASSED", "FAILED", "WITHHELD", "ABSENT", "INCOMPLETE"].map(
                      (st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      )
                    )}
                  </select>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="rc-btn rc-btn-primary"
                      style={{ flex: 1 }}
                      onClick={handleFilter}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <span className="spinner" /> Applying…
                        </>
                      ) : (
                        "Apply"
                      )}
                    </button>
                    <button className="rc-btn rc-btn-ghost" onClick={handleClear}>
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="fu fu2"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <p style={{ margin: 0, fontSize: 13.5, color: "#64748b" }}>
                  Showing{" "}
                  <strong style={{ color: "#0f172a" }}>{results.length}</strong> of{" "}
                  <strong style={{ color: "#0f172a" }}>{meta.total}</strong> results
                </p>
                {isPending && (
                  <span
                    style={{
                      fontSize: 13,
                      color: "#3b82f6",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span className="spinner" /> Loading…
                  </span>
                )}
              </div>

              <div
                className="rc-card fu fu3"
                style={{
                  overflow: "hidden",
                  marginBottom: 22,
                  borderLeft: "4px solid #1e40af",
                }}
              >
                {results.length === 0 ? (
                  <div style={{ padding: 64, textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                    <p
                      style={{
                        color: "#0f172a",
                        fontWeight: 700,
                        fontSize: 15,
                        margin: "0 0 4px",
                      }}
                    >
                      No results found
                    </p>
                    <p style={{ color: "#94a3b8", margin: 0 }}>
                      No results match the current filters.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="rc-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Roll</th>
                          <th>Student</th>
                          <th>Semester</th>
                          <th>Group / Session</th>
                          <th>Exam Year</th>
                          <th>Regulation</th>
                          <th>GPA</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, i) => {
                          const { referredCount, failedCount } =
                            splitBreakdown(r);
                          return (
                            <Fragment key={r.id}>
                              <tr
                                className={
                                  expandedId === r.id ? "rc-expanded" : ""
                                }
                                onClick={() =>
                                  setExpandedId(
                                    expandedId === r.id ? null : r.id
                                  )
                                }
                              >
                                <td
                                  style={{
                                    color: "#94a3b8",
                                    fontSize: 12,
                                    fontWeight: 600,
                                  }}
                                >
                                  {(page - 1) * meta.limit + i + 1}
                                </td>
                                <td>
                                  <span
                                    style={{
                                      color: "#1e40af",
                                      fontWeight: 800,
                                      fontFamily: "monospace",
                                      fontSize: 13.5,
                                    }}
                                  >
                                    {r.roll}
                                  </span>
                                </td>
                                <td>
                                  <div
                                    style={{
                                      fontWeight: 700,
                                      color: "#0f172a",
                                      fontSize: 14,
                                    }}
                                  >
                                    {r.student?.name ?? "—"}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 11.5,
                                      color: "#94a3b8",
                                      marginTop: 1,
                                    }}
                                  >
                                    {r.student?.registration}
                                  </div>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      background: "#eff6ff",
                                      color: "#1e40af",
                                      border: "1px solid #bfdbfe",
                                      borderRadius: 8,
                                      padding: "3px 10px",
                                      fontSize: 12.5,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Sem {r.semester?.name ?? r.semesterName}
                                  </span>
                                </td>
                                <td style={{ fontSize: 13.5, color: "#374151" }}>
                                  <span style={{ fontWeight: 700 }}>
                                    {r.group?.name}
                                  </span>
                                  <span style={{ color: "#94a3b8" }}>
                                    {" "}
                                    · {r.group?.session}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    color: "#374151",
                                    fontWeight: 700,
                                  }}
                                >
                                  {r.examYear}
                                </td>
                                <td
                                  style={{
                                    color: "#64748b",
                                    fontSize: 12.5,
                                  }}
                                >
                                  {r.regulation}
                                </td>
                                <td>
                                  {(() => {
                                    const g = getSemesterGpa(r);
                                    const col =
                                      g == null
                                        ? "#94a3b8"
                                        : g >= 3.5
                                        ? "#15803d"
                                        : g >= 2.5
                                        ? "#0369a1"
                                        : g >= 1
                                        ? "#b45309"
                                        : "#be123c";
                                    return (
                                      <span
                                        style={{
                                          fontWeight: 800,
                                          color: col,
                                          fontSize: 15,
                                          fontVariantNumeric: "tabular-nums",
                                        }}
                                      >
                                        {g != null ? g.toFixed(2) : "—"}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <StatusBadge status={r.status} />
                                    {failedCount > 0 && (
                                      <span
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 800,
                                          color: "#be123c",
                                        }}
                                      >
                                        ✕{failedCount}
                                      </span>
                                    )}
                                    {referredCount > 0 && (
                                      <span
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 800,
                                          color: "#b45309",
                                        }}
                                      >
                                        ⚠{referredCount}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {expandedId === r.id && (
                                <tr>
                                  <td colSpan={9} style={{ padding: 0 }}>
                                    <div
                                      style={{
                                        background: "#f0f9ff",
                                        borderTop: "1px solid #bae6fd",
                                        padding: "16px 20px",
                                        display: "grid",
                                        gap: 16,
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns:
                                            "repeat(auto-fit,minmax(160px,1fr))",
                                          gap: 16,
                                        }}
                                      >
                                        <div>
                                          <p
                                            style={{
                                              margin: 0,
                                              fontSize: 11,
                                              color: "#64748b",
                                              textTransform: "uppercase",
                                              letterSpacing: ".07em",
                                              fontWeight: 700,
                                            }}
                                          >
                                            Institute
                                          </p>
                                          <p
                                            style={{
                                              margin: "3px 0 0",
                                              fontSize: 13.5,
                                              color: "#0f172a",
                                              fontWeight: 700,
                                            }}
                                          >
                                            {r.instituteName}
                                          </p>
                                          <p
                                            style={{
                                              margin: "2px 0 0",
                                              fontSize: 12,
                                              color: "#94a3b8",
                                            }}
                                          >
                                            Code: {r.instituteCode}
                                          </p>
                                        </div>
                                        <div>
                                          <p
                                            style={{
                                              margin: 0,
                                              fontSize: 11,
                                              color: "#64748b",
                                              textTransform: "uppercase",
                                              letterSpacing: ".07em",
                                              fontWeight: 700,
                                            }}
                                          >
                                            All GPAs
                                          </p>
                                          <div
                                            style={{
                                              display: "flex",
                                              flexWrap: "wrap",
                                              gap: 6,
                                              marginTop: 6,
                                            }}
                                          >
                                            {nonNullGpas(r).map((g) => (
                                              <span
                                                key={g.label}
                                                style={{
                                                  background: "#fff",
                                                  border: "1px solid #e2e8f0",
                                                  borderRadius: 8,
                                                  padding: "2px 10px",
                                                  fontSize: 12,
                                                  fontWeight: 700,
                                                  color: "#0f172a",
                                                }}
                                              >
                                                {g.label}: {g.value.toFixed(2)}
                                              </span>
                                            ))}
                                            {nonNullGpas(r).length === 0 && (
                                              <span
                                                style={{
                                                  color: "#94a3b8",
                                                  fontSize: 13,
                                                }}
                                              >
                                                —
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <p
                                            style={{
                                              margin: 0,
                                              fontSize: 11,
                                              color: "#64748b",
                                              textTransform: "uppercase",
                                              letterSpacing: ".07em",
                                              fontWeight: 700,
                                            }}
                                          >
                                            Last Updated
                                          </p>
                                          <p
                                            style={{
                                              margin: "3px 0 0",
                                              fontSize: 13,
                                              color: "#374151",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {new Date(
                                              r.updatedAt
                                            ).toLocaleDateString("en-BD", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                            })}
                                          </p>
                                        </div>
                                      </div>

                                      {(referredCount > 0 ||
                                        failedCount > 0) && (
                                        <div>
                                          <p
                                            style={{
                                              margin: "0 0 8px",
                                              fontSize: 11,
                                              color: "#64748b",
                                              textTransform: "uppercase",
                                              letterSpacing: ".07em",
                                              fontWeight: 700,
                                            }}
                                          >
                                            Subjects
                                          </p>
                                          <SubjectBreakdownBlock r={r} />
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div
                  className="fu fu4"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="rc-page-btn"
                    disabled={page <= 1}
                    onClick={() => pushParams({ page: String(page - 1) })}
                  >
                    ←
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p2 =
                      totalPages <= 7
                        ? i + 1
                        : page <= 4
                        ? i + 1
                        : page >= totalPages - 3
                        ? totalPages - 6 + i
                        : page - 3 + i;
                    return (
                      <button
                        key={p2}
                        className={`rc-page-btn${p2 === page ? " active" : ""}`}
                        onClick={() => pushParams({ page: String(p2) })}
                      >
                        {p2}
                      </button>
                    );
                  })}
                  <button
                    className="rc-page-btn"
                    disabled={page >= totalPages}
                    onClick={() => pushParams({ page: String(page + 1) })}
                  >
                    →
                  </button>
                  <span
                    style={{
                      fontSize: 12.5,
                      color: "#94a3b8",
                      marginLeft: 6,
                    }}
                  >
                    Page {page} / {totalPages}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}