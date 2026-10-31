/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createNoticeDirect, deleteNotice } from "@/service/notice/notice.service";
import { getStudents } from "@/service/student/student.service";
import { getAllTeachers } from "@/service/admin/teacherManagement";
import {
  INotice,
  NoticeAudienceType,
  NoticePriority,
  NOTICE_AUDIENCE_TYPE_OPTIONS,
  NOTICE_AUDIENCE_TYPE_LABELS,
  NOTICE_PRIORITY_OPTIONS,
  NOTICE_PRIORITY_LABELS,
} from "@/types/notice.interface";

/* ────────────────────────────── Types ────────────────────────────── */

interface SelectOption {
  [x: string]: any;
  id: number;
  name: string;
}

interface NoticesPageClientProps {
  notices: INotice[];
  meta: { total: number; currentPage: number; totalPages: number };
  departments: SelectOption[];
  semesters: SelectOption[];
  groups: SelectOption[];
}

const INITIAL_FORM = {
  title: "",
  description: "",
  attachmentUrl: "",
  noticeDate: "",
  expiryDate: "",
  audienceType: "ALL" as NoticeAudienceType,
  priority: "MEDIUM" as NoticePriority,
  isPinned: false,
  isPublished: true,
  departmentId: "",
  semesterId: "",
  groupId: "",
  studentId: "",
  teacherId: "",
};
type FormState = typeof INITIAL_FORM;

// Audience-aware target fields
const AUDIENCE_NEEDS: Record<NoticeAudienceType, string[]> = {
  ALL: [],
  DEPARTMENT: ["departmentId"],
  SEMESTER: ["departmentId", "semesterId"],
  GROUP: ["departmentId", "semesterId", "groupId"],
  STUDENT: ["studentId"],
  TEACHER: ["teacherId"],
};

const FILTER_KEYS = [
  "searchTerm", "audienceType", "priority", "departmentId", "semesterId",
  "groupId", "studentId", "teacherId", "isPinned", "isPublished",
] as const;

/* ───────────────────────── Style constants ───────────────────────── */

const AUDIENCE_STYLES: Record<string, string> = {
  ALL: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DEPARTMENT: "bg-sky-50 text-sky-700 ring-sky-200",
  SEMESTER: "bg-violet-50 text-violet-700 ring-violet-200",
  GROUP: "bg-teal-50 text-teal-700 ring-teal-200",
  STUDENT: "bg-pink-50 text-pink-700 ring-pink-200",
  TEACHER: "bg-amber-50 text-amber-800 ring-gold-soft",
};
const AUDIENCE_FALLBACK = "bg-emerald-50 text-emerald-700 ring-emerald-200";

const PRIORITY_STYLES: Record<string, { chip: string; bar: string }> = {
  LOW: { chip: "bg-sky-50 text-sky-700 ring-sky-200", bar: "from-sky-400 to-sky-600" },
  MEDIUM: { chip: "bg-amber-50 text-amber-800 ring-gold-soft", bar: "from-gold-soft to-gold" },
  HIGH: { chip: "bg-orange-50 text-orange-700 ring-orange-200", bar: "from-orange-400 to-orange-600" },
  URGENT: { chip: "bg-rose-50 text-rose-700 ring-rose-200", bar: "from-rose-400 to-rose-600" },
  CRITICAL: { chip: "bg-rose-50 text-rose-700 ring-rose-200", bar: "from-rose-400 to-rose-600" },
};
const PRIORITY_FALLBACK = { chip: "bg-amber-50 text-amber-800 ring-gold-soft", bar: "from-primary to-emerald-500" };

const CONTROL =
  "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-200 " +
  "hover:border-gold-soft focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";
const LABEL = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-primary/70";
const CHIP = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset";

const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const groupLabel = (g: SelectOption) => `${g.currentSemester?.name ?? "—"} Semester ${g.name} Group`;

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

/* ───────────────────────── Async search hook ───────────────────────── */

const fetchStudents = async (q: string): Promise<SelectOption[]> =>
  (await getStudents({ searchTerm: q, limit: 10 })).data || [];
const fetchTeachers = async (q: string): Promise<SelectOption[]> =>
  (await getAllTeachers({ searchTerm: q, limit: 10 })).data || [];

function useAsyncSearch(fetcher: (q: string) => Promise<SelectOption[]>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      if (timer.current) clearTimeout(timer.current);
      if (!q.trim()) {
        setResults([]);
        return;
      }
      timer.current = setTimeout(async () => {
        setLoading(true);
        try {
          setResults(await fetcher(q));
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 400);
    },
    [fetcher]
  );

  const reset = useCallback((q = "") => {
    if (timer.current) clearTimeout(timer.current);
    setQuery(q);
    setResults([]);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { query, results, loading, search, reset };
}
type AsyncSearch = ReturnType<typeof useAsyncSearch>;

/* ───────────────────────────── Components ───────────────────────────── */

function AsyncPicker({
  state, placeholder, onPick, onType, className = CONTROL,
}: {
  state: AsyncSearch;
  placeholder: string;
  onPick: (item: SelectOption) => void;
  onType?: () => void;
  className?: string;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={state.query}
        onChange={(e) => {
          state.search(e.target.value);
          onType?.();
        }}
        className={className}
      />
      {state.loading && (
        <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      )}
      {state.results.length > 0 && (
        <ul className="st-fade absolute z-20 mt-1.5 max-h-52 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
          {state.results.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                onPick(item);
                state.reset(item.name);
              }}
              className="cursor-pointer px-4 py-2.5 text-sm text-foreground transition-colors duration-150 hover:bg-secondary hover:text-primary"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className={LABEL}>
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({
  value, onChange, placeholder, options, className = CONTROL,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options: { value: string | number; label: string }[];
  className?: string;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${className} appearance-none pr-9`}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gold">▾</span>
    </div>
  );
}

const NoticeCard = memo(function NoticeCard({
  notice, index, onDelete, disabled,
}: { notice: INotice; index: number; onDelete: (n: INotice) => void; disabled: boolean }) {
  const pr = PRIORITY_STYLES[String(notice.priority).toUpperCase()] ?? PRIORITY_FALLBACK;
  const date = notice.noticeDate ? dateFormatter.format(new Date(notice.noticeDate)) : null;

  return (
    <div
      className="st-row theme-card group relative flex flex-col overflow-hidden p-6"
      style={{ ["--i" as string]: index % 9 }}
    >
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${pr.bar}`} />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`${CHIP} ${AUDIENCE_STYLES[notice.audienceType] ?? AUDIENCE_FALLBACK}`}>
          {NOTICE_AUDIENCE_TYPE_LABELS[notice.audienceType]}
        </span>
        <span className={`${CHIP} ${pr.chip}`}>{NOTICE_PRIORITY_LABELS[notice.priority]}</span>
        {notice.isPinned && (
          <span className={`${CHIP} bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 ring-gold-soft`}>📌 Pinned</span>
        )}
        {!notice.isPublished && <span className={`${CHIP} bg-muted text-muted-foreground ring-border`}>Draft</span>}
      </div>

      <h2 className="mb-2 line-clamp-2 text-lg font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
        {notice.title}
      </h2>
      <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{notice.description}</p>

      {date && <p className="mb-4 text-xs font-medium text-gold">📅 {date}</p>}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Link
          href={`/admin/dashboard/notices/${notice.id}`}
          className="flex-1 rounded-xl border border-border bg-secondary/60 px-4 py-2 text-center text-sm font-semibold text-primary transition-all duration-200 hover:border-primary hover:bg-secondary active:scale-95"
        >
          View
        </Link>
        <button
          onClick={() => onDelete(notice)}
          disabled={disabled}
          className="flex-1 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-inset ring-rose-200 transition-all duration-200 hover:bg-rose-100 active:scale-95 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
});

function ModalShell({ title, onClose, children, size = "max-w-2xl" }: { title: string; onClose: () => void; children: ReactNode; size?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="st-backdrop fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-md" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`st-modal max-h-[90vh] w-full ${size} overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl`}
      >
        <div className="sticky top-0 z-10">
          <div className="h-1 bg-gradient-to-r from-primary via-emerald-500 to-gold" />
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-secondary via-card to-secondary px-6 py-4">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="h-9 w-9 rounded-xl text-lg text-muted-foreground transition-all duration-200 hover:rotate-90 hover:bg-rose-50 hover:text-rose-500 active:scale-90"
            >
              ✕
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = useMemo(() => getPageItems(currentPage, totalPages), [currentPage, totalPages]);

  const hrefFor = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  };

  const arrow = "flex h-10 w-10 items-center justify-center rounded-xl text-primary/70 transition-all duration-200 hover:bg-secondary hover:text-primary active:scale-90";
  const off = "pointer-events-none opacity-30";

  return (
    <div className="mt-10 flex items-center justify-center gap-1">
      <Link href={hrefFor(Math.max(1, currentPage - 1))} aria-label="Previous page" className={`${arrow} ${currentPage <= 1 ? off : ""}`}>‹</Link>
      {items.map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1 text-gold">…</span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-bold transition-all duration-200 active:scale-90 ${
              p === currentPage
                ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30"
                : "text-foreground/60 hover:bg-secondary hover:text-primary"
            }`}
          >
            {p}
          </Link>
        )
      )}
      <Link href={hrefFor(Math.min(totalPages, currentPage + 1))} aria-label="Next page" className={`${arrow} ${currentPage >= totalPages ? off : ""}`}>›</Link>
    </div>
  );
}

/* ───────────────────────────── Main ───────────────────────────── */

export default function NoticesPageClient({ notices, meta, departments, semesters, groups }: NoticesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<INotice | null>(null);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);

  // Separate search state for the filter bar and the create form
  const filterStudent = useAsyncSearch(fetchStudents);
  const filterTeacher = useAsyncSearch(fetchTeachers);
  const formStudent = useAsyncSearch(fetchStudents);
  const formTeacher = useAsyncSearch(fetchTeachers);

  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => setFormData((f) => ({ ...f, [key]: value })),
    []
  );

  /* ── URL filter helpers ── */
  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Debounce the text search so we don't navigate on every keystroke
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearchInput = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setParam("searchTerm", value), 400);
  };
  useEffect(() => () => { if (searchTimer.current) clearTimeout(searchTimer.current); }, []);

  const clearFilters = () => {
    filterStudent.reset();
    filterTeacher.reset();
    router.push(pathname);
  };

  /* ── Delete ── */
  const confirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startTransition(async () => {
      const result = await deleteNotice(id);
      if (result.success) {
        toast.success(result.message);
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  /* ── Create ── */
  const closeCreate = useCallback(() => setOpenCreate(false), []);

  const handleCreate = () => {
    if (!formData.title.trim()) return toast.warning("Title is required");
    if (!formData.description.trim()) return toast.warning("Description is required");

    const num = (v: string) => (v ? Number(v) : undefined);

    startTransition(async () => {
      const toastId = toast.loading("Creating notice...");
      const result = await createNoticeDirect({
        title: formData.title,
        description: formData.description,
        attachmentUrl: formData.attachmentUrl || undefined,
        noticeDate: formData.noticeDate || undefined,
        expiryDate: formData.expiryDate || undefined,
        audienceType: formData.audienceType,
        priority: formData.priority,
        isPinned: formData.isPinned,
        isPublished: formData.isPublished,
        departmentId: num(formData.departmentId),
        semesterId: num(formData.semesterId),
        groupId: num(formData.groupId),
        studentId: num(formData.studentId),
        teacherId: num(formData.teacherId),
      });

      if (result.success) {
        toast.success(result.message, { id: toastId });
        setOpenCreate(false);
        setFormData(INITIAL_FORM);
        formStudent.reset();
        formTeacher.reset();
        router.refresh();
      } else {
        toast.error(result.message ?? "Failed to create notice", { id: toastId });
      }
    });
  };

  const activeFilters = FILTER_KEYS.filter((k) => searchParams.get(k)).length;
  const needs = AUDIENCE_NEEDS[formData.audienceType];

  const departmentOptions = useMemo(() => departments.map((d) => ({ value: d.id, label: d.name })), [departments]);
  const semesterOptions = useMemo(() => semesters.map((s) => ({ value: s.id, label: s.name })), [semesters]);
  const groupOptions = useMemo(() => groups.map((g) => ({ value: g.id, label: groupLabel(g) })), [groups]);

  // Config-driven filter selects (replaces 8 copy-pasted <select>s)
  const filterSelects = useMemo(
    () => [
      { key: "audienceType", placeholder: "All Audiences", options: NOTICE_AUDIENCE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })) },
      { key: "priority", placeholder: "All Priorities", options: NOTICE_PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label })) },
      { key: "departmentId", placeholder: "All Departments", options: departmentOptions },
      { key: "semesterId", placeholder: "All Semesters", options: semesterOptions },
      { key: "groupId", placeholder: "All Groups", options: groupOptions },
      { key: "isPublished", placeholder: "Any Status", options: [{ value: "true", label: "Published" }, { value: "false", label: "Draft" }] },
    ],
    [departmentOptions, semesterOptions, groupOptions]
  );

  return (
    <div className="theme-content min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* ── Header ── */}
        <div className="st-fade mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
              Dashboard / Notices
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Notices</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage institute notices and announcements</p>
          </div>
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-gold/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
          >
            <span className="text-lg leading-none">+</span> Create Notice
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="st-fade theme-card mb-6 space-y-4 p-5" style={{ animationDelay: "60ms" }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative col-span-full lg:col-span-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">⌕</span>
              <input
                type="text"
                placeholder="Search notices..."
                defaultValue={searchParams.get("searchTerm") ?? ""}
                onChange={(e) => onSearchInput(e.target.value)}
                className={`${CONTROL} pl-10`}
              />
            </div>

            {filterSelects.map((f) => (
              <Select
                key={f.key}
                value={searchParams.get(f.key) ?? ""}
                onChange={(v) => setParam(f.key, v)}
                placeholder={f.placeholder}
                options={f.options}
              />
            ))}

            <Select
              value={searchParams.get("sortOrder") ?? "desc"}
              onChange={(v) => setParam("sortOrder", v)}
              options={[{ value: "desc", label: "Newest First" }, { value: "asc", label: "Oldest First" }]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AsyncPicker
              state={filterStudent}
              placeholder="Search student by name..."
              onPick={(s) => setParam("studentId", String(s.id))}
            />
            <AsyncPicker
              state={filterTeacher}
              placeholder="Search teacher by name..."
              onPick={(t) => setParam("teacherId", String(t.id))}
            />
          </div>

          {activeFilters > 0 && (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-emerald-200">
                {activeFilters} filter{activeFilters > 1 ? "s" : ""} active
              </span>
              <button
                onClick={clearFilters}
                className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-500 transition-all duration-200 hover:bg-rose-100 hover:text-rose-600 active:scale-95"
              >
                ✕ Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="st-fade mb-6" style={{ animationDelay: "100ms" }}>
          <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
            <span className="h-2 w-2 rounded-full bg-gradient-to-br from-primary to-gold" />
            Total: <span className="text-primary">{meta.total}</span> notice{meta.total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Content ── */}
        <div className={`transition-opacity duration-300 ${isPending ? "opacity-60" : "opacity-100"}`}>
          {notices.length === 0 ? (
            <div className="st-fade theme-card py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-3xl ring-1 ring-gold-soft">
                📭
              </div>
              <h2 className="text-xl font-bold text-foreground">No notices found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeFilters > 0 ? "Try adjusting your filters" : "Create your first notice"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {notices.map((notice, i) => (
                  <NoticeCard key={notice.id} notice={notice} index={i} onDelete={setDeleteTarget} disabled={isPending} />
                ))}
              </div>
              {meta.totalPages > 1 && <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} />}
            </>
          )}
        </div>
      </div>

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <ModalShell title="Delete Notice" size="max-w-sm" onClose={() => !isPending && setDeleteTarget(null)}>
          <div className="p-6">
            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-primary">{deleteTarget.title}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-sm font-semibold text-foreground/70 transition-all duration-200 hover:bg-muted active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isPending ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ── Create Modal ── */}
      {openCreate && (
        <ModalShell title="Create Notice" onClose={closeCreate}>
          <div className="space-y-5 p-6">
            <Field label="Title" required>
              <input type="text" value={formData.title} onChange={(e) => setField("title", e.target.value)} placeholder="Enter notice title" className={CONTROL} />
            </Field>

            <Field label="Description" required>
              <textarea rows={4} value={formData.description} onChange={(e) => setField("description", e.target.value)} placeholder="Write notice details" className={CONTROL} />
            </Field>

            <Field label="Attachment URL">
              <input type="url" value={formData.attachmentUrl} onChange={(e) => setField("attachmentUrl", e.target.value)} placeholder="https://..." className={CONTROL} />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Notice Date">
                <input type="date" value={formData.noticeDate} onChange={(e) => setField("noticeDate", e.target.value)} className={CONTROL} />
              </Field>
              <Field label="Expiry Date">
                <input type="date" value={formData.expiryDate} onChange={(e) => setField("expiryDate", e.target.value)} className={CONTROL} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Audience Type">
                <Select
                  value={formData.audienceType}
                  onChange={(v) => {
                    // reset targeting when audience changes
                    setFormData((f) => ({
                      ...f,
                      audienceType: v as NoticeAudienceType,
                      departmentId: "", semesterId: "", groupId: "", studentId: "", teacherId: "",
                    }));
                    formStudent.reset();
                    formTeacher.reset();
                  }}
                  options={NOTICE_AUDIENCE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </Field>
              <Field label="Priority">
                <Select
                  value={formData.priority}
                  onChange={(v) => setField("priority", v as NoticePriority)}
                  options={NOTICE_PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </Field>
            </div>

            {needs.includes("departmentId") && (
              <Field label="Department" required>
                <Select value={formData.departmentId} onChange={(v) => setField("departmentId", v)} placeholder="Select department" options={departmentOptions} />
              </Field>
            )}

            {needs.includes("semesterId") && (
              <Field label="Semester" required>
                <Select value={formData.semesterId} onChange={(v) => setField("semesterId", v)} placeholder="Select semester" options={semesterOptions} />
              </Field>
            )}

            {needs.includes("groupId") && (
              <Field label="Group" required>
                <Select value={formData.groupId} onChange={(v) => setField("groupId", v)} placeholder="Select group" options={groupOptions} />
              </Field>
            )}

            {needs.includes("studentId") && (
              <Field label="Student" required>
                <AsyncPicker
                  state={formStudent}
                  placeholder="Search student by name..."
                  onType={() => setField("studentId", "")}
                  onPick={(s) => setField("studentId", String(s.id))}
                />
              </Field>
            )}

            {needs.includes("teacherId") && (
              <Field label="Teacher" required>
                <AsyncPicker
                  state={formTeacher}
                  placeholder="Search teacher by name..."
                  onType={() => setField("teacherId", "")}
                  onPick={(t) => setField("teacherId", String(t.id))}
                />
              </Field>
            )}

            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-gradient-to-br from-secondary/70 to-card p-4">
              {(
                [
                  ["isPinned", "📌 Pin this notice"],
                  ["isPublished", "🌐 Publish immediately"],
                ] as const
              ).map(([key, text]) => (
                <label key={key} className="flex cursor-pointer select-none items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData[key]}
                    onChange={(e) => setField(key, e.target.checked)}
                    className="h-4 w-4 rounded accent-[var(--primary)]"
                  />
                  <span className="text-sm font-semibold text-foreground">{text}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={closeCreate}
                className="rounded-xl border border-border bg-muted/60 px-5 py-2.5 text-sm font-semibold text-foreground/70 transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                  </>
                ) : (
                  "Create Notice"
                )}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}