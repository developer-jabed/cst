// src/components/modules/Admin/studentManagement/StudentClient.tsx
"use client";

import {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
    type FormEvent,
    type ReactNode,
} from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createStudent } from "@/service/student/student.service";
import StudentTable from "./studentTable";


/* ────────────────────────────── Types ────────────────────────────── */

interface SelectOption {
    id: number;
    name: string;
    departmentId?: number | null;
    shiftId?: number | null;
    currentSemesterId?: number | null;
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

type FieldErrors = Record<string, string | undefined>;
interface ActionState {
    success?: boolean;
    message?: string;
    errors?: FieldErrors;
}

/* ───────────────────── Shared style constants ───────────────────── */

const LABEL = "text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70";
const CONTROL =
    "w-full rounded-xl border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-200 " +
    "hover:border-gold-soft focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60";
const controlClass = (error?: string) => `${CONTROL} ${error ? "border-rose-400" : "border-border"}`;

const GENDER_OPTIONS: SelectOption[] = [
    { id: 0, name: "Male" },
    { id: 1, name: "Female" },
    { id: 2, name: "Other" },
];

/* ───────────────────── Reusable form components ───────────────────── */

interface FieldProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    defaultValue?: string;
}

const Field = memo(function Field({ label, name, type = "text", placeholder, required, error, defaultValue }: FieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className={LABEL}>
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} className={controlClass(error)} />
            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
});

interface SelectFieldProps {
    label: string;
    name: string;
    options: { id: number | string; name: string }[];
    required?: boolean;
    error?: string;
    value?: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    /** use option name as the submitted value (for gender) */
    valueByName?: boolean;
}

const SelectField = memo(function SelectField({
    label, name, options, required, error, value, onChange, placeholder = "Select...", disabled, valueByName,
}: SelectFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className={LABEL}>
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
                <select
                    name={name}
                    value={value ?? ""}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={disabled}
                    className={`${controlClass(error)} appearance-none pr-10`}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((o) => (
                        <option key={o.id} value={valueByName ? o.name : o.id}>{o.name}</option>
                    ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gold">▾</span>
            </div>
            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
});

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-soft" />
                <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{title}</h3>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-soft" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
        </div>
    );
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="st-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/55 px-4 py-8 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                className="st-modal relative my-8 w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            >
                <div className="h-1 bg-gradient-to-r from-primary via-emerald-500 to-gold" />
                <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-secondary via-card to-secondary px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Enroll New Student</h2>
                        <p className="text-sm text-muted-foreground">Fill all required information</p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="h-10 w-10 rounded-2xl text-xl text-muted-foreground transition-all duration-200 hover:rotate-90 hover:bg-rose-50 hover:text-rose-500 active:scale-90"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

/* ─────────────────────── Create student form ─────────────────────── */

interface FormProps {
    departments: SelectOption[];
    shifts: SelectOption[];
    semesters: SelectOption[];
    groups: SelectOption[];
    onSuccess: () => void;
}

function CreateStudentForm({ departments, shifts, semesters, groups, onSuccess }: FormProps) {
    const [state, setState] = useState<ActionState | null>(null);
    const [isPending, startTransition] = useTransition();
    const [sel, setSel] = useState({ dept: "", shift: "", sem: "", group: "" });
    const [gender, setGender] = useState("");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Cascading selects: changing a level resets everything below it
    const setDept = (v: string) => setSel({ dept: v, shift: "", sem: "", group: "" });
    const setShift = (v: string) => setSel((s) => ({ ...s, shift: v, sem: "", group: "" }));
    const setSem = (v: string) => setSel((s) => ({ ...s, sem: v, group: "" }));
    const setGroup = (v: string) => setSel((s) => ({ ...s, group: v }));

    const filteredShifts = useMemo(
        () => (sel.dept ? shifts.filter((s) => !s.departmentId || String(s.departmentId) === sel.dept) : shifts),
        [shifts, sel.dept]
    );

    const filteredGroups = useMemo(
        () =>
            groups.filter((g) => {
                if (sel.dept && g.departmentId && String(g.departmentId) !== sel.dept) return false;
                if (sel.shift && g.shiftId && String(g.shiftId) !== sel.shift) return false;
                if (sel.sem && g.currentSemesterId && String(g.currentSemesterId) !== sel.sem) return false;
                return true;
            }),
        [groups, sel]
    );

    const errors = state?.errors ?? {};

    // Revoke object URLs to avoid memory leaks
    useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

    useEffect(() => {
        if (!state) return;
        if (state.success) {
            toast.success("Student enrolled successfully!");
            const t = setTimeout(onSuccess, 1000);
            return () => clearTimeout(t);
        }
        if (state.message) toast.error(state.message);
    }, [state, onSuccess]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const file = fileRef.current?.files?.[0];
        if (file) formData.append("file", file);

        startTransition(async () => {
            setState((await createStudent(null, formData)) as ActionState);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Upload */}
            <div className="flex items-center gap-6 rounded-2xl border border-border bg-gradient-to-br from-secondary/70 to-card p-4">
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="group flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gold-soft bg-card transition-all duration-300 hover:scale-105 hover:border-gold hover:shadow-lg hover:shadow-gold/20"
                >
                    {photoPreview ? (
                        <Image src={photoPreview} alt="Preview" width={96} height={96} unoptimized className="h-full w-full object-cover" />
                    ) : (
                        <div className="text-center text-muted-foreground transition-colors group-hover:text-primary">
                            <div className="mb-1 text-3xl">📷</div>
                            <div className="text-xs font-medium">Photo</div>
                        </div>
                    )}
                </button>
                <div>
                    <p className="font-semibold text-foreground">Profile Photo</p>
                    <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG or WebP • Max 2MB</p>
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="mt-3 rounded-xl border border-border bg-card px-5 py-2 text-sm font-medium text-primary transition-all duration-200 hover:border-primary hover:bg-secondary active:scale-95"
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

            <Section title="Academic Placement">
                <SelectField label="Department" name="departmentId" options={departments} required value={sel.dept} onChange={setDept} error={errors.departmentId} />
                <SelectField label="Shift" name="shiftId" options={filteredShifts} required value={sel.shift} onChange={setShift} error={errors.shiftId} disabled={!sel.dept} />
                <SelectField label="Semester" name="semesterId" options={semesters} required value={sel.sem} onChange={setSem} error={errors.semesterId} disabled={!sel.shift} />
                <SelectField label="Group" name="groupId" options={filteredGroups} required value={sel.group} onChange={setGroup} error={errors.groupId} disabled={!sel.sem} />
                <Field label="Roll Number" name="roll" placeholder="e.g. 2201" required error={errors.roll} />
                <Field label="Registration Number" name="registration" placeholder="Registration number" required error={errors.registration} />
            </Section>

            <Section title="Personal Information">
                <Field label="Full Name" name="name" required error={errors.name} />
                <Field label="Email" name="email" type="email" required error={errors.email} />
                <Field label="Mobile" name="mobile" required error={errors.mobile} />
                <SelectField label="Gender" name="gender" options={GENDER_OPTIONS} valueByName required placeholder="Select gender" value={gender} onChange={setGender} error={errors.gender} />
                <Field label="Birth Date" name="birthDate" type="date" required error={errors.birthDate} />
                <Field label="Birth Number" name="birthnumber" required error={errors.birthnumber} />
                <Field label="NID (Optional)" name="nid" error={errors.nid} />
            </Section>

            <Section title="Family Information">
                <Field label="Father Name" name="fatherName" required error={errors.fatherName} />
                <Field label="Mother Name" name="motherName" required error={errors.motherName} />
                <Field label="Father Mobile" name="fatherMobile" required error={errors.fatherMobile} />
                <Field label="Mother Mobile" name="motherMobile" required error={errors.motherMobile} />
            </Section>

            <Section title="Address">
                <Field label="Present Address" name="presentAddress" required error={errors.presentAddress} />
                <Field label="Permanent Address" name="permanentAddress" required error={errors.permanentAddress} />
            </Section>

            <Section title="Login Credentials">
                <Field label="Password" name="password" type="password" required error={errors.password} />
            </Section>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 px-10 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                    {isPending ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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

/* ───────────────────── Main client component ───────────────────── */

export default function StudentManagementClient({ departments, shifts, semesters, groups, students, meta }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") ?? "");
    const [isPending, startTransition] = useTransition();

    const urlSearch = searchParams.get("searchTerm") ?? "";
    const gender = searchParams.get("gender") ?? "";
    const hasActiveFilters = !!(
        searchTerm || gender ||
        ["departmentId", "shiftId", "semesterId", "groupId"].some((k) => searchParams.get(k))
    );

    const applyFilters = useCallback(
        (updates: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));
            if (!updates.page) params.set("page", "1");
            startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
        },
        [router, pathname, searchParams]
    );

    // Debounced search
    useEffect(() => {
        if (searchTerm === urlSearch) return;
        const t = setTimeout(() => applyFilters({ searchTerm: searchTerm || null }), 500);
        return () => clearTimeout(t);
    }, [searchTerm, urlSearch, applyFilters]);

    const clearAllFilters = () => {
        setSearchTerm("");
        startTransition(() => router.replace(pathname));
    };

    const closeModal = useCallback(() => setModalOpen(false), []);
    const handleSuccess = useCallback(() => {
        setModalOpen(false);
        router.refresh();
    }, [router]);
    const handlePageChange = useCallback((page: number) => applyFilters({ page: String(page) }), [applyFilters]);

    return (
        <div className="theme-content min-h-screen text-foreground">
            {/* top loading bar while filtering */}
            <div className="relative h-1 w-full overflow-hidden">
                <div
                    className={`h-full w-full bg-gradient-to-r from-primary via-emerald-400 to-gold transition-opacity duration-300 ${
                        isPending ? "animate-pulse opacity-100" : "opacity-0"
                    }`}
                />
            </div>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
                {/* Header */}
                <div className="st-fade flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
                            Dashboard / Students
                        </p>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Student Management</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            <span className="font-bold text-primary">{meta.total}</span> student{meta.total !== 1 ? "s" : ""} found
                        </p>
                    </div>

                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-gold/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
                    >
                        <span className="text-lg leading-none">+</span> Enroll New Student
                    </button>
                </div>

                {/* Filters */}
                <div className="st-fade theme-card p-6" style={{ animationDelay: "60ms" }}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <div className="relative xl:col-span-2">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">⌕</span>
                            <input
                                type="text"
                                placeholder="Search by name, roll, email, mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`${controlClass()} rounded-2xl pl-10`}
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={gender}
                                onChange={(e) => applyFilters({ gender: e.target.value || null })}
                                className={`${controlClass()} appearance-none rounded-2xl pr-10`}
                            >
                                <option value="">All Genders</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gold">▾</span>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="mt-4 rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-500 transition-all duration-200 hover:bg-rose-100 hover:text-rose-600 active:scale-95"
                        >
                            ✕ Clear All Filters
                        </button>
                    )}
                </div>

                <div className={`transition-opacity duration-300 ${isPending ? "opacity-60" : "opacity-100"}`}>
                    <StudentTable students={students} meta={meta} onPageChange={handlePageChange} />
                </div>
            </div>

            <Modal open={modalOpen} onClose={closeModal}>
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