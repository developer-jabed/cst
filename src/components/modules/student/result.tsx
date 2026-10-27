/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Search,
  GraduationCap,
  Filter,
  ChevronLeft,
  ChevronRight,
  Hash,
  Calendar,
  BookOpen,
  Award,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultItem {
  _id?: string;
  roll?: string;
  name?: string;
  semesterName?: string;
  examYear?: string;
  regulation?: string;
  cgpa?: number | string;
  gpa?: number | string;
  status?: string;
  totalCredit?: number;
  [key: string]: any;
}

interface Props {
  mode: "all" | "roll";
  results: ResultItem[];
  meta: { page: number; limit: number; total: number };
  rollResults: ResultItem[];
  initialRoll: string;
  page: number;
  filters: {
    searchTerm: string;
    semesterName: string;
    examYear: string;
    regulation: string;
    status: string;
  };
}

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
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [rollInput, setRollInput] = useState(initialRoll);
  const [localFilters, setLocalFilters] = useState(filters);

  const updateQuery = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (!("page" in updates)) params.set("page", "1");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSearchByRoll = () => {
    if (!rollInput.trim()) return;
    updateQuery({ roll: rollInput.trim(), page: 1 });
  };

  const clearRoll = () => {
    setRollInput("");
    updateQuery({ roll: undefined, page: 1 });
  };

  const applyFilters = () => {
    updateQuery({
      searchTerm: localFilters.searchTerm || undefined,
      semesterName: localFilters.semesterName || undefined,
      examYear: localFilters.examYear || undefined,
      regulation: localFilters.regulation || undefined,
      status: localFilters.status || undefined,
      page: 1,
    });
  };

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 15)));

  return (
    <div className=" min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-7">
          <div className=" mb-2.5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Results
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-[2.1rem]">
            My Results
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View your semester-wise academic performance
          </p>
        </div>

        {/* Main panel — highly transparent + blurred so outer texture shows */}
        <div
          className={cn(
            "overflow-hidden rounded-[1.4rem]",
            "border border-white/50 dark:border-white/10",
            "bg-white/35 dark:bg-card/30",
            "backdrop-blur-2xl",
            "shadow-[0_8px_32px_rgba(11,31,26,0.08)]"
          )}
        >
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-white/40 dark:border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Mode pills */}
            <div className="flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/5 p-1">
              <button
                onClick={() => updateQuery({ roll: undefined, page: 1 })}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  mode === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Results
              </button>
              <button
                onClick={() => {
                  if (rollInput) updateQuery({ roll: rollInput, page: 1 });
                }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  mode === "roll"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                By Roll
              </button>
            </div>

            {/* Roll search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Hash
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <input
                  value={rollInput}
                  onChange={(e) => setRollInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchByRoll()}
                  placeholder="Enter roll number"
                  className="h-9 w-44 rounded-full border border-white/50 dark:border-white/10 bg-white/25 dark:bg-white/5 pl-9 pr-3 text-sm outline-none backdrop-blur-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                onClick={handleSearchByRoll}
                disabled={isPending || !rollInput.trim()}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Search className="h-4 w-4" strokeWidth={1.75} />
                )}
                Search
              </button>
              {mode === "roll" && (
                <button
                  onClick={clearRoll}
                  className="h-9 rounded-full border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/5 px-3 text-sm text-muted-foreground transition hover:bg-white/30"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          {mode === "all" && (
            <div className="flex flex-wrap items-end gap-3 border-b border-white/30 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-5 py-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Search
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <input
                    value={localFilters.searchTerm}
                    onChange={(e) =>
                      setLocalFilters((f) => ({ ...f, searchTerm: e.target.value }))
                    }
                    placeholder="Name / Roll"
                    className="h-8 w-40 rounded-lg border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 pl-8 pr-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Semester
                </label>
                <input
                  value={localFilters.semesterName}
                  onChange={(e) =>
                    setLocalFilters((f) => ({ ...f, semesterName: e.target.value }))
                  }
                  placeholder="e.g. 1st"
                  className="h-8 w-28 rounded-lg border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 px-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Exam Year
                </label>
                <input
                  value={localFilters.examYear}
                  onChange={(e) =>
                    setLocalFilters((f) => ({ ...f, examYear: e.target.value }))
                  }
                  placeholder="2024"
                  className="h-8 w-24 rounded-lg border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 px-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </label>
                <select
                  value={localFilters.status}
                  onChange={(e) =>
                    setLocalFilters((f) => ({ ...f, status: e.target.value }))
                  }
                  className="h-8 w-28 rounded-lg border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 px-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="">All</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Incomplete">Incomplete</option>
                </select>
              </div>

              <button
                onClick={applyFilters}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 text-sm font-medium text-primary transition hover:bg-primary/15"
              >
                <Filter className="h-3.5 w-3.5" strokeWidth={1.75} />
                Apply
              </button>
            </div>
          )}

          {/* Content */}
          <div className="relative min-h-[320px]">
            {isPending && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-[2px]">
                <Loader2 className="h-6 w-6 animate-spin text-primary" strokeWidth={1.75} />
              </div>
            )}

            {mode === "roll" ? (
              <RollView results={rollResults} roll={initialRoll} />
            ) : (
              <AllResultsView
                results={results}
                meta={meta}
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => updateQuery({ page: p })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── All Results Table ───────────────────────── */

function AllResultsView({
  results,
  meta,
  page,
  totalPages,
  onPageChange,
}: {
  results: ResultItem[];
  meta: { page: number; limit: number; total: number };
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (!results.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5">
          <FileText className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="font-medium text-foreground">No results found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or search term
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/30 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3.5 font-medium">Roll</th>
              <th className="px-5 py-3.5 font-medium">Name</th>
              <th className="px-5 py-3.5 font-medium">Semester</th>
              <th className="px-5 py-3.5 font-medium">Year</th>
              <th className="px-5 py-3.5 font-medium">CGPA</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, idx) => (
              <tr
                key={item._id || idx}
                className="border-b border-white/20 dark:border-white/5 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              >
                <td className="px-5 py-3.5 font-medium text-foreground">
                  {item.roll || "—"}
                </td>
                <td className="px-5 py-3.5 text-foreground">{item.name || "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    <BookOpen className="h-3 w-3" strokeWidth={1.75} />
                    {item.semesterName || "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {item.examYear || "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-serif text-base font-bold text-primary">
                    {item.cgpa ?? item.gpa ?? "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-white/30 dark:border-white/10 px-5 py-3.5">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {(page - 1) * meta.limit + 1}–{Math.min(page * meta.limit, meta.total)}
          </span>{" "}
          of <span className="font-medium text-foreground">{meta.total}</span>
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 text-muted-foreground transition hover:bg-white/30 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <span className="min-w-[3.5rem] text-center text-sm font-medium tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 text-muted-foreground transition hover:bg-white/30 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────── Roll Detail View ───────────────────────── */

function RollView({ results, roll }: { results: ResultItem[]; roll: string }) {
  if (!results.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5">
          <User className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="font-medium text-foreground">No results for roll {roll}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Double-check the roll number and try again
        </p>
      </div>
    );
  }

  const student = results[0];

  return (
    <div className="p-5 sm:p-6">
      {/* Student header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-soft/30 bg-gradient-to-br from-secondary/60 to-accent/60 backdrop-blur-sm">
            <GraduationCap className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">
              {student.name || "Student"}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Hash className="h-3.5 w-3.5" strokeWidth={1.75} />
              {student.roll || roll}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
            {results.length} semester{results.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Semester cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((item, idx) => (
          <div
            key={item._id || idx}
            className="group relative overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/25 dark:bg-white/5 p-5 backdrop-blur-sm transition hover:border-primary/30 hover:shadow-[var(--shadow-hover)]"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-emerald-500 to-[var(--gold)] opacity-0 transition group-hover:opacity-100" />

            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Semester
                </p>
                <p className="mt-0.5 font-serif text-lg font-bold text-foreground">
                  {item.semesterName || "—"}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  CGPA
                </p>
                <p className="mt-0.5 font-serif text-xl font-bold text-primary">
                  {item.cgpa ?? item.gpa ?? "—"}
                </p>
              </div>
              <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Year
                </p>
                <p className="mt-0.5 font-medium text-foreground">
                  {item.examYear || "—"}
                </p>
              </div>
            </div>

            {(item.regulation || item.totalCredit) && (
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                {item.regulation && (
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" strokeWidth={1.75} />
                    {item.regulation}
                  </span>
                )}
                {item.totalCredit && <span>{item.totalCredit} credits</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Status Badge ───────────────────────── */

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  const isPassed = /pass|success|complete/i.test(status);
  const isFailed = /fail|incomplete|absent/i.test(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isPassed && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        isFailed && "bg-destructive/10 text-destructive",
        !isPassed && !isFailed && "bg-black/5 dark:bg-white/5 text-muted-foreground"
      )}
    >
      {isPassed ? (
        <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} />
      ) : isFailed ? (
        <XCircle className="h-3 w-3" strokeWidth={1.75} />
      ) : null}
      {status}
    </span>
  );
}