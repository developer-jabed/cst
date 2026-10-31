// src/components/modules/Admin/studentManagement/StudentTable.tsx
"use client";

import { memo, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { deleteStudent } from "@/service/student/student.service";

/* ────────────────────────────── Types ────────────────────────────── */

interface Student {
    id: number;
    name: string;
    email: string;
    roll: string;
    registration: string;
    mobile: string;
    gender: string;
    profilePhoto: string | null;
    isDeleted: boolean;
    group: { id: number; name: string };
    department: { id: number; name: string };
}

interface Meta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface Props {
    students: Student[];
    meta: Meta;
    onPageChange: (page: number) => void;
}

/* ───────────────────── Theme constants (module scope) ───────────────────── */

// Avatar gradients — all derived from the emerald / gold / ink family
const AVATAR_GRADIENTS = [
    "from-emerald-500 to-teal-600",
    "from-amber-400 to-yellow-600",
    "from-teal-500 to-cyan-600",
    "from-lime-500 to-emerald-600",
    "from-sky-500 to-indigo-600",
    "from-rose-400 to-pink-600",
    "from-violet-500 to-purple-600",
] as const;

const GENDER_STYLES: Record<string, string> = {
    Male: "bg-sky-50 text-sky-700 ring-sky-200",
    Female: "bg-rose-50 text-rose-600 ring-rose-200",
};
const GENDER_FALLBACK = "bg-muted text-muted-foreground ring-border";

const GROUP_STYLES: Record<string, string> = {
    A: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    B: "bg-amber-50 text-amber-700 ring-amber-200",
    C: "bg-sky-50 text-sky-700 ring-sky-200",
    D: "bg-violet-50 text-violet-700 ring-violet-200",
};
const GROUP_FALLBACK = "bg-teal-50 text-teal-700 ring-teal-200";

const COLUMNS = [
    { label: "Student", className: "" },
    { label: "Roll", className: "" },
    { label: "Department", className: "hidden md:table-cell" },
    { label: "Group", className: "hidden lg:table-cell" },
    { label: "Mobile", className: "hidden lg:table-cell" },
    { label: "Gender", className: "hidden sm:table-cell" },
] as const;

const TH = "px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70";
const BADGE = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset";

const getInitials = (name: string) =>
    name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase();

/** Compact page list with ellipsis markers (null) */
function getPageItems(page: number, total: number): (number | null)[] {
    const pages = Array.from({ length: total }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === total || Math.abs(p - page) <= 1
    );
    const out: (number | null)[] = [];
    pages.forEach((p, i) => {
        if (i > 0 && p - pages[i - 1] > 1) out.push(null);
        out.push(p);
    });
    return out;
}

/* ────────────────────────────── Icons ────────────────────────────── */

const TrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

/* ─────────────────────────── Delete Modal ─────────────────────────── */

function DeleteConfirmModal({
    student,
    onConfirm,
    onCancel,
    isPending,
}: {
    student: Student;
    onConfirm: () => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isPending && onCancel();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onCancel, isPending]);

    return (
        <div
            className="st-backdrop fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 px-4 backdrop-blur-md"
            onClick={() => !isPending && onCancel()}
        >
            <div
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                className="st-modal w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            >
                <div className="h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-gold" />
                <div className="p-6">
                    <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
                        <span className="absolute inset-0 animate-ping rounded-full bg-rose-200/60" />
                        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-rose-100 ring-1 ring-rose-200">
                            <TrashIcon className="h-6 w-6 text-rose-500" />
                        </span>
                    </div>
                    <h3 className="mb-1 text-center text-lg font-bold text-foreground">Remove Student</h3>
                    <p className="mb-6 text-center text-sm text-muted-foreground">
                        Are you sure you want to remove{" "}
                        <span className="font-semibold text-primary">{student.name}</span>? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isPending}
                            className="flex-1 rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-sm font-semibold text-foreground/70 transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isPending}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/35 active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {isPending ? (
                                <>
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Removing…
                                </>
                            ) : (
                                "Remove"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────── Avatar ──────────────────────────── */

const Avatar = memo(function Avatar({ id, name, photo }: { id: number; name: string; photo: string | null }) {
    const base = "h-10 w-10 shrink-0 rounded-full ring-2 ring-gold-soft/70 transition-transform duration-300 group-hover:scale-110";

    if (photo) {
        return <Image src={photo} alt={name} width={40} height={40} className={`${base} object-cover`} />;
    }
    return (
        <div className={`${base} flex items-center justify-center bg-gradient-to-br ${AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length]}`}>
            <span className="text-xs font-bold text-white drop-shadow-sm">{getInitials(name)}</span>
        </div>
    );
});

/* ─────────────────────────── Pagination ─────────────────────────── */

function Pagination({ meta, onPageChange }: { meta: Meta; onPageChange: (p: number) => void }) {
    const { page, totalPages, total, limit } = meta;
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);
    const items = useMemo(() => getPageItems(page, totalPages), [page, totalPages]);

    const arrow =
        "flex h-9 w-9 items-center justify-center rounded-xl text-primary/70 transition-all duration-200 hover:bg-secondary hover:text-primary active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-gradient-to-r from-secondary/60 via-transparent to-secondary/60 px-4 py-3.5 sm:flex-row">
            <p className="text-xs text-muted-foreground">
                Showing <span className="font-bold text-primary">{from}–{to}</span> of{" "}
                <span className="font-bold text-primary">{total}</span> students
            </p>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={arrow} aria-label="Previous page">
                    ‹
                </button>
                {items.map((p, i) =>
                    p === null ? (
                        <span key={`gap-${i}`} className="px-1 text-xs text-gold">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            aria-current={p === page ? "page" : undefined}
                            className={`h-9 min-w-9 rounded-xl px-2 text-xs font-bold transition-all duration-200 active:scale-90 ${
                                p === page
                                    ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30"
                                    : "text-foreground/60 hover:bg-secondary hover:text-primary"
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}
                <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className={arrow} aria-label="Next page">
                    ›
                </button>
            </div>
        </div>
    );
}

/* ───────────────────────────── Row ───────────────────────────── */

const StudentRow = memo(function StudentRow({
    student: s,
    index,
    onDelete,
}: {
    student: Student;
    index: number;
    onDelete: (s: Student) => void;
}) {
    return (
        <tr
            className="st-row group relative transition-colors duration-300 hover:bg-gradient-to-r hover:from-secondary hover:via-accent/40 hover:to-transparent"
            style={{ ["--i" as string]: index }}
        >
            <td className="relative px-4 py-3">
                {/* gold accent bar on hover */}
                <span className="absolute left-0 top-2 bottom-2 w-[3px] origin-center scale-y-0 rounded-r bg-gradient-to-b from-gold-soft to-gold transition-transform duration-300 group-hover:scale-y-100" />
                <div className="flex items-center gap-3">
                    <Avatar id={s.id} name={s.name} photo={s.profilePhoto} />
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.email}</p>
                    </div>
                </div>
            </td>

            <td className="px-4 py-3">
                <span className={`${BADGE} bg-emerald-50 text-emerald-700 ring-emerald-200 tabular-nums`}>{s.roll}</span>
            </td>

            <td className="hidden px-4 py-3 md:table-cell">
                <span className={`${BADGE} bg-amber-50 text-amber-800 ring-gold-soft`}>{s.department.name}</span>
            </td>

            <td className="hidden px-4 py-3 lg:table-cell">
                <span className={`${BADGE} ${GROUP_STYLES[s.group.name] ?? GROUP_FALLBACK}`}>{s.group.name}</span>
            </td>

            <td className="hidden px-4 py-3 text-xs font-medium tabular-nums text-foreground/70 lg:table-cell">{s.mobile}</td>

            <td className="hidden px-4 py-3 sm:table-cell">
                <span className={`${BADGE} ${GENDER_STYLES[s.gender] ?? GENDER_FALLBACK}`}>{s.gender}</span>
            </td>

            <td className="px-4 py-3">
                <div className="flex items-center justify-end opacity-0 translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 focus-within:translate-x-0 focus-within:opacity-100">
                    <button
                        onClick={() => onDelete(s)}
                        title="Remove student"
                        aria-label={`Remove ${s.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:scale-110 hover:bg-rose-50 hover:text-rose-500 active:scale-90"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </td>
        </tr>
    );
});

/* ───────────────────────── Empty State ───────────────────────── */

function EmptyState() {
    return (
        <div className="st-fade rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent ring-1 ring-gold-soft">
                    <svg className="h-8 w-8 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <p className="text-sm font-bold text-foreground">No students found</p>
                <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters or enroll a new student.</p>
            </div>
        </div>
    );
}

/* ───────────────────────── Main Table ───────────────────────── */

export default function StudentTable({ students, meta, onPageChange }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
    const [isPending, startTransition] = useTransition();

    const closeModal = useCallback(() => setDeleteTarget(null), []);

    const handleDelete = useCallback(() => {
        if (!deleteTarget) return;
        startTransition(async () => {
            const result = await deleteStudent(deleteTarget.id);
            if (result.success) {
                toast.success("Student removed successfully");
                setDeleteTarget(null);
            } else {
                toast.error(result.message ?? "Failed to remove student");
            }
        });
    }, [deleteTarget]);

    if (students.length === 0) return <EmptyState />;

    return (
        <>
            {deleteTarget && (
                <DeleteConfirmModal
                    student={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={closeModal}
                    isPending={isPending}
                />
            )}

            <div className="st-fade overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
                {/* brand stripe */}
                <div className="h-1 bg-gradient-to-r from-primary via-emerald-500 to-gold" />

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-gradient-to-r from-secondary via-accent/60 to-secondary">
                                {COLUMNS.map((c) => (
                                    <th key={c.label} className={`${TH} ${c.className}`}>{c.label}</th>
                                ))}
                                <th className="px-4 py-3.5" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/70">
                            {students.map((s, i) => (
                                <StudentRow key={s.id} student={s} index={i} onDelete={setDeleteTarget} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {meta.totalPages > 1 && <Pagination meta={meta} onPageChange={onPageChange} />}
            </div>
        </>
    );
}