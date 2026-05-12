"use client";

import { useEffect, useRef, useState } from "react";
import { X, FlaskConical, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPracticalDirect, ICreatePracticalPayload, PracticalType, updatePractical } from "@/service/Practical/practical.service";

interface PracticalFormModalProps {
  open: boolean;
  onClose: () => void;
  subjectGroupId: number;
  onSuccess: () => void;
  initialData?: {
    id: number;
    title: string;
    totalMarks: number;
    type: PracticalType;
    givenDate?: string | null;
    submissionDeadline?: string | null;
  } | null;
}

const toInputDate = (d?: string | null) => {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
};

export function PracticalFormModal({
  open,
  onClose,
  subjectGroupId,
  onSuccess,
  initialData,
}: PracticalFormModalProps) {
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<PracticalType>(
    initialData?.type ?? "PRACTICAL",
  );
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [totalMarks, setTotalMarks] = useState(
    String(initialData?.totalMarks ?? ""),
  );
  const [givenDate, setGivenDate] = useState(
    toInputDate(initialData?.givenDate),
  );
  const [submissionDeadline, setSubmissionDeadline] = useState(
    toInputDate(initialData?.submissionDeadline),
  );

  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset form on open/initialData change
  useEffect(() => {
    setType(initialData?.type ?? "PRACTICAL");
    setTitle(initialData?.title ?? "");
    setTotalMarks(String(initialData?.totalMarks ?? ""));
    setGivenDate(toInputDate(initialData?.givenDate));
    setSubmissionDeadline(toInputDate(initialData?.submissionDeadline));
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !totalMarks) return;
    setLoading(true);

    try {
      let res;
      if (isEdit && initialData) {
        res = await updatePractical(initialData.id, {
          title,
          totalMarks: Number(totalMarks),
          type,
          givenDate: givenDate || undefined,
          submissionDeadline: submissionDeadline || undefined,
        });
      } else {
        const payload: ICreatePracticalPayload = {
          subjectGroupId,
          title,
          totalMarks: Number(totalMarks),
          type,
          givenDate: givenDate || undefined,
          submissionDeadline: submissionDeadline || undefined,
        };
        res = await createPracticalDirect(payload);
      }

      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onClose();
      } else {
        toast.error(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? "Edit Practical / Job" : "Create Practical / Job"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* Type selector */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["PRACTICAL", "JOB"] as PracticalType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                    type === t
                      ? t === "PRACTICAL"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {t === "PRACTICAL" ? (
                    <FlaskConical className="h-4 w-4" />
                  ) : (
                    <Briefcase className="h-4 w-4" />
                  )}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lab 1 – Introduction to Circuits"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Total Marks */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Total Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              placeholder="e.g. 50"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Given Date
              </label>
              <input
                type="date"
                value={givenDate}
                onChange={(e) => setGivenDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Deadline
              </label>
              <input
                type="date"
                value={submissionDeadline}
                onChange={(e) => setSubmissionDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
