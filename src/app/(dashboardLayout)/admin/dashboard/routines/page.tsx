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
    <div className="theme-content min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="st-fade mb-8 flex items-start gap-3">
          <div className="mt-1 flex gap-[3px]">
            <span className="h-9 w-[3px] rounded-full bg-gradient-to-b from-primary to-emerald-500" />
            <span className="h-9 w-[3px] rounded-full bg-gradient-to-b from-gold to-gold-soft" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">ক্লাস রুটিন</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              প্রতিটি গ্রুপের সাপ্তাহিক ক্লাস রুটিন তৈরি ও পরিচালনা করুন
            </p>
          </div>
        </div>

        {hasError && (
          <div className="st-fade mb-6 rounded-xl border border-gold-soft bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
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