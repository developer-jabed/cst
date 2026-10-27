import { getAllRoutines } from "@/service/routine/routine.service";
import { getAllGroups } from "@/service/group/group.service";
import RoutinesClient from "@/components/modules/Admin/routines/RoutinesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ক্লাস রুটিন | অ্যাডমিন",
  description: "ক্লাস রুটিন ও সময়সূচি পরিচালনা করুন",
};

export default async function RoutinesPage() {
  const [routinesRes, groupsRes] = await Promise.all([
    getAllRoutines(),
    getAllGroups({ limit: 300 }),
  ]);

  const routines = routinesRes?.data ?? routinesRes ?? [];
  const groups = groupsRes?.data ?? [];

  const hasError = routinesRes?.success === false || groupsRes?.success === false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            ক্লাস রুটিন
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            প্রতিটি গ্রুপের সাপ্তাহিক ক্লাস রুটিন তৈরি ও পরিচালনা করুন
          </p>
        </div>

        {hasError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            কিছু তথ্য লোড করা যায়নি। পৃষ্ঠাটি রিফ্রেশ করে আবার চেষ্টা করুন।
          </div>
        )}

        <RoutinesClient
          initialRoutines={Array.isArray(routines) ? routines : []}
          groups={Array.isArray(groups) ? groups : []}
        />
      </div>
    </div>
  );
}