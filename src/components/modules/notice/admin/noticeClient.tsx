"use client";

import Link from "next/link";
import { useState, useTransition, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  createNoticeDirect,
  deleteNotice,
} from "@/service/notice/notice.service";
import { getStudents } from "@/service/student/student.service";

import {
  INotice,
  NoticeAudienceType,
  NoticePriority,
  NOTICE_AUDIENCE_TYPE_OPTIONS,
  NOTICE_AUDIENCE_TYPE_LABELS,
  NOTICE_PRIORITY_OPTIONS,
  NOTICE_PRIORITY_LABELS,
} from "@/types/notice.interface";
import { getAllTeachers } from "@/service/admin/teacherManagement";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Audience-aware target fields
// ─────────────────────────────────────────────────────────────

const AUDIENCE_NEEDS: Record<NoticeAudienceType, string[]> = {
  ALL: [],
  DEPARTMENT: ["departmentId"],
  SEMESTER: ["departmentId", "semesterId"],
  GROUP: ["departmentId", "semesterId", "groupId"],
  STUDENT: ["studentId"],
  TEACHER: ["teacherId"],
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function NoticesPageClient({
  notices,
  meta,
  departments,
  semesters,
  groups,
}: NoticesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [openCreate, setOpenCreate] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Student / teacher async search
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [students, setStudents] = useState<SelectOption[]>([]);
  const [teachers, setTeachers] = useState<SelectOption[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);

  const studentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const teacherTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── URL filter helpers ────────────────────────────────────

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const clearFilters = () => {
    router.push(pathname);
  };

  // ── Async student search ──────────────────────────────────

  const handleStudentSearch = (q: string) => {
    setStudentSearch(q);
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

  // ── Async teacher search ──────────────────────────────────

  const handleTeacherSearch = (q: string) => {
    setTeacherSearch(q);
    if (teacherTimer.current) clearTimeout(teacherTimer.current);
    if (!q.trim()) {
      setTeachers([]);
      return;
    }
    teacherTimer.current = setTimeout(async () => {
      setTeacherLoading(true);
      try {
        const res = await getAllTeachers({ searchTerm: q, limit: 10 });
        setTeachers(res.data || []);
      } finally {
        setTeacherLoading(false);
      }
    }, 400);
  };

  // ── Delete ────────────────────────────────────────────────

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

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
    if (!formData.title.trim()) {
      return toast.warning("Title is required");
    }
    if (!formData.description.trim()) {
      return toast.warning("Description is required");
    }

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
        departmentId: formData.departmentId
          ? Number(formData.departmentId)
          : undefined,
        semesterId: formData.semesterId
          ? Number(formData.semesterId)
          : undefined,
        groupId: formData.groupId ? Number(formData.groupId) : undefined,
        studentId: formData.studentId ? Number(formData.studentId) : undefined,
        teacherId: formData.teacherId ? Number(formData.teacherId) : undefined,
      });

      if (result.success) {
        toast.success(result.message, { id: toastId });
        setOpenCreate(false);
        setFormData(INITIAL_FORM);
        setStudentSearch("");
        setTeacherSearch("");
        setStudents([]);
        setTeachers([]);
        router.refresh();
      } else {
        toast.error(result.message ?? "Failed to create notice", {
          id: toastId,
        });
      }
    });
  };

  const activeFilters = [
    "searchTerm",
    "audienceType",
    "priority",
    "departmentId",
    "semesterId",
    "groupId",
    "studentId",
    "teacherId",
    "isPinned",
    "isPublished",
  ].filter((k) => searchParams.get(k)).length;

  const needs = AUDIENCE_NEEDS[formData.audienceType];

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notices</h1>
          <p className="text-gray-500 mt-1">
            Manage institute notices and announcements
          </p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="px-5 py-2.5 rounded-xl bg-black text-white hover:opacity-90 transition text-sm font-medium"
        >
          + Create Notice
        </button>
      </div>

 
      <div className="bg-white border rounded-2xl p-5 mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <input
            type="text"
            placeholder="Search notices..."
            defaultValue={searchParams.get("searchTerm") ?? ""}
            onChange={(e) => setParam("searchTerm", e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black col-span-full lg:col-span-1"
          />

 
          <select
            value={searchParams.get("audienceType") ?? ""}
            onChange={(e) => setParam("audienceType", e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Audiences</option>
            {NOTICE_AUDIENCE_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={searchParams.get("priority") ?? ""}
            onChange={(e) => setParam("priority", e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Priorities</option>
            {NOTICE_PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={searchParams.get("sortOrder") ?? "desc"}
            onChange={(e) => setParam("sortOrder", e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {/* Department */}
          <select
            value={searchParams.get("departmentId") ?? ""}
            onChange={(e) => setParam("departmentId", e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Semester */}
          <select
            value={searchParams.get("semesterId") ?? ""}
            onChange={(e) => setParam("semesterId", e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Semesters</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Group */}
          <select
            value={searchParams.get("groupId") ?? ""}
            onChange={(e) => setParam("groupId", e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
               {g.currentSemester.name} Semester {g.name} Group
              </option>
            ))}
          </select>

          {/* Published */}
          <select
            value={searchParams.get("isPublished") ?? ""}
            onChange={(e) => setParam("isPublished", e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Any Status</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </div>

        {/* Student search filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search student by name..."
              value={studentSearch}
              onChange={(e) => handleStudentSearch(e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            {studentLoading && (
              <span className="absolute right-3 top-3 text-xs text-gray-400">
                Searching...
              </span>
            )}
            {students.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {students.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => {
                      setParam("studentId", String(s.id));
                      setStudentSearch(s.name);
                      setStudents([]);
                    }}
                    className="px-4 py-2.5 text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Teacher search filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search teacher by name..."
              value={teacherSearch}
              onChange={(e) => handleTeacherSearch(e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            {teacherLoading && (
              <span className="absolute right-3 top-3 text-xs text-gray-400">
                Searching...
              </span>
            )}
            {teachers.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {teachers.map((t) => (
                  <li
                    key={t.id}
                    onClick={() => {
                      setParam("teacherId", String(t.id));
                      setTeacherSearch(t.name);
                      setTeachers([]);
                    }}
                    className="px-4 py-2.5 text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    {t.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Clear filters */}
        {activeFilters > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {activeFilters} filter{activeFilters > 1 ? "s" : ""} active
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="flex items-center gap-2 mb-6">
        <span className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium">
          Total: {meta.total} notice{meta.total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Empty State ── */}
      {notices.length === 0 ? (
        <div className="border rounded-2xl py-20 text-center bg-white">
          <p className="text-2xl mb-2">📭</p>
          <h2 className="text-xl font-semibold">No notices found</h2>
          <p className="text-gray-500 mt-2">
            {activeFilters > 0
              ? "Try adjusting your filters"
              : "Create your first notice"}
          </p>
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
                    href={`/admin/notices/${notice.id}`}
                    className="flex-1 text-center px-4 py-2 rounded-lg border hover:bg-gray-50 text-sm font-medium transition"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    disabled={isPending}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium disabled:opacity-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination ── */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: meta.totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <Link
                    key={page}
                    href={`?${new URLSearchParams({
                      ...Object.fromEntries(searchParams.entries()),
                      page: String(page),
                    }).toString()}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition ${
                      meta.currentPage === page
                        ? "bg-black text-white border-black"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {page}
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
              <h2 className="text-2xl font-bold">Create Notice</h2>
              <button
                onClick={() => setOpenCreate(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
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

              {/* Description */}
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

              {/* Attachment */}
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

              {/* Dates */}
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

              {/* Audience + Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Audience Type">
                  <select
                    value={formData.audienceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        audienceType: e.target.value as NoticeAudienceType,
                        // reset targeting when audience changes
                        departmentId: "",
                        semesterId: "",
                        groupId: "",
                        studentId: "",
                        teacherId: "",
                      })
                    }
                    className={inputCls}
                  >
                    {NOTICE_AUDIENCE_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
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
              </div>

              {/* Audience-specific targeting */}
              {needs.includes("departmentId") && (
                <Field label="Department" required>
                  <select
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentId: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {needs.includes("semesterId") && (
                <Field label="Semester" required>
                  <select
                    value={formData.semesterId}
                    onChange={(e) =>
                      setFormData({ ...formData, semesterId: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option value="">Select semester</option>
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {needs.includes("groupId") && (
                <Field label="Group" required>
                  <select
                    value={formData.groupId}
                    onChange={(e) =>
                      setFormData({ ...formData, groupId: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option value="">Select group</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                       {g.currentSemester.name} Semester {g.name} Group
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {needs.includes("studentId") && (
                <Field label="Student" required>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => {
                        handleStudentSearch(e.target.value);
                        setFormData({ ...formData, studentId: "" });
                      }}
                      placeholder="Search student by name..."
                      className={inputCls}
                    />
                    {studentLoading && (
                      <span className="absolute right-3 top-3 text-xs text-gray-400">
                        Searching...
                      </span>
                    )}
                    {students.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
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
                            className="px-4 py-2.5 text-sm hover:bg-gray-50 cursor-pointer"
                          >
                            {s.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Field>
              )}

              {needs.includes("teacherId") && (
                <Field label="Teacher" required>
                  <div className="relative">
                    <input
                      type="text"
                      value={teacherSearch}
                      onChange={(e) => {
                        handleTeacherSearch(e.target.value);
                        setFormData({ ...formData, teacherId: "" });
                      }}
                      placeholder="Search teacher by name..."
                      className={inputCls}
                    />
                    {teacherLoading && (
                      <span className="absolute right-3 top-3 text-xs text-gray-400">
                        Searching...
                      </span>
                    )}
                    {teachers.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {teachers.map((t) => (
                          <li
                            key={t.id}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                teacherId: String(t.id),
                              });
                              setTeacherSearch(t.name);
                              setTeachers([]);
                            }}
                            className="px-4 py-2.5 text-sm hover:bg-gray-50 cursor-pointer"
                          >
                            {t.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Field>
              )}

              {/* Toggles */}
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

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setOpenCreate(false)}
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

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black";

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
