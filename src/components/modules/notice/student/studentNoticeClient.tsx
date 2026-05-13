"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";

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

  const studentGroup = student?.group ?? null;

  const notices = activeTab === "feed" ? feedNotices : myNotices;
  const meta = activeTab === "feed" ? feedMeta : myMeta;

  // ── URL helpers ───────────────────────────────────────────

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notices</h1>
          <p className="text-gray-500 mt-1">
            Your notice feed and notices you have created
          </p>
        </div>
        {studentGroup ? (
          <button
            onClick={() => setOpenCreate(true)}
            className="px-5 py-2.5 rounded-xl bg-black text-white hover:opacity-90 transition text-sm font-medium"
          >
            + Create Notice
          </button>
        ) : (
          <div className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm">
            No group assigned
          </div>
        )}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab("feed")}
          className={tabCls(activeTab === "feed")}
        >
          📬 Notice Feed
        </button>
        <button
          onClick={() => setTab("mine")}
          className={tabCls(activeTab === "mine")}
        >
          ✏️ My Notices
        </button>
      </div>

      {/* ── Group Info Banner ── */}
      {studentGroup && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-blue-50 border border-blue-100 mb-6">
          <span className="text-xl">👥</span>
          <div>
            <p className="text-sm font-medium text-blue-800">Your Group</p>
            <p className="text-xs text-blue-600 mt-0.5">
              {studentGroup.name} — notices you create will be sent to this
              group
            </p>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white border rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search notices..."
            defaultValue={searchParams.get("searchTerm") ?? ""}
            onChange={(e) => setParam("searchTerm", e.target.value)}
            className={inputCls}
          />
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
      <div className="mb-6">
        <span className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium">
          Total: {meta.total} notice{meta.total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Empty State ── */}
      {notices.length === 0 ? (
        <div className="border rounded-2xl py-20 text-center bg-white">
          <p className="text-3xl mb-3">📭</p>
          <h2 className="text-xl font-semibold">No notices yet</h2>
          <p className="text-gray-500 mt-2">
            {activeTab === "feed"
              ? "No notices available for you right now"
              : studentGroup
                ? "Create a notice to share with your group"
                : "You are not assigned to any group"}
          </p>
          {activeTab === "mine" && studentGroup && (
            <button
              onClick={() => setOpenCreate(true)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-black text-white text-sm hover:opacity-90 transition"
            >
              + Create Notice
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Notice Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="border bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {NOTICE_AUDIENCE_TYPE_LABELS[notice.audienceType]}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                    {NOTICE_PRIORITY_LABELS[notice.priority]}
                  </span>
                  {notice.isPinned && (
                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                      📌 Pinned
                    </span>
                  )}
                  {!notice.isPublished && (
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                      Draft
                    </span>
                  )}
                </div>

                {notice.group && (
                  <p className="text-xs text-gray-400 mb-3">
                    👥 {notice.group.name}
                  </p>
                )}

                <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                  {notice.title}
                </h2>

                <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                  {notice.description}
                </p>

                {notice.noticeDate && (
                  <p className="text-xs text-gray-400 mb-4">
                    📅 {new Date(notice.noticeDate).toLocaleDateString("en-GB")}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Link
                    href={`/student/notices/${notice.id}`}
                    className="flex-1 text-center px-4 py-2 rounded-lg border hover:bg-gray-50 text-sm font-medium transition"
                  >
                    View
                  </Link>
                  {activeTab === "mine" && (
                    <button
                      onClick={() => handleDelete(notice.id)}
                      disabled={isPending}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium disabled:opacity-50 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination ── */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: meta.totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <Link
                    key={p}
                    href={`?${new URLSearchParams({
                      ...Object.fromEntries(searchParams.entries()),
                      page: String(p),
                    }).toString()}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition ${
                      meta.currentPage === p
                        ? "bg-black text-white border-black"
                        : "bg-white hover:bg-gray-50"
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Create Notice</h2>
                {studentGroup && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    Will be sent to{" "}
                    <span className="font-medium text-black">
                      {studentGroup.name}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={resetModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
                <span>👥</span>
                <div>
                  <p className="text-xs text-blue-600 font-medium">
                    Target Group
                  </p>
                  <p className="text-sm font-semibold text-blue-800">
                    {studentGroup?.name}
                  </p>
                </div>
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) =>
                      setFormData({ ...formData, isPinned: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">
                    📌 Pin this notice
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">
                    🌐 Publish immediately
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  onClick={resetModal}
                  className="px-5 py-2.5 rounded-xl border hover:bg-gray-50 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-50 text-sm font-medium transition"
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


const inputCls =
  "w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black";

const tabCls = (active: boolean) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition ${
    active ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"
  }`;

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
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
