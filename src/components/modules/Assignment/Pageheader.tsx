import Link from "next/link";
import { ArrowLeft, Plus, FlaskConical } from "lucide-react";

interface PageHeaderProps {
  groupName: string;
  subjectName: string;
  semesterName: string;
  subjectGroupId: number;
  backHref?: string;
}

export function PageHeader({
  groupName,
  subjectName,
  semesterName,
  subjectGroupId,
  backHref = "",
}: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-8 py-8 shadow-2xl">
      {/* Background decorative blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />

      {/* Back button */}
      <Link
        href={backHref}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Assignments
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        {/* Left: info */}
        <div className="space-y-2">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              {semesterName}
            </span>
            <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              {subjectName}
            </span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/30 backdrop-blur-sm">
              <FlaskConical className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {groupName}
              </h1>
              <p className="text-sm text-slate-400">
                Lab Tasks · Practicals &amp; Jobs
              </p>
            </div>
          </div>
        </div>

        {/* Right: CTA */}
        <Link
          href={`?subjectGroupId=${subjectGroupId}&modal=create`}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:from-blue-400 hover:to-indigo-400 hover:shadow-blue-700/50"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          Create Practical / Job
        </Link>
      </div>

  
    </div>
  );
}
