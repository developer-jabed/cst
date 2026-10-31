"use client";

import { memo, useCallback, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import AssignTeacherModal from "./Assignteachermodal";

/* ────────────────────────────── Types ────────────────────────────── */

interface Named { id: number; name?: string }
interface Teacher extends Named { firstName?: string; lastName?: string; avatarUrl?: string | null }
interface SubjectGroup {
    id: number;
    teacherId: number;
    subjectId: number;
    groupId: number;
    semesterId: number;
}

interface Props {
    groups: Named[];
    teachers: Teacher[];
    subjects: Named[];
    semesters: Named[];
    subjectGroups: SubjectGroup[];
    totalPages: number;
    currentPage: number;
}

/* ───────────────────────── Constants & helpers ───────────────────────── */

const PAGE_SIZE = 10;

const AVATAR_GRADIENTS = [
    "from-emerald-500 to-teal-600",
    "from-amber-400 to-yellow-600",
    "from-teal-500 to-cyan-600",
    "from-lime-500 to-emerald-600",
    "from-sky-500 to-indigo-600",
    "from-rose-400 to-pink-600",
    "from-violet-500 to-purple-600",
] as const;

const PILL_STYLES = {
    emerald: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    gold: "bg-amber-50 text-amber-800 ring-gold-soft",
    sky: "bg-sky-50 text-sky-800 ring-sky-200",
    violet: "bg-violet-50 text-violet-800 ring-violet-200",
} as const;
type PillVariant = keyof typeof PILL_STYLES;

const TH = "px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70";

const getTeacherLabel = (t?: Teacher, fallbackId?: number): string => {
    if (!t) return `#${fallbackId}`;
    if (t.firstName) return `${t.firstName} ${t.lastName ?? ""}`.trim();
    return t.name ?? `#${t.id}`;
};

const getInitials = (name: string) =>
    name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const toMap = <T extends { id: number }>(arr: T[]) => new Map(arr.map((x) => [x.id, x]));

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

/* ─────────────────────────────── Icons ─────────────────────────────── */
// Defined once, reused everywhere (replaces ~15 duplicated inline SVGs)

const ICONS = {
    book: (
        <>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    grid: (
        <>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
        </>
    ),
    calendar: (
        <>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        </>
    ),
    user: (
        <>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
            <circle cx="12" cy="7" r="4" />
        </>
    ),
    users: (
        <>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
        </>
    ),
    cap: (
        <>
            <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    link: (
        <>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    plus: <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />,
} satisfies Record<string, ReactNode>;
type IconName = keyof typeof ICONS;

const Icon = ({ name, size = 14, strokeWidth = 2, className }: { name: IconName; size?: number; strokeWidth?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
        {ICONS[name]}
    </svg>
);

/* ───────────────────────────── Components ───────────────────────────── */

const Pill = memo(function Pill({ children, variant, icon }: { children: ReactNode; variant: PillVariant; icon: IconName }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset transition-transform duration-200 hover:scale-105 ${PILL_STYLES[variant]}`}>
            <Icon name={icon} size={11} />
            {children}
        </span>
    );
});

const TeacherAvatar = memo(function TeacherAvatar({ teacher, name, id }: { teacher?: Teacher; name: string; id: number }) {
    const base = "h-9 w-9 shrink-0 rounded-full ring-2 ring-gold-soft/70 transition-transform duration-300 group-hover:scale-110";
    if (teacher?.avatarUrl) {
        return <Image src={teacher.avatarUrl} alt={name} width={36} height={36} className={`${base} object-cover`} />;
    }
    return (
        <div className={`${base} flex items-center justify-center bg-gradient-to-br ${AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length]}`}>
            <span className="text-[11px] font-bold text-white drop-shadow-sm">{getInitials(name)}</span>
        </div>
    );
});

const STAT_STYLES = {
    emerald: { bg: "from-emerald-50 to-emerald-100 text-emerald-600", bar: "from-emerald-400 to-emerald-600" },
    sky: { bg: "from-sky-50 to-sky-100 text-sky-600", bar: "from-sky-400 to-sky-600" },
    gold: { bg: "from-amber-50 to-yellow-100 text-amber-600", bar: "from-gold-soft to-gold" },
    violet: { bg: "from-violet-50 to-violet-100 text-violet-600", bar: "from-violet-400 to-violet-600" },
} as const;

const StatCard = memo(function StatCard({
    label, value, icon, color, index,
}: { label: string; value: number; icon: IconName; color: keyof typeof STAT_STYLES; index: number }) {
    const s = STAT_STYLES[color];
    return (
        <div
            className="st-fade theme-card group relative flex items-center gap-3 overflow-hidden px-4 py-4"
            style={{ animationDelay: `${index * 70}ms` }}
        >
            <span className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${s.bar}`} />
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${s.bg}`}>
                <Icon name={icon} size={20} strokeWidth={1.8} />
            </div>
            <div>
                <p className="mb-1 text-2xl font-black leading-none tabular-nums text-foreground">{value}</p>
                <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
            </div>
        </div>
    );
});

function EmptyState({ onOpen }: { onOpen: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
            <div className="relative mb-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-gold-soft bg-gradient-to-br from-secondary to-accent text-primary">
                    <Icon name="cap" size={32} strokeWidth={1.4} />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-gold-soft bg-card text-gold shadow-sm">
                    <Icon name="plus" size={10} strokeWidth={2.4} />
                </span>
            </div>
            <p className="mb-1 text-[15px] font-bold text-foreground">No assignments yet</p>
            <p className="mb-6 max-w-xs text-sm text-muted-foreground">
                Start by assigning a teacher to a subject for a specific group and semester.
            </p>
            <button
                onClick={onOpen}
                className="rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
            >
                Make first assignment
            </button>
        </div>
    );
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const items = useMemo(() => getPageItems(currentPage, totalPages), [currentPage, totalPages]);

    // Keep any other query params (e.g. ?tab=assignments)
    const hrefFor = useCallback(
        (p: number) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(p));
            return `${pathname}?${params.toString()}`;
        },
        [pathname, searchParams]
    );

    const arrow = "flex h-9 w-9 items-center justify-center rounded-xl text-primary/70 transition-all duration-200 hover:bg-secondary hover:text-primary active:scale-90";
    const disabledArrow = "pointer-events-none opacity-30";

    return (
        <div className="flex items-center justify-between border-t border-border bg-gradient-to-r from-secondary/60 via-transparent to-secondary/60 px-5 py-3.5">
            <p className="text-xs text-muted-foreground">
                Page <span className="font-bold text-primary">{currentPage}</span> of{" "}
                <span className="font-bold text-primary">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
                <Link href={hrefFor(Math.max(1, currentPage - 1))} aria-label="Previous page" className={`${arrow} ${currentPage <= 1 ? disabledArrow : ""}`}>‹</Link>
                {items.map((p, i) =>
                    p === null ? (
                        <span key={`gap-${i}`} className="px-1 text-xs text-gold">…</span>
                    ) : (
                        <Link
                            key={p}
                            href={hrefFor(p)}
                            aria-current={p === currentPage ? "page" : undefined}
                            className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold transition-all duration-200 active:scale-90 ${
                                p === currentPage
                                    ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30"
                                    : "text-foreground/60 hover:bg-secondary hover:text-primary"
                            }`}
                        >
                            {p}
                        </Link>
                    )
                )}
                <Link href={hrefFor(Math.min(totalPages, currentPage + 1))} aria-label="Next page" className={`${arrow} ${currentPage >= totalPages ? disabledArrow : ""}`}>›</Link>
            </div>
        </div>
    );
}

/* ───────────────────────────── Row ───────────────────────────── */

interface RowProps {
    sg: SubjectGroup;
    number: number;
    teacher?: Teacher;
    subjectName: string;
    groupName: string;
    semesterName: string;
}

const AssignmentRow = memo(function AssignmentRow({ sg, number, teacher, subjectName, groupName, semesterName }: RowProps) {
    const tName = getTeacherLabel(teacher, sg.teacherId);
    return (
        <tr
            className="st-row group relative transition-colors duration-300 hover:bg-gradient-to-r hover:from-secondary hover:via-accent/40 hover:to-transparent"
            style={{ ["--i" as string]: number % PAGE_SIZE }}
        >
            <td className="relative px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground">
                <span className="absolute inset-y-2 left-0 w-[3px] origin-center scale-y-0 rounded-r bg-gradient-to-b from-gold-soft to-gold transition-transform duration-300 group-hover:scale-y-100" />
                {number}
            </td>
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                    <TeacherAvatar teacher={teacher} name={tName} id={sg.teacherId} />
                    <span className="text-[13px] font-semibold text-foreground transition-colors group-hover:text-primary">{tName}</span>
                </div>
            </td>
            <td className="px-5 py-3.5"><Pill variant="violet" icon="book">{subjectName}</Pill></td>
            <td className="px-5 py-3.5"><Pill variant="gold" icon="grid">{groupName}</Pill></td>
            <td className="px-5 py-3.5"><Pill variant="emerald" icon="calendar">{semesterName}</Pill></td>
        </tr>
    );
});

/* ───────────────────────────── Main ───────────────────────────── */

const COLUMNS: { label: string; icon?: IconName }[] = [
    { label: "#" },
    { label: "Teacher", icon: "user" },
    { label: "Subject", icon: "book" },
    { label: "Group", icon: "grid" },
    { label: "Semester", icon: "calendar" },
];

export default function SubjectGroupClient({
    groups, teachers, subjects, semesters, subjectGroups, totalPages, currentPage,
}: Props) {
    const [open, setOpen] = useState(false);
    const openModal = useCallback(() => setOpen(true), []);
    const closeModal = useCallback(() => setOpen(false), []);

    // O(1) lookups instead of Array.find on every row, every render
    const teacherMap = useMemo(() => toMap(teachers), [teachers]);
    const subjectMap = useMemo(() => toMap(subjects), [subjects]);
    const groupMap = useMemo(() => toMap(groups), [groups]);
    const semesterMap = useMemo(() => toMap(semesters), [semesters]);

    const stats = useMemo(
        () => [
            { label: "Total assignments", value: subjectGroups.length, icon: "link" as const, color: "emerald" as const },
            { label: "Subjects covered", value: new Set(subjectGroups.map((s) => s.subjectId)).size, icon: "book" as const, color: "sky" as const },
            { label: "Groups active", value: new Set(subjectGroups.map((s) => s.groupId)).size, icon: "users" as const, color: "gold" as const },
            { label: "Teachers assigned", value: new Set(subjectGroups.map((s) => s.teacherId)).size, icon: "cap" as const, color: "violet" as const },
        ],
        [subjectGroups]
    );

    return (
        <>
            <div className="theme-content min-h-screen p-6 text-foreground">
                {/* Header */}
                <div className="st-fade mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="mb-1 flex items-center gap-2.5">
                            <div className="flex gap-[3px]">
                                <span className="h-7 w-[3px] rounded-full bg-gradient-to-b from-primary to-emerald-500" />
                                <span className="h-7 w-[3px] rounded-full bg-gradient-to-b from-gold to-gold-soft" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-foreground">Subject assignments</h1>
                        </div>
                        <p className="pl-4 text-sm text-muted-foreground">
                            Manage which teacher covers each subject for every group
                        </p>
                    </div>

                    <button
                        onClick={openModal}
                        className="group flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-gold/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
                    >
                        <Icon name="plus" size={15} strokeWidth={2.2} className="transition-transform duration-200 group-hover:rotate-90" />
                        Assign teacher
                    </button>
                </div>

                {/* Stats */}
                {subjectGroups.length > 0 && (
                    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {stats.map((s, i) => (
                            <StatCard key={s.label} {...s} index={i} />
                        ))}
                    </div>
                )}

                {/* Table card */}
                <div className="st-fade overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]" style={{ animationDelay: "120ms" }}>
                    <div className="h-1 bg-gradient-to-r from-primary via-emerald-500 to-gold" />

                    {subjectGroups.length === 0 ? (
                        <EmptyState onOpen={openModal} />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-gradient-to-r from-secondary via-accent/60 to-secondary">
                                            {COLUMNS.map((c) => (
                                                <th key={c.label} className={`${TH} ${c.label === "#" ? "w-12" : ""}`}>
                                                    {c.icon && <Icon name={c.icon} size={11} className="-mt-0.5 mr-1.5 inline text-gold" />}
                                                    {c.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/70">
                                        {subjectGroups.map((sg, i) => (
                                            <AssignmentRow
                                                key={sg.id}
                                                sg={sg}
                                                number={(currentPage - 1) * PAGE_SIZE + i + 1}
                                                teacher={teacherMap.get(sg.teacherId)}
                                                subjectName={subjectMap.get(sg.subjectId)?.name ?? `#${sg.subjectId}`}
                                                groupName={groupMap.get(sg.groupId)?.name ?? `#${sg.groupId}`}
                                                semesterName={semesterMap.get(sg.semesterId)?.name ?? `#${sg.semesterId}`}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
                        </>
                    )}
                </div>
            </div>

            <AssignTeacherModal
                isOpen={open}
                onClose={closeModal}
                groups={groups}
                teachers={teachers}
                subjects={subjects}
                semesters={semesters}
            />
        </>
    );
}