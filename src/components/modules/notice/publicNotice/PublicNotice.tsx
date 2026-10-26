"use client";

import { INotice, NoticePriority } from "@/types/notice.interface";
import { useMemo, useState } from "react";



// ─────────────────────────────────────────────────────────────
// Priority Styles
// ─────────────────────────────────────────────────────────────

const PRIORITY_STYLE: Record<
  NoticePriority,
  {
    color: string;
    label: string;
  }
> = {
  URGENT: {
    color: "#B3261E",
    label: "Urgent",
  },

  HIGH: {
    color: "#B8862E",
    label: "High",
  },

  MEDIUM: {
    color: "#5B7FA6",
    label: "Medium",
  },

  LOW: {
    color: "#5C6672",
    label: "Low",
  },
};

// ─────────────────────────────────────────────────────────────
// Date Formatter
// ─────────────────────────────────────────────────────────────

function formatDate(date?: string | null): string {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-US", {
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

  const [expandedId, setExpandedId] = useState<number | null>(
    null,
  );

  // ─────────────────────────────────────────────────────────
  // Filter Notices
  // ─────────────────────────────────────────────────────────

  const { pinned, rest } = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = q
      ? initialNotices.filter((notice) => {
          return (
            notice.title.toLowerCase().includes(q) ||
            notice.description.toLowerCase().includes(q)
          );
        })
      : initialNotices;

    return {
      pinned: filtered.filter((notice) => notice.isPinned),

      rest: filtered.filter((notice) => !notice.isPinned),
    };
  }, [initialNotices, query]);

  // ─────────────────────────────────────────────────────────
  // Toggle Notice
  // ─────────────────────────────────────────────────────────

  const handleToggle = (id: number) => {
    setExpandedId((currentId) =>
      currentId === id ? null : id,
    );
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#EAECE6]">
      <div className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
        {/* Header */}

        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              className="text-4xl leading-tight text-[#16233F]"
              style={{
                fontFamily:
                  "'Source Serif 4', Georgia, serif",
              }}
            >
              Notices
            </h1>

            <p className="mt-2 text-[15px] text-[#5C6672]">
              Announcements from the institute.
            </p>
          </div>

          {/* Search */}

          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3ABB3]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search notices"
              aria-label="Search notices"
              className="w-full rounded-lg border border-[#D6DAD2] bg-white py-2.5 pl-9 pr-4 text-sm text-[#16233F] shadow-sm placeholder:text-[#A3ABB3] transition focus:border-[#B8862E] focus:outline-none focus:ring-2 focus:ring-[#B8862E]/20 sm:w-64"
            />
          </div>
        </div>

        {/* Failed */}

        {failed && (
          <div className="rounded-xl border border-[#E4C9C9] bg-[#FBF2F2] p-8 text-sm text-[#8A4B4B]">
            Notices did not load. Refresh the page to try
            again.
          </div>
        )}

        {/* Empty */}

        {!failed &&
          pinned.length === 0 &&
          rest.length === 0 && (
            <div className="rounded-xl border border-[#D6DAD2] bg-white p-8 text-sm text-[#5C6672]">
              {query.trim()
                ? "No notices match your search."
                : "There are no notices right now."}
            </div>
          )}

        {/* Pinned Notices */}

        {!failed && pinned.length > 0 && (
          <div className="mb-8 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[#B8862E]">
              Pinned
            </p>

            {pinned.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                pinned
                expanded={expandedId === notice.id}
                onToggle={() =>
                  handleToggle(notice.id)
                }
              />
            ))}
          </div>
        )}

        {/* Main Notices */}

        {!failed && rest.length > 0 && (
          <div className="space-y-3">
            {pinned.length > 0 && (
              <p className="text-xs font-medium uppercase tracking-wide text-[#8A93A0]">
                All notices
              </p>
            )}

            {rest.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                expanded={expandedId === notice.id}
                onToggle={() =>
                  handleToggle(notice.id)
                }
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
  const style =
    PRIORITY_STYLE[notice.priority] ??
    PRIORITY_STYLE.MEDIUM;

  const noticeDate = formatDate(notice.noticeDate);

  const expiryDate = formatDate(notice.expiryDate);

  const hasLongDescription =
    notice.description.length > 120;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-[0_4px_24px_rgba(22,35,63,0.06)] transition ${
        pinned
          ? "border-[#E9D6AE]"
          : "border-[#DFE3D9]"
      }`}
    >
      {/* Main clickable area */}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start gap-4 px-6 py-5 text-left"
      >
        {/* Priority indicator */}

        <span
          className="mt-1 min-h-[2.5rem] w-1.5 shrink-0 rounded-full"
          style={{
            backgroundColor: style.color,
          }}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          {/* Title + Priority */}

          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[#16233F]">
              {notice.title}
            </h3>

            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: `${style.color}1A`,
                color: style.color,
              }}
            >
              {style.label}
            </span>

            {/* Pinned Icon */}

            {pinned && (
              <svg
                className="h-3.5 w-3.5 text-[#B8862E]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-label="Pinned notice"
              >
                <path d="M16 3l5 5-5 5v3l-4-4-6 6-1-1 6-6-4-4h3l5-5z" />
              </svg>
            )}
          </div>

          {/* Dates */}

          {(noticeDate || expiryDate) && (
            <p className="mt-1 text-xs text-[#8A93A0]">
              {noticeDate}

              {expiryDate && (
                <>
                  {" "}
                  · expires {expiryDate}
                </>
              )}
            </p>
          )}

          {/* Description */}

          <p
            className={`mt-2 text-sm text-[#4B5768] ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {notice.description}
          </p>

          {/* Read More */}

          {hasLongDescription && (
            <span className="mt-1 inline-block text-xs font-medium text-[#B8862E]">
              {expanded ? "Show less" : "Read more"}
            </span>
          )}

          {/* Attachment */}

          {notice.attachmentUrl && (
            <a
              href={notice.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) =>
                event.stopPropagation()
              }
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#F1F2ED] px-3 py-1.5 text-xs font-medium text-[#16233F] transition hover:bg-[#E7E9E1]"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                />
              </svg>

              View attachment
            </a>
          )}
        </div>

        {/* Expand Icon */}

        <svg
          className={`mt-1 h-4 w-4 shrink-0 text-[#8A93A0] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
}