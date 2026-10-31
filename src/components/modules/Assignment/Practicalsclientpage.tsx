/* eslint-disable @typescript-eslint/no-explicit-any */
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
  {
    key: "ALL",
    label: "All",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  {
    key: "PRACTICAL",
    label: "Practicals",
    icon: <FlaskConical className="h-4 w-4" />,
  },
  {
    key: "JOB",
    label: "Jobs",
    icon: <Briefcase className="h-4 w-4" />,
  },
];

interface PracticalsClientPageProps {
  subjectGroupId: number;
  students: { id: number; name: string; rollNo?: string }[];
}

export function PracticalsClientPage({
  subjectGroupId,
  students,
}: PracticalsClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modalParam = searchParams.get("modal");

  const [tab, setTab] = useState<Tab>("ALL");
  const [practicals, setPracticals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string>("");
  const [submissionsPractical, setSubmissionsPractical] = useState<any | null>(
    null
  );

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

  // Shared loader used by modals (onSuccess) — not called from the effect
  const fetchPracticals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPracticals({
        subjectGroupId,
        ...(tab !== "ALL" ? { type: tab as any } : {}),
        limit: 100,
      });
      setPracticals(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [subjectGroupId, tab]);

  // Effect owns its own fetch so setState only runs inside the async callback
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getPracticals({
          subjectGroupId,
          ...(tab !== "ALL" ? { type: tab as any } : {}),
          limit: 100,
        });
        if (!cancelled) {
          setPracticals(res.data ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setPracticals([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [subjectGroupId, tab]);

  const practicalCount = practicals.filter((p) => p.type === "PRACTICAL").length;
  const jobCount = practicals.filter((p) => p.type === "JOB").length;

  return (
    <>
      {/* Tab bar + stats */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl bg-secondary/50 p-1 ring-1 ring-border">
          {TABS.map(({ key, label, icon }) => {
            const count =
              key === "ALL"
                ? practicals.length
                : key === "PRACTICAL"
                  ? practicalCount
                  : jobCount;

            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  tab === key
                    ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {icon}
                {label}
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    tab === key
                      ? "bg-white/20 text-primary-foreground"
                      : "bg-border text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 text-sm">
          <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
            {practicalCount} Practical{practicalCount !== 1 ? "s" : ""}
          </span>
          <span className="rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
            {jobCount} Job{jobCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : practicals.length === 0 ? (
        <div className="theme-card flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-primary/50 ring-1 ring-gold-soft">
            <SearchX className="h-7 w-7" />
          </div>
          <p className="text-base font-bold text-foreground">No tasks found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first{" "}
            {tab === "ALL" ? "practical or job" : tab.toLowerCase()} to get
            started.
          </p>
          <button
            onClick={openCreate}
            className="mt-5 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:shadow-lg hover:shadow-primary/40 active:scale-95"
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
              onDelete={(id) => {
                setDeleteId(id);
                setDeleteTitle(p.title);
              }}
              onSubmissions={(data) => setSubmissionsPractical(data)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-emerald-600 px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:shadow-xl hover:shadow-primary/40 active:scale-95 sm:hidden"
      >
        + New
      </button>
    </>
  );
}