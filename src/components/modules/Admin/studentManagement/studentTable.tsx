// src/components/modules/Admin/studentManagement/StudentTable.tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { deleteStudent } from "@/service/student/student.service";

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

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

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
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 text-center mb-1">Remove Student</h3>
                <p className="text-sm text-slate-500 text-center mb-6">
                    Are you sure you want to remove <span className="font-semibold text-slate-700">{student.name}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isPending}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Removing…
                            </>
                        ) : "Remove"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, photo }: { name: string; photo: string | null }) {
    const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    if (photo) {
        return (
            <Image
                src={photo} alt={name} width={36} height={36}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
            />
        );
    }
    return (
        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-indigo-500">{initials}</span>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ meta, onPageChange }: { meta: Meta; onPageChange: (p: number) => void }) {
    const { page, totalPages, total, limit } = meta;
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
    );

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{from}–{to}</span> of{" "}
                <span className="font-semibold text-slate-600">{total}</span> students
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                >
                    ‹
                </button>
                {pages.map((p, i) => {
                    const prev = pages[i - 1];
                    return (
                        <span key={p} className="flex items-center gap-1">
                            {prev && p - prev > 1 && (
                                <span className="text-xs text-slate-300 px-1">…</span>
                            )}
                            <button
                                onClick={() => onPageChange(p)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors
                  ${p === page
                                        ? "bg-indigo-600 text-white"
                                        : "text-slate-500 hover:bg-slate-100"
                                    }`}
                            >
                                {p}
                            </button>
                        </span>
                    );
                })}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                >
                    ›
                </button>
            </div>
        </div>
    );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export default function StudentTable({ students, meta, onPageChange }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
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
    };

    if (students.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No students found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or enroll a new student.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {deleteTarget && (
                <DeleteConfirmModal
                    student={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    isPending={isPending}
                />
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Roll</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Department</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Group</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Mobile</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Gender</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={s.name} photo={s.profilePhoto} />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-800 truncate">{s.name}</p>
                                                <p className="text-xs text-slate-400 truncate">{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-xs font-semibold">
                                            {s.roll}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-slate-600 text-xs">{s.department.name}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="text-slate-600 text-xs">{s.group.name}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="text-slate-500 text-xs">{s.mobile}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold
                      ${s.gender === "Male"
                                                ? "bg-blue-50 text-blue-600"
                                                : s.gender === "Female"
                                                    ? "bg-pink-50 text-pink-600"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {s.gender}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setDeleteTarget(s)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                title="Remove student"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <Pagination meta={meta} onPageChange={onPageChange} />
                )}
            </div>
        </>
    );
}