/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createRoutine, getRoutineByGroup } from "@/service/routine/routine.service";
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
  Clock,
  DoorOpen,
  type LucideIcon,
} from "lucide-react";

interface Props {
  initialRoutines: any[];
  groups: any[];
}

/* ───────────────────────── Constants & helpers ───────────────────────── */

// ইনডেক্স = dayOfWeek (0 = রবিবার ... 6 = শনিবার)
const DAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

// প্রতিটি দিনের আলাদা রঙ
const DAY_STYLES = [
  "bg-rose-50 text-rose-700 ring-rose-200",
  "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "bg-sky-50 text-sky-700 ring-sky-200",
  "bg-violet-50 text-violet-700 ring-violet-200",
  "bg-amber-50 text-amber-800 ring-gold-soft",
  "bg-teal-50 text-teal-700 ring-teal-200",
  "bg-pink-50 text-pink-700 ring-pink-200",
] as const;

const AVATAR_GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-amber-400 to-yellow-600",
  "from-teal-500 to-cyan-600",
  "from-lime-500 to-emerald-600",
  "from-sky-500 to-indigo-600",
  "from-rose-400 to-pink-600",
  "from-violet-500 to-purple-600",
] as const;

const LIMIT = 12;

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
type FormState = typeof EMPTY_FORM;

const LABEL = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-primary/70";
const CONTROL =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-200 " +
  "hover:border-gold-soft focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60";
const TH = "px-5 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70";

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
  const semesterValue = g.currentSemester?.name ?? g.currentSemester?.order;
  const semesterLabel =
    semesterValue !== undefined && semesterValue !== null && semesterValue !== ""
      ? `${toOrdinal(semesterValue)} Sem`
      : "";
  return [g.shift?.name, semesterLabel, g.name || `Group ${g.id}`].filter(Boolean).join(" - ");
};

// বিষয়ের লেবেল। ফিল্ডের নাম আলাদা হলে এখানে বদলান।
const getBookLabel = (book: any): string => {
  const name = book.subject?.name || book.subjectName || book.name || book.title || "নামহীন বিষয়";
  const code = book.subject?.code || book.code;
  return code ? `${name} (${code})` : name;
};

// শিক্ষকের ফোন নম্বর। ফিল্ডের নাম আলাদা হলে এখানে বদলান।
const getTeacherPhone = (teacher: any): string =>
  teacher?.phone ?? teacher?.mobile ?? teacher?.phoneNumber ?? teacher?.contactNumber ?? "";

const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

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

/* ───────────────────────────── Small components ───────────────────────────── */

const STAT_STYLES = {
  emerald: { icon: "from-emerald-50 to-emerald-100 text-emerald-600", bar: "from-emerald-400 to-emerald-600" },
  sky: { icon: "from-sky-50 to-sky-100 text-sky-600", bar: "from-sky-400 to-sky-600" },
  gold: { icon: "from-amber-50 to-yellow-100 text-amber-600", bar: "from-gold-soft to-gold" },
  violet: { icon: "from-violet-50 to-violet-100 text-violet-600", bar: "from-violet-400 to-violet-600" },
} as const;

const StatCard = memo(function StatCard({
  label, value, Icon, color, index,
}: { label: string; value: ReactNode; Icon: LucideIcon; color: keyof typeof STAT_STYLES; index: number }) {
  const s = STAT_STYLES[color];
  return (
    <div
      className="st-fade theme-card group relative flex items-center gap-3 overflow-hidden p-4"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${s.bar}`} />
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${s.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-black tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
});

const Chip = ({ className, children }: { className: string; children: ReactNode }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${className}`}>
    {children}
  </span>
);

const RoutineRow = memo(function RoutineRow({ item, index, groupLabel }: { item: any; index: number; groupLabel: string }) {
  const teacher = item.subjectGroup?.teacher;
  const phone = getTeacherPhone(teacher);
  const day = Number(item.dayOfWeek);

  return (
    <tr
      className="st-row group relative transition-colors duration-300 hover:bg-gradient-to-r hover:from-secondary hover:via-accent/40 hover:to-transparent"
      style={{ ["--i" as string]: index }}
    >
      <td className="relative px-5 py-3.5">
        <span className="absolute inset-y-2 left-0 w-[3px] origin-center scale-y-0 rounded-r bg-gradient-to-b from-gold-soft to-gold transition-transform duration-300 group-hover:scale-y-100" />
        <Chip className={DAY_STYLES[day] ?? DAY_STYLES[0]}>{DAYS[day] ?? item.dayOfWeek}</Chip>
      </td>
      <td className="px-5 py-3.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-600 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/30 transition-transform duration-200 group-hover:scale-110">
          {item.period}
        </span>
      </td>
      <td className="px-5 py-3.5">
        {item.subjectGroup?.subject?.name ? (
          <Chip className="bg-violet-50 text-violet-800 ring-violet-200">
            <BookOpen className="h-3 w-3" />
            {item.subjectGroup.subject.name}
          </Chip>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-5 py-3.5">
        {teacher?.name ? (
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ring-2 ring-gold-soft/70 transition-transform duration-300 group-hover:scale-110 ${
                AVATAR_GRADIENTS[Number(teacher.id ?? 0) % AVATAR_GRADIENTS.length]
              }`}
            >
              <span className="text-[11px] font-bold text-white">{getInitials(teacher.name)}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground transition-colors group-hover:text-primary">{teacher.name}</span>
              {phone && (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary">
                  <Phone className="h-3 w-3" />
                  {phone}
                </a>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <Chip className="bg-amber-50 text-amber-800 ring-gold-soft">{groupLabel}</Chip>
      </td>
      <td className="px-5 py-3.5">
        {item.room ? (
          <Chip className="bg-sky-50 text-sky-700 ring-sky-200">
            <DoorOpen className="h-3 w-3" />
            {item.room}
          </Chip>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-5 py-3.5">
        {item.startTime && item.endTime ? (
          <Chip className="bg-emerald-50 text-emerald-700 ring-emerald-200 tabular-nums">
            <Clock className="h-3 w-3" />
            {item.startTime} - {item.endTime}
          </Chip>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
});

function Pagination({ page, totalPages, total, onChange }: { page: number; totalPages: number; total: number; onChange: (p: number) => void }) {
  const items = useMemo(() => getPageItems(page, totalPages), [page, totalPages]);
  const arrow =
    "flex h-9 w-9 items-center justify-center rounded-xl text-primary/70 transition-all duration-200 hover:bg-secondary hover:text-primary active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-gradient-to-r from-secondary/60 via-transparent to-secondary/60 px-5 py-3.5 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        মোট <span className="font-bold text-primary">{total}</span> টির মধ্যে{" "}
        <span className="font-bold text-primary">
          {(page - 1) * LIMIT + 1} - {Math.min(page * LIMIT, total)}
        </span>{" "}
        দেখানো হচ্ছে
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1} className={arrow} aria-label="আগের পৃষ্ঠা">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {items.map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className="px-1 text-xs text-gold">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`h-9 min-w-9 rounded-xl px-2 text-xs font-bold transition-all duration-200 active:scale-90 ${
                p === page
                  ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30"
                  : "text-foreground/60 hover:bg-secondary hover:text-primary"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={arrow} aria-label="পরের পৃষ্ঠা">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}

/* ───────────────────────────── Main component ───────────────────────────── */

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

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const setField = useCallback(
    <K extends keyof FormState>(key: K) =>
      (e: { target: { value: string } }) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    []
  );

  const groupMap = useMemo(() => new Map<string, any>(groups.map((g: any) => [String(g.id), g])), [groups]);

  const modalGroup = form.groupId ? groupMap.get(form.groupId) : undefined;
  const departmentId = modalGroup?.departmentId;
  const currentSemesterId = modalGroup?.currentSemesterId;

  // শিক্ষকের তালিকা একবারই লোড হবে
  useEffect(() => {
    let cancelled = false;
    (async () => {
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
    })();
    return () => { cancelled = true; };
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
    (async () => {
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
    })();
    return () => { cancelled = true; };
  }, [departmentId]);

  // শুধু নির্বাচিত গ্রুপের বর্তমান সেমিস্টারের বিষয়
  const subjectOptions = useMemo(() => {
    if (currentSemesterId === undefined || currentSemesterId === null) return [];
    const section = semesterData.find((s: any) => String(s.semester?.id) === String(currentSemesterId));
    return Array.isArray(section?.books) ? section.books : [];
  }, [semesterData, currentSemesterId]);

  // ফিল্টার + পেজিনেশন
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return routines.filter((item) => {
      const teacher = item.subjectGroup?.teacher;
      if (selectedGroup && String(item.groupId) !== selectedGroup) return false;
      if (selectedDay !== "" && String(item.dayOfWeek) !== selectedDay) return false;
      if (!q) return true;
      return (
        item.subjectGroup?.subject?.name?.toLowerCase().includes(q) ||
        teacher?.name?.toLowerCase().includes(q) ||
        getTeacherPhone(teacher).toLowerCase().includes(q) ||
        item.room?.toLowerCase().includes(q)
      );
    });
  }, [routines, selectedGroup, selectedDay, search]);

  const totalPages = Math.ceil(filtered.length / LIMIT) || 1;
  const paginated = useMemo(() => filtered.slice((page - 1) * LIMIT, page * LIMIT), [filtered, page]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
  }, []);

  // Escape চাপলে মডাল বন্ধ
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, loading, closeModal]);

  const handleCreate = async () => {
    if (!form.groupId || !form.subjectId || !form.teacherId || !form.dayOfWeek || !form.period) {
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
        setRoutines((prev) => [...prev.filter((r) => String(r.groupId) !== createdGroupId), ...newData]);
      }
    } catch (err) {
      console.error("createRoutine error:", err);
      toast.error("কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন!");
    } finally {
      setLoading(false);
    }
  };

  // ফিল্টার বদলালে প্রথম পৃষ্ঠায় ফিরে যাওয়া
  const onFilter = (setter: (v: string) => void) => (e: { target: { value: string } }) => {
    setter(e.target.value);
    setPage(1);
  };

  const stats = [
    { label: "মোট স্লট", value: routines.length, Icon: Calendar, color: "emerald" as const },
    { label: "গ্রুপ", value: groups.length, Icon: Users, color: "sky" as const },
    { label: "ফিল্টার করা", value: filtered.length, Icon: Filter, color: "gold" as const },
    { label: "পৃষ্ঠা", value: `${page}/${totalPages}`, Icon: BookOpen, color: "violet" as const },
  ];

  const filterSelect = `${CONTROL} sm:w-auto`;

  return (
    <div className="space-y-6">
      {/* ফিল্টার */}
      <div className="st-fade theme-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
            <input
              type="text"
              placeholder="বিষয়, শিক্ষক, ফোন, রুম খুঁজুন..."
              value={search}
              onChange={onFilter(setSearch)}
              className={`${CONTROL} pl-10`}
            />
          </div>

          <select value={selectedGroup} onChange={onFilter(setSelectedGroup)} className={filterSelect}>
            <option value="">সব গ্রুপ</option>
            {groups.map((g: any) => (
              <option key={g.id} value={g.id}>{getGroupLabel(g)}</option>
            ))}
          </select>

          <select value={selectedDay} onChange={onFilter(setSelectedDay)} className={filterSelect}>
            <option value="">সব দিন</option>
            {DAYS.map((day, idx) => (
              <option key={day} value={idx}>{day}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-gold/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          রুটিন যোগ করুন
        </button>
      </div>

      {/* পরিসংখ্যান */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* টেবিল */}
      <div className="st-fade overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]" style={{ animationDelay: "120ms" }}>
        <div className="h-1 bg-gradient-to-r from-primary via-emerald-500 to-gold" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-gradient-to-r from-secondary via-accent/60 to-secondary">
              <tr>
                {["দিন", "পিরিয়ড", "বিষয়", "শিক্ষক", "গ্রুপ", "রুম", "সময়"].map((h) => (
                  <th key={h} className={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent ring-1 ring-gold-soft">
                      <Calendar className="h-6 w-6 text-primary/60" />
                    </div>
                    <p className="font-semibold text-foreground">কোনো রুটিন পাওয়া যায়নি</p>
                  </td>
                </tr>
              ) : (
                paginated.map((item: any, i: number) => (
                  <RoutineRow
                    key={item.id}
                    item={item}
                    index={i}
                    groupLabel={getGroupLabel(groupMap.get(String(item.groupId)) ?? item.group) || `Group ${item.groupId}`}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} total={filtered.length} onChange={setPage} />}
      </div>

      {/* রুটিন তৈরির মডাল */}
      {isModalOpen && (
        <div
          className="st-backdrop fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-md"
          onClick={() => !loading && closeModal()}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="st-modal max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl"
          >
            <div className="h-1 bg-gradient-to-r from-primary via-emerald-500 to-gold" />
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-secondary via-card to-secondary px-6 py-4">
              <h2 className="text-lg font-bold text-foreground">নতুন রুটিন যোগ করুন</h2>
              <button
                onClick={closeModal}
                aria-label="বন্ধ করুন"
                className="rounded-xl p-2 text-muted-foreground transition-all duration-200 hover:rotate-90 hover:bg-rose-50 hover:text-rose-500 active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <Field label="গ্রুপ *">
                <select
                  value={form.groupId}
                  onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value, subjectId: "" }))}
                  className={CONTROL}
                >
                  <option value="">গ্রুপ নির্বাচন করুন</option>
                  {groups.map((g: any) => (
                    <option key={g.id} value={g.id}>{getGroupLabel(g)}</option>
                  ))}
                </select>
              </Field>

              <Field label="বিষয় *">
                <select
                  value={form.subjectId}
                  onChange={setField("subjectId")}
                  disabled={!form.groupId || loadingSubjects}
                  className={CONTROL}
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
                    <option key={`${book.id}-${idx}`} value={book.id}>{getBookLabel(book)}</option>
                  ))}
                </select>
              </Field>

              <Field label="শিক্ষক *">
                <select value={form.teacherId} onChange={setField("teacherId")} disabled={loadingTeachers} className={CONTROL}>
                  <option value="">
                    {loadingTeachers ? "শিক্ষক লোড হচ্ছে..." : teachers.length === 0 ? "কোনো শিক্ষক পাওয়া যায়নি" : "শিক্ষক নির্বাচন করুন"}
                  </option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {getTeacherPhone(t) ? ` (${getTeacherPhone(t)})` : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="দিন *">
                  <select value={form.dayOfWeek} onChange={setField("dayOfWeek")} className={CONTROL}>
                    {DAYS.map((day, idx) => (
                      <option key={day} value={idx}>{day}</option>
                    ))}
                  </select>
                </Field>
                <Field label="পিরিয়ড *">
                  <input type="number" min={1} max={10} value={form.period} onChange={setField("period")} className={CONTROL} />
                </Field>
              </div>

              <Field label="রুম">
                <input type="text" value={form.room} onChange={setField("room")} placeholder="যেমন: ২০১" className={CONTROL} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="শুরুর সময় *">
                  <input type="time" value={form.startTime} onChange={setField("startTime")} className={CONTROL} />
                </Field>
                <Field label="শেষের সময় *">
                  <input type="time" value={form.endTime} onChange={setField("endTime")} className={CONTROL} />
                </Field>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button
                onClick={closeModal}
                disabled={loading}
                className="rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-sm font-semibold text-foreground/70 transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-50"
              >
                বাতিল
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    তৈরি হচ্ছে...
                  </>
                ) : (
                  "রুটিন তৈরি করুন"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}