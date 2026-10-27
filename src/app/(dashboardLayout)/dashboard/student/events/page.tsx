/* eslint-disable @typescript-eslint/no-explicit-any */
import EventsClient from "@/components/modules/events/EventClient";
import { getEvents } from "@/service/event/event.service";

export const dynamic = "force-dynamic";

interface EventsPageProps {
  // Next.js 15: searchParams is a Promise and must be awaited
  searchParams: Promise<{
    page?: string;
    search?: string;
    eventType?: string;
    sortOrder?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const sp = await searchParams;

  const page = Number(sp.page) || 1;
  const search = sp.search || "";
  const eventType = sp.eventType as any;
  const sortOrder = (sp.sortOrder as "asc" | "desc") || "desc";

  const result = await getEvents({
    page,
    limit: 9,
    search: search || undefined,
    eventType: eventType || undefined,
    sortBy: "eventDate",
    sortOrder,
  });

  return (
    <div className="relative">
      {/* Ambient glow behind the header (layout already provides the main animated bg) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-0 -z-10 h-56 w-56 animate-pulse rounded-full bg-primary/10 blur-[90px] motion-reduce:animate-none"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 left-1/3 -z-10 h-40 w-40 animate-pulse rounded-full bg-gold/10 blur-[80px] [animation-delay:1.5s] motion-reduce:animate-none"
      />

      {/* Page header */}
      <header className="mb-6 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-700 motion-reduce:animate-none">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-gold to-transparent" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gold">
            Events
          </span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Events
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
          Seminars, workshops, competitions and campus celebrations
        </p>

        <div className="mt-5 h-px w-full bg-gradient-to-r from-gold/60 via-gold/20 to-transparent" />
      </header>

      {/* Frosted content panel */}
      <section className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both rounded-2xl border border-gold/30 bg-card/70 p-3 shadow-[var(--shadow-card)] backdrop-blur-xl transition-colors delay-100 duration-700 hover:border-gold/50 motion-reduce:animate-none md:p-5">
        <EventsClient
          initialEvents={result.data || []}
          total={result.total || 0}
          totalPages={result.totalPages || 1}
          currentPage={page}
          initialSearch={search}
          initialEventType={eventType || ""}
        />
      </section>
    </div>
  );
}