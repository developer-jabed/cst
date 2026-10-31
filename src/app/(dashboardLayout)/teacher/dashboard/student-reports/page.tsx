/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMyStudentReports } from "@/service/report/report.service";
import StudentReportsClient from "../../../../../components/modules/report/ReportClient";
import { FileBarChart } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student Reports | Teacher",
  description: "Subject wise student reports",
};

export default async function StudentReportsPage() {
  const reportsRes = await getMyStudentReports();
  const reports = reportsRes?.success ? reportsRes.data || [] : [];

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="st-fade flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
              Dashboard / Reports
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Student Reports
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Select a subject group to view student attendance & practical
              reports
            </p>
          </div>

          <div className="theme-card flex items-center gap-3 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30">
              <FileBarChart size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Subject Groups
              </p>
              <p className="text-xl font-black leading-none tabular-nums text-foreground">
                {reports.length}
              </p>
            </div>
          </div>
        </div>

        <StudentReportsClient initialReports={reports} />
      </div>
    </div>
  );
}