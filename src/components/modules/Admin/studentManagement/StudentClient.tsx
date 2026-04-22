/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/modules/Admin/studentManagement/StudentClient.tsx
"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createStudent } from "@/service/student/student.service";
import StudentTable from "./studentTable";

// ────────────────────────────────────────────── TYPES
interface SelectOption {
    id: number;
    name: string;
}

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
    departments: SelectOption[];
    shifts: SelectOption[];
    semesters: SelectOption[];
    groups: SelectOption[];
    students: Student[];
    meta: Meta;
}

// ─── REUSABLE COMPONENTS ─────────────────────
function Field({ label, name, type = "text", placeholder, required, error, defaultValue }: any) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                defaultValue={defaultValue}
                className={`rounded-xl border px-4 py-3 text-sm bg-white text-slate-800 placeholder-slate-400 outline-none transition-all
                    focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
                    ${error ? "border-rose-400" : "border-slate-200 hover:border-slate-300"}`}
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        </div>
    );
}

function SelectField({ label, name, options, required, error, value, onChange, placeholder = "Select...", disabled }: any) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <select
                name={name}
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
                className={`rounded-xl border px-4 py-3 text-sm bg-white text-slate-800 outline-none transition-all appearance-none
                    focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
                    ${error ? "border-rose-400" : "border-slate-200 hover:border-slate-300"}
                    disabled:opacity-50 disabled:bg-slate-50`}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((o: any) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                ))}
            </select>
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600">{title}</h3>
                <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
        </div>
    );
}

function Modal({ open, onClose, children }: any) {
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
            <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl my-8">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Enroll New Student</h2>
                        <p className="text-sm text-slate-500">Fill all required information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl text-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// ─── CREATE STUDENT FORM ─────────────────────
function CreateStudentForm({ departments, shifts, semesters, groups, onSuccess }: any) {
    const [state, setState] = useState<any>(null);
    const [isPending, startTransition] = useTransition();
    const [deptId, setDeptId] = useState("");
    const [shiftId, setShiftId] = useState("");
    const [semId, setSemId] = useState("");
    const [groupId, setGroupId] = useState("");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleDeptChange = (val: string) => {
        setDeptId(val);
        setShiftId("");
        setSemId("");
        setGroupId("");
    };

    const handleShiftChange = (val: string) => {
        setShiftId(val);
        setSemId("");
        setGroupId("");
    };

    const handleSemChange = (val: string) => {
        setSemId(val);
        setGroupId("");
    };

    const filteredShifts = deptId
        ? shifts.filter((s: any) => !s.departmentId || String(s.departmentId) === deptId)
        : shifts;

    const filteredGroups = groups.filter((g: any) => {
        if (deptId && g.departmentId && String(g.departmentId) !== deptId) return false;
        if (shiftId && g.shiftId && String(g.shiftId) !== shiftId) return false;
        if (semId && g.currentSemesterId && String(g.currentSemesterId) !== semId) return false;
        return true;
    });

    const errors = state?.errors ?? {};

    useEffect(() => {
        if (state?.success) {
            toast.success("Student enrolled successfully!");
            setTimeout(() => onSuccess(), 1200);
        } else if (state?.message) {
            toast.error(state.message);
        }
    }, [state, onSuccess]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const file = fileRef.current?.files?.[0];
        if (file) formData.append("file", file);

        startTransition(async () => {
            const result = await createStudent(null, formData);
            setState(result);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Upload */}
            <div className="flex items-center gap-6">
                <div
                    onClick={() => fileRef.current?.click()}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 bg-slate-50"
                >
                    {photoPreview ? (
                        <Image src={photoPreview} alt="Preview" width={96} height={96} className="object-cover w-full h-full" />
                    ) : (
                        <div className="text-center text-slate-400">
                            <div className="text-3xl mb-1">📷</div>
                            <div className="text-xs">Photo</div>
                        </div>
                    )}
                </div>
                <div>
                    <p className="font-semibold text-slate-700">Profile Photo</p>
                    <p className="text-xs text-slate-500 mt-1">JPEG, PNG or WebP • Max 2MB</p>
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="mt-3 text-sm px-5 py-2 rounded-xl border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                    >
                        {photoPreview ? "Change Photo" : "Choose Photo"}
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setPhotoPreview(URL.createObjectURL(f));
                        }}
                    />
                </div>
            </div>

            {/* Academic Placement */}
            <Section title="Academic Placement">
                <SelectField label="Department" name="departmentId" options={departments} required value={deptId} onChange={handleDeptChange} error={errors.departmentId} />
                <SelectField label="Shift" name="shiftId" options={filteredShifts} required value={shiftId} onChange={handleShiftChange} error={errors.shiftId} disabled={!deptId} />
                <SelectField label="Semester" name="semesterId" options={semesters} required value={semId} onChange={handleSemChange} error={errors.semesterId} disabled={!shiftId} />
                <SelectField label="Group" name="groupId" options={filteredGroups} required value={groupId} onChange={setGroupId} error={errors.groupId} disabled={!semId} />
                <Field label="Roll Number" name="roll" placeholder="e.g. 2201" required error={errors.roll} />
                <Field label="Registration Number" name="registration" placeholder="Registration number" required error={errors.registration} />
            </Section>

            {/* Personal Information */}
            <Section title="Personal Information">
                <Field label="Full Name" name="name" required error={errors.name} />
                <Field label="Email" name="email" type="email" required error={errors.email} />
                <Field label="Mobile" name="mobile" required error={errors.mobile} />
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                        name="gender" defaultValue=""
                        className={`rounded-lg border px-3 py-2.5 text-sm bg-white text-slate-800 outline-none transition-all appearance-none
              focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
              ${errors.gender ? "border-rose-400" : "border-slate-200 hover:border-slate-300"}`}
                    >
                        <option value="" disabled>Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-xs text-rose-500 mt-0.5">{errors.gender}</p>}
                </div>
                <Field label="Birth Date" name="birthDate" type="date" required error={errors.birthDate} />
                <Field label="Birth Number" name="birthnumber" required error={errors.birthnumber} />
                <Field label="NID (Optional)" name="nid" error={errors.nid} />
            </Section>

            {/* Family Information */}
            <Section title="Family Information">
                <Field label="Father Name" name="fatherName" required error={errors.fatherName} />
                <Field label="Mother Name" name="motherName" required error={errors.motherName} />
                <Field label="Father Mobile" name="fatherMobile" required error={errors.fatherMobile} />
                <Field label="Mother Mobile" name="motherMobile" required error={errors.motherMobile} />
            </Section>

            {/* Address */}
            <Section title="Address">
                <Field label="Present Address" name="presentAddress" required error={errors.presentAddress} />
                <Field label="Permanent Address" name="permanentAddress" required error={errors.permanentAddress} />
            </Section>

            {/* Credentials */}
            <Section title="Login Credentials">
                <Field label="Password" name="password" type="password" required error={errors.password} />
            </Section>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-10 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                >
                    {isPending ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Enrolling...
                        </>
                    ) : (
                        "Enroll Student"
                    )}
                </button>
            </div>
        </form>
    );
}

// ─── MAIN CLIENT COMPONENT ─────────────────────
export default function StudentManagementClient(props: Props) {
    const { departments, shifts, semesters, groups, students, meta } = props;

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") ?? "");
    const [isPending, startTransition] = useTransition();

    const departmentId = searchParams.get("departmentId") ?? "";
    const shiftId = searchParams.get("shiftId") ?? "";
    const semesterId = searchParams.get("semesterId") ?? "";
    const groupId = searchParams.get("groupId") ?? "";
    const gender = searchParams.get("gender") ?? "";

    const createQueryString = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") params.delete(key);
            else params.set(key, value);
        });
        if (!updates.page) params.set("page", "1");
        return params.toString();
    }, [searchParams]);

    const applyFilters = useCallback((updates: Record<string, string | null>) => {
        startTransition(() => {
            const query = createQueryString(updates);
            router.replace(`${pathname}?${query}`, { scroll: false });
        });
    }, [router, pathname, createQueryString]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (searchParams.get("searchTerm") ?? "")) {
                applyFilters({ searchTerm: searchTerm || null });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, searchParams, applyFilters]);

    const clearAllFilters = () => {
        setSearchTerm("");
        router.replace(pathname);
    };

    const hasActiveFilters = !!(searchTerm || departmentId || shiftId || semesterId || groupId || gender);

    const handleSuccess = () => {
        setModalOpen(false);
        router.refresh(); // Refresh data after successful enrollment
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold tracking-[0.3em] text-indigo-500 uppercase mb-1">Dashboard / Students</p>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Student Management</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {meta.total} student{meta.total !== 1 ? "s" : ""} found
                        </p>
                    </div>

                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/30"
                    >
                        + Enroll New Student
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div className="xl:col-span-2">
                            <input
                                type="text"
                                placeholder="Search by name, roll, email, mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>



                        <select value={gender} onChange={(e) => applyFilters({ gender: e.target.value })} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm bg-white">
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button onClick={clearAllFilters} className="mt-4 text-sm text-rose-500 hover:text-rose-600 font-medium">
                            Clear All Filters
                        </button>
                    )}
                </div>

                <StudentTable students={students} meta={meta} onPageChange={(page) => applyFilters({ page: String(page) })} />
            </div>

            {/* Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <CreateStudentForm
                    departments={departments}
                    shifts={shifts}
                    semesters={semesters}
                    groups={groups}
                    onSuccess={handleSuccess}
                />
            </Modal>
        </div>
    );
}