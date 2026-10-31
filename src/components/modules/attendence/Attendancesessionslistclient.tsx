/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  AttendanceSession,
  formatSessionDate,
  formatSessionTime,
  getSessionSummary,
} from "@/types/attendence.interface";

function AttendanceRatePill({
  records,
}: {
  records: AttendanceSession["records"];
}) {
  if (!records || records.length === 0)
    return <span className="text-xs text-muted-foreground">No records</span>;

  const { total, present, attendanceRate } = getSessionSummary(records as any);
  const color =
    attendanceRate >= 80
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : attendanceRate >= 60
        ? "bg-amber-50 text-amber-800 ring-amber-200"
        : "bg-rose-50 text-rose-700 ring-rose-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${color}`}
    >
      {attendanceRate}% · {present}/{total}
    </span>
  );
}

function SessionRow({
  session,
  index,
  groupId,
}: {
  session: AttendanceSession;
  index: number;
  groupId: number;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="group border-b border-border transition-colors last:border-0 hover:bg-secondary/30"
    >
      <td className="py-3.5 pl-5 pr-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays size={15} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {formatSessionDate(session.date)}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={10} />
              {formatSessionTime(session.createdAt)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {session.subject?.name ?? "—"}
          </p>
          {(session.subject?.code ?? session.subject?.shortName) && (
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border">
              {session.subject?.code ?? session.subject?.shortName}
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-3.5">
        <p className="text-sm text-foreground">
          {session.teacher?.name ?? session.teacher?.user?.name ?? "—"}
        </p>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border">
          {session.takenByRole === "TEACHER" ? "Teacher" : "CR Student"}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <AttendanceRatePill records={session.records} />
      </td>

      <td className="py-3.5 pl-4 pr-5 text-right">
        <Link
          href={`${groupId}/${session.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-primary to-emerald-600 px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:shadow-lg hover:shadow-primary/35 active:scale-95"
        >
          <Eye size={13} />
          View
        </Link>
      </td>
    </motion.tr>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-accent text-primary/50 ring-1 ring-gold-soft">
        <CalendarDays size={28} />
      </div>
      <p className="text-base font-bold text-foreground">No sessions found</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Attendance sessions will appear here once created.
      </p>
    </div>
  );
}

type Props = {
  sessions: AttendanceSession[];
  groupId: number;
  totalPages: number;
  currentPage: number;
  total: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onSearch: (q: string) => void;
};

export default function AttendanceSessionsListClient({
  sessions,
  groupId,
  totalPages,
  currentPage,
  total,
  isLoading = false,
  onPageChange,
  onSearch,
}: Props) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
        <div className="h-1 w-full bg-gradient-to-r from-primary to-emerald-500" />
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays size={15} className="text-primary" />
            <span className="font-bold tabular-nums text-foreground">
              {total}
            </span>{" "}
            sessions recorded
          </div>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearch}
              placeholder="Search by date or subject…"
              className="w-60 rounded-xl border border-border bg-secondary/40 py-2 pl-8 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-blue-400" />
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {["Date & Time", "Subject", "Taken By", "Attendance", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground first:pl-5 last:pr-5"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {sessions.map((session, i) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      index={i}
                      groupId={groupId}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="theme-card flex items-center justify-between px-5 py-3 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">
            Page{" "}
            <span className="font-bold text-foreground">{currentPage}</span> of{" "}
            <span className="font-bold text-foreground">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPage) <= 1
              )
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange(p as number)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                      currentPage === p
                        ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25"
                        : "border border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}