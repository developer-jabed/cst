/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMyStudentReports } from "@/service/report/report.service";
import StudentReportsClient from "../../../../../components/modules/report/ReportClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student Reports | Teacher",
  description: "Subject wise student reports",
};

export default async function StudentReportsPage() {
  const reportsRes = await getMyStudentReports();
  const reports = reportsRes?.success ? reportsRes.data || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Student Reports
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Select a subject group to view student attendance & practical reports
          </p>
        </div>

        <StudentReportsClient initialReports={reports} />
      </div>
    </div>
  );
}