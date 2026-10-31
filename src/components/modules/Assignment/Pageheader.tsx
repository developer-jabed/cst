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
    <div className="st-fade space-y-4">
      {/* Breadcrumb-style back */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Assignments
      </Link>

      <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />

        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                {semesterName} Semester
              </span>
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
                {subjectName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30">
                <FlaskConical className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  Group {groupName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Lab Tasks · Practicals &amp; Jobs
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`?subjectGroupId=${subjectGroupId}&modal=create`}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:shadow-lg hover:shadow-primary/40 active:scale-95"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Create Practical / Job
          </Link>
        </div>
      </div>
    </div>
  );
}