"use client";

import { INotice, NoticePriority } from "@/types/notice.interface";
import { useMemo, useState } from "react";
import { ChevronDown, Paperclip, Pin, Search } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Priority Styles
// ─────────────────────────────────────────────────────────────

const PRIORITY_STYLE: Record<
  NoticePriority,
  { color: string; soft: string; label: string }
> = {
  URGENT: {
    color: "#B3261E",
    soft: "bg-rose-50 text-rose-800 ring-rose-200",
    label: "Urgent",
  },
  HIGH: {
    color: "#c9a24b",
    soft: "bg-amber-50 text-amber-900 ring-amber-200",
    label: "High",
  },
  MEDIUM: {
    color: "#0f766e",
    soft: "bg-teal-50 text-teal-800 ring-teal-200",
    label: "Medium",
  },
  LOW: {
    color: "#64748b",
    soft: "bg-slate-100 text-slate-600 ring-slate-200",
    label: "Low",
  },
};

// ─────────────────────────────────────────────────────────────
// Date Formatter
// ─────────────────────────────────────────────────────────────

function formatDate(date?: string | null): string {
  if (!date) return "";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return parsedDate.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────
// Notice Board Client
// ─────────────────────────────────────────────────────────────

interface NoticeBoardClientProps {
  initialNotices: INotice[];
  failed: boolean;
}

export default function NoticeBoardClient({
  initialNotices,
  failed,
}: NoticeBoardClientProps) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { pinned, rest } = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = q
      ? initialNotices.filter(
          (notice) =>
            notice.title.toLowerCase().includes(q) ||
            notice.description.toLowerCase().includes(q)
        )
      : initialNotices;

    return {
      pinned: filtered.filter((notice) => notice.isPinned),
      rest: filtered.filter((notice) => !notice.isPinned),
    };
  }, [initialNotices, query]);

  const handleToggle = (id: number) => {
    setExpandedId((currentId) => (currentId === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 md:px-10 md:py-16">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b8923f]">
              Campus Board
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Notices
            </h1>
            <p className="mt-2 text-[15px] text-slate-600">
              Announcements from the institute.
            </p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notices"
              aria-label="Search notices"
              className="w-full rounded-xl border border-[#e8e0d0] bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#c9a24b] focus:ring-2 focus:ring-[#c9a24b]/20 sm:w-64"
            />
          </div>
        </div>

        {/* Failed */}
        {failed && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-sm text-rose-800">
            Notices did not load. Refresh the page to try again.
          </div>
        )}

        {/* Empty */}
        {!failed && pinned.length === 0 && rest.length === 0 && (
          <div className="rounded-2xl border border-[#e8e0d0] bg-white px-6 py-14 text-center shadow-sm">
            <p className="font-semibold text-slate-800">
              {query.trim()
                ? "No notices match your search."
                : "There are no notices right now."}
            </p>
          </div>
        )}

        {/* Pinned */}
        {!failed && pinned.length > 0 && (
          <div className="mb-8 space-y-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b8923f]">
              <Pin className="h-3.5 w-3.5" />
              Pinned
            </p>
            {pinned.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                pinned
                expanded={expandedId === notice.id}
                onToggle={() => handleToggle(notice.id)}
              />
            ))}
          </div>
        )}

        {/* Main list */}
        {!failed && rest.length > 0 && (
          <div className="space-y-3">
            {pinned.length > 0 && (
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                All notices
              </p>
            )}
            {rest.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                expanded={expandedId === notice.id}
                onToggle={() => handleToggle(notice.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Notice Card
// ─────────────────────────────────────────────────────────────

interface NoticeCardProps {
  notice: INotice;
  pinned?: boolean;
  expanded: boolean;
  onToggle: () => void;
}

function NoticeCard({
  notice,
  pinned = false,
  expanded,
  onToggle,
}: NoticeCardProps) {
  const style = PRIORITY_STYLE[notice.priority] ?? PRIORITY_STYLE.MEDIUM;
  const noticeDate = formatDate(notice.noticeDate);
  const expiryDate = formatDate(notice.expiryDate);
  const hasLongDescription = notice.description.length > 120;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-[0_4px_20px_rgba(6,78,59,0.05)] transition ${
        pinned
          ? "border-[#c9a24b]/40 ring-1 ring-[#c9a24b]/15"
          : "border-[#e8e0d0] hover:border-[#c9a24b]/30"
      }`}
    >
      {pinned && (
        <div className="h-0.5 w-full bg-gradient-to-r from-[#c9a24b] via-[#e8d5a3] to-[#c9a24b]" />
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <span
          className="mt-1 min-h-[2.5rem] w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: style.color }}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-bold text-slate-900">
              {notice.title}
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${style.soft}`}
            >
              {style.label}
            </span>
            {pinned && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900 ring-1 ring-inset ring-amber-200">
                <Pin className="h-3 w-3" />
                Pinned
              </span>
            )}
          </div>

          {(noticeDate || expiryDate) && (
            <p className="mt-1 text-xs text-slate-400">
              {noticeDate}
              {expiryDate && <> · expires {expiryDate}</>}
            </p>
          )}

          <p
            className={`mt-2 text-sm leading-relaxed text-slate-600 ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {notice.description}
          </p>

          {hasLongDescription && (
            <span className="mt-1.5 inline-block text-xs font-semibold text-[#b8923f]">
              {expanded ? "Show less" : "Read more"}
            </span>
          )}

          {notice.attachmentUrl && (
            <a
              href={notice.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#e8e0d0] bg-[#f7f3ea] px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-[#c9a24b]/40 hover:bg-[#f0ebe3]"
            >
              <Paperclip className="h-3.5 w-3.5 text-[#064e3b]" />
              View attachment
            </a>
          )}
        </div>

        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}