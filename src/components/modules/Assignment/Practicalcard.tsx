"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  Users,
  Calendar,
  Clock,
  MoreVertical,
  CheckSquare,
  ChevronRight,
  Briefcase,
  FlaskConical,
} from "lucide-react";
import { PracticalType } from "@/service/Practical/practical.service";

interface PracticalCardProps {
  practical: {
    id: number;
    title: string;
    totalMarks: number;
    type: PracticalType;
    givenDate?: string | null;
    submissionDeadline?: string | null;
    submissions?: { id: number; submitted: boolean; obtainedMarks?: number | null }[];
  };
  onEdit: (practical: any) => void;
  onDelete: (id: number) => void;
  onSubmissions: (practical: any) => void;
}

export function PracticalCard({
  practical,
  onEdit,
  onDelete,
  onSubmissions,
}: PracticalCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const submittedCount =
    practical.submissions?.filter((s) => s.submitted).length ?? 0;
  const totalStudents = practical.submissions?.length ?? 0;
  const submissionRate =
    totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

  const isPractical = practical.type === "PRACTICAL";
  const isOverdue =
    practical.submissionDeadline &&
    new Date(practical.submissionDeadline) < new Date();

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg hover:border-blue-200">
      {/* Top color stripe */}
      <div
        className={`h-1 w-full ${isPractical ? "bg-gradient-to-r from-blue-500 to-cyan-400" : "bg-gradient-to-r from-violet-500 to-fuchsia-400"}`}
      />

      <div className="flex flex-1 flex-col p-5">
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Type icon */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isPractical ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}
            >
              {isPractical ? (
                <FlaskConical className="h-4.5 w-4.5" />
              ) : (
                <Briefcase className="h-4.5 w-4.5" />
              )}
            </div>
            <div>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isPractical ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}
              >
                {practical.type}
              </span>
              <h3 className="mt-0.5 text-[15px] font-semibold leading-tight text-slate-800">
                {practical.title}
              </h3>
            </div>
          </div>

          {/* Three-dot menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-9 z-20 min-w-[150px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(practical); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(practical.id); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Total marks badge */}
        <div className="mb-4 flex items-center gap-1.5">
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Total Marks: {practical.totalMarks}
          </span>
          {isOverdue && (
            <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
              Overdue
            </span>
          )}
        </div>

        {/* Dates */}
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Given: {formatDate(practical.givenDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className={`h-3.5 w-3.5 ${isOverdue ? "text-red-400" : "text-slate-400"}`} />
            <span className={isOverdue ? "text-red-500 font-medium" : ""}>
              Deadline: {formatDate(practical.submissionDeadline)}
            </span>
          </div>
        </div>

        {/* Submission progress */}
        {totalStudents > 0 && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {submittedCount}/{totalStudents} submitted
                </span>
              </div>
              <span className="font-semibold text-slate-700">{submissionRate}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${submissionRate === 100 ? "bg-emerald-500" : isPractical ? "bg-blue-500" : "bg-violet-500"}`}
                style={{ width: `${submissionRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Submissions button */}
        <button
          onClick={() => onSubmissions(practical)}
          className={`group/btn mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${isPractical ? "bg-blue-600 hover:bg-blue-700" : "bg-violet-600 hover:bg-violet-700"} shadow-sm`}
        >
          <CheckSquare className="h-4 w-4" />
          Manage Submissions
          <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}