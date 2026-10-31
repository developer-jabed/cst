"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { deletePractical } from "@/service/Practical/practical.service";

interface DeleteModalProps {
  open: boolean;
  practicalId: number | null;
  practicalTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteModal({
  open,
  practicalId,
  practicalTitle,
  onClose,
  onSuccess,
}: DeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  if (!open || practicalId === null) return null;

  const handleDelete = async () => {
    setLoading(true);
    const res = await deletePractical(practicalId);
    setLoading(false);
    if (res.success) {
      toast.success("Practical deleted.");
      onSuccess();
      onClose();
    } else {
      toast.error(res.message ?? "Failed to delete.");
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="theme-card w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-pink-400" />

        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-foreground">
            Delete Practical
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 ring-1 ring-rose-200">
            <AlertTriangle className="h-7 w-7 text-rose-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{practicalTitle}&quot;
            </span>
            ? This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}