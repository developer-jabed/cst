/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
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
import { createEvent, deleteEvent } from "@/service/event/event.service";

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

// ─── Shared class names (theme tokens only) ──────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60";

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-card)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-gold/50 hover:bg-accent";

const chipCls =
  "inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-secondary px-3 py-1 text-xs font-medium text-primary";

// Event type badges: alpha tints so they work in light and dark mode
const EVENT_TYPE_COLORS: Record<string, string> = {
  SEMINAR: "bg-sky-500/15 text-sky-700 ring-sky-500/30 dark:text-sky-300",
  WORKSHOP: "bg-violet-500/15 text-violet-700 ring-violet-500/30 dark:text-violet-300",
  SKILL_COMPETITION: "bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-300",
  CULTURAL: "bg-pink-500/15 text-pink-700 ring-pink-500/30 dark:text-pink-300",
  TOURNAMENT: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300",
  DEBATE: "bg-orange-500/15 text-orange-700 ring-orange-500/30 dark:text-orange-300",
  FAREWELL: "bg-rose-500/15 text-rose-700 ring-rose-500/30 dark:text-rose-300",
  FRESHERS_RECEPTION: "bg-teal-500/15 text-teal-700 ring-teal-500/30 dark:text-teal-300",
  OTHER: "bg-muted text-muted-foreground ring-border",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
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
        toast.success(result.message || "Event created");
        onSuccess();
        onClose();
      } else {
        setError(result.message || "Failed to create event");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-in items-center justify-center p-4 fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative max-h-[90vh] w-full max-w-2xl animate-in overflow-y-auto rounded-3xl border border-gold/30 bg-card shadow-2xl fade-in zoom-in-95 duration-300 motion-reduce:animate-none">
        <div className="h-[3px] bg-gradient-to-r from-primary via-emerald-500 to-gold" />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-xl font-bold text-foreground">Create Event</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Fill in the details for your new event
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <Field label="Title" required>
            <input
              name="title"
              required
              placeholder="e.g. Annual Tech Seminar 2025"
              className={inputCls}
            />
          </Field>

          <Field label="Description" required>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Describe the event..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Event Type">
              <select name="eventType" className={inputCls}>
                <option value="">Select type</option>
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <input
                name="location"
                placeholder="e.g. Auditorium, Block A"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Event Date">
            <input name="eventDate" type="date" className={inputCls} />
          </Field>

          <Field label="Photo URL">
            <input
              name="photoUrl"
              type="url"
              placeholder="https://..."
              className={inputCls}
            />
          </Field>

          <Field label="Drive Link">
            <input
              name="driveLink"
              type="url"
              placeholder="https://drive.google.com/..."
              className={inputCls}
            />
          </Field>

          <Field label="Event Links">
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
                    className={`${inputCls} flex-1`}
                  />
                  {eventLinks.length > 1 && (
                    <button
                      type="button"
                      aria-label="Remove link"
                      onClick={() =>
                        setEventLinks(eventLinks.filter((_, idx) => idx !== i))
                      }
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setEventLinks([...eventLinks, ""])}
                className="flex items-center gap-1 text-sm font-medium text-primary transition hover:text-gold"
              >
                <Plus size={14} /> Add another link
              </button>
            </div>
          </Field>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <X size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button type="button" onClick={onClose} className={ghostBtn}>
              Cancel
            </button>
            <button type="submit" disabled={isPending} className={primaryBtn}>
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
  index,
  onDelete,
}: {
  event: Event;
  index: number;
  onDelete: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const typeColor =
    EVENT_TYPE_COLORS[event.eventType || "OTHER"] ?? EVENT_TYPE_COLORS.OTHER;
  const typeLabel =
    EVENT_TYPE_OPTIONS.find((o) => o.value === event.eventType)?.label ?? "Other";

  const handleDelete = async () => {
    if (!confirm("Delete this event? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res: any = await deleteEvent(event.id);
      if (res?.success === false) {
        toast.error(res.message || "Failed to delete event");
        setDeleting(false);
        return;
      }
      toast.success("Event deleted");
      onDelete(event.id);
    } catch {
      toast.error("Failed to delete event");
      setDeleting(false);
    }
  };

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      className="group relative flex animate-in flex-col overflow-hidden rounded-2xl border border-gold/25 bg-card/80 shadow-[var(--shadow-card)] backdrop-blur transition-all duration-500 fade-in slide-in-from-bottom-2 fill-mode-both hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[var(--shadow-hover)] motion-reduce:animate-none motion-reduce:transition-none"
    >
      {/* Photo */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-secondary to-muted">
        {event.photoUrl ? (
          <img
            src={event.photoUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Calendar size={36} className="text-gold/60" />
          </div>
        )}

        {/* Soft bottom fade so badges stay readable */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-foreground/20 to-transparent" />

        {event.isFeatured && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-gold/60 bg-gold px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
            <Star size={11} fill="currentColor" /> Featured
          </span>
        )}

        {event.eventType && (
          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ring-1 backdrop-blur ${typeColor}`}
          >
            {typeLabel}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1.5 line-clamp-2 text-base font-semibold leading-snug text-foreground">
          {event.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {event.description}
        </p>

        <div className="mt-auto flex flex-col gap-1.5 text-xs text-muted-foreground">
          {event.eventDate && formatDate(event.eventDate) && (
            <div className="flex items-center gap-1.5 tabular-nums">
              <Calendar size={13} className="flex-shrink-0 text-gold" />
              {formatDate(event.eventDate)}
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="flex-shrink-0 text-gold" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {(event.driveLink ||
          (event.eventLinks && event.eventLinks.filter(Boolean).length > 0)) && (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
            {event.driveLink && (
              <a
                href={event.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
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
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                <ExternalLink size={13} /> Link {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-1 border-t border-border bg-muted/40 px-4 py-2.5">
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Delete event"
          aria-label="Delete event"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
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
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const navBtn =
    "flex items-center gap-1 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm font-medium text-foreground transition hover:border-gold/50 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={navBtn}
      >
        <ChevronLeft size={16} /> Prev
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`h-9 w-9 rounded-lg border text-sm font-medium tabular-nums transition ${
                p === currentPage
                  ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                  : "border-border bg-card/60 text-foreground hover:border-gold/50 hover:bg-accent"
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
        className={navBtn}
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

  // Debounce search so we don't refetch on every keystroke
  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (search === current) return;
    const t = setTimeout(
      () => updateUrl({ search: search || undefined, page: 1 }),
      350
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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

  const closeModal = useCallback(() => setModalOpen(false), []);

  const hasFilters = search || eventType;

  return (
    <>
      <div className="space-y-6">
        {/* ── Toolbar: count + create ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-secondary px-4 py-1.5 text-sm font-medium tabular-nums text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Total: {total} event{total !== 1 ? "s" : ""}
          </span>

          <button onClick={() => setModalOpen(true)} className={primaryBtn}>
            <Plus size={16} /> Create Event
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search events…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} pl-10 pr-9`}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative sm:w-56">
              <Tag
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <select
                value={eventType}
                onChange={(e) => handleTypeFilter(e.target.value)}
                className={`${inputCls} pl-10`}
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

          {hasFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Filters:</span>
              {search && (
                <span className={chipCls}>
                  “{search}”
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Remove search filter"
                    className="transition hover:text-gold"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {eventType && (
                <span className={chipCls}>
                  {EVENT_TYPE_OPTIONS.find((o) => o.value === eventType)?.label}
                  <button
                    onClick={() => handleTypeFilter("")}
                    aria-label="Remove type filter"
                    className="transition hover:text-gold"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <main>
          {isNavigating ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-card/50 py-20 text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-secondary text-primary">
                <FolderOpen size={24} />
              </span>
              <h3 className="mb-1 text-base font-semibold text-foreground">
                No events found
              </h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                {hasFilters
                  ? "Try adjusting your filters or search terms."
                  : "Get started by creating your first event."}
              </p>
              {!hasFilters && (
                <button
                  onClick={() => setModalOpen(true)}
                  className={`${primaryBtn} mt-5`}
                >
                  <Plus size={16} /> Create Event
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={i}
                  onDelete={handleEventDeleted}
                />
              ))}
            </div>
          )}

          {!isNavigating && events.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </main>
      </div>

      <CreateEventModal
        open={modalOpen}
        onClose={closeModal}
        onSuccess={handleEventCreated}
      />
    </>
  );
}