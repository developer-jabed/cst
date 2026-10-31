/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { getUserInfo } from "@/service/auth/getUserInfo";
import { getGroupById } from "@/service/group/group.service";
import { getSubjectById } from "@/service/subject/subject.service";
import { FlaskConical } from "lucide-react";

export const dynamic = "force-dynamic";

type EnrichedGroup = {
  id: number;
  groupId: number;
  subjectId: number;
  semesterId: number;
  groupName: string;
  subjectName: string;
  semesterName: string;
};

export default async function AssignmentPage() {
  const teacher = await getUserInfo();
  const subjectGroups = teacher?.teacher?.subjectGroups || [];

  const groupsWithDetails: EnrichedGroup[] = await Promise.all(
    subjectGroups.map(async (item: any) => {
      const [groupRes, subjectRes] = await Promise.all([
        getGroupById(item.groupId),
        getSubjectById(item.subjectId),
      ]);

      const group = groupRes?.data;
      const subject = subjectRes?.data;

      return {
        id: item.id,
        groupId: item.groupId,
        subjectId: item.subjectId,
        semesterId: item.semesterId,
        groupName: group?.name || `Group ${item.groupId}`,
        subjectName: subject?.name || `Subject ${item.subjectId}`,
        semesterName: group?.currentSemester?.name || "N/A",
      };
    })
  );

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="st-fade flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
              Dashboard / Assignments
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Lab Task · Practical & Jobs
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Select a group to manage practicals and jobs
            </p>
          </div>

          <div className="theme-card flex items-center gap-3 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30">
              <FlaskConical size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Total Groups
              </p>
              <p className="text-xl font-black leading-none tabular-nums text-foreground">
                {groupsWithDetails.length}
              </p>
            </div>
          </div>
        </div>

        {/* Grid */}
        {groupsWithDetails.length === 0 ? (
          <div className="st-fade theme-card py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-primary/60 ring-1 ring-gold-soft">
              <FlaskConical size={28} />
            </div>
            <p className="text-lg font-bold text-foreground">No groups found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Subject groups will appear here once assigned.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groupsWithDetails.map((group, i) => (
              <div
                key={group.id}
                className="st-row theme-card group relative flex flex-col overflow-hidden shadow-[var(--shadow-card)]"
                style={{ ["--i" as string]: i % 9 }}
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />

                <div className="flex flex-1 flex-col gap-4 p-5">
                  {/* Semester badge */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      {group.semesterName} Semester
                    </span>
                  </div>

                  {/* Identity */}
                  <div>
                    <h3 className="text-[15px] font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary">
                      Group {group.groupName}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {group.subjectName}
                    </p>
                  </div>

                  {/* Action */}
                  <Link
                    href={`assignments/${group.groupId}?subject=${group.subjectId}`}
                    className="group/btn mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:border-transparent hover:bg-gradient-to-br hover:from-primary hover:to-emerald-600 hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                  >
                    View Group Task
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="transition-transform duration-200 group-hover/btn:translate-x-1"
                    >
                      <polyline points="6 3 11 8 6 13" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}