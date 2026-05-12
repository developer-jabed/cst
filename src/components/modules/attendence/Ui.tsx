"use client";

import { AttendanceRecord, getSessionSummary, SessionMeta, STATUS_CONFIG } from "@/types/attendence.interface";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Users,
  BookOpen,
  GraduationCap,
  User,
  Clock,
  CalendarDays,
} from "lucide-react";



const META_ICON_MAP = {
  group: Users,
  semester: GraduationCap,
  teacher: User,
  subject: BookOpen,
  department: BookOpen,
  shift: Clock,
} as const;

export function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/70 backdrop-blur-sm px-3 py-2 border border-slate-200/80 shadow-sm">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
        <Icon size={14} />
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-800 leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Session Header ───────────────────────────────────────────────────────────

export function SessionHeader({
  meta,
  date,
  isLive = false,
}: {
  meta: SessionMeta;
  date: string;
  isLive?: boolean;
}) {
  const dateObj = new Date(date);
  const formatted = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  console.log(meta.groupName)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 shadow-xl">
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-300">
            Attendance Session
          </p>
          <h1 className="mt-0.5 text-2xl font-bold text-white leading-tight">
            {meta.subjectName ?? "Subject"}
          </h1>
          {meta.subjectCode && (
            <span className="mt-1 inline-block rounded-md bg-indigo-700/60 px-2 py-0.5 text-xs font-semibold text-indigo-200">
              {meta.subjectCode}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-indigo-200">
            <CalendarDays size={12} />
            {formatted}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-indigo-200">
            <Clock size={12} />
            {time}
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Session
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-6 pb-5 pt-2">
        <MetaChip icon={Users} label="Group" value={meta.groupName} />
        <MetaChip
          icon={GraduationCap}
          label="Semester"
          value={meta.semesterName}
        />
        <MetaChip icon={User} label="Teacher" value={meta.teacherName} />
        <MetaChip
          icon={BookOpen}
          label="Department"
          value={meta.departmentName}
        />
        {meta.shiftName && (
          <MetaChip icon={Clock} label="Shift" value={meta.shiftName} />
        )}
      </div>
    </div>
  );
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────

export function SummaryBar({ records }: { records: AttendanceRecord[] }) {
  const { total, present, absent, late } = getSessionSummary(records);
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct(present)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <motion.div
          className="bg-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct(late)}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        />
        <motion.div
          className="bg-rose-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct(absent)}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        {[
          { label: "Total", value: total, cls: "text-slate-700" },
          { label: "Present", value: present, cls: "text-emerald-600" },
          { label: "Late", value: late, cls: "text-amber-600" },
          { label: "Absent", value: absent, cls: "text-rose-600" },
        ].map(({ label, value, cls }) => (
          <div key={label}>
            <p className={`text-xl font-bold ${cls}`}>{value}</p>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

export function StatusBadge({
  status,
}: {
  status: keyof typeof STATUS_CONFIG;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${cfg.badgeCls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotCls}`} />
      {cfg.label}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastState = {
  visible: boolean;
  success: boolean;
  message: string;
};

export function Toast({ toast }: { toast: ToastState }) {
  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 shadow-2xl text-white text-sm font-semibold ${
            toast.success ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.success ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── useToast hook ────────────────────────────────────────────────────────────

import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    success: true,
    message: "",
  });

  const show = (success: boolean, message: string) => {
    setToast({ visible: true, success, message });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  };

  return { toast, show };
}
