"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FlaskConical,
  Briefcase,
  LayoutGrid,
  Loader2,
  SearchX,
} from "lucide-react";
import { getPracticals } from "@/service/Practical/practical.service";
import { DeleteModal } from "./Deletemodal";
import { SubmissionsModal } from "./Submissionsmodal";
import { PracticalFormModal } from "./Practicalformmodal";
import { PracticalCard } from "./Practicalcard";

type Tab = "ALL" | "PRACTICAL" | "JOB";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "ALL",       label: "All",        icon: <LayoutGrid  className="h-4 w-4" /> },
  { key: "PRACTICAL", label: "Practicals", icon: <FlaskConical className="h-4 w-4" /> },
  { key: "JOB",       label: "Jobs",       icon: <Briefcase   className="h-4 w-4" /> },
];

interface PracticalsClientPageProps {
  subjectGroupId: number;
  students: { id: number; name: string; rollNo?: string }[];
}

export function PracticalsClientPage({
  subjectGroupId,
  students,
}: PracticalsClientPageProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // ── Derive modal state from URL ──────────────────────────────────────────
  // ?modal=create  → open create form
  // ?modal=edit    → (optional future use)
  const modalParam = searchParams.get("modal"); // "create" | null

  const [tab, setTab]           = useState<Tab>("ALL");
  const [practicals, setPracticals] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  // Local modal state (edit, delete, submissions don't use the URL)
  const [editData,              setEditData]              = useState<any | null>(null);
  const [deleteId,              setDeleteId]              = useState<number | null>(null);
  const [deleteTitle,           setDeleteTitle]           = useState<string>("");
  const [submissionsPractical,  setSubmissionsPractical]  = useState<any | null>(null);

  // ── createOpen is driven by the URL param ────────────────────────────────
  const createOpen = modalParam === "create";

  const openCreate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "create");
    router.push(`?${params.toString()}`);
  };

  const closeCreate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`?${params.toString()}`);
  };

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchPracticals = useCallback(async () => {
    setLoading(true);
    const res = await getPracticals({
      subjectGroupId,
      ...(tab !== "ALL" ? { type: tab as any } : {}),
      limit: 100,
    });
    setPracticals(res.data ?? []);
    setLoading(false);
  }, [subjectGroupId, tab]);

  useEffect(() => {
    fetchPracticals();
  }, [fetchPracticals]);

  // ── Counts ───────────────────────────────────────────────────────────────
  const practicalCount = practicals.filter((p) => p.type === "PRACTICAL").length;
  const jobCount       = practicals.filter((p) => p.type === "JOB").length;

  return (
    <>
      {/* ── Tab bar + stats ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map(({ key, label, icon }) => {
            const count =
              key === "ALL"       ? practicals.length :
              key === "PRACTICAL" ? practicalCount    : jobCount;

            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === key
                    ? key === "PRACTICAL" ? "bg-blue-600 text-white shadow"
                    : key === "JOB"       ? "bg-violet-600 text-white shadow"
                    :                       "bg-slate-800 text-white shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {icon}
                {label}
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    tab === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 text-sm">
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-medium text-blue-700">
            {practicalCount} Practical{practicalCount !== 1 ? "s" : ""}
          </span>
          <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 font-medium text-violet-700">
            {jobCount} Job{jobCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
        </div>
      ) : practicals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20">
          <SearchX className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-base font-semibold text-slate-500">No tasks found</p>
          <p className="mt-1 text-sm text-slate-400">
            Create your first{" "}
            {tab === "ALL" ? "practical or job" : tab.toLowerCase()} to get started.
          </p>
          <button
            onClick={openCreate}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Create Now
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {practicals.map((p) => (
            <PracticalCard
              key={p.id}
              practical={p}
              onEdit={(data) => setEditData(data)}
              onDelete={(id) => { setDeleteId(id); setDeleteTitle(p.title); }}
              onSubmissions={(data) => setSubmissionsPractical(data)}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}

      {/* Create / Edit form — createOpen is URL-driven, editData is local state */}
      <PracticalFormModal
        open={createOpen || !!editData}
        onClose={() => {
          closeCreate();
          setEditData(null);
        }}
        subjectGroupId={subjectGroupId}
        initialData={editData}
        onSuccess={() => {
          closeCreate();
          setEditData(null);
          fetchPracticals();
        }}
      />

      <SubmissionsModal
        open={!!submissionsPractical}
        onClose={() => setSubmissionsPractical(null)}
        practical={submissionsPractical}
        students={students}
      />

      <DeleteModal
        open={deleteId !== null}
        practicalId={deleteId}
        practicalTitle={deleteTitle}
        onClose={() => setDeleteId(null)}
        onSuccess={fetchPracticals}
      />

      {/* Mobile floating button */}
      <button
        onClick={openCreate}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-blue-900/30 transition hover:from-blue-700 hover:to-indigo-700 sm:hidden"
      >
        + New
      </button>
    </>
  );
}