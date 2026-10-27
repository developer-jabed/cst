/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  createRoutine,
  getRoutineByGroup,
} from "@/service/routine/routine.service";
// এই দুটি পাথ আপনার প্রজেক্ট অনুযায়ী ঠিক করে নিন
import { getSubjectsGroupedBySemester } from "@/service/subject/subject.service";
import { getAllTeachers } from "@/service/admin/teacherManagement";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Users,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
} from "lucide-react";

interface Props {
  initialRoutines: any[];
  groups: any[];
}

// ইনডেক্স = dayOfWeek (0 = রবিবার ... 6 = শনিবার)
const DAYS = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

const toOrdinal = (value: any): string => {
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value ?? "");
  const suffixes = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return `${num}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
};

// শিফটের নাম - সেমিস্টার - গ্রুপের নাম  =>  "Day - 1st Sem - A"
const getGroupLabel = (g: any): string => {
  if (!g) return "";

  const shiftName = g.shift?.name;
  const semesterValue = g.currentSemester?.name ?? g.currentSemester?.order;
  const semesterLabel =
    semesterValue !== undefined && semesterValue !== null && semesterValue !== ""
      ? `${toOrdinal(semesterValue)} Sem`
      : "";
  const groupName = g.name || `Group ${g.id}`;

  return [shiftName, semesterLabel, groupName].filter(Boolean).join(" - ");
};

// বিষয়ের লেবেল। ফিল্ডের নাম আলাদা হলে এখানে বদলান।
const getBookLabel = (book: any): string => {
  const name =
    book.subject?.name ||
    book.subjectName ||
    book.name ||
    book.title ||
    "নামহীন বিষয়";
  const code = book.subject?.code || book.code;
  return code ? `${name} (${code})` : name;
};

// শিক্ষকের ফোন নম্বর। ফিল্ডের নাম আলাদা হলে এখানে বদলান।
const getTeacherPhone = (teacher: any): string =>
  teacher?.phone ??
  teacher?.mobile ??
  teacher?.phoneNumber ??
  teacher?.contactNumber ??
  "";

const EMPTY_FORM = {
  groupId: "",
  subjectId: "",
  teacherId: "",
  dayOfWeek: "1",
  period: "1",
  room: "",
  startTime: "",
  endTime: "",
};

export default function RoutinesClient({ initialRoutines, groups }: Props) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // একটি ডিপার্টমেন্টের রেসপন্স: [{ semester: {...}, books: [...] }, ...]
  const [semesterData, setSemesterData] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  // departmentId -> রেসপন্স; একই ডিপার্টমেন্টে আবার API কল হবে না
  const subjectsCache = useRef<Map<string, any[]>>(new Map());

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const limit = 12;

  const groupMap = useMemo(() => {
    const map = new Map<string, any>();
    groups.forEach((g: any) => map.set(String(g.id), g));
    return map;
  }, [groups]);

  const modalGroup = form.groupId ? groupMap.get(form.groupId) : undefined;
  const departmentId = modalGroup?.departmentId;
  const currentSemesterId = modalGroup?.currentSemesterId;

  // শিক্ষকের তালিকা একবারই লোড হবে
  useEffect(() => {
    let cancelled = false;

    const loadTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const res = await getAllTeachers({ limit: 300 });
        if (cancelled) return;
        const data = res?.data ?? res ?? [];
        setTeachers(Array.isArray(data) ? data : []);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load teachers:", error);
        toast.error("শিক্ষকের তালিকা লোড করা যায়নি!");
      } finally {
        if (!cancelled) setLoadingTeachers(false);
      }
    };

    loadTeachers();

    return () => {
      cancelled = true;
    };
  }, []);

  // প্রতি ডিপার্টমেন্টে একবার বিষয় ফেচ (পরে ক্যাশ থেকে)
  useEffect(() => {
    if (departmentId === undefined || departmentId === null) {
      setSemesterData([]);
      setLoadingSubjects(false);
      return;
    }

    const key = String(departmentId);
    const cached = subjectsCache.current.get(key);
    if (cached) {
      setSemesterData(cached);
      setLoadingSubjects(false);
      return;
    }

    let cancelled = false;

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const res = await getSubjectsGroupedBySemester({ departmentId });
        if (cancelled) return;

        if (!res?.success) {
          toast.error(res?.message || "বিষয়ের তালিকা লোড করা যায়নি!");
          setSemesterData([]);
          return;
        }

        subjectsCache.current.set(key, res.data);
        setSemesterData(res.data);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load subjects:", error);
        toast.error("বিষয়ের তালিকা লোড করা যায়নি!");
        setSemesterData([]);
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    };

    fetchSubjects();

    return () => {
      cancelled = true;
    };
  }, [departmentId]);

  // শুধু নির্বাচিত গ্রুপের বর্তমান সেমিস্টারের বিষয়
  const subjectOptions = useMemo(() => {
    if (currentSemesterId === undefined || currentSemesterId === null) {
      return [];
    }
    const section = semesterData.find(
      (s: any) => String(s.semester?.id) === String(currentSemesterId)
    );
    return Array.isArray(section?.books) ? section.books : [];
  }, [semesterData, currentSemesterId]);

  // ফিল্টার + পেজিনেশন
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return routines.filter((item) => {
      const teacher = item.subjectGroup?.teacher;

      const matchGroup = selectedGroup
        ? String(item.groupId) === selectedGroup
        : true;
      const matchDay =
        selectedDay !== "" ? String(item.dayOfWeek) === selectedDay : true;
      const matchSearch = q
        ? item.subjectGroup?.subject?.name?.toLowerCase().includes(q) ||
          teacher?.name?.toLowerCase().includes(q) ||
          getTeacherPhone(teacher).toLowerCase().includes(q) ||
          item.room?.toLowerCase().includes(q)
        : true;

      return matchGroup && matchDay && matchSearch;
    });
  }, [routines, selectedGroup, selectedDay, search]);

  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleCreate = async () => {
    if (
      !form.groupId ||
      !form.subjectId ||
      !form.teacherId ||
      !form.dayOfWeek ||
      !form.period
    ) {
      toast.error("অনুগ্রহ করে সব আবশ্যক তথ্য পূরণ করুন!");
      return;
    }

    if (!form.startTime || !form.endTime) {
      toast.error("শুরু ও শেষের সময় নির্বাচন করুন!");
      return;
    }

    if (form.startTime >= form.endTime) {
      toast.error("শেষের সময় অবশ্যই শুরুর সময়ের পরে হতে হবে!");
      return;
    }

    setLoading(true);
    try {
      const res = await createRoutine({
        groupId: Number(form.groupId),
        subjectId: Number(form.subjectId),
        teacherId: Number(form.teacherId),
        dayOfWeek: Number(form.dayOfWeek),
        period: Number(form.period),
        room: form.room.trim() || undefined,
        startTime: form.startTime,
        endTime: form.endTime,
      });

      if (res?.success === false) {
        toast.error(res.message || "রুটিন তৈরি করা যায়নি!");
        return;
      }

      toast.success("রুটিন সফলভাবে তৈরি হয়েছে!");

      const createdGroupId = form.groupId;
      closeModal();

      // তালিকা রিফ্রেশ
      const updated = await getRoutineByGroup(createdGroupId);
      const newData = updated?.data || updated || [];

      if (Array.isArray(newData)) {
        setRoutines((prev) => {
          const others = prev.filter(
            (r) => String(r.groupId) !== createdGroupId
          );
          return [...others, ...newData];
        });
      }
    } catch (err) {
      console.error("createRoutine error:", err);
      toast.error("কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ফিল্টার */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="বিষয়, শিক্ষক, ফোন, রুম খুঁজুন..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">সব গ্রুপ</option>
            {groups.map((g: any) => (
              <option key={g.id} value={g.id}>
                {getGroupLabel(g)}
              </option>
            ))}
          </select>

          <select
            value={selectedDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">সব দিন</option>
            {DAYS.map((day, idx) => (
              <option key={day} value={idx}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          রুটিন যোগ করুন
        </button>
      </div>

      {/* পরিসংখ্যান */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">মোট স্লট</p>
              <p className="text-xl font-semibold text-slate-900">
                {routines.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">গ্রুপ</p>
              <p className="text-xl font-semibold text-slate-900">
                {groups.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5">
              <Filter className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">ফিল্টার করা</p>
              <p className="text-xl font-semibold text-slate-900">
                {filtered.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5">
              <BookOpen className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">পৃষ্ঠা</p>
              <p className="text-xl font-semibold text-slate-900">
                {page}/{totalPages}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* টেবিল */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">দিন</th>
                <th className="px-5 py-4 font-medium">পিরিয়ড</th>
                <th className="px-5 py-4 font-medium">বিষয়</th>
                <th className="px-5 py-4 font-medium">শিক্ষক</th>
                <th className="px-5 py-4 font-medium">গ্রুপ</th>
                <th className="px-5 py-4 font-medium">রুম</th>
                <th className="px-5 py-4 font-medium">সময়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-14 text-center text-slate-400"
                  >
                    কোনো রুটিন পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                paginated.map((item: any) => {
                  const teacher = item.subjectGroup?.teacher;
                  const teacherPhone = getTeacherPhone(teacher);

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {DAYS[item.dayOfWeek] ?? item.dayOfWeek}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-700">
                          {item.period}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {item.subjectGroup?.subject?.name || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {teacher?.name ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-slate-700">
                              {teacher.name}
                            </span>
                            {teacherPhone && (
                              <a
                                href={`tel:${teacherPhone}`}
                                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600"
                              >
                                <Phone className="h-3 w-3" />
                                {teacherPhone}
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {getGroupLabel(
                          groupMap.get(String(item.groupId)) ?? item.group
                        ) || `Group ${item.groupId}`}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {item.room || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {item.startTime && item.endTime
                          ? `${item.startTime} - ${item.endTime}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* পেজিনেশন */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-500">
              মোট {filtered.length} টির মধ্যে {(page - 1) * limit + 1} -{" "}
              {Math.min(page * limit, filtered.length)} দেখানো হচ্ছে
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* রুটিন তৈরির মডাল */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                নতুন রুটিন যোগ করুন
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* গ্রুপ */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  গ্রুপ *
                </label>
                <select
                  value={form.groupId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      groupId: e.target.value,
                      subjectId: "",
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">গ্রুপ নির্বাচন করুন</option>
                  {groups.map((g: any) => (
                    <option key={g.id} value={g.id}>
                      {getGroupLabel(g)}
                    </option>
                  ))}
                </select>
              </div>

              {/* বিষয় (নির্বাচিত গ্রুপের সেমিস্টারের) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  বিষয় *
                </label>
                <select
                  value={form.subjectId}
                  onChange={(e) =>
                    setForm({ ...form, subjectId: e.target.value })
                  }
                  disabled={!form.groupId || loadingSubjects}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {!form.groupId
                      ? "আগে একটি গ্রুপ নির্বাচন করুন"
                      : loadingSubjects
                        ? "বিষয় লোড হচ্ছে..."
                        : subjectOptions.length === 0
                          ? "এই সেমিস্টারে কোনো বিষয় পাওয়া যায়নি"
                          : "বিষয় নির্বাচন করুন"}
                  </option>

                  {subjectOptions.map((book: any, idx: number) => (
                    <option key={`${book.id}-${idx}`} value={book.id}>
                      {getBookLabel(book)}
                    </option>
                  ))}
                </select>
              </div>

              {/* শিক্ষক */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  শিক্ষক *
                </label>
                <select
                  value={form.teacherId}
                  onChange={(e) =>
                    setForm({ ...form, teacherId: e.target.value })
                  }
                  disabled={loadingTeachers}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {loadingTeachers
                      ? "শিক্ষক লোড হচ্ছে..."
                      : teachers.length === 0
                        ? "কোনো শিক্ষক পাওয়া যায়নি"
                        : "শিক্ষক নির্বাচন করুন"}
                  </option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {getTeacherPhone(t) ? ` (${getTeacherPhone(t)})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* দিন + পিরিয়ড */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    দিন *
                  </label>
                  <select
                    value={form.dayOfWeek}
                    onChange={(e) =>
                      setForm({ ...form, dayOfWeek: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  >
                    {DAYS.map((day, idx) => (
                      <option key={day} value={idx}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    পিরিয়ড *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.period}
                    onChange={(e) =>
                      setForm({ ...form, period: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* রুম */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  রুম
                </label>
                <input
                  type="text"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  placeholder="যেমন: ২০১"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* সময় */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    শুরুর সময় *
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    শেষের সময় *
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                বাতিল
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "তৈরি হচ্ছে..." : "রুটিন তৈরি করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}