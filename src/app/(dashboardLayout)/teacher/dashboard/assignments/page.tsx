import Link from "next/link";
import { getUserInfo } from "@/service/auth/getUserInfo";
import { getGroupById } from "@/service/group/group.service";
import { getSubjectById } from "@/service/subject/subject.service";

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

  const subjectGroups =
    teacher?.teacher?.subjectGroups || [];

  const groupsWithDetails: EnrichedGroup[] =
    await Promise.all(
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

          groupName:
            group?.name || `Group ${item.groupId}`,

          subjectName:
            subject?.name || `Subject ${item.subjectId}`,

          semesterName:
            group?.currentSemester?.name || "N/A",
        };
      })
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        Lab Task Practical And Jobs Dashboard
      </h1>

      {/* Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {groupsWithDetails.map((group) => (
          <div
            key={group.id}
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-lg"
          >
            {/* SEMESTER BADGE */}
            <div className="mb-3">
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Semester: {group.semesterName}
              </span>
            </div>

            {/* GROUP NAME */}
            <h2 className="text-xl font-bold text-gray-800">
             Group: {group.groupName}
            </h2>

            {/* SUBJECT NAME */}
            <p className="mt-1 text-sm font-medium text-indigo-600">
              Subject: {group.subjectName}
            </p>

        
            <Link
              href={`assignments/${group.groupId}?subject=${group.subjectId}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition"
            >
              View Group Task
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}