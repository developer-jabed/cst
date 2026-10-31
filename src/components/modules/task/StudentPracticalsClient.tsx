"use client";

import { useMemo, useState, useTransition } from "react";
import {
  FlaskConical,
  Briefcase,
  LayoutGrid,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  X,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";
import {
  createSubmissionDirect,
  updateSubmission,
  PracticalType,
} from "@/service/Practical/practical.service";

/* ───────────────────────── Types ───────────────────────── */

type Submission = {
  id?: number;
  studentId: number;
  submitted: boolean;
  obtainedMarks?: number | null;
};

type Practical = {
  id: number;
  title: string;
  totalMarks: number;
  type: PracticalType;
  givenDate?: string | null;
  submissionDeadline?: string | null;
  subjectGroup?: {
    subject?: { name?: string; code?: string; shortName?: string };
    group?: { name?: string };
  };
  submissions?: Submission[];
};

type Tab = "ALL" | "PRACTICAL" | "JOB";

interface Props {
  practicals: Practical[];
  studentId: number;
  studentName: string;
}

/* ───────────────────────── Helpers ───────────────────────── */

function formatDate(d?: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(deadline?: string | null, submitted?: boolean) {
  if (submitted || !deadline) return false;
  const d = new Date(deadline);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
}

function getMySubmission(p: Practical, studentId: number): Submission | null {
  const list = p.submissions ?? [];
  return list.find((s) => Number(s.studentId) === Number(studentId)) ?? null;
}

/* ───────────────────────── Component ───────────────────────── */

export default function StudentPracticalsClient({
  practicals,
  studentId,
  studentName,
}: Props) {
  const [tab, setTab] = useState<Tab>("ALL");
  const [active, setActive] = useState<Practical | null>(null);
  const [marks, setMarks] = useState("");
  const [submitted, setSubmitted] = useState(true);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (tab === "ALL") return practicals;
    return practicals.filter((p) => p.type === tab);
  }, [practicals, tab]);

  const stats = useMemo(() => {
    let submittedCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;
    practicals.forEach((p) => {
      const sub = getMySubmission(p, studentId);
      const done = Boolean(sub?.submitted);
      if (done) submittedCount++;
      else {
        pendingCount++;
        if (isOverdue(p.submissionDeadline, false)) overdueCount++;
      }
    });
    return { submittedCount, pendingCount, overdueCount, total: practicals.length };
  }, [practicals, studentId]);

  const openSubmit = (p: Practical) => {
    const sub = getMySubmission(p, studentId);
    setActive(p);
    setMarks(
      sub?.obtainedMarks != null ? String(sub.obtainedMarks) : ""
    );
    setSubmitted(sub?.submitted ?? true);
  };

  const closeModal = () => {
    if (isPending) return;
    setActive(null);
    setMarks("");
    setSubmitted(true);
  };

  const handleSubmit = () => {
    if (!active) return;

    if (marks !== "" && Number(marks) > active.totalMarks) {
      toast.error(`Marks cannot exceed ${active.totalMarks}`);
      return;
    }

    startTransition(async () => {
      const existing = getMySubmission(active, studentId);
      const payload = {
        obtainedMarks: marks !== "" ? Number(marks) : undefined,
        submitted,
      };

      let res;
      if (existing) {
        res = await updateSubmission(active.id, studentId, payload);
      } else {
        res = await createSubmissionDirect({
          practicalId: active.id,
          studentId,
          ...payload,
        });
      }

      if (res.success) {
        toast.success(res.message ?? "Submission saved!");
        // Optimistic local update
        const idx = practicals.findIndex((p) => p.id === active.id);
        if (idx >= 0) {
          const list = practicals[idx].submissions ?? [];
          const mine = list.findIndex(
            (s) => Number(s.studentId) === Number(studentId)
          );
          if (mine >= 0) {
            list[mine] = {
              ...list[mine],
              submitted,
              obtainedMarks: marks !== "" ? Number(marks) : null,
            };
          } else {
            list.push({
              studentId,
              submitted,
              obtainedMarks: marks !== "" ? Number(marks) : null,
            });
          }
          practicals[idx].submissions = [...list];
        }
        closeModal();
      } else {
        toast.error(res.message ?? "Failed to save submission");
      }
    });
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "ALL", label: "All", icon: <LayoutGrid className="h-4 w-4" /> },
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

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total Tasks",
            value: stats.total,
            accent: "from-primary to-emerald-500",
          },
          {
            label: "Submitted",
            value: stats.submittedCount,
            accent: "from-emerald-500 to-teal-400",
          },
          {
            label: "Pending",
            value: stats.pendingCount,
            accent: "from-amber-500 to-yellow-400",
          },
          {
            label: "Overdue",
            value: stats.overdueCount,
            accent: "from-rose-500 to-pink-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]"
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${s.accent}`} />
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums text-foreground">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex rounded-xl bg-secondary/50 p-1 ring-1 ring-border w-fit">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              tab === key
                ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="theme-card mt-6 py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-primary/50 ring-1 ring-gold-soft">
            <SearchX className="h-7 w-7" />
          </div>
          <p className="text-lg font-bold text-foreground">No tasks found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "ALL"
              ? "No practicals or jobs assigned to your group yet."
              : `No ${tab.toLowerCase()}s assigned yet.`}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => {
            const sub = getMySubmission(p, studentId);
            const done = Boolean(sub?.submitted);
            const overdue = isOverdue(p.submissionDeadline, done);
            const isPractical = p.type === "PRACTICAL";
            const subjectName =
              p.subjectGroup?.subject?.name ??
              p.subjectGroup?.subject?.shortName ??
              "Subject";

            return (
              <div
                key={p.id}
                className="st-row theme-card group relative flex flex-col overflow-hidden shadow-[var(--shadow-card)]"
                style={{ ["--i" as string]: i % 9 }}
              >
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${
                    isPractical
                      ? "from-sky-500 to-blue-400"
                      : "from-violet-500 to-purple-400"
                  }`}
                />

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          isPractical
                            ? "bg-sky-50 text-sky-600"
                            : "bg-violet-50 text-violet-600"
                        }`}
                      >
                        {isPractical ? (
                          <FlaskConical className="h-4 w-4" />
                        ) : (
                          <Briefcase className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                            isPractical
                              ? "bg-sky-50 text-sky-700 ring-sky-200"
                              : "bg-violet-50 text-violet-700 ring-violet-200"
                          }`}
                        >
                          {p.type}
                        </span>
                        <h3 className="mt-0.5 text-[15px] font-bold leading-tight text-foreground group-hover:text-primary">
                          {p.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">{subjectName}</p>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-border">
                      Total: {p.totalMarks} marks
                    </span>
                    {done && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Submitted
                        {sub?.obtainedMarks != null &&
                          ` · ${sub.obtainedMarks}/${p.totalMarks}`}
                      </span>
                    )}
                    {!done && overdue && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                        <AlertCircle className="h-3 w-3" />
                        Overdue
                      </span>
                    )}
                    {!done && !overdue && (
                      <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Given: {formatDate(p.givenDate)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock
                        className={`h-3.5 w-3.5 ${overdue ? "text-rose-500" : ""}`}
                      />
                      <span className={overdue ? "font-medium text-rose-600" : ""}>
                        Deadline: {formatDate(p.submissionDeadline)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openSubmit(p)}
                    className="group/btn mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 py-2.5 text-sm font-semibold text-primary transition-all hover:border-transparent hover:bg-gradient-to-br hover:from-primary hover:to-emerald-600 hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                    {done ? "Update Submission" : "Submit Task"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="theme-card w-full max-w-md overflow-hidden shadow-2xl">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />

            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {getMySubmission(active, studentId)
                    ? "Update Submission"
                    : "Submit Task"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {active.title} · {studentName}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-secondary/40 p-3 ring-1 ring-border text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total marks</span>
                  <span className="font-bold text-foreground">
                    {active.totalMarks}
                  </span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-medium text-foreground">
                    {formatDate(active.submissionDeadline)}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Obtained marks (optional)
                </label>
                <input
                  type="number"
                  min={0}
                  max={active.totalMarks}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder={`/ ${active.totalMarks}`}
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Leave empty if marks are not known yet. Teacher may update later.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={submitted}
                  onChange={(e) => setSubmitted(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm font-medium text-foreground">
                  Mark as submitted
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  disabled={isPending}
                  className="flex-1 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:shadow-lg disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}