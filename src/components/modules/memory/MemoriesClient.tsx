"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { MapPin, Search, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type EventItem = {
  id: number;
  title: string;
  description?: string | null;
  photoUrl?: string | null;
  eventLinks?: unknown;
  driveLink?: string | null;
  eventType?: string | null;
  location?: string | null;
  eventDate?: string | null;
  isFeatured?: boolean;
};

interface Props {
  featured: EventItem[];
  events: EventItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  types: string[];
  initialSearch: string;
  activeType: string;
  errorMessage?: string;
}

// ─── Palettes ─────────────────────────────────────────────────────────────────
const PALETTES = [
  {
    grad: "from-[#064e3b] via-[#065f46] to-[#0f766e]",
    soft: "bg-emerald-50 text-emerald-800",
    chip: "bg-[#064e3b]",
    glow: "hover:shadow-emerald-900/10",
  },
  {
    grad: "from-[#0f766e] via-teal-600 to-cyan-700",
    soft: "bg-teal-50 text-teal-800",
    chip: "bg-teal-700",
    glow: "hover:shadow-teal-900/10",
  },
  {
    grad: "from-[#b8923f] via-[#c9a24b] to-amber-600",
    soft: "bg-amber-50 text-amber-900",
    chip: "bg-[#b8923f]",
    glow: "hover:shadow-amber-900/10",
  },
  {
    grad: "from-slate-800 via-slate-700 to-[#064e3b]",
    soft: "bg-slate-100 text-slate-700",
    chip: "bg-slate-800",
    glow: "hover:shadow-slate-900/10",
  },
  {
    grad: "from-sky-700 via-sky-600 to-teal-600",
    soft: "bg-sky-50 text-sky-800",
    chip: "bg-sky-700",
    glow: "hover:shadow-sky-900/10",
  },
  {
    grad: "from-emerald-800 via-emerald-600 to-teal-600",
    soft: "bg-emerald-50 text-emerald-800",
    chip: "bg-emerald-800",
    glow: "hover:shadow-emerald-900/10",
  },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function paletteFor(type?: string | null) {
  return PALETTES[hash(type || "general") % PALETTES.length];
}

function labelOf(type?: string | null) {
  if (!type) return "General";
  return type
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function emojiFor(type?: string | null) {
  const t = (type || "").toLowerCase();
  if (/sport|game|match/.test(t)) return "🏆";
  if (/cultur|music|dance|art/.test(t)) return "🎭";
  if (/seminar|workshop|academ|class|train/.test(t)) return "🎓";
  if (/meet|confer|summit/.test(t)) return "🤝";
  if (/compet|contest/.test(t)) return "🥇";
  if (/fest|celebr|day|party/.test(t)) return "🎉";
  return "✨";
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
const TZ = "Asia/Dhaka";

function parseDate(d?: string | null) {
  if (!d) return null;
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? null : x;
}

function dayKey(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

function dateParts(d: Date) {
  return {
    day: d.toLocaleDateString("en-GB", { day: "2-digit", timeZone: TZ }),
    month: d
      .toLocaleDateString("en-GB", { month: "short", timeZone: TZ })
      .toUpperCase(),
    weekday: d.toLocaleDateString("en-GB", { weekday: "long", timeZone: TZ }),
    full: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: TZ,
    }),
  };
}

type Status = "upcoming" | "today" | "past" | "tba";

function statusOf(d: Date | null): Status {
  if (!d) return "tba";
  const a = dayKey(d);
  const b = dayKey(new Date());
  return a > b ? "upcoming" : a === b ? "today" : "past";
}

const STATUS_UI: Record<Status, { text: string; cls: string }> = {
  upcoming: {
    text: "Upcoming",
    cls: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
  },
  today: {
    text: "Happening today",
    cls: "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200 animate-pulse",
  },
  past: {
    text: "Past event",
    cls: "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200",
  },
  tba: {
    text: "Date TBA",
    cls: "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200",
  },
};

// ─── Links helper ─────────────────────────────────────────────────────────────
function hostOf(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function normalizeLinks(raw: unknown): { label: string; url: string }[] {
  let v: any = raw;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      v = [v];
    }
  }
  if (!v) return [];

  const arr: any[] = Array.isArray(v)
    ? v
    : typeof v === "object"
      ? Object.entries(v).map(([label, url]) => ({ label, url }))
      : [];

  return arr
    .map((item, i) => {
      if (typeof item === "string") return { label: hostOf(item), url: item };
      const url = item?.url ?? item?.link ?? item?.href;
      if (!url) return null;
      const label =
        item?.label ??
        item?.title ??
        item?.name ??
        hostOf(String(url)) ??
        `Link ${i + 1}`;
      return { label: String(label), url: String(url) };
    })
    .filter((x): x is { label: string; url: string } =>
      Boolean(x && /^https?:\/\//i.test(x.url))
    );
}

// ─── Small UI ─────────────────────────────────────────────────────────────────
function Cover({
  ev,
  className = "",
  children,
}: {
  ev: EventItem;
  className?: string;
  children?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const pal = paletteFor(ev.eventType);
  const showImg = !!ev.photoUrl && !failed;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${pal.grad} ${className}`}
    >
      {showImg ? (
        <img
          src={ev.photoUrl!}
          alt={ev.title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
      ) : (
        <>
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 70%, #fff 0, transparent 35%)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow-lg transition duration-500 group-hover:scale-110 sm:text-6xl">
            {emojiFor(ev.eventType)}
          </div>
        </>
      )}
      {children}
    </div>
  );
}

function DateTile({ date }: { date: Date | null }) {
  if (!date) {
    return (
      <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-[#e8e0d0] bg-white text-xs font-bold text-slate-500 shadow-lg">
        TBA
      </div>
    );
  }
  const p = dateParts(date);
  return (
    <div className="flex h-14 w-14 flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#e8e0d0] bg-white shadow-lg">
      <span className="w-full bg-gradient-to-r from-[#064e3b] to-[#0f766e] py-0.5 text-center text-[9px] font-bold tracking-widest text-white">
        {p.month}
      </span>
      <span className="text-xl font-black leading-tight text-slate-900">
        {p.day}
      </span>
    </div>
  );
}

// ─── Featured card ────────────────────────────────────────────────────────────
function FeaturedCard({
  ev,
  onOpen,
}: {
  ev: EventItem;
  onOpen: () => void;
}) {
  const date = parseDate(ev.eventDate);
  const pal = paletteFor(ev.eventType);

  return (
    <button
      onClick={onOpen}
      className="group relative min-w-[86%] snap-start text-left sm:min-w-[420px]"
    >
      <Cover
        ev={ev}
        className="h-72 rounded-2xl shadow-xl transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#c9a24b] to-[#b8923f] px-3 py-1 text-xs font-bold text-[#1a1508] shadow-lg">
            ★ Featured
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${pal.chip}`}
          >
            {labelOf(ev.eventType)}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5">
          <DateTile date={date} />
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-xl font-bold leading-snug text-white drop-shadow">
              {ev.title}
            </h3>
            {ev.location && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{ev.location}</span>
              </p>
            )}
          </div>
        </div>
      </Cover>
    </button>
  );
}

// ─── Event card ───────────────────────────────────────────────────────────────
function EventCard({
  ev,
  onOpen,
}: {
  ev: EventItem;
  onOpen: () => void;
}) {
  const date = parseDate(ev.eventDate);
  const pal = paletteFor(ev.eventType);
  const st = STATUS_UI[statusOf(date)];

  return (
    <article
      onClick={onOpen}
      className={`group cursor-pointer overflow-hidden rounded-2xl border border-[#e8e0d0] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#c9a24b]/35 hover:shadow-lg ${pal.glow}`}
    >
      <Cover ev={ev} className="h-44">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold text-white shadow ${pal.chip}`}
          >
            {labelOf(ev.eventType)}
          </span>
          {ev.isFeatured && (
            <span className="rounded-full bg-gradient-to-r from-[#c9a24b] to-[#b8923f] px-2 py-1 text-[11px] font-bold text-[#1a1508] shadow">
              ★
            </span>
          )}
        </div>

        <div className="absolute -bottom-0 left-4 translate-y-1/2">
          <DateTile date={date} />
        </div>
      </Cover>

      <div className="px-5 pb-5 pt-9">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${st.cls}`}
          >
            {st.text}
          </span>
          {date && (
            <span className="text-xs text-slate-400">
              {dateParts(date).weekday}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition group-hover:text-[#064e3b]">
          {ev.title}
        </h3>

        {ev.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {ev.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[#f0ebe3] pt-3">
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#064e3b]" />
            <span className="truncate">{ev.location || "Location TBA"}</span>
          </span>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition group-hover:gap-2 ${pal.soft}`}
          >
            Details <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────
function EventModal({
  ev,
  onClose,
}: {
  ev: EventItem;
  onClose: () => void;
}) {
  const date = parseDate(ev.eventDate);
  const pal = paletteFor(ev.eventType);
  const st = STATUS_UI[statusOf(date)];
  const links = normalizeLinks(ev.eventLinks);
  const drive =
    ev.driveLink && /^https?:\/\//i.test(ev.driveLink) ? ev.driveLink : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0a1612]/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ev.title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-[#e8e0d0] bg-white shadow-2xl sm:rounded-2xl"
      >
        <Cover ev={ev} className="h-56 sm:h-64">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#e8e0d0] bg-white/95 text-slate-700 shadow-lg transition hover:scale-105 hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-5 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${pal.chip}`}
            >
              {labelOf(ev.eventType)}
            </span>
            {ev.isFeatured && (
              <span className="rounded-full bg-gradient-to-r from-[#c9a24b] to-[#b8923f] px-3 py-1 text-xs font-bold text-[#1a1508]">
                ★ Featured
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}
            >
              {st.text}
            </span>
          </div>
        </Cover>

        <div className="space-y-5 p-6">
          <h2 className="text-2xl font-black leading-snug text-slate-900">
            {ev.title}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3">
              <DateTile date={date} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                  When
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {date ? dateParts(date).full : "To be announced"}
                </p>
                {date && (
                  <p className="text-xs text-slate-500">
                    {dateParts(date).weekday}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/80 p-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8e0d0] bg-white text-[#c9a24b] shadow">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
                  Where
                </p>
                {ev.location ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      ev.location
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-semibold text-slate-800 underline-offset-2 hover:underline"
                  >
                    {ev.location}
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    To be announced
                  </p>
                )}
                <p className="text-xs text-slate-500">Open in Google Maps</p>
              </div>
            </div>
          </div>

          {ev.description && (
            <div>
              <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                About this event
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {ev.description}
              </p>
            </div>
          )}

          {(links.length > 0 || drive) && (
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Links &amp; resources
              </h3>
              <div className="flex flex-wrap gap-2">
                {drive && (
                  <a
                    href={drive}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#064e3b] to-[#0f766e] px-4 py-2 text-sm font-semibold text-white shadow transition hover:brightness-110"
                  >
                    📁 Photo / Drive
                  </a>
                )}
                {links.map((l, i) => (
                  <a
                    key={`${l.url}-${i}`}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition hover:brightness-95 ${pal.soft}`}
                  >
                    🔗 {l.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EventsClient({
  featured,
  events,
  total,
  totalPages,
  currentPage,
  types,
  initialSearch,
  activeType,
  errorMessage,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(initialSearch);
  const [openEvent, setOpenEvent] = useState<EventItem | null>(null);

  const buildHref = (o: {
    search?: string;
    type?: string;
    page?: number;
  }) => {
    const sp = new URLSearchParams();
    const search = o.search ?? initialSearch;
    const type = o.type ?? activeType;
    if (search) sp.set("search", search);
    if (type) sp.set("type", type);
    if (o.page && o.page > 1) sp.set("page", String(o.page));
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  useEffect(() => {
    if (q.trim() === initialSearch) return;
    const t = setTimeout(() => {
      startTransition(() =>
        router.push(buildHref({ search: q.trim(), page: 1 }))
      );
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const clearAll = () => {
    setQ("");
    startTransition(() => router.push(pathname));
  };

  const hasFilter = Boolean(initialSearch || activeType);

  const pages: number[] = [];
  const from = Math.max(1, currentPage - 2);
  const to = Math.min(totalPages, from + 4);
  for (let i = Math.max(1, to - 4); i <= to; i++) pages.push(i);

  return (
    <div className="space-y-10">
      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b8923f]">
                Spotlight
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Featured Events
              </h2>
              <p className="text-sm text-slate-500">
                Hand-picked highlights you shouldn&apos;t miss
              </p>
            </div>
            <span className="hidden text-xs text-slate-400 sm:block">
              Scroll →
            </span>
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 pt-1 sm:mx-0 sm:px-0">
            {featured.map((ev) => (
              <FeaturedCard
                key={ev.id}
                ev={ev}
                onOpen={() => setOpenEvent(ev)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="relative overflow-hidden rounded-2xl border border-[#e8e0d0] bg-white p-4 shadow-sm sm:p-5">
        {isPending && (
          <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-gradient-to-r from-[#064e3b] via-[#c9a24b] to-[#0f766e]" />
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events..."
              className="w-full rounded-xl border border-[#e8e0d0] bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm outline-none transition focus:border-[#c9a24b] focus:ring-2 focus:ring-[#c9a24b]/20"
            />
            {q && (
              <button
                onClick={clearAll}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#f7f3ea] text-slate-500 hover:bg-[#e8e0d0]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref({ type: "", page: 1 })}
              scroll={false}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                !activeType
                  ? "bg-gradient-to-br from-[#064e3b] to-[#0f766e] text-white shadow-md"
                  : "border border-[#e8e0d0] bg-[#f7f3ea] text-slate-600 hover:border-[#c9a24b]/40"
              }`}
            >
              ✨ All
            </Link>
            {types.map((t) => {
              const pal = paletteFor(t);
              const active = activeType === t;
              return (
                <Link
                  key={t}
                  href={buildHref({ type: t, page: 1 })}
                  scroll={false}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    active
                      ? `${pal.chip} text-white shadow-md`
                      : `${pal.soft} hover:brightness-95`
                  }`}
                >
                  {emojiFor(t)} {labelOf(t)}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            <b className="text-slate-800">{total}</b> event
            {total === 1 ? "" : "s"} found
          </span>
          {hasFilter && (
            <button
              onClick={clearAll}
              className="font-semibold text-[#064e3b] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Grid */}
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
          <p className="font-bold text-rose-800">Couldn&apos;t load events</p>
          <p className="mt-1 text-sm text-rose-600">{errorMessage}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8e0d0] bg-white py-20 text-center">
          <p className="text-lg font-bold text-slate-800">No events found</p>
          <p className="mt-1 text-sm text-slate-500">
            Try a different search or category.
          </p>
          {hasFilter && (
            <button
              onClick={clearAll}
              className="mt-5 rounded-full bg-gradient-to-br from-[#064e3b] to-[#0f766e] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
            >
              Show all events
            </button>
          )}
        </div>
      ) : (
        <div
          className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${
            isPending ? "opacity-60 transition" : ""
          }`}
        >
          {events.map((ev) => (
            <EventCard key={ev.id} ev={ev} onOpen={() => setOpenEvent(ev)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <Link
            href={buildHref({ page: currentPage - 1 })}
            aria-disabled={currentPage <= 1}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              currentPage <= 1
                ? "pointer-events-none border border-[#e8e0d0] bg-[#f7f3ea] text-slate-300"
                : "border border-[#e8e0d0] bg-white text-slate-700 hover:bg-[#f7f3ea]"
            }`}
          >
            ← Prev
          </Link>

          {pages.map((p) => (
            <Link
              key={p}
              href={buildHref({ page: p })}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${
                p === currentPage
                  ? "bg-gradient-to-br from-[#064e3b] to-[#0f766e] text-white shadow-md"
                  : "border border-[#e8e0d0] bg-white text-slate-600 hover:bg-[#f7f3ea]"
              }`}
            >
              {p}
            </Link>
          ))}

          <Link
            href={buildHref({ page: currentPage + 1 })}
            aria-disabled={currentPage >= totalPages}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              currentPage >= totalPages
                ? "pointer-events-none border border-[#e8e0d0] bg-[#f7f3ea] text-slate-300"
                : "border border-[#e8e0d0] bg-white text-slate-700 hover:bg-[#f7f3ea]"
            }`}
          >
            Next →
          </Link>
        </nav>
      )}

      {openEvent && (
        <EventModal ev={openEvent} onClose={() => setOpenEvent(null)} />
      )}
    </div>
  );
}