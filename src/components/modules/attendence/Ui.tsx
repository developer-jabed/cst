"use client";

import { useState } from "react";
import {
  AttendanceRecord,
  getSessionSummary,
  SessionMeta,
  STATUS_CONFIG,
} from "@/types/attendence.interface";
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

/* ───────────────────────── MetaChip ───────────────────────── */

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
    <div className="flex items-center gap-2 rounded-xl bg-card/80 px-3 py-2 ring-1 ring-border backdrop-blur-sm">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={14} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold leading-tight text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────── SessionHeader ───────────────────────── */

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

  return (
    <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />

      <div className="bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 px-6 pb-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
              Attendance Session
            </p>
            <h1 className="mt-0.5 text-2xl font-black leading-tight text-foreground">
              {meta.subjectName ?? "Subject"}
            </h1>
            {meta.subjectCode && (
              <span className="mt-1.5 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                {meta.subjectCode}
              </span>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs text-muted-foreground ring-1 ring-border">
              <CalendarDays size={12} />
              {formatted}
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs text-muted-foreground ring-1 ring-border">
              <Clock size={12} />
              {time}
            </div>
            {isLive && (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live Session
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
    </div>
  );
}

/* ───────────────────────── SummaryBar ───────────────────────── */

export function SummaryBar({ records }: { records: AttendanceRecord[] }) {
  const { total, present, absent, late } = getSessionSummary(records);
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
      <div className="p-4">
        <div className="mb-3 flex h-2.5 overflow-hidden rounded-full bg-border">
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
            { label: "Total", value: total, cls: "text-foreground" },
            { label: "Present", value: present, cls: "text-emerald-600" },
            { label: "Late", value: late, cls: "text-amber-600" },
            { label: "Absent", value: absent, cls: "text-rose-600" },
          ].map(({ label, value, cls }) => (
            <div key={label}>
              <p className={`text-xl font-black tabular-nums ${cls}`}>
                {value}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── StatusBadge ───────────────────────── */

export function StatusBadge({
  status,
}: {
  status: keyof typeof STATUS_CONFIG;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${cfg.badgeCls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotCls}`} />
      {cfg.label}
    </span>
  );
}

/* ───────────────────────── Toast ───────────────────────── */

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
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-semibold text-white shadow-2xl ${
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

/* ───────────────────────── useToast ───────────────────────── */

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