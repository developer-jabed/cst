"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import AssignTeacherModal from "./Assignteachermodal";

interface SubjectGroupTableProps {
  subjects: any[];
  groups: any[];
  teachers: any[];
  semesters: any[];
  subjectGroups: any[];
  totalPages: number;
  currentPage: number;
}

// ─── Pill badge ───────────────────────────────────────────────────────────────

function Pill({
  children,
  variant = "indigo",
  icon,
}: {
  children: React.ReactNode;
  variant?: "indigo" | "amber" | "green";
  icon: React.ReactNode;
}) {
  const variants = {
    indigo: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    amber:  "bg-amber-50  text-amber-800  ring-amber-200",
    green:  "bg-emerald-50 text-emerald-800 ring-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${variants[variant]}`}
    >
      {icon}
      {children}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAssign }: { onAssign: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-slate-800 font-semibold text-[15px] mb-1">No assignments yet</p>
      <p className="text-slate-500 text-sm mb-6">Assign a teacher to a subject group to get started.</p>
      <button
        onClick={onAssign}
        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-sm shadow-indigo-200"
      >
        Make first assignment
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SubjectGroupTable({
  subjects,
  groups,
  teachers,
  semesters,
  subjectGroups,
  totalPages,
  currentPage,
}: SubjectGroupTableProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const getSubjectName = (id: number) =>
    subjects.find((s) => s.id === id)?.name ?? `#${id}`;

  const getGroupName = (id: number) =>
    groups.find((g) => g.id === id)?.name ?? `#${id}`;

  const getSemesterName = (id: number) =>
    semesters.find((s) => s.id === id)?.name ?? `#${id}`;

  const getTeacherName = (id: number) => {
    const t = teachers.find((t) => t.id === id);
    if (!t) return `#${id}`;
    return t.firstName ? `${t.firstName} ${t.lastName ?? ""}`.trim() : (t.name ?? `#${id}`);
  };

  const getTeacherInitials = (id: number) => {
    const name = getTeacherName(id);
    return name
      .split(" ")
      .filter(Boolean)
      .map((w: string) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <div className="bg-slate-50 min-h-screen p-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              {/* Accent bar */}
              <span className="w-1 h-6 rounded-full bg-indigo-500 shrink-0" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Subject assignments
              </h1>
            </div>
            <p className="text-sm text-slate-500 pl-3.5">
              Manage teacher – subject – group links for each semester
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-sm shadow-indigo-200 group"
          >
            {/* Plus icon rotates on hover */}
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

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Total assignments"
            value={subjectGroups.length}
            iconBg="bg-indigo-50"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.8">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <StatCard
            label="Subjects covered"
            value={new Set(subjectGroups.map((s) => s.subjectId)).size}
            iconBg="bg-emerald-50"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <StatCard
            label="Teachers assigned"
            value={new Set(subjectGroups.map((s) => s.teacherId)).size}
            iconBg="bg-amber-50"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.8">
                <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>

        {/* ── Table card ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {subjectGroups.length === 0 ? (
            <EmptyState onAssign={() => setModalOpen(true)} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      {[
                        { label: "#",        icon: null },
                        { label: "Subject",  icon: (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline -mt-0.5 mr-1">
                              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )},
                        { label: "Group",    icon: (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline -mt-0.5 mr-1">
                              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
                            </svg>
                          )},
                        { label: "Teacher",  icon: (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline -mt-0.5 mr-1">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          )},
                        { label: "Semester", icon: (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline -mt-0.5 mr-1">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                            </svg>
                          )},
                        { label: "",         icon: null },
                      ].map(({ label, icon }) => (
                        <th
                          key={label}
                          className="px-5 py-3.5 text-left text-[10.5px] font-semibold text-slate-400 tracking-widest uppercase"
                        >
                          {icon}
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {subjectGroups.map((sg, idx) => (
                      <tr key={sg.id} className="group hover:bg-slate-50/60 transition-colors">

                        {/* Index */}
                        <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">
                          {(currentPage - 1) * 10 + idx + 1}
                        </td>

                        {/* Subject */}
                        <td className="px-5 py-3.5">
                          <Pill
                            variant="indigo"
                            icon={
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            }
                          >
                            {getSubjectName(sg.subjectId)}
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
                            Group {getGroupName(sg.groupId)}
                          </Pill>
                        </td>

                        {/* Teacher */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">
                              {getTeacherInitials(sg.teacherId)}
                            </div>
                            <span className="text-slate-800 font-medium text-[13px]">
                              {getTeacherName(sg.teacherId)}
                            </span>
                          </div>
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
                            {getSemesterName(sg.semesterId)}
                          </Pill>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-medium">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-xs text-slate-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <a
                        key={p}
                        href={`?page=${p}`}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                          p === currentPage
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
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
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        subjects={subjects}
        groups={groups}
        teachers={teachers}
        semesters={semesters}
      />
    </>
  );
}