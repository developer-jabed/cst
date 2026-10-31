import TeacherDashboardClient from "../../../../components/modules/metaData/teacherMetadata/teacherMetadata";
import { getTeacherDashboard } from "../../../../service/meta/teacherMeta.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Teacher Dashboard",
  description: "Your classes, students, attendance and notices at a glance",
};

const TZ = "Asia/Dhaka";

function dhakaNow() {
  const now = new Date();
  const hour =
    Number(
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        hour12: false,
        timeZone: TZ,
      }).format(now)
    ) % 24;

  const greeting =
    hour < 5
      ? "Good night"
      : hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : hour < 21
      ? "Good evening"
      : "Good night";

  const today = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  });

  return { greeting, today };
}

export default async function TeacherDashboardPage() {
  const res = await getTeacherDashboard();
  const { greeting, today } = dhakaNow();

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        {res.success && res.data ? (
          <TeacherDashboardClient
            data={res.data}
            greeting={greeting}
            today={today}
          />
        ) : (
          <div className="mx-auto mt-16 max-w-md theme-card overflow-hidden shadow-[var(--shadow-card)]">
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-pink-400" />
            <div className="px-8 py-14 text-center">
              <p className="text-5xl">😕</p>
              <h1 className="mt-3 text-lg font-bold text-rose-700">
                Couldn&apos;t load your dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {res.message || "Please refresh the page or try again shortly."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}