"use client";

// app/events/EventsClient.tsx — CLIENT COMPONENT

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  FolderOpen,
  HardDrive,
  Loader2,
  MapPin,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { EVENT_TYPE_OPTIONS, EventType } from "@/types/event.interface";
import { createEvent, deleteEvent, toggleEventFeatured } from "@/service/event/event.service";

interface Event {
  id: number;
  title: string;
  description: string;
  photoUrl?: string;
  eventLinks?: string[];
  driveLink?: string;
  eventType?: EventType;
  location?: string;
  eventDate?: string;
  isFeatured?: boolean;
  createdAt?: string;
}

interface EventsClientProps {
  initialEvents: Event[];
  total: number;
  totalPages: number;
  currentPage: number;
  initialSearch: string;
  initialEventType: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_TYPE_COLORS: Record<string, string> = {
  SEMINAR: "bg-blue-50 text-blue-700 ring-blue-200",
  WORKSHOP: "bg-violet-50 text-violet-700 ring-violet-200",
  SKILL_COMPETITION: "bg-amber-50 text-amber-700 ring-amber-200",
  CULTURAL: "bg-pink-50 text-pink-700 ring-pink-200",
  TOURNAMENT: "bg-green-50 text-green-700 ring-green-200",
  DEBATE: "bg-orange-50 text-orange-700 ring-orange-200",
  FAREWELL: "bg-rose-50 text-rose-700 ring-rose-200",
  FRESHERS_RECEPTION: "bg-teal-50 text-teal-700 ring-teal-200",
  OTHER: "bg-slate-50 text-slate-700 ring-slate-200",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatDateForInput(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

// ─── Create Event Modal ───────────────────────────────────────────────────────

function CreateEventModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [eventLinks, setEventLinks] = useState<string[]>([""]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) {
      setError("");
      setEventLinks([""]);
      formRef.current?.reset();
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const filtered = eventLinks.filter(Boolean);
    if (filtered.length) fd.set("eventLinks", JSON.stringify(filtered));

    startTransition(async () => {
      const result = await createEvent(undefined, fd);
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message || "Failed to create event");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create Event</h2>
            <p className="text-sm text-slate-500 mt-0.5">Fill in the details for your new event</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              name="title"
              required
              placeholder="e.g. Annual Tech Seminar 2025"
              className="input-field"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Describe the event..."
              className="input-field resize-none"
            />
          </div>

          {/* Row: Type + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Type</label>
              <select name="eventType" className="input-field">
                <option value="">Select type</option>
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
              <input name="location" placeholder="e.g. Auditorium, Block A" className="input-field" />
            </div>
          </div>

          {/* Row: Date + Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Date</label>
              <input name="eventDate" type="date" className="input-field" />
            </div>
         
          </div>

  
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Photo URL</label>
            <input name="photoUrl" type="url" placeholder="https://..." className="input-field" />
          </div>

          {/* Drive Link */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Drive Link</label>
            <input name="driveLink" type="url" placeholder="https://drive.google.com/..." className="input-field" />
          </div>

          {/* Event Links */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Links</label>
            <div className="space-y-2">
              {eventLinks.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="url"
                    placeholder={`https://link-${i + 1}.com`}
                    value={link}
                    onChange={(e) => {
                      const updated = [...eventLinks];
                      updated[i] = e.target.value;
                      setEventLinks(updated);
                    }}
                    className="input-field flex-1"
                  />
                  {eventLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setEventLinks(eventLinks.filter((_, idx) => idx !== i))}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setEventLinks([...eventLinks, ""])}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <Plus size={14} /> Add another link
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              <X size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({
  event,
  onDelete,
  onToggleFeatured,
}: {
  event: Event;
  onDelete: (id: number) => void;
  onToggleFeatured: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [togglingFeatured, setTogglingFeatured] = useState(false);
  const typeColor = EVENT_TYPE_COLORS[event.eventType || "OTHER"] ?? EVENT_TYPE_COLORS.OTHER;
  const typeLabel = EVENT_TYPE_OPTIONS.find((o) => o.value === event.eventType)?.label ?? "Other";

  const handleDelete = async () => {
    if (!confirm("Delete this event? This action cannot be undone.")) return;
    setDeleting(true);
    await deleteEvent(event.id);
    onDelete(event.id);
  };



  return (
    <article className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Photo */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {event.photoUrl ? (
          <img
            src={event.photoUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Calendar size={36} className="text-slate-300" />
          </div>
        )}

        {/* Featured badge */}
        {event.isFeatured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-amber-400 text-amber-900 text-xs font-semibold rounded-full shadow-sm">
            <Star size={11} fill="currentColor" /> Featured
          </span>
        )}

        {/* Type badge */}
        {event.eventType && (
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${typeColor}`}>
            {typeLabel}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 mb-1.5">
          {event.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{event.description}</p>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 mt-auto text-xs text-slate-500">
          {event.eventDate && (
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400 flex-shrink-0" />
              {formatDate(event.eventDate)}
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* Links row */}
        {(event.driveLink || (event.eventLinks && event.eventLinks.length > 0)) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            {event.driveLink && (
              <a
                href={event.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <HardDrive size={13} /> Drive
              </a>
            )}
            {event.eventLinks?.filter(Boolean).map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ExternalLink size={13} /> Link {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-1 px-4 py-3 bg-slate-50 border-t border-slate-100">
     

        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Delete event"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
        >
          {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      </div>
    </article>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 py-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} /> Prev
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function EventsClient({
  initialEvents,
  total,
  totalPages,
  currentPage,
  initialSearch,
  initialEventType,
}: EventsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [search, setSearch] = useState(initialSearch);
  const [eventType, setEventType] = useState(initialEventType);
  const [showFilters, setShowFilters] = useState(false);
  const [isNavigating, startNavTransition] = useTransition();

  // Keep events in sync with server-fetched props
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const updateUrl = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") {
          next.set(k, String(v));
        } else {
          next.delete(k);
        }
      });
      startNavTransition(() => {
        router.push(`${pathname}?${next.toString()}`);
      });
    },
    [searchParams, pathname, router]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      updateUrl({ search: value || undefined, page: 1 });
    },
    [updateUrl]
  );

  const handleTypeFilter = useCallback(
    (value: string) => {
      setEventType(value);
      updateUrl({ eventType: value || undefined, page: 1 });
    },
    [updateUrl]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrl({ page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateUrl]
  );

  const handleEventCreated = useCallback(() => {
    updateUrl({ page: 1 });
  }, [updateUrl]);

  const handleEventDeleted = useCallback((id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleToggleFeatured = useCallback((id: number) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFeatured: !e.isFeatured } : e))
    );
  }, []);

  const hasFilters = search || eventType;

  return (
    <>
      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.625rem;
          font-size: 0.875rem;
          color: #0f172a;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-field:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .input-field::placeholder { color: #94a3b8; }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1.125rem;
          background: #4f46e5;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 0.625rem;
          border: none;
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s, opacity 0.15s;
        }
        .btn-primary:hover { background: #4338ca; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1.125rem;
          background: #f1f5f9;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 0.625rem;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-secondary:hover { background: #e2e8f0; }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        {/* ── Header ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 bg-indigo-600 rounded-xl">
                  <Calendar size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 leading-none">Events</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {total} event{total !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <button onClick={() => setModalOpen(true)} className="btn-primary">
                <Plus size={16} /> Create Event
              </button>
            </div>
          </div>
        </header>

        {/* ── Toolbar ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search events…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field pl-9 pr-9"
              />
              {search && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Type filter */}
            <div className="relative sm:w-52">
              <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={eventType}
                onChange={(e) => handleTypeFilter(e.target.value)}
                className="input-field pl-9 appearance-none pr-8"
              >
                <option value="">All types</option>
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-slate-500">Filters:</span>
              {search && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full ring-1 ring-indigo-200">
                  "{search}"
                  <button onClick={() => handleSearch("")} className="hover:text-indigo-900">
                    <X size={11} />
                  </button>
                </span>
              )}
              {eventType && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full ring-1 ring-indigo-200">
                  {EVENT_TYPE_OPTIONS.find((o) => o.value === eventType)?.label}
                  <button onClick={() => handleTypeFilter("")} className="hover:text-indigo-900">
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          {isNavigating ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FolderOpen size={28} className="text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">No events found</h3>
              <p className="text-sm text-slate-500 max-w-xs">
                {hasFilters
                  ? "Try adjusting your filters or search terms."
                  : "Get started by creating your first event."}
              </p>
              {!hasFilters && (
                <button onClick={() => setModalOpen(true)} className="btn-primary mt-4">
                  <Plus size={16} /> Create Event
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDelete={handleEventDeleted}
                  onToggleFeatured={handleToggleFeatured}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!isNavigating && events.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </main>
      </div>

      {/* ── Modal ── */}
      <CreateEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleEventCreated}
      />
    </>
  );
}