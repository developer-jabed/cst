import { PageHeader } from "@/components/modules/Assignment/Pageheader";
import { PracticalsClientPage } from "@/components/modules/Assignment/Practicalsclientpage";
import { getUserInfo } from "@/service/auth/getUserInfo";
import { getGroupById } from "@/service/group/group.service";
import { getSubjectById } from "@/service/subject/subject.service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ subjectGroupId?: string; modal?: string }>;
}

export default async function PracticalsPage({
  params,
  searchParams,
}: PageProps) {

  const { groupId: groupIdStr }                    = await params;
  const { subjectGroupId: subjectGroupIdStr }      = await searchParams;

  const groupId = Number(groupIdStr);

  // ── Teacher + subject groups ─────────────────────────────────────────────
  const teacher       = await getUserInfo();
  const subjectGroups: any[] = teacher?.teacher?.subjectGroups ?? [];

  const subjectGroupIdFromQuery = Number(subjectGroupIdStr ?? 0);

  const subjectGroup =
    subjectGroups.find((sg) =>
      subjectGroupIdFromQuery
        ? sg.id === subjectGroupIdFromQuery
        : sg.groupId === groupId,
    ) ?? null;

  const subjectGroupId: number = subjectGroup?.id ?? subjectGroupIdFromQuery;
  const subjectId: number      = subjectGroup?.subjectId ?? 0;

  // ── Parallel data fetch ──────────────────────────────────────────────────
  const [groupRes, subjectRes] = await Promise.all([
    getGroupById(groupId),
    subjectId ? getSubjectById(subjectId) : Promise.resolve(null),
  ]);

  const group   = groupRes?.data;
  const subject = subjectRes?.data;

  const groupName    = group?.name                   ?? `Group ${groupId}`;
  const subjectName  = subject?.name                 ?? `Subject ${subjectId}`;
  const semesterName = group?.currentSemester?.name  ?? "N/A";

  // ── Students ─────────────────────────────────────────────────────────────
  const students: { id: number; name: string; rollNo?: string }[] = (
    group?.students ?? []
  ).map((s: any) => ({
    id:     s.id,
    name:   s.name ?? s.user?.name ?? `Student ${s.id}`,
    rollNo: s.rollNo ?? s.user?.rollNo,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          groupName={groupName}
          subjectName={subjectName}
          semesterName={semesterName}
          subjectGroupId={subjectGroupId}
          backHref="/teacher/dashboard/assignments"
        />

        {/*
          PracticalsClientPage reads ?modal=create from the URL itself
          via useSearchParams() — no need to pass it as a prop.
          The Link in PageHeader just needs to include ?modal=create in its href.
        */}
        <PracticalsClientPage
          subjectGroupId={subjectGroupId}
          students={students}
        />
      </div>
    </div>
  );
}