import AttendancePageTabs from "@/components/modules/attendence/Attendancepagetabs";
import { getGroupById } from "@/service/group/group.service";

export const dynamic = "force-dynamic";

export default async function GroupAttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ subject?: string }>;
}) {
  const { id } = await params;
  const { subject } = await searchParams;

  const groupRes = await getGroupById(Number(id));
  const group = groupRes?.data;

  const students = (group?.students ?? []).map((s: any) => ({
    id: s.id,
    name: s.name ?? s.user?.name ?? "Unknown",
    roll: s.roll ?? s.rollNumber ?? undefined,
  }));

  const subjectId = subject ? Number(subject) : group?.subjectGroups?.[0]?.subjectId;

  const slot =
    group?.subjectGroups?.find((sg: any) => sg.subjectId === subjectId) ??
    group?.subjectGroups?.[0];
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <AttendancePageTabs
        students={students}
        subjectGroup={{
          groupId: Number(id),
          subjectId: slot?.subjectId,
          semesterId: slot?.semesterId,
          teacherId: slot?.teacherId,
        }}
        meta={{
          groupName: group?.name,
          semesterName: slot?.semester?.name ?? group?.currentSemester?.name,
          teacherName: slot?.teacher?.name ?? slot?.teacher?.user?.name,
          subjectName: slot?.subject?.name,
          subjectCode: slot?.subject?.code ?? slot?.subject?.shortName,
          departmentName: group?.department?.name,
          shiftName: group?.shift?.name,
        }}
      />
    </div>
  );
}