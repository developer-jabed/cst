"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Inbox,
  PenLine,
  Users,
  CalendarDays,
  Pin,
  Globe,
  X,
  Plus,
  Search,
  Trash2,
  Eye,
} from "lucide-react";

import {
  createNoticeDirect,
  deleteNotice,
} from "@/service/notice/notice.service";

import {
  INotice,
  NoticePriority,
  NOTICE_PRIORITY_OPTIONS,
  NOTICE_PRIORITY_LABELS,
  NOTICE_AUDIENCE_TYPE_LABELS,
} from "@/types/notice.interface";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface StudentGroup {
  id: number;
  name: string;
}

interface CurrentStudent {
  id: number;
  name: string;
  group?: StudentGroup | null;
  semester?: { id: number; name: string } | null;
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
  student?: CurrentStudent | null;
  activeTab: "feed" | "mine";
}

const INITIAL_FORM = {
  title: "",
  description: "",
  attachmentUrl: "",
  noticeDate: "",
  expiryDate: "",
  priority: "MEDIUM" as NoticePriority,
  isPinned: false,
  isPublished: true,
};

// ─────────────────────────────────────────────────────────────
// Shared class names (theme tokens only)
// ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40";

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-card)] transition hover:opacity-90 disabled:opacity-50";

const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-gold/50 hover:bg-accent";

const tabCls = (active: boolean) =>
  `inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
    active
      ? "bg-card text-foreground shadow-sm ring-1 ring-gold/30"
      : "text-muted-foreground hover:text-foreground"
  }`;

const badgeCls =
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function StudentNoticesClient({
  feedNotices,
  feedMeta,
  myNotices,
  myMeta,
  student,
  activeTab,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [openCreate, setOpenCreate] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [search, setSearch] = useState(searchParams.get("searchTerm") ?? "");

  const studentGroup = student?.group ?? null;

  const notices = activeTab === "feed" ? feedNotices : myNotices;
  const meta = activeTab === "feed" ? feedMeta : myMeta;

  // ── URL helpers ───────────────────────────────────────────

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const setTab = (tab: "feed" | "mine") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const pageHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  };

  // Debounce search so we don't hit the server on every keystroke
  useEffect(() => {
    const current = searchParams.get("searchTerm") ?? "";
    if (search === current) return;
    const t = setTimeout(() => setParam("searchTerm", search), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Close modal with Escape
  useEffect(() => {
    if (!openCreate) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenCreate(false);
        setFormData(INITIAL_FORM);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCreate]);

  // ── Delete ────────────────────────────────────────────────

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

  // ── Create ────────────────────────────────────────────────

  const handleCreate = () => {
    if (!formData.title.trim()) return toast.warning("Title is required");
    if (!formData.description.trim())
      return toast.warning("Description is required");
    if (!studentGroup) return toast.error("You are not assigned to any group");

    startTransition(async () => {
      const toastId = toast.loading("Creating notice...");

      const result = await createNoticeDirect({
        title: formData.title,
        description: formData.description,
        attachmentUrl: formData.attachmentUrl || undefined,
        noticeDate: formData.noticeDate || undefined,
        expiryDate: formData.expiryDate || undefined,
        priority: formData.priority,
        audienceType: "GROUP",
        isPinned: formData.isPinned,
        isPublished: formData.isPublished,
        groupId: studentGroup.id,
        studentId: student?.id,
      });

      if (result.success) {
        toast.success(result.message, { id: toastId });
        setOpenCreate(false);
        setFormData(INITIAL_FORM);
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
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Toolbar: tabs + create ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-fit gap-1 rounded-xl bg-muted/70 p-1">
          <button
            onClick={() => setTab("feed")}
            className={tabCls(activeTab === "feed")}
          >
            <Inbox size={15} />
            Notice Feed
          </button>
          <button
            onClick={() => setTab("mine")}
            className={tabCls(activeTab === "mine")}
          >
            <PenLine size={15} />
            My Notices
          </button>
        </div>

        {studentGroup ? (
          <button onClick={() => setOpenCreate(true)} className={primaryBtn}>
            <Plus size={16} />
            Create Notice
          </button>
        ) : (
          <div className="rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-sm text-muted-foreground">
            No group assigned
          </div>
        )}
      </div>

      {/* ── Group Info Banner ── */}
      {studentGroup && (
        <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-secondary/70 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/40 bg-card/70 text-primary">
            <Users size={17} />
          </span>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gold">
              Your Group
            </p>
            <p className="mt-0.5 text-sm text-foreground">
              {studentGroup.name}
              <span className="text-muted-foreground">
                {" "}
                — notices you create will be sent to this group
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search notices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputCls} pl-10`}
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

      {/* ── Stats ── */}
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-secondary px-4 py-1.5 text-sm font-medium tabular-nums text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Total: {meta.total} notice{meta.total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Empty State ── */}
      {notices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/40 bg-card/50 py-20 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-secondary text-primary">
            <Inbox size={24} />
          </span>
          <h2 className="text-xl font-semibold text-foreground">
            No notices yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            {activeTab === "feed"
              ? "No notices available for you right now"
              : studentGroup
                ? "Create a notice to share with your group"
                : "You are not assigned to any group"}
          </p>
          {activeTab === "mine" && studentGroup && (
            <button
              onClick={() => setOpenCreate(true)}
              className={`${primaryBtn} mt-5`}
            >
              <Plus size={16} />
              Create Notice
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Notice Grid ── */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {notices.map((notice, i) => (
              <div
                key={notice.id}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="group flex animate-in flex-col rounded-2xl border border-gold/25 bg-card/80 p-6 shadow-[var(--shadow-card)] backdrop-blur fade-in slide-in-from-bottom-2 fill-mode-both duration-500 transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[var(--shadow-hover)] motion-reduce:animate-none motion-reduce:transition-none"
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  <span
                    className={`${badgeCls} border-gold/40 bg-secondary text-primary`}
                  >
                    {NOTICE_AUDIENCE_TYPE_LABELS[notice.audienceType]}
                  </span>
                  <span
                    className={`${badgeCls} border-gold/30 bg-gold/15 text-foreground`}
                  >
                    {NOTICE_PRIORITY_LABELS[notice.priority]}
                  </span>
                  {notice.isPinned && (
                    <span
                      className={`${badgeCls} border-gold/50 bg-gold/25 text-foreground`}
                    >
                      <Pin size={11} />
                      Pinned
                    </span>
                  )}
                  {!notice.isPublished && (
                    <span
                      className={`${badgeCls} border-border bg-muted text-muted-foreground`}
                    >
                      Draft
                    </span>
                  )}
                </div>

                {notice.group && (
                  <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users size={12} />
                    {notice.group.name}
                  </p>
                )}

                <h2 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground">
                  {notice.title}
                </h2>

                <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
                  {notice.description}
                </p>

                {notice.noticeDate && (
                  <p className="mb-4 flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
                    <CalendarDays size={12} />
                    {new Date(notice.noticeDate).toLocaleDateString("en-GB")}
                  </p>
                )}

                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <Link
                    href={`/student/notices/${notice.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-gold/50 hover:bg-accent"
                  >
                    <Eye size={14} />
                    View
                  </Link>
                  {activeTab === "mine" && (
                    <button
                      onClick={() => handleDelete(notice.id)}
                      disabled={isPending}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination ── */}
          {meta.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {Array.from({ length: meta.totalPages }).map((_, i) => {
                const p = i + 1;
                const active = meta.currentPage === p;
                return (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                        : "border-border bg-card/60 text-foreground hover:border-gold/50 hover:bg-accent"
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

      {/* ── Create Modal ── */}
      {openCreate && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm fade-in duration-200"
          onClick={resetModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl animate-in overflow-y-auto rounded-3xl border border-gold/30 bg-card shadow-2xl fade-in zoom-in-95 duration-300 motion-reduce:animate-none"
          >
            <div className="h-[3px] bg-gradient-to-r from-primary via-emerald-500 to-gold" />

            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-border bg-card/95 px-6 pb-4 pt-5 backdrop-blur">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Create Notice
                </h2>
                {studentGroup && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Will be sent to{" "}
                    <span className="font-medium text-foreground">
                      {studentGroup.name}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={resetModal}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center gap-3 rounded-xl border border-gold/30 bg-secondary/70 px-4 py-3">
                <Users size={16} className="text-primary" />
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gold">
                    Target Group
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {studentGroup?.name}
                  </p>
                </div>
                <span className="ml-auto rounded-full border border-gold/40 bg-card/70 px-2.5 py-1 text-xs text-primary">
                  Auto-assigned
                </span>
              </div>

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
                    setFormData({ ...formData, attachmentUrl: e.target.value })
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
                      setFormData({ ...formData, noticeDate: e.target.value })
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Expiry Date">
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
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

              <div className="flex flex-col gap-3 pt-1">
                <label className="flex cursor-pointer select-none items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) =>
                      setFormData({ ...formData, isPinned: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Pin size={14} className="text-gold" />
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
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Globe size={14} className="text-gold" />
                    Publish immediately
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button onClick={resetModal} className={ghostBtn}>
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isPending}
                  className={primaryBtn}
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
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}