import { getStudentDashboard } from "@/service/meta/studentMeta.service";
import StudentDashboardClient from "../../../../components/modules/metaData/studentMetaData/StudentMetaDataClient";

export const dynamic = "force-dynamic";

const TZ = "Asia/Dhaka";

function getGreeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: TZ,
    }).format(new Date())
  );

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function getToday(): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date());
}

export default async function StudentDashboardPage() {
  const result = await getStudentDashboard();

  if (!result.success || !result.data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
        <span className="text-5xl">⚠️</span>
        <h2 className="mt-3 text-lg font-bold text-slate-800">
          ড্যাশবোর্ড লোড করা যায়নি
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {result.message || "কিছুক্ষণ পর আবার চেষ্টা করুন।"}
        </p>
      </div>
    );
  }

  return (
    <StudentDashboardClient
      data={result.data}
      greeting={getGreeting()}
      today={getToday()}
    />
  );
}