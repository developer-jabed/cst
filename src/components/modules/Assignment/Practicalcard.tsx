/* eslint-disable @typescript-eslint/no-explicit-any */
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
    submissions?: {
      id: number;
      submitted: boolean;
      obtainedMarks?: number | null;
    }[];
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
    totalStudents > 0
      ? Math.round((submittedCount / totalStudents) * 100)
      : 0;

  const isPractical = practical.type === "PRACTICAL";
  const isOverdue =
    practical.submissionDeadline &&
    new Date(practical.submissionDeadline) < new Date();

  const formatDate = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  return (
    <div className="st-row theme-card group relative flex flex-col overflow-hidden shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5">
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${
          isPractical
            ? "from-sky-500 to-blue-400"
            : "from-violet-500 to-purple-400"
        }`}
      />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                isPractical
                  ? "bg-sky-50 text-sky-600"
                  : "bg-violet-50 text-violet-600"
              }`}
            >
              {isPractical ? (
                <FlaskConical className="h-4 w-4" />
              ) : (
                <Briefcase className="h-4 w-4" />
              )}
            </span>
            <div>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                  isPractical
                    ? "bg-sky-50 text-sky-700 ring-sky-200"
                    : "bg-violet-50 text-violet-700 ring-violet-200"
                }`}
              >
                {practical.type}
              </span>
              <h3 className="mt-0.5 text-[15px] font-bold leading-tight text-foreground transition group-hover:text-primary">
                {practical.title}
              </h3>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-9 z-20 min-w-[150px] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(practical);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground transition hover:bg-secondary hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(practical.id);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-border">
            Total Marks: {practical.totalMarks}
          </span>
          {isOverdue && (
            <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
              Overdue
            </span>
          )}
        </div>

        {/* Dates */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Given: {formatDate(practical.givenDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock
              className={`h-3.5 w-3.5 ${isOverdue ? "text-rose-500" : ""}`}
            />
            <span className={isOverdue ? "font-medium text-rose-600" : ""}>
              Deadline: {formatDate(practical.submissionDeadline)}
            </span>
          </div>
        </div>

        {/* Progress */}
        {totalStudents > 0 && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {submittedCount}/{totalStudents} submitted
                </span>
              </div>
              <span className="font-bold tabular-nums text-foreground">
                {submissionRate}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full transition-all ${
                  submissionRate === 100
                    ? "bg-emerald-500"
                    : isPractical
                      ? "bg-sky-500"
                      : "bg-violet-500"
                }`}
                style={{ width: `${submissionRate}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1" />

        <button
          onClick={() => onSubmissions(practical)}
          className="group/btn mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:border-transparent hover:bg-gradient-to-br hover:from-primary hover:to-emerald-600 hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 active:scale-95"
        >
          <CheckSquare className="h-4 w-4" />
          Manage Submissions
          <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}