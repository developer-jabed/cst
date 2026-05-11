"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useActionState, useRef, useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createTeacher } from "@/service/admin/teacherManagement";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Department { id: number; name: string; }

interface Teacher {
    id: number;
    name: string;
    email: string;
    mobile: string;
    designation: string;
    profilePhoto?: string | null;
    department?: { name: string };
}

interface Meta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface Props {
    departments: Department[];
    teachers: Teacher[];
    meta: Meta;
}

const initialState = {
    success: false,
    message: "",
    errors: {} as Record<string, string[]>,
};

// ── Field Error ───────────────────────────────────────────────────────────────

function FieldError({ errors, name }: { errors: Record<string, string[]>; name: string }) {
    const msgs = errors?.[name];
    if (!msgs?.length) return null;
    return <p className="text-xs text-red-500 mt-1">{msgs[0]}</p>;
}

// ── Main Client ───────────────────────────────────────────────────────────────

export default function TeacherManagementClient({ departments, teachers, meta }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // ── Server Action State ───────────────────────────────────────────────────
    const [state, formAction, isSubmitting] = useActionState(createTeacher, initialState);

    // ── Close modal & reset on success ───────────────────────────────────────
    // Use a ref to track the previous success value so we only react to a
    // *transition* from false → true, and schedule the state updates in a
    // startTransition to avoid the synchronous-setState-in-effect warning.
    const prevSuccessRef = useRef(false);
    useEffect(() => {
        if (state.success && !prevSuccessRef.current) {
            prevSuccessRef.current = true;
            startTransition(() => {
                setDialogOpen(false);
                setPreviewUrl(null);
                formRef.current?.reset();
            });
        }
        if (!state.success) {
            prevSuccessRef.current = false;
        }
    }, [state.success]);

    // ── URL helpers ───────────────────────────────────────────────────────────
    function updateParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value); else params.delete(key);
        params.set("page", "1");
        startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }

    function goToPage(p: number) {
        if (p < 1 || p > meta.totalPages) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(p));
        startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }

    // ── Photo preview ─────────────────────────────────────────────────────────
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }

    function openDialog() {
        setDialogOpen(true);
        setPreviewUrl(null);
        // Reset form state when reopening
        formRef.current?.reset();
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">

            {/* ── Header ── */}
            <div className="border-b border-gray-200 bg-white sticky top-0 z-30">
                <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                            Faculty Management
                        </p>
                        <h1 className="text-xl font-bold text-gray-900">Teachers</h1>
                    </div>
                    <button
                        onClick={openDialog}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-sm"
                    >
                        + Enroll Teacher
                    </button>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-5">

                {/* ── Filters ── */}
                <div className="flex flex-wrap gap-3 items-center">
                    <input
                        type="text"
                        placeholder="Search teachers…"
                        defaultValue={searchParams.get("searchTerm") ?? ""}
                        onChange={(e) => updateParam("searchTerm", e.target.value)}
                        className="bg-white border border-gray-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                    />
                    <select
                        defaultValue={searchParams.get("departmentId") ?? ""}
                        onChange={(e) => updateParam("departmentId", e.target.value)}
                        className="bg-white border border-gray-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                    >
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <div className="ml-auto text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">{meta.total}</span> teachers
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["#", "Teacher", "Designation", "Department", "Mobile", "Email"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                                            No teachers found.
                                        </td>
                                    </tr>
                                ) : teachers.map((teacher, i) => (
                                    <tr key={teacher.id} className="border-t hover:bg-gray-50 transition">
                                        <td className="px-5 py-3 text-gray-500">{(meta.page - 1) * meta.limit + i + 1}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                {teacher.profilePhoto ? (
                                                    <Image
                                                        src={teacher.profilePhoto}
                                                        alt={teacher.name}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full object-cover w-8 h-8 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {teacher.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-900">{teacher.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-medium">
                                                {teacher.designation}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{teacher.department?.name ?? "—"}</td>
                                        <td className="px-5 py-3 text-gray-600">{teacher.mobile}</td>
                                        <td className="px-5 py-3 text-gray-600">{teacher.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Pagination ── */}
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        Page <span className="font-semibold text-gray-800">{meta.page}</span> of{" "}
                        <span className="font-semibold text-gray-800">{meta.totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => goToPage(meta.page - 1)}
                            disabled={meta.page <= 1 || isPending}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            ←
                        </button>
                        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                            {meta.page}
                        </button>
                        <button
                            onClick={() => goToPage(meta.page + 1)}
                            disabled={meta.page >= meta.totalPages || isPending}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Modal ── */}
            {dialogOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setDialogOpen(false); }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Enroll Teacher</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Fill in the details to add a new teacher</p>
                            </div>
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Global error / success message */}
                        {state.message && (
                            <div className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm font-medium ${state.success
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                                }`}>
                                {state.message}
                            </div>
                        )}

                        {/* Form — uses formAction directly (works with useActionState) */}
                        <form ref={formRef} action={formAction} className="px-6 py-5 space-y-4">

                            {/* Profile Photo */}
                            <div className="flex flex-col items-center gap-3">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition overflow-hidden bg-gray-50"
                                >
                                    {previewUrl ? (
                                        <Image src={previewUrl} alt="Preview" width={80} height={80} className="object-cover w-full h-full" />
                                    ) : (
                                        <span className="text-2xl text-gray-300">📷</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    {previewUrl ? "Change photo" : "Upload photo (optional)"}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    name="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    name="name"
                                    placeholder="e.g. Dr. John Smith"
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition ${state.errors?.name ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                />
                                <FieldError errors={state.errors} name="name" />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="e.g. john@university.edu"
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition ${state.errors?.email ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                />
                                <FieldError errors={state.errors} name="email" />
                            </div>

                            {/* Mobile */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile <span className="text-red-500">*</span></label>
                                <input
                                    name="mobile"
                                    placeholder="e.g. +8801700000000"
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition ${state.errors?.mobile ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                />
                                <FieldError errors={state.errors} name="mobile" />
                            </div>

                            {/* Designation */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Designation <span className="text-red-500">*</span></label>
                                <input
                                    name="designation"
                                    placeholder="e.g. Associate Professor"
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition ${state.errors?.designation ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                />
                                <FieldError errors={state.errors} name="designation" />
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Department <span className="text-red-500">*</span></label>
                                <select
                                    name="departmentId"
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white ${state.errors?.departmentId ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                >
                                    <option value="">Select a department</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                <FieldError errors={state.errors} name="departmentId" />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Password <span className="text-red-500">*</span></label>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition ${state.errors?.password ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                />
                                <FieldError errors={state.errors} name="password" />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDialogOpen(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enrolling…
                                        </>
                                    ) : "Enroll Teacher"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}