"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
  Users,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  bulkCreateSubmissions,
  bulkUpdateSubmissions,
  getSubmissions,
} from "@/service/Practical/practical.service";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Student {
  id: number;
  name: string;
  rollNo?: string;
}

interface ExistingSubmission {
  id: number;
  studentId: number;
  submitted: boolean;
  obtainedMarks?: number | null;
}

interface SubmissionRow {
  studentId: number;
  studentName: string;
  rollNo?: string;
  submitted: boolean;
  obtainedMarks: string;
  existsInDb: boolean;
  _original: { submitted: boolean; obtainedMarks: string };
}

interface SubmissionsModalProps {
  open: boolean;
  onClose: () => void;
  practical: {
    id: number;
    title: string;
    totalMarks: number;
    type: string;
    submissions?: ExistingSubmission[];
  } | null;
  students: Student[];
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function buildEmptyRow(st: Student): SubmissionRow {
  return {
    studentId: st.id,
    studentName: st.name,
    rollNo: st.rollNo,
    submitted: false,
    obtainedMarks: "",
    existsInDb: false,
    _original: { submitted: false, obtainedMarks: "" },
  };
}

function isRowDirty(row: SubmissionRow): boolean {
  return (
    row.submitted !== row._original.submitted ||
    row.obtainedMarks !== row._original.obtainedMarks
  );
}

function hasData(row: SubmissionRow): boolean {
  return row.obtainedMarks !== "" || row.submitted;
}

function buildRowsFromPractical(
  students: Student[],
  submissions: ExistingSubmission[],
): SubmissionRow[] {
  const existingMap = new Map<number, ExistingSubmission>();
  submissions.forEach((s) => existingMap.set(Number(s.studentId), s));

  return students.map((st) => {
    const existing = existingMap.get(st.id);
    if (!existing) return buildEmptyRow(st);

    const marksStr =
      existing.obtainedMarks != null ? String(existing.obtainedMarks) : "";
    const submittedVal = Boolean(existing.submitted);

    return {
      studentId: st.id,
      studentName: st.name,
      rollNo: st.rollNo,
      submitted: submittedVal,
      obtainedMarks: marksStr,
      existsInDb: true,
      _original: { submitted: submittedVal, obtainedMarks: marksStr },
    };
  });
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function SubmissionsModal({
  open,
  onClose,
  practical,
  students,
}: SubmissionsModalProps) {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !practical?.id) {
      if (!open) {
        setRows([]);
        setSearch("");
      }
      return;
    }

    if (practical.submissions && practical.submissions.length > 0) {
      setRows(buildRowsFromPractical(students, practical.submissions));
      return;
    }

    if (practical.submissions !== undefined) {
      setRows(students.map(buildEmptyRow));
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setRows([]);

      try {
        const res = await getSubmissions({
          practicalId: practical.id,
          limit: 500,
          page: 1,
        });

        if (cancelled) return;

        const submissions: any[] = res.data ?? [];

        const existingMap = new Map<
          number,
          { submitted: boolean; obtainedMarks: number | null }
        >();
        submissions.forEach((s: any) => {
          existingMap.set(Number(s.studentId), {
            submitted: Boolean(s.submitted),
            obtainedMarks: s.obtainedMarks ?? null,
          });
        });

        const built: SubmissionRow[] = students.map((st) => {
          const existing = existingMap.get(st.id);
          if (!existing) return buildEmptyRow(st);

          const marksStr =
            existing.obtainedMarks != null
              ? String(existing.obtainedMarks)
              : "";
          const submittedVal = existing.submitted;

          return {
            studentId: st.id,
            studentName: st.name,
            rollNo: st.rollNo,
            submitted: submittedVal,
            obtainedMarks: marksStr,
            existsInDb: true,
            _original: { submitted: submittedVal, obtainedMarks: marksStr },
          };
        });

        setRows(built);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load submissions:", err);
        toast.error("Failed to load existing submissions");
        setRows(students.map(buildEmptyRow));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, practical?.id]);

  // Auto-focus search when modal opens
  useEffect(() => {
    if (open && !loading) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, loading]);

  if (!open || !practical) return null;

  // ── Filtered rows (search applies to name + rollNo) ──────────────────────
  const q = search.trim().toLowerCase();
  const filteredRows = q
    ? rows.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.rollNo?.toLowerCase().includes(q),
      )
    : rows;

  // ── Row mutations (operate on global index in `rows`, not filtered index) ─
  const toggleSubmitted = (studentId: number) =>
    setRows((prev) =>
      prev.map((r) =>
        r.studentId === studentId ? { ...r, submitted: !r.submitted } : r,
      ),
    );

  const setMarks = (studentId: number, val: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.studentId === studentId ? { ...r, obtainedMarks: val } : r,
      ),
    );

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    for (const r of rows) {
      if (
        r.obtainedMarks !== "" &&
        Number(r.obtainedMarks) > practical.totalMarks
      ) {
        toast.error(
          `Marks for ${r.studentName} exceed total marks (${practical.totalMarks})`,
        );
        return;
      }
    }

    setSaving(true);

    try {
      // Phase A: create brand-new records that have data
      const newRows = rows.filter((r) => !r.existsInDb && hasData(r));

      if (newRows.length > 0) {
        const createRes = await bulkCreateSubmissions({
          practicalId: practical.id,
          studentIds: newRows.map((r) => r.studentId),
        });

        if (!createRes.success) {
          toast.error(createRes.message ?? "Failed to create submissions");
          return;
        }
      }

      // Phase B: update newly created + pre-existing dirty rows
      const newStudentIds = new Set(newRows.map((r) => r.studentId));

      const rowsToUpdate = rows.filter(
        (r) =>
          newStudentIds.has(r.studentId) || (r.existsInDb && isRowDirty(r)),
      );

      if (rowsToUpdate.length === 0 && newRows.length === 0) {
        toast.info("No changes to save.");
        return;
      }

      if (rowsToUpdate.length > 0) {
        const updateRes = await bulkUpdateSubmissions(practical.id, {
          submissions: rowsToUpdate.map((r) => ({
            studentId: r.studentId,
            submitted: r.submitted,
            obtainedMarks:
              r.obtainedMarks !== "" ? Number(r.obtainedMarks) : undefined,
          })),
        });

        if (!updateRes.success) {
          toast.error(updateRes.message ?? "Failed to update submissions");
          return;
        }
      }

      // Phase C: sync local state
      setRows((prev) =>
        prev.map((r) => ({
          ...r,
          existsInDb: r.existsInDb || newStudentIds.has(r.studentId),
          _original: { submitted: r.submitted, obtainedMarks: r.obtainedMarks },
        })),
      );

      toast.success("Submissions saved successfully!");
      onClose();
    } catch (err) {
      console.error("Save submissions error:", err);
      toast.error("Something went wrong while saving");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived counts ───────────────────────────────────────────────────────
  const submittedCount = rows.filter((r) => r.submitted).length;
  const savedCount = rows.filter((r) => r.existsInDb).length;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Manage Submissions
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {practical.title}&nbsp;·&nbsp;Total: {practical.totalMarks} marks
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <Users className="mr-1 inline h-3.5 w-3.5" />
              {submittedCount}/{rows.length} submitted
            </span>

            {savedCount > 0 && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                {savedCount} saved
              </span>
            )}

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="border-b border-slate-100 px-6 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name......"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {/* Result count when filtering */}
          {q && (
            <p className="mt-1.5 text-xs text-slate-400">
              {filteredRows.length === 0
                ? "No students match your search"
                : `${filteredRows.length} of ${rows.length} students`}
            </p>
          )}
        </div>

        {/* ── Body ── */}
        <div className="max-h-[55vh] overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <p className="text-xs text-slate-400">Loading submissions…</p>
            </div>
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              No students found in this group.
            </p>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="mb-2 h-8 w-8 text-slate-200" />
              <p className="text-sm font-medium text-slate-400">
                No students match
              </p>
              <p className="mt-0.5 text-xs text-slate-300">
                Try a different name or roll number
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_110px_110px] gap-3 px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span>Student</span>
                <span className="text-center">Obtained Marks</span>
                <span className="text-center">Submitted</span>
              </div>

              {filteredRows.map((row) => (
                <div
                  key={row.studentId}
                  className={`grid grid-cols-[1fr_110px_110px] items-center gap-3 rounded-xl border px-3 py-3 transition ${
                    row.submitted
                      ? "border-emerald-200 bg-emerald-50"
                      : row.existsInDb
                        ? "border-blue-100 bg-blue-50/40"
                        : "border-slate-100 bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  {/* Student info */}
                  <div className="flex items-center gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {/* Highlight matching search term in name */}
                        {q
                          ? highlightMatch(row.studentName, q)
                          : row.studentName}
                      </p>
                      {row.rollNo && (
                        <p className="text-xs text-slate-400">
                          {q ? highlightMatch(row.rollNo, q) : row.rollNo}
                        </p>
                      )}
                    </div>
                    {row.existsInDb && (
                      <span
                        title="Already saved"
                        className="ml-auto h-2 w-2 shrink-0 rounded-full bg-emerald-400"
                      />
                    )}
                  </div>

                  {/* Marks input */}
                  <div>
                    <input
                      type="number"
                      min={0}
                      max={practical.totalMarks}
                      value={row.obtainedMarks}
                      onChange={(e) => setMarks(row.studentId, e.target.value)}
                      placeholder={`/ ${practical.totalMarks}`}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-center text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Submitted toggle */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => toggleSubmitted(row.studentId)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        row.submitted
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {row.submitted ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Yes
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" /> No
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          {/* Show save scope hint when searching */}
          {q ? (
            <p className="text-xs text-slate-400">
              Save applies to{" "}
              <span className="font-semibold text-slate-600">all</span>{" "}
              students, not just search results
            </p>
          ) : (
            <span />
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600 disabled:opacity-70"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Highlight helper — wraps matched substring in a <mark>
// ─────────────────────────────────────────────
function highlightMatch(text: string, query: string): React.ReactNode {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-yellow-100 px-0.5 text-yellow-800">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
