import TeacherDashboardClient from "../../../../components/modules/metaData/teacherMetadata/teacherMetadata";
import { getTeacherDashboard } from "../../../../service/meta/teacherMeta.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Teacher Dashboard",
  description: "Your classes, students, attendance and notices at a glance",
};

const TZ = "Asia/Dhaka";

// Greeting + date are computed on the server in Dhaka time (no hydration mismatch)
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-amber-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {res.success && res.data ? (
          <TeacherDashboardClient
            data={res.data}
            greeting={greeting}
            today={today}
          />
        ) : (
          <div className="mx-auto mt-16 max-w-md rounded-3xl border border-rose-200 bg-rose-50 px-8 py-14 text-center shadow-sm">
            <p className="text-5xl">😕</p>
            <h1 className="mt-3 text-lg font-bold text-rose-700">
              Couldn&apos;t load your dashboard
            </h1>
            <p className="mt-1 text-sm text-rose-600">
              {res.message || "Please refresh the page or try again shortly."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}