"use client";
import { createSubjectGroup } from "@/service/subject/subjectGroup.service";
import { useActionState, useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Department {
  name?: string;
  shortName?: string;
}

interface Shift {
  name?: string;
  shortName?: string;
}

interface CurrentSemester {
  id?: number;
  name?: string;
  order?: number;
}

interface SelectOption {
  id: number;
  name?: string;
  title?: string;
  shortName?: string;
  firstName?: string;
  lastName?: string;
  code?: string;
  // Subject extras
  credits?: number;
  /** Subjects pass department as a plain string; teachers pass an object */
  department?: string | Department;
  yearLevel?: string;
  contactHours?: string;
  totalStudents?: number;
  category?: string;
  // Teacher extras
  designation?: string;
  rank?: string;
  email?: string;
  mobile?: string;
  subjectsThisSem?: number;
  studentsCount?: number;
  available?: boolean;
  // Group extras
  session?: string;
  currentSemester?: CurrentSemester;
  shift?: Shift;
  studentCount?: number;
  semesterName?: string;
  // Semester extras
  academicYear?: string;
  isActive?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AssignTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: SelectOption[];
  teachers: SelectOption[];
  subjects: SelectOption[];
  semesters: SelectOption[];
  defaultGroupId?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const INIT = { success: false, message: "" };

function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function getLabel(o: SelectOption): string {
  if (o.firstName) return `${toStr(o.firstName)} ${toStr(o.lastName)}`.trim();

  if (o.session !== undefined) {
    const semLabel = o.currentSemester
      ? `Sem ${toStr(o.currentSemester.order ?? o.currentSemester.name)}`
      : "";
    return [`Group ${toStr(o.name)}`, semLabel, toStr(o.session)]
      .filter(Boolean)
      .join(" · ");
  }

  if (o.mobile !== undefined) {
    return [toStr(o.name), toStr(o.mobile)].filter(Boolean).join(" · ");
  }

  return toStr(o.name) || toStr(o.title) || toStr(o.shortName) || `#${o.id}`;
}

/** Safely extract department sub-fields for teacher cards (API returns object). */
function parseDept(dept: SelectOption["department"]): { name: string; shortName: string } {
  if (dept && typeof dept === "object") {
    return { name: toStr(dept.name), shortName: toStr(dept.shortName) };
  }
  return { name: toStr(dept), shortName: "" };
}

function getInitials(o: SelectOption): string {
  if (o.firstName) {
    return `${toStr(o.firstName)[0] ?? ""}${toStr(o.lastName)[0] ?? ""}`.toUpperCase();
  }
  const name = toStr(o.name) || toStr(o.title) || toStr(o.shortName);
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ["Subject", "Group", "Teacher", "Semester"];
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : active
                    ? "border-indigo-600 text-indigo-600 bg-white"
                    : "border-slate-200 text-slate-400 bg-white"
                }`}
              >
                {done ? (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-wide ${
                  done || active ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-1 mb-4 ${done ? "bg-indigo-500" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubjectCard({ subject }: { subject: SelectOption }) {
  const code = toStr(subject.code);
  const credits =
    typeof subject.credits === "number" ? subject.credits : null;
  const category = toStr(subject.category);
  // For subjects, department is a plain string
  const department =
    typeof subject.department === "string" ? subject.department : "";
  const yearLevel = toStr(subject.yearLevel);
  const contactHours = toStr(subject.contactHours);
  const totalStudents =
    typeof subject.totalStudents === "number" ? subject.totalStudents : null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden mb-3">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6741D9" strokeWidth="1.8">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-800 truncate">{getLabel(subject)}</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {code && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                # {code}
              </span>
            )}
            {credits != null && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {credits} credits
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                {category}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 px-4 py-3 gap-y-2.5 gap-x-4">
        {department && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Department</div>
            <div className="text-[12.5px] font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6741D9" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
              </svg>
              {department}
            </div>
          </div>
        )}
        {yearLevel && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Year level</div>
            <div className="text-[12.5px] font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6741D9" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
              {yearLevel}
            </div>
          </div>
        )}
        {contactHours && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact hours</div>
            <div className="text-[12.5px] font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6741D9" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
              {contactHours}
            </div>
          </div>
        )}
        {totalStudents != null && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enrolled</div>
            <div className="text-[12.5px] font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6741D9" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
              </svg>
              {totalStudents} students
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TeacherCard({ teacher }: { teacher: SelectOption }) {
  const name = toStr(teacher.name);
  const designation = toStr(teacher.designation);
  const email = toStr(teacher.email);
  const mobile = toStr(teacher.mobile);

  // ✅ department from API is { name, shortName } — use parseDept to narrow safely
  const { name: deptFull, shortName: deptShort } = parseDept(teacher.department);

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((w: string) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 mb-2">
      <div className="w-11 h-11 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-sm font-bold text-teal-700 shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-800 truncate">{name || `#${teacher.id}`}</div>

        {designation && (
          <div className="text-[11px] text-violet-700 font-semibold mt-0.5 truncate" title={designation}>
            {designation}
          </div>
        )}

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {(deptShort || deptFull) && (
            <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-500">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
              </svg>
              {deptShort || deptFull}
            </span>
          )}
          {email && (
            <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" strokeLinecap="round" />
              </svg>
              {email}
            </span>
          )}
          {mobile && (
            <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
              </svg>
              {mobile}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function GroupCard({ group }: { group: SelectOption }) {
  const groupName = toStr(group.name);
  const session = toStr(group.session);
  const semName = toStr(group.currentSemester?.name);
  const semOrder = group.currentSemester?.order != null
    ? `Semester ${group.currentSemester.order}`
    : semName
    ? `Semester ${semName}`
    : "";
  // group.department is also an object from the API
  const { shortName: deptShort } = parseDept(group.department);
  const shiftName = toStr(group.shift?.name);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2.5 mb-2">
      <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-slate-800">Group {groupName}</span>
          {session && (
            <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
              {session}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {semOrder && (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
              {semOrder}
            </span>
          )}
          {deptShort && (
            <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-500">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
              </svg>
              {deptShort}
            </span>
          )}
          {shiftName && (
            <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-500">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
              {shiftName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SemesterCard({ semester }: { semester: SelectOption }) {
  const academicYear = toStr(semester.academicYear);
  const isActive = typeof semester.isActive === "boolean" ? semester.isActive : null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2.5 mb-2">
      <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-slate-800">{getLabel(semester)}</div>
        <div className="flex items-center gap-2 mt-0.5">
          {academicYear && (
            <span className="text-[10.5px] text-slate-500">{academicYear}</span>
          )}
          {isActive != null && (
            <span
              className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  value,
  icon,
  onChange,
}: {
  label: string;
  name: string;
  options: SelectOption[];
  value?: number | null;
  icon: React.ReactNode;
  onChange?: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-slate-400 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          required
          value={value ?? ""}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-[13.5px] appearance-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all hover:border-slate-300 cursor-pointer font-medium"
        >
          <option value="" disabled className="text-slate-400">
            Choose {label}…
          </option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {getLabel(o)}
              {toStr(o.code) ? ` · ${toStr(o.code)}` : ""}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M1.5 3.5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function AssignTeacherModal({
  isOpen,
  onClose,
  groups,
  teachers,
  subjects,
  semesters,
  defaultGroupId,
}: AssignTeacherModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createSubjectGroup, INIT);
  const [mounted, setMounted] = useState(false);
  // Incrementing this key remounts the <form>, resetting useActionState to INIT.
  const [formKey, setFormKey] = useState(0);

  const [selectedSubject, setSelectedSubject] = useState<SelectOption | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<SelectOption | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SelectOption | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<SelectOption | null>(null);

  // Reset selections AND bump formKey on open so useActionState is wiped clean.
  // Guard with `if (!isOpen) return` so setState only fires when the
  // modal actually opens — not on every render. This avoids the "cascading
  // renders" lint warning while still correctly resetting selections each time
  // the modal is opened.
  useEffect(() => {
    if (!isOpen) return;

    setFormKey((k) => k + 1);
    setSelectedSubject(subjects[0] ?? null);
    setSelectedTeacher(teachers[0] ?? null);
    setSelectedGroup(
      defaultGroupId
        ? (groups.find((g) => g.id === defaultGroupId) ?? groups[0] ?? null)
        : (groups[0] ?? null)
    );
    setSelectedSemester(semesters[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // intentional: only reset when isOpen flips to true

  // Animate in/out
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(isOpen));
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Close after successful submit
  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
    const t = setTimeout(onClose, 1400);
    return () => clearTimeout(t);
  }, [state.success, onClose]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Step 0 = nothing selected, 3 = all selected
  const step = selectedSubject
    ? selectedGroup
      ? selectedTeacher
        ? 3
        : 2
      : 1
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.25s ease" }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-lg"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

          <div className="p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.7">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" />
                    <path
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900 leading-tight tracking-tight">
                    Assign Teacher
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Link teacher · subject · group · semester
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M1 1l11 11M12 1L1 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <StepIndicator step={step} />

            <div className="h-px bg-slate-100 mb-5" />

            {/* Form */}
            <form key={formKey} ref={formRef} action={action} className="space-y-4">

              {/* Subject */}
              <div>
                <div className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Subject
                </div>
                {selectedSubject && <SubjectCard subject={selectedSubject} />}
                <SelectField
                  label="Subject"
                  name="subjectId"
                  options={subjects}
                  value={selectedSubject?.id ?? null}
                  icon={null}
                  onChange={(id) => setSelectedSubject(subjects.find((s) => s.id === id) ?? null)}
                />
              </div>

              {/* Group + Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
                    </svg>
                    Group
                  </div>
                  {selectedGroup && <GroupCard group={selectedGroup} />}
                  <SelectField
                    label="Group"
                    name="groupId"
                    options={groups}
                    value={selectedGroup?.id ?? null}
                    icon={null}
                    onChange={(id) => setSelectedGroup(groups.find((g) => g.id === id) ?? null)}
                  />
                </div>
                <div>
                  <div className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                    </svg>
                    Semester
                  </div>
                  {selectedSemester && <SemesterCard semester={selectedSemester} />}
                  <SelectField
                    label="Semester"
                    name="semesterId"
                    options={semesters}
                    value={selectedSemester?.id ?? null}
                    icon={null}
                    onChange={(id) => setSelectedSemester(semesters.find((s) => s.id === id) ?? null)}
                  />
                </div>
              </div>

              {/* Teacher */}
              <div>
                <div className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Teacher
                </div>
                {selectedTeacher && <TeacherCard teacher={selectedTeacher} />}
                <SelectField
                  label="Teacher"
                  name="teacherId"
                  options={teachers}
                  value={selectedTeacher?.id ?? null}
                  icon={null}
                  onChange={(id) => setSelectedTeacher(teachers.find((t) => t.id === id) ?? null)}
                />
              </div>

              {/* Feedback */}
              {state.message && (
                <div
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold border ${
                    state.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {state.success ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                    </svg>
                  )}
                  {state.message}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-800 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || state.success}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
                >
                  {pending ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path
                          d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                          strokeLinecap="round"
                        />
                      </svg>
                      Saving…
                    </>
                  ) : state.success ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Assigned!
                    </>
                  ) : (
                    "Assign Teacher"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}