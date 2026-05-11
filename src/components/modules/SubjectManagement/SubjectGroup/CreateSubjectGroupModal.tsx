"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import AssignTeacherModal from "./Assignteachermodal";
import Image from "next/image";

interface SubjectGroupClientProps {
  groups: any[];
  teachers: any[];
  subjects: any[];
  semesters: any[];
  subjectGroups: any[];
  totalPages: number;
  currentPage: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTeacherLabel(t: any): string {
  if (t?.firstName) return `${t.firstName} ${t.lastName ?? ""}`.trim();
  return t?.name ?? `#${t?.id}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Pill badge ───────────────────────────────────────────────────────────────

function Pill({
  children,
  variant,
  icon,
}: {
  children: React.ReactNode;
  variant: "purple" | "amber" | "green" | "blue";
  icon: React.ReactNode;
}) {
  const cls = {
    purple: "bg-violet-50 text-violet-800 ring-violet-200",
    amber: "bg-amber-50  text-amber-800  ring-amber-200",
    green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    blue: "bg-sky-50    text-sky-800    ring-sky-200",
  }[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ring-inset ${cls}`}>
      {icon}
      {children}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  iconBg,
  icon,
}: {
  label: string;
  value: number;
  iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900 leading-none mb-1">{value}</p>
        <p className="text-[11px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[11px] font-semibold shrink-0">
      {getInitials(name)}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.4">
            <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* Plus badge */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 2v6M2 5h6" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <p className="text-slate-900 font-semibold text-[15px] mb-1">No assignments yet</p>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">
        Start by assigning a teacher to a subject for a specific group and semester.
      </p>
      <button
        onClick={onOpen}
        className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-sm shadow-violet-200"
      >
        Make first assignment
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SubjectGroupClient({
  groups,
  teachers,
  subjects,
  semesters,
  subjectGroups,
  totalPages,
  currentPage,
}: SubjectGroupClientProps) {
  const [open, setOpen] = useState(false);

  const byId = <T extends { id: number }>(arr: T[], id: number) =>
    arr.find((x) => x.id === id);

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-6">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              {/* Double accent bars */}
              <div className="flex gap-[3px]">
                <span className="w-[3px] h-6 rounded-full bg-violet-600" />
                <span className="w-[3px] h-6 rounded-full bg-violet-300" />
              </div>
              <h1 className="text-[18px] font-bold text-slate-900 tracking-tight">
                Subject assignments
              </h1>
            </div>
            <p className="text-sm text-slate-500 pl-4">
              Manage which teacher covers each subject for every group
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-sm shadow-violet-200 group"
          >
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              className="transition-transform group-hover:rotate-90 duration-200"
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Assign teacher
          </button>
        </div>

        {/* ── Stats row ── */}
        {subjectGroups.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Total assignments"
              value={subjectGroups.length}
              iconBg="bg-violet-50"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <StatCard
              label="Subjects covered"
              value={new Set(subjectGroups.map((s) => s.subjectId)).size}
              iconBg="bg-sky-50"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="1.8">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <StatCard
              label="Groups active"
              value={new Set(subjectGroups.map((s) => s.groupId)).size}
              iconBg="bg-amber-50"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
                </svg>
              }
            />
            <StatCard
              label="Teachers assigned"
              value={new Set(subjectGroups.map((s) => s.teacherId)).size}
              iconBg="bg-emerald-50"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          </div>
        )}

        {/* ── Table card ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {subjectGroups.length === 0 ? (
            <EmptyState onOpen={() => setOpen(true)} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      {/* # */}
                      <th className="w-10 px-5 py-3.5 text-left text-[10.5px] font-semibold text-slate-400 tracking-widest uppercase">
                        #
                      </th>
                      {/* Teacher */}
                      <th className="px-5 py-3.5 text-left text-[10.5px] font-semibold text-slate-400 tracking-widest uppercase">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline -mt-0.5 mr-1">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Teacher
                      </th>
                      {/* Subject */}
                      <th className="px-5 py-3.5 text-left text-[10.5px] font-semibold text-slate-400 tracking-widest uppercase">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline -mt-0.5 mr-1">
                          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Subject
                      </th>
                      {/* Group */}
                      <th className="px-5 py-3.5 text-left text-[10.5px] font-semibold text-slate-400 tracking-widest uppercase">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline -mt-0.5 mr-1">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                        </svg>
                        Group
                      </th>
                      {/* Semester */}
                      <th className="px-5 py-3.5 text-left text-[10.5px] font-semibold text-slate-400 tracking-widest uppercase">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline -mt-0.5 mr-1">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                        </svg>
                        Semester
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {subjectGroups.map((sg, i) => {
                      const teacher = byId(teachers, sg.teacherId) as any;
                      const subject = byId(subjects, sg.subjectId) as any;
                      const group = byId(groups, sg.groupId) as any;
                      const semester = byId(semesters, sg.semesterId) as any;
                      const tName = teacher ? getTeacherLabel(teacher) : `#${sg.teacherId}`;

                      return (
                        <tr key={sg.id} className="hover:bg-slate-50/60 transition-colors">

                          {/* Index */}
                          <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">
                            {(currentPage - 1) * 10 + i + 1}
                          </td>

                          {/* Teacher */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              {teacher?.avatarUrl && (
                                <Image
                                  src={teacher.avatarUrl}
                                  alt={tName}
                                  width={32}
                                  height={32}
                                  className="rounded-full object-cover"
                                />
                              )}
                              <span className="text-slate-800 font-medium text-[13px]">{tName}</span>
                            </div>
                          </td>

                          {/* Subject */}
                          <td className="px-5 py-3.5">
                            <Pill
                              variant="purple"
                              icon={
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              }
                            >
                              {subject?.name ?? `#${sg.subjectId}`}
                            </Pill>
                          </td>

                          {/* Group */}
                          <td className="px-5 py-3.5">
                            <Pill
                              variant="amber"
                              icon={
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="3" width="7" height="7" rx="1" />
                                  <rect x="14" y="3" width="7" height="7" rx="1" />
                                  <rect x="14" y="14" width="7" height="7" rx="1" />
                                  <rect x="3" y="14" width="7" height="7" rx="1" />
                                </svg>
                              }
                            >
                              {group?.name ?? `#${sg.groupId}`}
                            </Pill>
                          </td>

                          {/* Semester */}
                          <td className="px-5 py-3.5">
                            <Pill
                              variant="green"
                              icon={
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" />
                                  <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                                </svg>
                              }
                            >
                              {semester?.name ?? `#${sg.semesterId}`}
                            </Pill>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                  <span className="text-xs text-slate-400">
                    Page {currentPage} / {totalPages}
                  </span>
                  <div className="flex gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <a
                        key={p}
                        href={`?page=${p}`}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${p === currentPage
                          ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                          : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                          }`}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AssignTeacherModal
        isOpen={open}
        onClose={() => setOpen(false)}
        groups={groups}
        teachers={teachers}
        subjects={subjects}
        semesters={semesters}
      />
    </>
  );
}