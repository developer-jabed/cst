// components/modules/notice/NoticesPageClient.tsx

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  createNoticeDirect,
  deleteNotice,
} from "@/service/notice/notice.service";

import {
  INotice,
  NoticeAudienceType,
  NoticePriority,
  NOTICE_AUDIENCE_TYPE_OPTIONS,
  NOTICE_AUDIENCE_TYPE_LABELS,
  NOTICE_PRIORITY_OPTIONS,
  NOTICE_PRIORITY_LABELS,
} from "@/types/notice.interface";

interface NoticesPageClientProps {
  notices: INotice[];

  meta: {
    total: number;
    currentPage: number;
    totalPages: number;
  };
}

export default function NoticesPageClient({
  notices,
  meta,
}: NoticesPageClientProps) {
  const [isPending, startTransition] =
    useTransition();

  const [openCreate, setOpenCreate] =
    useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    attachmentUrl: "",
    noticeDate: "",
    expiryDate: "",
    audienceType:
      "ALL" as NoticeAudienceType,
    priority: "MEDIUM" as NoticePriority,
    isPinned: false,
    isPublished: true,
  });

  const handleDelete = (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmDelete) return;

    startTransition(async () => {
      const result = await deleteNotice(id);

      if (result.success) {
        alert(result.message);
        window.location.reload();
      } else {
        alert(result.message);
      }
    });
  };

  const handleCreateNotice = () => {
    if (!formData.title.trim()) {
      return alert("Title is required");
    }

    if (!formData.description.trim()) {
      return alert("Description is required");
    }

    startTransition(async () => {
      const result = await createNoticeDirect({
        title: formData.title,
        description: formData.description,

        attachmentUrl:
          formData.attachmentUrl || undefined,

        noticeDate:
          formData.noticeDate || undefined,

        expiryDate:
          formData.expiryDate || undefined,

        audienceType:
          formData.audienceType,

        priority: formData.priority,

        isPinned: formData.isPinned,
        isPublished:
          formData.isPublished,
      });

      if (result.success) {
        alert(result.message);

        setOpenCreate(false);

        setFormData({
          title: "",
          description: "",
          attachmentUrl: "",
          noticeDate: "",
          expiryDate: "",
          audienceType: "ALL",
          priority: "MEDIUM",
          isPinned: false,
          isPublished: true,
        });

        window.location.reload();
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Notices
          </h1>

          <p className="text-gray-500 mt-1">
            Manage institute notices and
            announcements
          </p>
        </div>

        <button
          onClick={() =>
            setOpenCreate(true)
          }
          className="px-5 py-2.5 rounded-xl bg-black text-white hover:opacity-90 transition"
        >
          Create Notice
        </button>
      </div>

      {/* Create Modal */}
      {openCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Create Notice
              </h2>

              <button
                onClick={() =>
                  setOpenCreate(false)
                }
                className="text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title
                </label>

                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter notice title"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Write notice details"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Attachment URL
                </label>

                <input
                  type="text"
                  value={
                    formData.attachmentUrl
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attachmentUrl:
                        e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notice Date
                  </label>

                  <input
                    type="date"
                    value={formData.noticeDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        noticeDate:
                          e.target.value,
                      })
                    }
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiryDate:
                          e.target.value,
                      })
                    }
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Audience + Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Audience Type
                  </label>

                  <select
                    value={
                      formData.audienceType
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        audienceType:
                          e.target
                            .value as NoticeAudienceType,
                      })
                    }
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  >
                    {NOTICE_AUDIENCE_TYPE_OPTIONS.map(
                      (item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority
                  </label>

                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority:
                          e.target
                            .value as NoticePriority,
                      })
                    }
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  >
                    {NOTICE_PRIORITY_OPTIONS.map(
                      (item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Switches */}
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      formData.isPinned
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPinned:
                          e.target.checked,
                      })
                    }
                  />

                  <span>Pin Notice</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      formData.isPublished
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished:
                          e.target.checked,
                      })
                    }
                  />

                  <span>Publish Notice</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() =>
                    setOpenCreate(false)
                  }
                  className="px-5 py-2.5 rounded-xl border hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleCreateNotice
                  }
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isPending
                    ? "Creating..."
                    : "Create Notice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100">
          <span className="font-medium">
            Total Notices:
          </span>

          <span>{meta.total}</span>
        </div>
      </div>

      {/* Empty */}
      {notices.length === 0 ? (
        <div className="border rounded-2xl py-20 text-center bg-white">
          <h2 className="text-xl font-semibold">
            No notices found
          </h2>

          <p className="text-gray-500 mt-2">
            Create your first notice
          </p>
        </div>
      ) : (
        <>
          {/* Notice Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="border bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {
                      NOTICE_AUDIENCE_TYPE_LABELS[
                        notice.audienceType
                      ]
                    }
                  </span>

                  <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                    {
                      NOTICE_PRIORITY_LABELS[
                        notice.priority
                      ]
                    }
                  </span>

                  {notice.isPinned && (
                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                      Pinned
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold mb-3">
                  {notice.title}
                </h2>

                <p className="text-gray-600 text-sm line-clamp-4 mb-5">
                  {notice.description}
                </p>

                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  {notice.noticeDate && (
                    <p>
                      📅{" "}
                      {new Date(
                        notice.noticeDate
                      ).toLocaleDateString(
                        "en-GB"
                      )}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Link
                    href={`/admin/notices/${notice.id}`}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                  >
                    View
                  </Link>

                  <button
                    onClick={() =>
                      handleDelete(
                        notice.id
                      )
                    }
                    disabled={isPending}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-10">
            {Array.from({
              length: meta.totalPages,
            }).map((_, index) => {
              const page = index + 1;

              return (
                <Link
                  key={page}
                  href={`?page=${page}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition ${
                    meta.currentPage === page
                      ? "bg-black text-white border-black"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {page}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}