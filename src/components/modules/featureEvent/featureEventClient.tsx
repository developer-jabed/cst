"use client";

import { memo, useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleEventFeatured } from "@/service/event/event.service";
import { EVENT_TYPE_LABELS, EventType } from "@/types/event.interface";

interface EventItem {
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
}

interface EventsPageClientProps {
  events: EventItem[];
}

/* ───────────────────────── Constants & helpers ───────────────────────── */

// Event-type chip colors — picked deterministically from the type name,
// so any new EventType automatically gets a color without touching this file.
const TYPE_STYLES = [
  "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "bg-sky-50 text-sky-700 ring-sky-200",
  "bg-violet-50 text-violet-700 ring-violet-200",
  "bg-amber-50 text-amber-800 ring-gold-soft",
  "bg-rose-50 text-rose-700 ring-rose-200",
  "bg-teal-50 text-teal-700 ring-teal-200",
] as const;

const pickTypeStyle = (type?: string) => {
  if (!type) return TYPE_STYLES[3];
  let sum = 0;
  for (let i = 0; i < type.length; i++) sum += type.charCodeAt(i);
  return TYPE_STYLES[sum % TYPE_STYLES.length];
};

// Created once, not on every card render
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : dateFormatter.format(d);
};

/* ─────────────────────────────── Icons ─────────────────────────────── */

const Pin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
  </svg>
);
const Star = ({ filled }: { filled?: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ImageIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Drive = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const External = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ───────────────────────────── Event card ───────────────────────────── */

interface CardProps {
  event: EventItem;
  index: number;
  busy: boolean;
  onToggle: (id: number, current: boolean) => void;
}

const BTN = "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95";

const EventCard = memo(function EventCard({ event, index, busy, onToggle }: CardProps) {
  const featured = !!event.isFeatured;
  const date = formatDate(event.eventDate);
  const typeLabel = event.eventType ? EVENT_TYPE_LABELS[event.eventType] : "Other";

  return (
    <article
      className="st-row theme-card group flex flex-col overflow-hidden"
      style={{ ["--i" as string]: index % 9 }}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-secondary to-accent">
        {event.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.photoUrl}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-primary/30">
            <ImageIcon />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}

        {/* gradient overlay for chip legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-foreground/10" />

        <span className={`absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-inset backdrop-blur-sm ${pickTypeStyle(event.eventType)}`}>
          {typeLabel}
        </span>

        {featured && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-amber-500/30">
            <Star filled /> Featured
          </span>
        )}

        {date && (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            <CalendarIcon />
            {date}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="mb-2 text-xl font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary">
          {event.title}
        </h2>

        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{event.description}</p>

        {event.location && (
          <p className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70">
            <span className="text-gold"><Pin /></span>
            {event.location}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2.5 pt-5">
          <button
            disabled={busy}
            onClick={() => onToggle(event.id, featured)}
            className={`${BTN} disabled:cursor-wait disabled:opacity-60 ${
              featured
                ? "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-100"
                : "bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/25 hover:-translate-y-0.5 hover:shadow-lg"
            }`}
          >
            {busy ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
            ) : (
              <Star filled={!featured} />
            )}
            {featured ? "Remove Featured" : "Make Featured"}
          </button>

          {event.driveLink && (
            <a
              href={event.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BTN} bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100`}
            >
              <Drive /> Drive
            </a>
          )}

          {event.eventLinks?.[0] && (
            <a
              href={event.eventLinks[0]}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BTN} bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25 hover:-translate-y-0.5 hover:shadow-lg`}
            >
              Visit <External />
            </a>
          )}
        </div>
      </div>
    </article>
  );
});

/* ───────────────────────────── Page client ───────────────────────────── */

export default function EventsPageClient({ events }: EventsPageClientProps) {
  const [eventList, setEventList] = useState(events);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const handleToggleFeatured = useCallback((id: number, currentStatus: boolean) => {
    setBusyId(id);
    startTransition(async () => {
      try {
        const result = await toggleEventFeatured(id);
        if (result.success) {
          setEventList((prev) => prev.map((e) => (e.id === id ? { ...e, isFeatured: !currentStatus } : e)));
          toast.success(currentStatus ? "Removed from featured" : "Marked as featured");
        } else {
          toast.error(result.message ?? "Failed to update event");
        }
      } catch {
        toast.error("Something went wrong, please try again");
      } finally {
        setBusyId(null);
      }
    });
  }, []);

  const featuredCount = eventList.filter((e) => e.isFeatured).length;

  return (
    <div className="theme-content min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="st-fade mb-10 text-center">
          <p className="mb-2 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
            Dashboard / Events
          </p>
          <h1 className="text-4xl font-black tracking-tight text-foreground">All Events</h1>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-primary via-emerald-500 to-gold" />
          <p className="mt-3 text-muted-foreground">Explore upcoming and past events</p>

          {eventList.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                {eventList.length} events
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800 ring-1 ring-inset ring-gold-soft">
                {featuredCount} featured
              </span>
            </div>
          )}
        </div>

        {eventList.length === 0 ? (
          <div className="st-fade flex flex-col items-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-primary/60 ring-1 ring-gold-soft">
              <CalendarIcon />
            </div>
            <p className="text-lg font-bold text-foreground">No events found</p>
            <p className="mt-1 text-sm text-muted-foreground">New events will show up here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {eventList.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} busy={busyId === event.id} onToggle={handleToggleFeatured} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}