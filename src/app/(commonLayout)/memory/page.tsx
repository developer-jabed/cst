/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EventType } from "@/types/event.interface";
import { getEvents, getFeaturedEvents } from "@/service/event/event.service";
import EventsClient from "../../../components/modules/memory/MemoriesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events & Activities",
  description: "Explore upcoming, featured and past events",
};

type SearchParams = Promise<{
  search?: string;
  type?: string;
  page?: string;
}>;

const PAGE_SIZE = 9;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const search = (sp.search ?? "").trim();
  const type = (sp.type ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);

  // Fetch both lists in parallel on the server
  const [eventsRes, featuredRes] = await Promise.all([
    getEvents({
      search: search || undefined,
      eventType: (type || undefined) as EventType | undefined,
      page,
      limit: PAGE_SIZE,
    }),
    getFeaturedEvents(),
  ]);

  const events: any[] = eventsRes?.success ? eventsRes.data ?? [] : [];
  const featured: any[] = featuredRes?.success ? featuredRes.data ?? [] : [];

  const total: number = eventsRes?.total ?? events.length;
  const totalPages: number = eventsRes?.totalPages ?? 1;

  // Category chips come from the data we already have
  const typeSet = new Set<string>(
    [...events, ...featured]
      .map((e) => e.eventType as string | undefined)
      .filter((t): t is string => Boolean(t))
  );
  if (type) typeSet.add(type);
  const types = Array.from(typeSet);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-amber-50/40">
      {/* ───────── Hero ───────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-emerald-900 to-emerald-600">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-10 h-40 w-40 rounded-full bg-emerald-300/20 blur-2xl" />

        {/* floating emojis */}
        <span className="pointer-events-none absolute right-[8%] top-10 hidden animate-bounce text-5xl sm:block">
          🎉
        </span>
        <span className="pointer-events-none absolute right-[22%] bottom-8 hidden animate-pulse text-4xl sm:block">
          🏆
        </span>
        <span className="pointer-events-none absolute right-[3%] bottom-14 hidden animate-bounce text-4xl [animation-delay:400ms] sm:block">
          🎭
        </span>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            Live from our campus
          </span>

          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Events &amp;{" "}
            <span className="bg-gradient-to-r from-amber-200 to-yellow-100 bg-clip-text text-transparent">
              Activities
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-emerald-100 sm:text-lg">
            Discover what&apos;s happening, relive the best moments and never
            miss an upcoming celebration.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/15 px-5 py-3 text-white backdrop-blur">
              <p className="text-2xl font-extrabold">{total}</p>
              <p className="text-xs text-emerald-100">Total events</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-5 py-3 text-white backdrop-blur">
              <p className="text-2xl font-extrabold">{featured.length}</p>
              <p className="text-xs text-emerald-100">Featured</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-5 py-3 text-white backdrop-blur">
              <p className="text-2xl font-extrabold">{types.length}</p>
              <p className="text-xs text-emerald-100">Categories</p>
            </div>
          </div>
        </div>

        {/* wave divider */}
        <svg
          className="absolute bottom-0 left-0 w-full text-white"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            fillOpacity="0.9"
            d="M0,32 C240,64 480,0 720,24 C960,48 1200,64 1440,28 L1440,60 L0,60 Z"
          />
        </svg>
      </header>

      {/* ───────── Content ───────── */}
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <EventsClient
          featured={featured}
          events={events}
          total={total}
          totalPages={totalPages}
          currentPage={page}
          types={types}
          initialSearch={search}
          activeType={type}
          errorMessage={
            eventsRes?.success ? undefined : eventsRes?.message || "Please try again."
          }
        />
      </main>
    </div>
  );
}