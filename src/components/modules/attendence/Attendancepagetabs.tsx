"use client";

import { useState } from "react";
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
      <div className="flex rounded-xl bg-secondary/50 p-1 ring-1 ring-border">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === key
                ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

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