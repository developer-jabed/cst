import StudentNoticesClient from "@/components/modules/notice/student/studentNoticeClient";
import { getUserInfo } from "@/service/auth/getUserInfo";
import { getNotices } from "@/service/notice/notice.service";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    page?: string;
    searchTerm?: string;
    priority?: string;
    sortOrder?: "asc" | "desc";
    tab?: "feed" | "mine";
  };
}

export default async function StudentNoticesPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const tab = searchParams.tab || "feed";

  const userResult = await getUserInfo();
  const student = userResult?.student ?? null;

  const sharedParams = {
    searchTerm: searchParams.searchTerm || undefined,
    priority: searchParams.priority as any, // or better: cast to NoticePriority
    sortBy: "createdAt",
    sortOrder: searchParams.sortOrder || "desc",
    page,
    limit: 10,
  };

  const [feedResult, myNoticesResult] = await Promise.all([
    getNotices(sharedParams, {
      role: "student",
      studentId: student?.id ?? 0,
      groupId: student?.group?.id,
      semesterId: student?.group?.currentSemester?.id,
      departmentId: student?.department?.id,
    }),
    getNotices({
      ...sharedParams,
      studentId: student?.id ?? 0,
    }),
  ]);

  return (
    <StudentNoticesClient
      feedNotices={feedResult.data || []}
      feedMeta={{
        total: feedResult.total || 0,
        currentPage: feedResult.currentPage || 1,
        totalPages: feedResult.totalPages || 1,
      }}
      myNotices={myNoticesResult.data || []}
      myMeta={{
        total: myNoticesResult.total || 0,
        currentPage: myNoticesResult.currentPage || 1,
        totalPages: myNoticesResult.totalPages || 1,
      }}
      student={student}
      activeTab={tab}
    />
  );
}
