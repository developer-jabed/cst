/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const { groupId: groupIdStr } = await params;
  const { subjectGroupId: subjectGroupIdStr } = await searchParams;

  const groupId = Number(groupIdStr);

  const teacher = await getUserInfo();
  const subjectGroups: any[] = teacher?.teacher?.subjectGroups ?? [];

  const subjectGroupIdFromQuery = Number(subjectGroupIdStr ?? 0);

  const subjectGroup =
    subjectGroups.find((sg) =>
      subjectGroupIdFromQuery
        ? sg.id === subjectGroupIdFromQuery
        : sg.groupId === groupId
    ) ?? null;

  const subjectGroupId: number =
    subjectGroup?.id ?? subjectGroupIdFromQuery;
  const subjectId: number = subjectGroup?.subjectId ?? 0;

  const [groupRes, subjectRes] = await Promise.all([
    getGroupById(groupId),
    subjectId ? getSubjectById(subjectId) : Promise.resolve(null),
  ]);

  const group = groupRes?.data;
  const subject = subjectRes?.data;

  const groupName = group?.name ?? `Group ${groupId}`;
  const subjectName = subject?.name ?? `Subject ${subjectId}`;
  const semesterName = group?.currentSemester?.name ?? "N/A";

  const students: { id: number; name: string; rollNo?: string }[] = (
    group?.students ?? []
  ).map((s: any) => ({
    id: s.id,
    name: s.name ?? s.user?.name ?? `Student ${s.id}`,
    rollNo: s.rollNo ?? s.user?.rollNo,
  }));

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          groupName={groupName}
          subjectName={subjectName}
          semesterName={semesterName}
          subjectGroupId={subjectGroupId}
          backHref="/teacher/dashboard/assignments"
        />

        <PracticalsClientPage
          subjectGroupId={subjectGroupId}
          students={students}
        />
      </div>
    </div>
  );
}