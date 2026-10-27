"use client";

import { Fragment, useMemo, useState } from "react";

type PracticalItem = {
  practicalId: number;
  title: string;
  type?: string;
  totalMarks: number;
  givenDate?: string | null;
  submissionDeadline?: string | null;
  submitted: boolean;
  obtainedMarks: number | null;
};

type StudentReport = {
  student: {
    id: number;
    name: string;
    roll: string;
    registration: string;
    email?: string | null;
    mobile?: string | null;
    profilePhoto?: string | null;
    attemptNumber?: number;
  };
  attendance: {
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
  practical: {
    total: number;
    submitted: number;
    pending: number;
    list?: PracticalItem[];
  };
};

type SubjectGroupReport = {
  subjectGroup: {
    id: number;
    subject: {
      id: number;
      name: string;
      code: string;
      shortName?: string;
    };
    group: {
      id: number;
      name: string;
      session: string;
      currentSemester?: { name: string };
    };
    semester: {
      id: number;
      name: string;
    };
  };
  totalStudents: number;
  students: StudentReport[];
};

interface Props {
  initialReports: SubjectGroupReport[];
  errorMessage?: string;
}

type StatusFilter = "ALL" | "LOW_ATTENDANCE" | "PENDING";
type SortKey = "ROLL" | "NAME" | "ATTENDANCE_ASC" | "ATTENDANCE_DESC";

const LOW_ATTENDANCE = 60;
const GOOD_ATTENDANCE = 80;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function attendanceTone(p: number) {
  if (p >= GOOD_ATTENDANCE)
    return { text: "text-emerald-600", bar: "bg-emerald-500" };
  if (p >= LOW_ATTENDANCE) return { text: "text-amber-600", bar: "bg-amber-500" };
  return { text: "text-rose-600", bar: "bg-rose-500" };
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(p: PracticalItem) {
  if (p.submitted || !p.submissionDeadline) return false;
  const d = new Date(p.submissionDeadline);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-xs font-semibold text-white ring-2 ring-white">
      {initials(name)}
    </div>
  );
}

function ProgressBar({ value, barClass }: { value: number; barClass: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all ${barClass}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${tone}`} />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

type SemesterInfo = SubjectGroupReport["subjectGroup"]["semester"];
type GroupInfo = SubjectGroupReport["subjectGroup"]["group"];

function SelectField({
  step,
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled,
}: {
  step: number;
  label: string;
  placeholder: string;
  value: number | null;
  options: { value: number; label: string }[];
  onChange: (id: number | null) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
          {step}
        </span>
        {label}
      </span>
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudentReportsClient({
  initialReports,
  errorMessage,
}: Props) {
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [subjectGroupId, setSubjectGroupId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("ROLL");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // ── Cascading options: Semester → Group → Subject ──
  const semesters = useMemo(() => {
    const map = new Map<number, SemesterInfo>();
    initialReports.forEach((r) =>
      map.set(r.subjectGroup.semester.id, r.subjectGroup.semester)
    );
    return Array.from(map.values());
  }, [initialReports]);

  // A single option is selected automatically
  const semId = semesterId ?? (semesters.length === 1 ? semesters[0].id : null);

  const groups = useMemo(() => {
    const map = new Map<number, GroupInfo>();
    initialReports
      .filter((r) => r.subjectGroup.semester.id === semId)
      .forEach((r) => map.set(r.subjectGroup.group.id, r.subjectGroup.group));
    return Array.from(map.values());
  }, [initialReports, semId]);

  const grpId = groupId ?? (groups.length === 1 ? groups[0].id : null);

  const subjects = useMemo(
    () =>
      initialReports.filter(
        (r) =>
          r.subjectGroup.semester.id === semId &&
          r.subjectGroup.group.id === grpId
      ),
    [initialReports, semId, grpId]
  );

  const selectedId =
    subjectGroupId ??
    (subjects.length === 1 ? subjects[0].subjectGroup.id : null);

  const selectedReport = useMemo(
    () => initialReports.find((r) => r.subjectGroup.id === selectedId) || null,
    [initialReports, selectedId]
  );

  const summary = useMemo(() => {
    if (!selectedReport) return null;
    const list = selectedReport.students;
    const total = list.length;
    const avg =
      total > 0
        ? Math.round(
            list.reduce((sum, s) => sum + s.attendance.percentage, 0) / total
          )
        : 0;
    const low = list.filter(
      (s) => s.attendance.percentage < LOW_ATTENDANCE
    ).length;
    const pendingStudents = list.filter((s) => s.practical.pending > 0).length;
    return { total, avg, low, pendingStudents };
  }, [selectedReport]);

  const filteredStudents = useMemo(() => {
    if (!selectedReport) return [];
    let list = selectedReport.students;

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.student.name.toLowerCase().includes(q) ||
          s.student.roll.toLowerCase().includes(q) ||
          s.student.registration.toLowerCase().includes(q)
      );
    }

    if (statusFilter === "LOW_ATTENDANCE") {
      list = list.filter((s) => s.attendance.percentage < LOW_ATTENDANCE);
    } else if (statusFilter === "PENDING") {
      list = list.filter((s) => s.practical.pending > 0);
    }

    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case "NAME":
          return a.student.name.localeCompare(b.student.name);
        case "ATTENDANCE_ASC":
          return a.attendance.percentage - b.attendance.percentage;
        case "ATTENDANCE_DESC":
          return b.attendance.percentage - a.attendance.percentage;
        default:
          return a.student.roll.localeCompare(b.student.roll, undefined, {
            numeric: true,
          });
      }
    });
    return sorted;
  }, [selectedReport, search, statusFilter, sortKey]);

  const resetView = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSortKey("ROLL");
    setExpanded(new Set());
  };

  const onSemesterChange = (id: number | null) => {
    setSemesterId(id);
    setGroupId(null);
    setSubjectGroupId(null);
    resetView();
  };

  const onGroupChange = (id: number | null) => {
    setGroupId(id);
    setSubjectGroupId(null);
    resetView();
  };

  const onSubjectChange = (id: number | null) => {
    setSubjectGroupId(id);
    resetView();
  };

  const toggleRow = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportCsv = () => {
    if (!selectedReport) return;
    const sg = selectedReport.subjectGroup;
    const header = [
      "Roll",
      "Name",
      "Registration",
      "Attendance %",
      "Present",
      "Absent",
      "Late",
      "Total Classes",
      "Practicals Submitted",
      "Practicals Total",
    ];
    const rows = filteredStudents.map((s) => [
      s.student.roll,
      s.student.name,
      s.student.registration,
      s.attendance.percentage,
      s.attendance.present,
      s.attendance.absent,
      s.attendance.late,
      s.attendance.total,
      s.practical.submitted,
      s.practical.total,
    ]);
    const csv = [header, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sg.subject.code}-${sg.group.name}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!selectedReport || !summary) return;
    const sg = selectedReport.subjectGroup;

    const esc = (v: unknown) =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const color = (p: number) =>
      p >= GOOD_ATTENDANCE ? "#059669" : p >= LOW_ATTENDANCE ? "#d97706" : "#e11d48";

    const rows = filteredStudents
      .map((s, i) => {
        const c = color(s.attendance.percentage);
        const pPct =
          s.practical.total > 0
            ? Math.round((s.practical.submitted / s.practical.total) * 100)
            : 0;
        const attempt =
          s.student.attemptNumber && s.student.attemptNumber > 1
            ? ` <span class="tag">Attempt ${s.student.attemptNumber}</span>`
            : "";
        const status =
          s.practical.pending > 0
            ? `<span class="badge bad">${s.practical.pending} Pending</span>`
            : `<span class="badge ok">Complete</span>`;

        return `<tr class="${i % 2 ? "alt" : ""}">
          <td class="roll">${esc(s.student.roll)}</td>
          <td>
            <div class="st">
              <span class="av">${esc(initials(s.student.name))}</span>
              <div>
                <div class="nm">${esc(s.student.name)}</div>
                <div class="rg">Reg: ${esc(s.student.registration)}${attempt}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="pct" style="color:${c}">${s.attendance.percentage}%</div>
            <div class="bar"><i style="width:${s.attendance.percentage}%;background:${c}"></i></div>
          </td>
          <td class="pal">
            <b style="color:#059669">${s.attendance.present}</b> /
            <b style="color:#e11d48">${s.attendance.absent}</b> /
            <b style="color:#d97706">${s.attendance.late}</b>
            <div class="sub">of ${s.attendance.total} classes</div>
          </td>
          <td>
            <div class="pct" style="color:#4f46e5">${s.practical.submitted}/${s.practical.total}</div>
            <div class="bar"><i style="width:${pPct}%;background:#6366f1"></i></div>
          </td>
          <td>${status}</td>
        </tr>`;
      })
      .join("");

    const filterNote =
      statusFilter === "LOW_ATTENDANCE"
        ? "Filter: Low attendance"
        : statusFilter === "PENDING"
        ? "Filter: Pending practical"
        : "";

    const generated = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(sg.subject.code)} Report</title>
<style>
  @page { size: A4; margin: 12mm 12mm 16mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: "Segoe UI", "Noto Sans Bengali", "Noto Sans", Arial, sans-serif; color: #0f172a; font-size: 11px; }
  .hero { position: relative; overflow: hidden; border-radius: 14px; padding: 18px 22px; color: #fff;
          background: linear-gradient(120deg, #4338ca 0%, #4f46e5 45%, #2563eb 100%); }
  .hero::before { content: ""; position: absolute; right: -40px; top: -60px; width: 190px; height: 190px; border-radius: 50%; background: rgba(255,255,255,.12); }
  .hero::after { content: ""; position: absolute; right: 70px; bottom: -70px; width: 140px; height: 140px; border-radius: 50%; background: rgba(255,255,255,.08); }
  .hero .eyebrow { font-size: 9px; letter-spacing: .18em; text-transform: uppercase; opacity: .8; }
  .hero h1 { margin: 4px 0 2px; font-size: 22px; line-height: 1.2; }
  .hero .meta { font-size: 11px; opacity: .92; }
  .chips { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; position: relative; z-index: 1; }
  .chip { background: rgba(255,255,255,.18); border-radius: 999px; padding: 3px 10px; font-size: 10px; font-weight: 600; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 14px 0; }
  .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; background: #fff; border-top: 3px solid var(--c); }
  .card .l { font-size: 8.5px; letter-spacing: .1em; text-transform: uppercase; color: #64748b; font-weight: 600; }
  .card .v { font-size: 22px; font-weight: 700; margin-top: 2px; color: var(--c); }
  .card .h { font-size: 9px; color: #94a3b8; }
  .note { font-size: 10px; color: #64748b; margin: 0 0 6px; display: flex; justify-content: space-between; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
  thead { display: table-header-group; }
  th { background: #eef2ff; color: #3730a3; text-align: left; font-size: 9px; letter-spacing: .08em; text-transform: uppercase; padding: 8px 10px; }
  td { padding: 7px 10px; border-top: 1px solid #f1f5f9; vertical-align: middle; }
  tr { page-break-inside: avoid; break-inside: avoid; }
  tr.alt td { background: #f8fafc; }
  .roll { font-weight: 700; color: #1e293b; width: 38px; }
  .st { display: flex; align-items: center; gap: 8px; }
  .av { width: 26px; height: 26px; border-radius: 50%; flex: none; display: inline-flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #6366f1, #3b82f6); color: #fff; font-size: 9px; font-weight: 700; }
  .nm { font-weight: 600; color: #0f172a; }
  .rg { font-size: 9px; color: #94a3b8; }
  .tag { background: #fef3c7; color: #b45309; border-radius: 4px; padding: 0 4px; font-weight: 600; }
  .pct { font-weight: 700; font-size: 11px; }
  .bar { height: 5px; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin-top: 3px; width: 90px; }
  .bar i { display: block; height: 100%; border-radius: 999px; }
  .pal { white-space: nowrap; }
  .sub { font-size: 8.5px; color: #94a3b8; }
  .badge { display: inline-block; border-radius: 999px; padding: 2px 9px; font-size: 9.5px; font-weight: 700; }
  .badge.ok { background: #d1fae5; color: #047857; }
  .badge.bad { background: #ffe4e6; color: #be123c; }
  .legend { margin-top: 12px; font-size: 9px; color: #64748b; display: flex; gap: 14px; flex-wrap: wrap; }
  .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
  .foot { position: fixed; bottom: -10mm; left: 0; right: 0; font-size: 8.5px; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 4px; }
</style></head>
<body>
  <div class="hero">
    <div class="eyebrow">Student Report</div>
    <h1>${esc(sg.subject.name)}</h1>
    <div class="meta">Code ${esc(sg.subject.code)} · Group ${esc(sg.group.name)} (${esc(sg.group.session)}) · ${esc(sg.semester.name)}</div>
    <div class="chips">
      <span class="chip">${summary.total} students</span>
      <span class="chip">Avg. attendance ${summary.avg}%</span>
      <span class="chip">Generated ${esc(generated)}</span>
    </div>
  </div>

  <div class="cards">
    <div class="card" style="--c:#4f46e5"><div class="l">Students</div><div class="v">${summary.total}</div><div class="h">Enrolled in this group</div></div>
    <div class="card" style="--c:${color(summary.avg)}"><div class="l">Avg. Attendance</div><div class="v">${summary.avg}%</div><div class="h">Across all students</div></div>
    <div class="card" style="--c:#e11d48"><div class="l">Low Attendance</div><div class="v">${summary.low}</div><div class="h">Below ${LOW_ATTENDANCE}%</div></div>
    <div class="card" style="--c:#d97706"><div class="l">Pending Practicals</div><div class="v">${summary.pendingStudents}</div><div class="h">Students with unsubmitted work</div></div>
  </div>

  <div class="note">
    <span>Showing ${filteredStudents.length} of ${selectedReport.totalStudents} students</span>
    <span>${esc(filterNote)}</span>
  </div>

  <table>
    <thead><tr>
      <th>Roll</th><th>Student</th><th>Attendance</th><th>P / A / L</th><th>Practical</th><th>Status</th>
    </tr></thead>
    <tbody>${rows || `<tr><td colspan="6" style="text-align:center;padding:24px;color:#94a3b8">No students found</td></tr>`}</tbody>
  </table>

  <div class="legend">
    <span><i class="dot" style="background:#059669"></i>Good (${GOOD_ATTENDANCE}%+)</span>
    <span><i class="dot" style="background:#d97706"></i>Average (${LOW_ATTENDANCE}–${GOOD_ATTENDANCE - 1}%)</span>
    <span><i class="dot" style="background:#e11d48"></i>Low (below ${LOW_ATTENDANCE}%)</span>
    <span>P / A / L = Present (incl. late) / Absent / Late</span>
  </div>

  <div class="foot"><span>${esc(sg.subject.name)} · Group ${esc(sg.group.name)}</span><span>${esc(generated)}</span></div>
</body></html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    if (!win) {
      iframe.remove();
      return;
    }

    const prevTitle = document.title;
    document.title = `${sg.subject.code}-${sg.group.name}-report`;

    const cleanup = () => {
      document.title = prevTitle;
      iframe.remove();
    };

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.onafterprint = cleanup;

    // Brief tick so the iframe lays out before the print dialog opens
    setTimeout(() => {
      win.focus();
      win.print();
      setTimeout(cleanup, 60000); // fallback if afterprint never fires
    }, 100);
  };

  // ── Error / empty states ──
  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
        <p className="text-base font-semibold text-rose-700">
          Could not load reports
        </p>
        <p className="mt-1 text-sm text-rose-600">{errorMessage}</p>
      </div>
    );
  }

  if (initialReports.length === 0) {
    return (
      <div className="rounded-2xl border bg-white py-20 text-center shadow-sm">
        <p className="text-lg font-medium text-gray-400">
          No subject groups found
        </p>
        <p className="mt-1 text-sm text-gray-400">
          You have no assigned subjects yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========== Selection: Semester → Group → Subject ========== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            step={1}
            label="Semester"
            placeholder="Select semester"
            value={semId}
            options={semesters.map((x) => ({ value: x.id, label: x.name }))}
            onChange={onSemesterChange}
          />
          <SelectField
            step={2}
            label="Group"
            placeholder="Select group"
            value={grpId}
            disabled={semId === null}
            options={groups.map((x) => ({
              value: x.id,
              label: `${x.name} (${x.session})`,
            }))}
            onChange={onGroupChange}
          />
          <SelectField
            step={3}
            label="Subject"
            placeholder="Select subject"
            value={selectedId}
            disabled={grpId === null}
            options={subjects.map((r) => ({
              value: r.subjectGroup.id,
              label: `${r.subjectGroup.subject.name} (${r.subjectGroup.subject.code})`,
            }))}
            onChange={onSubjectChange}
          />
        </div>
      </section>

      {/* ========== Selected report ========== */}
      {selectedReport && summary && (
        <section className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Students"
              value={summary.total}
              hint="Enrolled in this group"
              tone="bg-indigo-500"
            />
            <StatCard
              label="Avg. Attendance"
              value={`${summary.avg}%`}
              hint="Across all students"
              tone={attendanceTone(summary.avg).bar}
            />
            <StatCard
              label="Low Attendance"
              value={summary.low}
              hint={`Below ${LOW_ATTENDANCE}%`}
              tone="bg-rose-500"
            />
            <StatCard
              label="Pending Practicals"
              value={summary.pendingStudents}
              hint="Students with unsubmitted work"
              tone="bg-amber-500"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            {/* Header */}
            <div className="border-b bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 text-white">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedReport.subjectGroup.subject.name}
                  </h2>
                  <p className="text-sm text-indigo-100">
                    Group {selectedReport.subjectGroup.group.name} (
                    {selectedReport.subjectGroup.group.session}) ·{" "}
                    {selectedReport.subjectGroup.semester.name}
                  </p>
                </div>
                <div className="mt-2 flex w-fit items-center gap-2 sm:mt-0">
                <button
                  onClick={exportPdf}
                  disabled={filteredStudents.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 21h10a2 2 0 002-2V9l-5-5H7a2 2 0 00-2 2v13a2 2 0 002 2zM14 4v5h5"
                    />
                  </svg>
                  Export PDF
                </button>
                <button
                  onClick={exportCsv}
                  disabled={filteredStudents.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/25 disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
                    />
                  </svg>
                  Export CSV
                </button>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="text"
                placeholder="Search by name, roll or registration..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:w-80"
              />

              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    ["ALL", "All"],
                    ["LOW_ATTENDANCE", "Low attendance"],
                    ["PENDING", "Pending practical"],
                  ] as [StatusFilter, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      statusFilter === key
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}

                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="rounded-lg border bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ROLL">Sort: Roll</option>
                  <option value="NAME">Sort: Name</option>
                  <option value="ATTENDANCE_ASC">Sort: Attendance ↑</option>
                  <option value="ATTENDANCE_DESC">Sort: Attendance ↓</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Roll</th>
                    <th className="px-4 py-3 font-semibold">Student</th>
                    <th className="w-48 px-4 py-3 font-semibold">Attendance</th>
                    <th className="px-4 py-3 font-semibold">P / A / L</th>
                    <th className="w-44 px-4 py-3 font-semibold">Practical</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="w-10 px-2 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-slate-400"
                      >
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((item) => {
                      const tone = attendanceTone(item.attendance.percentage);
                      const isOpen = expanded.has(item.student.id);
                      const practicalPct =
                        item.practical.total > 0
                          ? Math.round(
                              (item.practical.submitted /
                                item.practical.total) *
                                100
                            )
                          : 0;
                      const list = item.practical.list ?? [];

                      return (
                        <Fragment key={item.student.id}>
                          <tr
                            onClick={() => toggleRow(item.student.id)}
                            className="cursor-pointer border-b transition hover:bg-slate-50/70"
                          >
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {item.student.roll}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={item.student.name}
                                  src={item.student.profilePhoto}
                                />
                                <div className="min-w-0">
                                  <div className="truncate font-medium text-slate-800">
                                    {item.student.name}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>Reg: {item.student.registration}</span>
                                    {item.student.attemptNumber &&
                                      item.student.attemptNumber > 1 && (
                                        <span className="rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700">
                                          Attempt {item.student.attemptNumber}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className={`font-semibold ${tone.text}`}>
                                  {item.attendance.percentage}%
                                </span>
                                <span className="text-slate-400">
                                  {item.attendance.present}/
                                  {item.attendance.total}
                                </span>
                              </div>
                              <div className="mt-1">
                                <ProgressBar
                                  value={item.attendance.percentage}
                                  barClass={tone.bar}
                                />
                              </div>
                            </td>

                            <td className="px-4 py-3 text-xs text-slate-600">
                              <span className="font-medium text-emerald-600">
                                {item.attendance.present}
                              </span>
                              {" / "}
                              <span className="font-medium text-rose-600">
                                {item.attendance.absent}
                              </span>
                              {" / "}
                              <span className="font-medium text-amber-600">
                                {item.attendance.late}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-700">
                                  {item.practical.submitted}/
                                  {item.practical.total}
                                </span>
                                <span className="text-slate-400">
                                  {practicalPct}%
                                </span>
                              </div>
                              <div className="mt-1">
                                <ProgressBar
                                  value={practicalPct}
                                  barClass="bg-indigo-500"
                                />
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              {item.practical.pending > 0 ? (
                                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                                  {item.practical.pending} Pending
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                  Complete
                                </span>
                              )}
                            </td>

                            <td className="px-2 py-3 text-slate-400">
                              <svg
                                className={`h-4 w-4 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </td>
                          </tr>

                          {isOpen && (
                            <tr className="border-b bg-slate-50/60">
                              <td colSpan={7} className="px-4 py-4">
                                <div className="grid gap-4 lg:grid-cols-3">
                                  {/* Contact */}
                                  <div className="rounded-xl border bg-white p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      Contact
                                    </p>
                                    <dl className="mt-2 space-y-1 text-sm text-slate-600">
                                      <div className="flex justify-between gap-2">
                                        <dt className="text-slate-400">Email</dt>
                                        <dd className="truncate">
                                          {item.student.email || "—"}
                                        </dd>
                                      </div>
                                      <div className="flex justify-between gap-2">
                                        <dt className="text-slate-400">Mobile</dt>
                                        <dd>{item.student.mobile || "—"}</dd>
                                      </div>
                                    </dl>
                                  </div>

                                  {/* Practical list */}
                                  <div className="rounded-xl border bg-white p-4 lg:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      Practical / Job details
                                    </p>

                                    {list.length === 0 ? (
                                      <p className="mt-2 text-sm text-slate-400">
                                        No practicals assigned yet.
                                      </p>
                                    ) : (
                                      <ul className="mt-2 divide-y">
                                        {list.map((p) => {
                                          const overdue = isOverdue(p);
                                          return (
                                            <li
                                              key={p.practicalId}
                                              className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                              <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-slate-800">
                                                  {p.title}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                  Given {formatDate(p.givenDate)}{" "}
                                                  · Due{" "}
                                                  {formatDate(
                                                    p.submissionDeadline
                                                  )}
                                                </p>
                                              </div>

                                              <div className="flex items-center gap-3 text-xs">
                                                <span className="text-slate-600">
                                                  {p.obtainedMarks ?? "—"} /{" "}
                                                  {p.totalMarks}
                                                </span>
                                                {p.submitted ? (
                                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                                                    Submitted
                                                  </span>
                                                ) : overdue ? (
                                                  <span className="rounded-full bg-rose-50 px-2 py-0.5 font-medium text-rose-700">
                                                    Overdue
                                                  </span>
                                                ) : (
                                                  <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                                                    Pending
                                                  </span>
                                                )}
                                              </div>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t bg-slate-50 px-5 py-2.5 text-xs text-slate-500">
              <span>
                Showing {filteredStudents.length} of{" "}
                {selectedReport.totalStudents} students
              </span>
              <span className="hidden sm:inline">
                Click a row to see practical details
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Nothing selected */}
      {!selectedReport && (
        <div className="rounded-2xl border border-dashed bg-white py-16 text-center">
          <p className="text-slate-500">
            Select a semester, group and subject above to view student reports
          </p>
        </div>
      )}
    </div>
  );
}