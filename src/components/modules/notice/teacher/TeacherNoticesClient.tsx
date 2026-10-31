"use client";

import Link from "next/link";
import { useState, useTransition, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  Trash2,
  Eye,
  X,
  Users,
  GraduationCap,
} from "lucide-react";

import {
  createNoticeDirect,
  deleteNotice,
} from "@/service/notice/notice.service";
import { getStudents } from "@/service/student/student.service";

import {
  INotice,
  NoticeAudienceType,
  NoticePriority,
  NOTICE_PRIORITY_OPTIONS,
  NOTICE_PRIORITY_LABELS,
  NOTICE_AUDIENCE_TYPE_LABELS,
} from "@/types/notice.interface";

/* ───────────────────────── Types ───────────────────────── */

interface SelectOption {
  id: number;
  name: string;
}

interface CurrentTeacher {
  id: number;
  name: string;
  department?: { id: number; name: string } | null;
}

interface Meta {
  total: number;
  currentPage: number;
  totalPages: number;
}

interface Props {
  feedNotices: INotice[];
  feedMeta: Meta;
  myNotices: INotice[];
  myMeta: Meta;
  groups: SelectOption[];
  teacher?: CurrentTeacher | null;
  activeTab: "feed" | "mine";
}

const TEACHER_AUDIENCE_OPTIONS = [
  { value: "GROUP", label: "Group" },
  { value: "STUDENT", label: "Student" },
] as const;

const INITIAL_FORM = {
  title: "",
  description: "",
  attachmentUrl: "",
  noticeDate: "",
  expiryDate: "",
  priority: "MEDIUM" as NoticePriority,
  audienceType: "GROUP" as NoticeAudienceType,
  isPinned: false,
  isPublished: true,
  groupId: "",
  studentId: "",
};

/* ───────────────────────── Helpers ───────────────────────── */

const inputCls =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function priorityBadge(priority: NoticePriority) {
  const map: Record<string, string> = {
    HIGH: "bg-rose-50 text-rose-700 ring-rose-200",
    MEDIUM: "bg-amber-50 text-amber-800 ring-amber-200",
    LOW: "bg-sky-50 text-sky-700 ring-sky-200",
  };
  return map[priority] ?? "bg-secondary text-muted-foreground ring-border";
}

/* ───────────────────────── Component ───────────────────────── */

export default function TeacherNoticesClient({
  feedNotices,
  feedMeta,
  myNotices,
  myMeta,
  groups,
  teacher,
  activeTab,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [openCreate, setOpenCreate] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState<SelectOption[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const studentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notices = activeTab === "feed" ? feedNotices : myNotices;
  const meta = activeTab === "feed" ? feedMeta : myMeta;

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set(key, value) : params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const setTab = (tab: "feed" | "mine") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStudentSearch = (q: string) => {
    setStudentSearch(q);
    setFormData((prev) => ({ ...prev, studentId: "" }));
    if (studentTimer.current) clearTimeout(studentTimer.current);
    if (!q.trim()) {
      setStudents([]);
      return;
    }
    studentTimer.current = setTimeout(async () => {
      setStudentLoading(true);
      try {
        const res = await getStudents({ searchTerm: q, limit: 10 });
        setStudents(res.data || []);
      } finally {
        setStudentLoading(false);
      }
    }, 400);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this notice?")) return;
    startTransition(async () => {
      const result = await deleteNotice(id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleCreate = () => {
    if (!formData.title.trim()) return toast.warning("Title is required");
    if (!formData.description.trim())
      return toast.warning("Description is required");
    if (formData.audienceType === "GROUP" && !formData.groupId)
      return toast.warning("Please select a group");
    if (formData.audienceType === "STUDENT" && !formData.studentId)
      return toast.warning("Please select a student");

    startTransition(async () => {
      const toastId = toast.loading("Creating notice...");

      const result = await createNoticeDirect({
        title: formData.title,
        description: formData.description,
        attachmentUrl: formData.attachmentUrl || undefined,
        noticeDate: formData.noticeDate || undefined,
        expiryDate: formData.expiryDate || undefined,
        priority: formData.priority,
        audienceType: formData.audienceType,
        isPinned: formData.isPinned,
        isPublished: formData.isPublished,
        groupId: formData.groupId ? Number(formData.groupId) : undefined,
        studentId: formData.studentId
          ? Number(formData.studentId)
          : undefined,
        teacherId: teacher?.id,
      });

      if (result.success) {
        toast.success(result.message, { id: toastId });
        setOpenCreate(false);
        setFormData(INITIAL_FORM);
        setStudentSearch("");
        setStudents([]);
        router.refresh();
      } else {
        toast.error(result.message ?? "Failed to create notice", {
          id: toastId,
        });
      }
    });
  };

  const resetModal = () => {
    setOpenCreate(false);
    setFormData(INITIAL_FORM);
    setStudentSearch("");
    setStudents([]);
  };

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="st-fade flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
              Dashboard / Notices
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Notices
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your notice feed and notices you have created
            </p>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:shadow-lg hover:shadow-primary/40 active:scale-95"
          >
            <Plus size={16} />
            Create Notice
          </button>
        </div>

        {/* Tabs + Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex rounded-xl bg-secondary/50 p-1 ring-1 ring-border">
            <button
              onClick={() => setTab("feed")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === "feed"
                  ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Notice Feed
            </button>
            <button
              onClick={() => setTab("mine")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === "mine"
                  ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              My Notices
            </button>
          </div>

          <div className="theme-card flex items-center gap-3 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30">
              <Megaphone size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Total
              </p>
              <p className="text-xl font-black leading-none tabular-nums text-foreground">
                {meta.total}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
          <div className="h-1 w-full bg-gradient-to-r from-primary to-emerald-500" />
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search notices..."
                defaultValue={searchParams.get("searchTerm") ?? ""}
                onChange={(e) => setParam("searchTerm", e.target.value)}
                className={`${inputCls} pl-9`}
              />
            </div>
            <select
              value={searchParams.get("priority") ?? ""}
              onChange={(e) => setParam("priority", e.target.value)}
              className={inputCls}
            >
              <option value="">All Priorities</option>
              {NOTICE_PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={searchParams.get("sortOrder") ?? "desc"}
              onChange={(e) => setParam("sortOrder", e.target.value)}
              className={inputCls}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Empty / Grid */}
        {notices.length === 0 ? (
          <div className="theme-card py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-primary/50 ring-1 ring-gold-soft">
              <Megaphone size={28} />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              No notices yet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeTab === "feed"
                ? "No notices available for you right now"
                : "Create a notice for your groups or students"}
            </p>
            {activeTab === "mine" && (
              <button
                onClick={() => setOpenCreate(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:shadow-lg active:scale-95"
              >
                <Plus size={16} />
                Create Notice
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {notices.map((notice, i) => (
                <div
                  key={notice.id}
                  className="st-row theme-card group relative flex flex-col overflow-hidden shadow-[var(--shadow-card)]"
                  style={{ ["--i" as string]: i % 9 }}
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
                        {NOTICE_AUDIENCE_TYPE_LABELS[notice.audienceType]}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${priorityBadge(
                          notice.priority
                        )}`}
                      >
                        {NOTICE_PRIORITY_LABELS[notice.priority]}
                      </span>
                      {notice.isPinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                          <Pin size={10} /> Pinned
                        </span>
                      )}
                      {!notice.isPublished && (
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-border">
                          Draft
                        </span>
                      )}
                    </div>

                    {(notice.group || notice.student) && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {notice.group && (
                          <>
                            <Users size={12} /> {notice.group.name}
                          </>
                        )}
                        {notice.student && (
                          <>
                            <GraduationCap size={12} /> {notice.student.name}
                          </>
                        )}
                      </p>
                    )}

                    <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground transition group-hover:text-primary">
                      {notice.title}
                    </h3>

                    <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                      {notice.description}
                    </p>

                    {notice.noticeDate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(notice.noticeDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </p>
                    )}

                    <div className="flex items-center gap-2 border-t border-border pt-3">
                      <Link
                        href={`/teacher/notices/${notice.id}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/60 py-2 text-sm font-semibold text-primary transition hover:border-transparent hover:bg-gradient-to-br hover:from-primary hover:to-emerald-600 hover:text-primary-foreground"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                      {activeTab === "mine" && (
                        <button
                          onClick={() => handleDelete(notice.id)}
                          disabled={isPending}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: meta.totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <Link
                      key={p}
                      href={`?${new URLSearchParams({
                        ...Object.fromEntries(searchParams.entries()),
                        page: String(p),
                      }).toString()}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                        meta.currentPage === p
                          ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25"
                          : "border border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="theme-card w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Create Notice
                </h2>
                <p className="text-xs text-muted-foreground">
                  Send to a group or individual student
                </p>
              </div>
              <button
                onClick={resetModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <Field label="Title" required>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter notice title"
                  className={inputCls}
                />
              </Field>

              <Field label="Description" required>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Write notice details"
                  className={inputCls}
                />
              </Field>

              <Field label="Attachment URL">
                <input
                  type="url"
                  value={formData.attachmentUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attachmentUrl: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Notice Date">
                  <input
                    type="date"
                    value={formData.noticeDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        noticeDate: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Expiry Date">
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiryDate: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Priority">
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as NoticePriority,
                    })
                  }
                  className={inputCls}
                >
                  {NOTICE_PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Send To" required>
                <div className="grid grid-cols-2 gap-3">
                  {TEACHER_AUDIENCE_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          audienceType: o.value as NoticeAudienceType,
                          groupId: "",
                          studentId: "",
                        })
                      }
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition ${
                        formData.audienceType === o.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {o.value === "GROUP" ? (
                        <Users size={16} />
                      ) : (
                        <GraduationCap size={16} />
                      )}
                      {o.label}
                    </button>
                  ))}
                </div>
              </Field>

              {formData.audienceType === "GROUP" && (
                <Field label="Select Group" required>
                  <select
                    value={formData.groupId}
                    onChange={(e) =>
                      setFormData({ ...formData, groupId: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option value="">Choose a group...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {formData.audienceType === "STUDENT" && (
                <Field label="Select Student" required>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => handleStudentSearch(e.target.value)}
                      placeholder="Search by student name..."
                      className={inputCls}
                    />
                    {studentLoading && (
                      <span className="absolute right-3 top-3 text-xs text-muted-foreground">
                        Searching...
                      </span>
                    )}
                    {formData.studentId && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          ✓ {studentSearch}
                        </span>
                        <button
                          onClick={() => {
                            setFormData({ ...formData, studentId: "" });
                            setStudentSearch("");
                          }}
                          className="text-xs text-muted-foreground hover:text-rose-600"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                    {students.length > 0 && !formData.studentId && (
                      <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                        {students.map((s) => (
                          <li
                            key={s.id}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                studentId: String(s.id),
                              });
                              setStudentSearch(s.name);
                              setStudents([]);
                            }}
                            className="cursor-pointer px-4 py-2.5 text-sm text-foreground transition hover:bg-secondary"
                          >
                            {s.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Field>
              )}

              <div className="flex flex-col gap-3 pt-1">
                <label className="flex cursor-pointer select-none items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPinned: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Pin this notice
                  </span>
                </label>
                <label className="flex cursor-pointer select-none items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Publish immediately
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  onClick={resetModal}
                  className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isPending}
                  className="rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:shadow-lg disabled:opacity-50"
                >
                  {isPending ? "Creating..." : "Create Notice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}