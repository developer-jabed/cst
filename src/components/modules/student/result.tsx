"use client";

import { Fragment } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Student  { id: number; name: string; roll: string; registration: string }
interface Semester { id: number; name: string; order: number }
interface Group    { id: number; name: string; session: string }

interface DiplomaResult {
  id:               number;
  roll:             string;
  studentId:        number;
  semesterId:       number;
  semesterName:     string;
  groupId:          number;
  examYear:         number;
  regulation:       string;
  instituteName:    string;
  instituteCode:    string;
  status:           string;
  gpa1:             number | null;
  gpa2:             number | null;
  gpa3:             number | null;
  gpa4:             number | null;
  gpa5:             number | null;
  gpa6:             number | null;
  gpa7:             number | null;
  failedSubjects:   unknown[];
  referredSubjects: unknown[];
  isDeleted:        boolean;
  createdAt:        string;
  updatedAt:        string;
  student:          Student;
  semester:         Semester;
  group:            Group;
}

interface Meta    { page: number; limit: number; total: number }
interface Filters { searchTerm: string; semesterName: string; examYear: string; regulation: string; status: string }

interface Props {
  mode:        "all" | "roll";
  results:     DiplomaResult[];
  meta:        Meta;
  rollResults: DiplomaResult[];
  initialRoll: string;
  page:        number;
  filters:     Filters;
}

// ── GPA helpers ───────────────────────────────────────────────────────────────
const GPA_KEYS = ["gpa1","gpa2","gpa3","gpa4","gpa5","gpa6","gpa7"] as const;
type GpaKey = typeof GPA_KEYS[number];

function getSemesterGpa(r: DiplomaResult): number | null {
  const key = `gpa${r.semester?.order ?? r.semesterName}` as GpaKey;
  return r[key] ?? null;
}

function getBestGpa(r: DiplomaResult): number | null {
  const key = `gpa${r.semester?.order}` as GpaKey;
  if (r[key] != null) return r[key];
  for (const k of GPA_KEYS) if (r[k] != null) return r[k];
  return null;
}

function nonNullGpas(r: DiplomaResult) {
  return GPA_KEYS
    .map((k, i) => ({ label: `Sem ${i + 1}`, value: r[k] }))
    .filter(g => g.value != null);
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  PASSED:     { bg:"#f0fdf4", text:"#15803d", border:"#bbf7d0", dot:"#22c55e" },
  FAILED:     { bg:"#fff1f2", text:"#be123c", border:"#fecdd3", dot:"#f43f5e" },
  WITHHELD:   { bg:"#fffbeb", text:"#b45309", border:"#fde68a", dot:"#f59e0b" },
  ABSENT:     { bg:"#f8fafc", text:"#475569", border:"#e2e8f0", dot:"#94a3b8" },
  INCOMPLETE: { bg:"#faf5ff", text:"#7e22ce", border:"#e9d5ff", dot:"#a855f7" },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const c = STATUS[status] ?? STATUS.ABSENT;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:999,
      background:c.bg, color:c.text, border:`1px solid ${c.border}`,
      fontSize:11, fontWeight:700, letterSpacing:".06em", whiteSpace:"nowrap",
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, flexShrink:0 }} />
      {status}
    </span>
  );
}

function GpaChip({ value, label }: { value: number | null; label: string }) {
  const color = value == null ? "#94a3b8"
    : value >= 3.5 ? "#15803d"
    : value >= 2.5 ? "#0369a1"
    : value >= 1.0 ? "#b45309"
    : "#be123c";
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{
        width:60, height:60, borderRadius:"50%",
        border:`2.5px solid ${value != null ? color : "#e2e8f0"}`,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background: value != null ? `${color}12` : "#f8fafc",
      }}>
        <span style={{ fontSize:14, fontWeight:800, color, fontVariantNumeric:"tabular-nums" }}>
          {value != null ? value.toFixed(2) : "—"}
        </span>
      </div>
      <span style={{ display:"block", marginTop:4, fontSize:10, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>
        {label}
      </span>
    </div>
  );
}

// ── Constant ──────────────────────────────────────────────────────────────────
const EMPTY_FILTERS: Filters = { searchTerm:"", semesterName:"", examYear:"", regulation:"", status:"" };

// ── Main component ────────────────────────────────────────────────────────────
export default function ResultsClient({ mode, results, meta, rollResults, initialRoll, page, filters }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [rollInput,   setRollInput]   = useState(initialRoll);
  const [filterState, setFilterState] = useState<Filters>(filters);
  const [activeTab,   setActiveTab]   = useState<"all" | "roll">(mode);
  const [expandedId,  setExpandedId]  = useState<number | null>(null);

  // ── URL push ──────────────────────────────────────────────────────────────
  const pushParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k));
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }, [pathname, router, searchParams]);

  // ── Tab switch — resets everything ────────────────────────────────────────
  const handleTabSwitch = (tab: "all" | "roll") => {
    setActiveTab(tab);
    setFilterState(EMPTY_FILTERS);
    setRollInput("");
    setExpandedId(null);
    pushParams({ ...EMPTY_FILTERS, roll:"", page:"1" });
  };

  // ── Roll search ───────────────────────────────────────────────────────────
  const handleRollSearch = () => {
    if (!rollInput.trim()) return;
    pushParams({ roll: rollInput.trim(), page:"1", ...EMPTY_FILTERS });
  };

  // ── All results filter ────────────────────────────────────────────────────
  const handleFilter = () => {
    pushParams({ ...filterState, roll:"", page:"1" });
  };

  const handleClear = () => {
    setFilterState(EMPTY_FILTERS);
    pushParams({ ...EMPTY_FILTERS, roll:"", page:"1" });
  };

  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        .rc *{box-sizing:border-box}
        .rc{font-family:'Nunito',sans-serif;background:#f1f5f9;min-height:100vh;color:#0f172a}
        .rc-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,.05)}
        .rc-input{font-family:'Nunito',sans-serif;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;color:#0f172a;padding:10px 14px;font-size:14px;width:100%;outline:none;transition:border-color .2s,background .2s}
        .rc-input:focus{border-color:#3b82f6;background:#fff}
        .rc-input::placeholder{color:#94a3b8}
        select.rc-input option{background:#fff;color:#0f172a}
        .rc-btn{font-family:'Nunito',sans-serif;border:none;border-radius:10px;padding:10px 22px;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;justify-content:center;gap:6px}
        .rc-btn-primary{background:#1e40af;color:#fff}
        .rc-btn-primary:hover:not(:disabled){background:#1d4ed8;transform:translateY(-1px)}
        .rc-btn-primary:disabled{opacity:.6;cursor:not-allowed}
        .rc-btn-ghost{background:#f1f5f9;color:#475569;border:1.5px solid #e2e8f0}
        .rc-btn-ghost:hover{background:#e2e8f0;color:#1e293b}
        .rc-tab{font-family:'Nunito',sans-serif;padding:9px 20px;border-radius:10px;border:none;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s}
        .rc-tab-active{background:#1e40af;color:#fff;box-shadow:0 2px 8px rgba(30,64,175,.25)}
        .rc-tab-inactive{background:transparent;color:#64748b}
        .rc-tab-inactive:hover{background:#e2e8f0;color:#1e293b}
        .rc-table{width:100%;border-collapse:collapse}
        .rc-table th{text-align:left;padding:11px 16px;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;border-bottom:2px solid #f1f5f9;white-space:nowrap;background:#f8fafc}
        .rc-table td{padding:13px 16px;font-size:13.5px;border-bottom:1px solid #f1f5f9;color:#374151;vertical-align:middle}
        .rc-table tbody tr{cursor:pointer;transition:background .12s}
        .rc-table tbody tr:hover td{background:#f8fafc}
        .rc-table tbody tr.rc-expanded td{background:#eff6ff}
        .rc-page-btn{width:34px;height:34px;border-radius:8px;border:1.5px solid #e2e8f0;background:#fff;color:#475569;font-size:13px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}
        .rc-page-btn:hover:not(:disabled){background:#f1f5f9;border-color:#cbd5e1}
        .rc-page-btn.active{background:#1e40af;color:#fff;border-color:#1e40af}
        .rc-page-btn:disabled{opacity:.3;cursor:not-allowed}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .3s ease both}
        .fu1{animation-delay:.04s}.fu2{animation-delay:.08s}.fu3{animation-delay:.12s}.fu4{animation-delay:.16s}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:15px;height:15px;border:2px solid #bfdbfe;border-top-color:#1e40af;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;flex-shrink:0}
      `}</style>

      <div className="rc" style={{ padding:"28px 20px" }}>
        <div style={{ maxWidth:1180, margin:"0 auto" }}>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="fu" style={{ marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <div style={{ width:4, height:30, background:"linear-gradient(180deg,#1e40af,#3b82f6)", borderRadius:2 }} />
              <h1 style={{ fontFamily:"'Lora',serif", fontSize:26, fontWeight:700, margin:0, letterSpacing:"-.3px" }}>
                Diploma Results Portal
              </h1>
            </div>
            <p style={{ color:"#94a3b8", fontSize:13.5, margin:"0 0 0 14px" }}>
              Browse all exam results or look up a student by roll number
            </p>
          </div>

          {/* ── Tabs ───────────────────────────────────────────────────── */}
          <div className="fu fu1" style={{ display:"flex", gap:8, marginBottom:22 }}>
            {(["all","roll"] as const).map(t => (
              <button
                key={t}
                className={`rc-tab rc-tab-${t === activeTab ? "active" : "inactive"}`}
                onClick={() => handleTabSwitch(t)}
              >
                {t === "all" ? "📋  All Results" : "🔍  Search by Roll"}
              </button>
            ))}
          </div>

          {/* ════════════════════════════════ ROLL TAB */}
          {activeTab === "roll" && (
            <div>
              {/* Search bar */}
              <div className="rc-card fu fu1" style={{ padding:20, marginBottom:20 }}>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <input
                    className="rc-input"
                    style={{ flex:1, minWidth:200 }}
                    placeholder="Enter roll number (e.g. 802810)"
                    value={rollInput}
                    onChange={e => setRollInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleRollSearch()}
                  />
                  <button className="rc-btn rc-btn-primary" onClick={handleRollSearch} disabled={isPending}>
                    {isPending ? <><span className="spinner" /> Searching…</> : "Search"}
                  </button>
                </div>
              </div>

              {/* Empty: no search yet */}
              {!initialRoll && (
                <div className="rc-card" style={{ padding:56, textAlign:"center" }}>
                  <div style={{ fontSize:44, marginBottom:10 }}>🎓</div>
                  <p style={{ color:"#94a3b8", fontSize:15 }}>Enter a roll number to view semester-wise results</p>
                </div>
              )}

              {/* Empty: searched but no data */}
              {initialRoll && rollResults.length === 0 && (
                <div className="rc-card" style={{ padding:56, textAlign:"center" }}>
                  <div style={{ fontSize:44, marginBottom:10 }}>📭</div>
                  <p style={{ color:"#94a3b8", fontSize:15 }}>
                    No results found for roll <strong style={{ color:"#0f172a" }}>{initialRoll}</strong>
                  </p>
                </div>
              )}

              {/* Roll results */}
              {rollResults.length > 0 && (() => {
                const first   = rollResults[0];
                const passed  = rollResults.filter(r => r.status === "PASSED").length;
                const failed  = rollResults.filter(r => r.status === "FAILED").length;
                const bestGpa = Math.max(...rollResults.map(r => getBestGpa(r) ?? 0));

                return (
                  <div>
                    {/* Student banner */}
                    <div className="rc-card fu" style={{ padding:20, marginBottom:16, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                      <div style={{
                        width:52, height:52, borderRadius:"50%", flexShrink:0,
                        background:"linear-gradient(135deg,#1e40af,#3b82f6)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:22, fontWeight:800, color:"#fff",
                      }}>
                        {first.student?.name?.[0]?.toUpperCase() ?? "S"}
                      </div>
                      <div style={{ flex:1, minWidth:160 }}>
                        <p style={{ margin:0, fontWeight:800, fontSize:17, color:"#0f172a" }}>{first.student?.name}</p>
                        <p style={{ margin:"2px 0 0", fontSize:13, color:"#64748b" }}>
                          Roll: <strong style={{ color:"#1e40af" }}>{first.roll}</strong>
                          {first.student?.registration && <> &nbsp;·&nbsp; Reg: {first.student.registration}</>}
                        </p>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ margin:0, fontSize:13, color:"#374151", fontWeight:600 }}>{first.instituteName}</p>
                        <p style={{ margin:"2px 0 0", fontSize:12, color:"#94a3b8" }}>Code: {first.instituteCode}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="fu fu1" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:20 }}>
                      {[
                        { label:"Semesters", value: rollResults.length,                      color:"#1e40af" },
                        { label:"Passed",    value: passed,                                  color:"#15803d" },
                        { label:"Failed",    value: failed,                                  color:"#be123c" },
                        { label:"Best GPA",  value: bestGpa > 0 ? bestGpa.toFixed(2) : "—", color:"#b45309" },
                      ].map(s => (
                        <div key={s.label} className="rc-card" style={{ padding:"14px 18px" }}>
                          <p style={{ margin:0, fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em", fontWeight:700 }}>{s.label}</p>
                          <p style={{ margin:"4px 0 0", fontSize:24, fontWeight:800, color:s.color }}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Per-semester cards */}
                    <div style={{ display:"grid", gap:14 }}>
                      {rollResults.map((r, i) => {
                        const semGpa  = getSemesterGpa(r);
                        const allGpas = nonNullGpas(r);
                        return (
                          <div key={r.id} className="rc-card fu" style={{
                            padding:22,
                            animationDelay:`${i * 0.06}s`,
                            borderLeft:`4px solid ${STATUS[r.status]?.dot ?? "#94a3b8"}`,
                          }}>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:14, alignItems:"flex-start", marginBottom: (r.failedSubjects.length > 0 || r.referredSubjects.length > 0 || allGpas.length > 1) ? 14 : 0 }}>
                              <div style={{ flex:1, minWidth:200 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                                  <span style={{
                                    background:"#eff6ff", color:"#1e40af", border:"1px solid #bfdbfe",
                                    borderRadius:8, padding:"3px 12px", fontSize:13, fontWeight:800,
                                  }}>
                                    Semester {r.semester?.name ?? r.semesterName}
                                  </span>
                                  <StatusBadge status={r.status} />
                                </div>
                                <div style={{ fontSize:13, color:"#64748b", display:"flex", flexWrap:"wrap", gap:"4px 16px" }}>
                                  <span>📅 Exam Year: <strong style={{ color:"#374151" }}>{r.examYear}</strong></span>
                                  <span>📜 Regulation: <strong style={{ color:"#374151" }}>{r.regulation}</strong></span>
                                  <span>👥 Group: <strong style={{ color:"#374151" }}>{r.group?.name}</strong> ({r.group?.session})</span>
                                </div>
                              </div>
                              {/* GPA circles */}
                              <div style={{ display:"flex", gap:12, flexShrink:0 }}>
                                <GpaChip value={semGpa} label={`Sem ${r.semester?.order ?? r.semesterName}`} />
                                {allGpas.length > 1 &&
                                  allGpas
                                    .filter(g => g.label !== `Sem ${r.semester?.order}`)
                                    .slice(0, 2)
                                    .map(g => <GpaChip key={g.label} value={g.value as number} label={g.label} />)
                                }
                              </div>
                            </div>

                            {/* Failed / referred pills */}
                            {(r.failedSubjects.length > 0 || r.referredSubjects.length > 0) && (
                              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom: allGpas.length > 1 ? 12 : 0 }}>
                                {r.failedSubjects.length > 0 && (
                                  <span style={{ background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:8, padding:"4px 12px", fontSize:12, color:"#be123c", fontWeight:700 }}>
                                    ❌ Failed: {r.failedSubjects.length}
                                  </span>
                                )}
                                {r.referredSubjects.length > 0 && (
                                  <span style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:"4px 12px", fontSize:12, color:"#b45309", fontWeight:700 }}>
                                    ⚠️ Referred: {r.referredSubjects.length}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* All GPA breakdown */}
                            {allGpas.length > 1 && (
                              <div style={{ paddingTop:12, borderTop:"1px solid #f1f5f9" }}>
                                <p style={{ margin:"0 0 8px", fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em", fontWeight:700 }}>
                                  All GPA Records
                                </p>
                                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                  {allGpas.map(g => (
                                    <span key={g.label} style={{
                                      background:"#f8fafc", border:"1px solid #e2e8f0",
                                      borderRadius:8, padding:"4px 12px", fontSize:13, fontWeight:700, color:"#0f172a",
                                    }}>
                                      {g.label}: {(g.value as number).toFixed(2)}
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
                );
              })()}
            </div>
          )}

          {/* ════════════════════════════════ ALL TAB */}
          {activeTab === "all" && (
            <div>
              {/* Filter bar */}
              <div className="rc-card fu fu1" style={{ padding:20, marginBottom:20 }}>
                <p style={{ margin:"0 0 12px", fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:".08em", fontWeight:700 }}>
                  Filters
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:10 }}>
                  <input
                    className="rc-input" placeholder="Search roll / institute…"
                    value={filterState.searchTerm}
                    onChange={e => setFilterState(s => ({ ...s, searchTerm: e.target.value }))}
                  />
                  <input
                    className="rc-input" placeholder="Semester (e.g. 3)"
                    value={filterState.semesterName}
                    onChange={e => setFilterState(s => ({ ...s, semesterName: e.target.value }))}
                  />
                  <input
                    className="rc-input" placeholder="Exam year (e.g. 2025)"
                    value={filterState.examYear}
                    onChange={e => setFilterState(s => ({ ...s, examYear: e.target.value }))}
                  />
                  <input
                    className="rc-input" placeholder="Regulation (e.g. 2022)"
                    value={filterState.regulation}
                    onChange={e => setFilterState(s => ({ ...s, regulation: e.target.value }))}
                  />
                  <select
                    className="rc-input"
                    value={filterState.status}
                    onChange={e => setFilterState(s => ({ ...s, status: e.target.value }))}
                  >
                    <option value="">All Statuses</option>
                    {["PASSED","FAILED","WITHHELD","ABSENT","INCOMPLETE"].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <div style={{ display:"flex", gap:8 }}>
                    <button className="rc-btn rc-btn-primary" style={{ flex:1 }} onClick={handleFilter} disabled={isPending}>
                      {isPending ? <><span className="spinner" /> Applying…</> : "Apply"}
                    </button>
                    <button className="rc-btn rc-btn-ghost" onClick={handleClear}>Clear</button>
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div className="fu fu2" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <p style={{ margin:0, fontSize:13, color:"#64748b" }}>
                  Showing <strong style={{ color:"#0f172a" }}>{results.length}</strong> of{" "}
                  <strong style={{ color:"#0f172a" }}>{meta.total}</strong> results
                </p>
                {isPending && (
                  <span style={{ fontSize:12, color:"#3b82f6", display:"flex", alignItems:"center", gap:6 }}>
                    <span className="spinner" /> Loading…
                  </span>
                )}
              </div>

              {/* Table */}
              <div className="rc-card fu fu3" style={{ overflow:"hidden", marginBottom:20 }}>
                {results.length === 0 ? (
                  <div style={{ padding:64, textAlign:"center" }}>
                    <div style={{ fontSize:44, marginBottom:10 }}>📋</div>
                    <p style={{ color:"#94a3b8" }}>No results match the current filters.</p>
                  </div>
                ) : (
                  <div style={{ overflowX:"auto" }}>
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
                        {results.map((r, i) => (
                          <Fragment key={r.id}>
                            <tr
                              className={expandedId === r.id ? "rc-expanded" : ""}
                              onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                            >
                              <td style={{ color:"#94a3b8", fontSize:12, fontWeight:600 }}>
                                {(page - 1) * meta.limit + i + 1}
                              </td>
                              <td>
                                <span style={{ color:"#1e40af", fontWeight:800, fontFamily:"monospace", fontSize:13 }}>
                                  {r.roll}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight:600, color:"#0f172a", fontSize:13.5 }}>{r.student?.name ?? "—"}</div>
                                <div style={{ fontSize:11, color:"#94a3b8" }}>{r.student?.registration}</div>
                              </td>
                              <td>
                                <span style={{
                                  background:"#eff6ff", color:"#1e40af", border:"1px solid #bfdbfe",
                                  borderRadius:6, padding:"2px 10px", fontSize:12, fontWeight:700,
                                }}>
                                  Sem {r.semester?.name ?? r.semesterName}
                                </span>
                              </td>
                              <td style={{ fontSize:13, color:"#374151" }}>
                                <span style={{ fontWeight:600 }}>{r.group?.name}</span>
                                <span style={{ color:"#94a3b8" }}> · {r.group?.session}</span>
                              </td>
                              <td style={{ color:"#374151", fontWeight:600 }}>{r.examYear}</td>
                              <td style={{ color:"#64748b", fontSize:12 }}>{r.regulation}</td>
                              <td>
                                {(() => {
                                  const g = getSemesterGpa(r);
                                  const col = g == null ? "#94a3b8" : g >= 3.5 ? "#15803d" : g >= 2.5 ? "#0369a1" : g >= 1 ? "#b45309" : "#be123c";
                                  return (
                                    <span style={{ fontWeight:800, color:col, fontSize:15, fontVariantNumeric:"tabular-nums" }}>
                                      {g != null ? g.toFixed(2) : "—"}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td><StatusBadge status={r.status} /></td>
                            </tr>

                            {/* Expanded detail row */}
                            {expandedId === r.id && (
                              <tr>
                                <td colSpan={9} style={{ padding:0 }}>
                                  <div style={{
                                    background:"#f0f9ff", borderTop:"1px solid #bae6fd",
                                    padding:"16px 20px",
                                    display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16,
                                  }}>
                                    <div>
                                      <p style={{ margin:0, fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:".07em", fontWeight:700 }}>Institute</p>
                                      <p style={{ margin:"3px 0 0", fontSize:13.5, color:"#0f172a", fontWeight:600 }}>{r.instituteName}</p>
                                      <p style={{ margin:"2px 0 0", fontSize:12, color:"#94a3b8" }}>Code: {r.instituteCode}</p>
                                    </div>
                                    <div>
                                      <p style={{ margin:0, fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:".07em", fontWeight:700 }}>All GPAs</p>
                                      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:6 }}>
                                        {nonNullGpas(r).map(g => (
                                          <span key={g.label} style={{
                                            background:"#fff", border:"1px solid #e2e8f0",
                                            borderRadius:6, padding:"2px 10px", fontSize:12, fontWeight:700, color:"#0f172a",
                                          }}>
                                            {g.label}: {(g.value as number).toFixed(2)}
                                          </span>
                                        ))}
                                        {nonNullGpas(r).length === 0 && <span style={{ color:"#94a3b8", fontSize:13 }}>—</span>}
                                      </div>
                                    </div>
                                    <div>
                                      <p style={{ margin:0, fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:".07em", fontWeight:700 }}>Subjects</p>
                                      <p style={{ margin:"3px 0 0", fontSize:13, color:"#be123c", fontWeight:600 }}>Failed: {r.failedSubjects.length}</p>
                                      <p style={{ margin:"2px 0 0", fontSize:13, color:"#b45309", fontWeight:600 }}>Referred: {r.referredSubjects.length}</p>
                                    </div>
                                    <div>
                                      <p style={{ margin:0, fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:".07em", fontWeight:700 }}>Last Updated</p>
                                      <p style={{ margin:"3px 0 0", fontSize:13, color:"#374151", fontWeight:600 }}>
                                        {new Date(r.updatedAt).toLocaleDateString("en-BD", { day:"2-digit", month:"short", year:"numeric" })}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="fu fu4" style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                  <button className="rc-page-btn" disabled={page <= 1} onClick={() => pushParams({ page: String(page - 1) })}>←</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p2 = totalPages <= 7 ? i + 1
                      : page <= 4 ? i + 1
                      : page >= totalPages - 3 ? totalPages - 6 + i
                      : page - 3 + i;
                    return (
                      <button key={p2} className={`rc-page-btn${p2 === page ? " active" : ""}`} onClick={() => pushParams({ page: String(p2) })}>
                        {p2}
                      </button>
                    );
                  })}
                  <button className="rc-page-btn" disabled={page >= totalPages} onClick={() => pushParams({ page: String(page + 1) })}>→</button>
                  <span style={{ fontSize:12, color:"#94a3b8", marginLeft:6 }}>Page {page} / {totalPages}</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}