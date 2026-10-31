/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserInfo } from "@/service/auth/getUserInfo";
import { getPracticals } from "@/service/Practical/practical.service";
import { FlaskConical } from "lucide-react";
import StudentPracticalsClient from "../../../../../components/modules/task/StudentPracticalsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Tasks | Student",
  description: "View and submit practicals and jobs for your group",
};

export default async function StudentPracticalsPage() {
  const user = await getUserInfo();
  const student = user?.student;

  if (!student) {
    return (
      <div className="theme-content flex min-h-screen items-center justify-center p-6">
        <div className="theme-card max-w-md px-8 py-12 text-center">
          <p className="text-lg font-bold text-foreground">Student profile not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please contact your institution if this looks wrong.
          </p>
        </div>
      </div>
    );
  }

  const subjectGroups = student.subjectGroups ?? student.group?.subjectGroups ?? [];
  const groupId = student.groupId ?? student.group?.id;
  const groupName = student.group?.name ?? "My Group";
  const semesterName = student.group?.currentSemester?.name ?? "—";

  // Fetch practicals for all subject groups the student belongs to
  const allPracticals: any[] = [];
  const subjectGroupIds: number[] = Array.isArray(subjectGroups)
    ? subjectGroups.map((sg: any) => sg.id ?? sg.subjectGroupId).filter(Boolean)
    : [];

  if (subjectGroupIds.length > 0) {
    const results = await Promise.all(
      subjectGroupIds.map((sgId) =>
        getPracticals({ subjectGroupId: sgId, limit: 100, sortBy: "givenDate", sortOrder: "desc" })
      )
    );
    results.forEach((res) => {
      if (res.success && Array.isArray(res.data)) {
        allPracticals.push(...res.data);
      }
    });
  } else if (groupId) {
    // Fallback: try by group-related practicals if your API supports it via search
    const res = await getPracticals({ limit: 100, sortBy: "givenDate", sortOrder: "desc" });
    if (res.success && Array.isArray(res.data)) {
      allPracticals.push(
        ...res.data.filter(
          (p: any) =>
            p.subjectGroup?.groupId === groupId ||
            p.subjectGroup?.group?.id === groupId
        )
      );
    }
  }

  // Dedupe by id
  const map = new Map<number, any>();
  allPracticals.forEach((p) => map.set(p.id, p));
  const practicals = Array.from(map.values());

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="st-fade flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
              Dashboard / Tasks
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              My Practicals & Jobs
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Group {groupName} · {semesterName} — view tasks and submit your work
            </p>
          </div>

          <div className="theme-card flex items-center gap-3 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30">
              <FlaskConical size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Tasks
              </p>
              <p className="text-xl font-black leading-none tabular-nums text-foreground">
                {practicals.length}
              </p>
            </div>
          </div>
        </div>

        <StudentPracticalsClient
          practicals={practicals}
          studentId={student.id}
          studentName={student.name ?? user.name}
        />
      </div>
    </div>
  );
}