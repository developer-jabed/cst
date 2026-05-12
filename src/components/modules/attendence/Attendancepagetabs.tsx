"use client";

import { useState, useCallback } from "react";
import { ClipboardList, PlusCircle } from "lucide-react";
import {
  SessionMeta,
  Student,
  SubjectGroup,
} from "@/types/attendence.interface";
import AttendanceTakeClient from "./attendenceClient";
import AttendanceSessionsContainer from "./Attendancesessionscontainer";

type Tab = "take" | "sessions";

type Props = {
  students: Student[];
  subjectGroup: SubjectGroup;
  meta?: SessionMeta;
};

export default function AttendancePageTabs({
  students,
  subjectGroup,
  meta,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("take");

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "take", label: "Take Attendance", icon: PlusCircle },
    { key: "sessions", label: "Session History", icon: ClipboardList },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Tab bar */}
      <div className="flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeTab === key
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Panel */}
      {activeTab === "take" ? (
        <AttendanceTakeClient
          students={students}
          subjectGroup={subjectGroup}
          meta={meta}
        />
      ) : (
        <AttendanceSessionsContainer
          groupId={subjectGroup.groupId}
          subjectId={subjectGroup.subjectId}
          meta={meta}
        />
      )}
    </div>
  );
}
