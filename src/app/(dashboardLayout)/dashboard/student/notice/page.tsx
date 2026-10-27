/* eslint-disable @typescript-eslint/no-explicit-any */
import StudentNoticesClient from "@/components/modules/notice/student/studentNoticeClient";
import { getUserInfo } from "@/service/auth/getUserInfo";
import { getNotices } from "@/service/notice/notice.service";

export const dynamic = "force-dynamic";

interface PageProps {
  // Next.js 15: searchParams is a Promise and must be awaited
  searchParams: Promise<{
    page?: string;
    searchTerm?: string;
    priority?: string;
    sortOrder?: "asc" | "desc";
    tab?: "feed" | "mine";
  }>;
}

export default async function StudentNoticesPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const page = Number(sp.page) || 1;
  const tab = sp.tab || "feed";

  const userResult = await getUserInfo();
  const student = userResult?.student ?? null;

  const sharedParams = {
    searchTerm: sp.searchTerm || undefined,
    priority: sp.priority as any, // or better: cast to NoticePriority
    sortBy: "createdAt",
    sortOrder: sp.sortOrder || "desc",
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
    <div className="relative">
      {/* Ambient glow behind the header (layout already provides the main animated bg) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-0 -z-10 h-56 w-56 animate-pulse rounded-full bg-primary/10 blur-[90px] motion-reduce:animate-none"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 left-1/3 -z-10 h-40 w-40 animate-pulse rounded-full bg-gold/10 blur-[80px] [animation-delay:1.5s] motion-reduce:animate-none"
      />

      {/* Page header */}
      <header className="mb-6 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-700 motion-reduce:animate-none">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-gold to-transparent" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gold">
            Notices
          </span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Notice Board
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
          Stay updated with announcements for you, your group and your department
        </p>

        <div className="mt-5 h-px w-full bg-gradient-to-r from-gold/60 via-gold/20 to-transparent" />
      </header>

      {/* Frosted content panel */}
      <section className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both rounded-2xl border border-gold/30 bg-card/70 p-3 shadow-[var(--shadow-card)] backdrop-blur-xl transition-colors delay-100 duration-700 hover:border-gold/50 motion-reduce:animate-none md:p-5">
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
      </section>
    </div>
  );
}