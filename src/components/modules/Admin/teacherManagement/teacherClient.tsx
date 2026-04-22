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

// ── Main Client ───────────────────────────────────────────────────────────────

export default function TeacherManagementClient({ departments, teachers, meta }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    function updateParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value); else params.delete(key);
        params.set("page", "1");
        startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }

    function goToPage(p: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(p));
        startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">

            {/* Header */}
            <div className="border-b border-gray-200 bg-white sticky top-0 z-30">
                <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                            Faculty Management
                        </p>
                        <h1 className="text-xl font-bold text-gray-900">Teachers</h1>
                    </div>
                    <button
                        onClick={() => setDialogOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-sm"
                    >
                        + Enroll Teacher
                    </button>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-5">

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">

                    <input
                        type="text"
                        placeholder="Search teachers…"
                        defaultValue={searchParams.get("searchTerm") ?? ""}
                        onChange={(e) => updateParam("searchTerm", e.target.value)}
                        className="bg-white border border-gray-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
                    />

                    <select
                        defaultValue={searchParams.get("departmentId") ?? ""}
                        onChange={(e) => updateParam("departmentId", e.target.value)}
                        className="bg-white border border-gray-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
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

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["#", "Teacher", "Designation", "Department", "Mobile", "Email"].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map((teacher, i) => (
                                    <tr key={teacher.id} className="border-t hover:bg-gray-50">
                                        <td className="px-5 py-3">{i + 1}</td>
                                        <td className="px-5 py-3 font-medium">{teacher.name}</td>
                                        <td className="px-5 py-3">
                                            <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                                                {teacher.designation}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">{teacher.department?.name}</td>
                                        <td className="px-5 py-3">{teacher.mobile}</td>
                                        <td className="px-5 py-3">{teacher.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        Page {meta.page} of {meta.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded bg-white">←</button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded">{meta.page}</button>
                        <button className="px-3 py-1 border rounded bg-white">→</button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {dialogOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-[400px]">
                        <h2 className="text-lg font-semibold mb-4">Enroll Teacher</h2>
                        <form className="space-y-3">
                            <input name="name" placeholder="Name" className="w-full border p-2 rounded" />
                            <input name="email" placeholder="Email" className="w-full border p-2 rounded" />
                            <input name="mobile" placeholder="Mobile" className="w-full border p-2 rounded" />
                            <input name="designation" placeholder="Designation" className="w-full border p-2 rounded" />

                            <select name="departmentId" className="w-full border p-2 rounded">
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>

                            <input type="password" name="password" placeholder="Password" className="w-full border p-2 rounded" />

                            <button className="w-full bg-blue-600 text-white py-2 rounded">
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}