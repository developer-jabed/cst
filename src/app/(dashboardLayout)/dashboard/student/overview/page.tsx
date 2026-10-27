/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMyOverview } from "@/service/overview/overview.service";
import StudentOverviewClient from "@/components/modules/Overview/StudentOverviewClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Overview | Student",
  description: "Student dashboard overview",
};

export default async function StudentOverviewPage() {
  const overviewRes = await getMyOverview();

  const data = overviewRes?.success ? overviewRes.data : null;

  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
     
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Your academic summary at a glance
          </p>
        </div>

        {!data || data.role !== "STUDENT" ? (
          <div className="rounded-2xl border bg-white py-16 text-center shadow-sm">
            <p className="text-gray-500">Failed to load overview data.</p>
          </div>
        ) : (
          <StudentOverviewClient data={data} />
        )}
      </div>
    </div>
  );
}