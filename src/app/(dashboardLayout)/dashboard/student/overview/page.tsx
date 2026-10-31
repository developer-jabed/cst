/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMyOverview } from "@/service/overview/overview.service";
import StudentOverviewClient from "@/components/modules/Overview/StudentOverviewClient";
import { LayoutDashboard } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Overview | Student",
  description: "Student dashboard overview",
};

export default async function StudentOverviewPage() {
  const overviewRes = await getMyOverview();
  const data = overviewRes?.success ? overviewRes.data : null;

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="st-fade flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
              Dashboard / Overview
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Overview
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your academic summary at a glance
            </p>
          </div>

          <div className="theme-card flex items-center gap-3 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30">
              <LayoutDashboard size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Status
              </p>
              <p className="text-sm font-bold text-foreground">Student</p>
            </div>
          </div>
        </div>

        {!data || data.role !== "STUDENT" ? (
          <div className="theme-card py-16 text-center">
            <p className="text-muted-foreground">
              Failed to load overview data.
            </p>
          </div>
        ) : (
          <StudentOverviewClient data={data} />
        )}
      </div>
    </div>
  );
}