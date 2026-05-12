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
import { AttendanceSession, formatSessionDate, formatSessionTime, getSessionSummary } from "@/types/attendence.interface";

function AttendanceRatePill({ records }: { records: AttendanceSession["records"] }) {
  if (!records || records.length === 0)
    return <span className="text-xs text-slate-400">No records</span>;

  const { total, present, attendanceRate } = getSessionSummary(records as any);
  const color =
    attendanceRate >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : attendanceRate >= 60
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {attendanceRate}% · {present}/{total}
    </span>
  );
}

// ─── Session row ──────────────────────────────────────────────────────────────

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
      className="group border-b border-slate-100 hover:bg-indigo-50/40 transition-colors"
    >
      {/* Date & Time */}
      <td className="py-3.5 pl-5 pr-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <CalendarDays size={15} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{formatSessionDate(session.date)}</p>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={10} />
              {formatSessionTime(session.createdAt)}
            </p>
          </div>
        </div>
      </td>

      {/* Subject */}
      <td className="px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold text-slate-800">{session.subject?.name ?? "—"}</p>
          {(session.subject?.code ?? session.subject?.shortName) && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              {session.subject?.code ?? session.subject?.shortName}
            </span>
          )}
        </div>
      </td>

      {/* Teacher / Taken by */}
      <td className="px-4 py-3.5">
        <p className="text-sm text-slate-700">
          {session.teacher?.name ?? session.teacher?.user?.name ?? "—"}
        </p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          {session.takenByRole === "TEACHER" ? "Teacher" : "CR Student"}
        </span>
      </td>

      {/* Attendance rate */}
      <td className="px-4 py-3.5">
        <AttendanceRatePill records={session.records} />
      </td>

      {/* View button */}
      <td className="py-3.5 pr-5 pl-4 text-right">
        <Link
          href={`${groupId}/${session.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
        >
          <Eye size={13} />
          View
        </Link>
      </td>
    </motion.tr>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <CalendarDays size={28} className="text-slate-400" />
      </div>
      <p className="text-base font-semibold text-slate-700">No sessions found</p>
      <p className="mt-1 text-sm text-slate-400">Attendance sessions will appear here once created.</p>
    </div>
  );
}

// ─── Props & Main Component ───────────────────────────────────────────────────

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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={15} className="text-indigo-500" />
          <span className="font-semibold text-slate-700">{total}</span> sessions recorded
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearch}
            placeholder="Search by date or subject…"
            className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 w-60"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Date & Time", "Subject", "Taken By", "Attendance", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 first:pl-5 last:pr-5"
                    >
                      {h}
                    </th>
                  ))}
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
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-700">{currentPage}</span> of{" "}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-slate-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange(p as number)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                      currentPage === p
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}