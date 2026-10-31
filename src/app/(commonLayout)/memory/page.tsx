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

  const typeSet = new Set<string>(
    [...events, ...featured]
      .map((e) => e.eventType as string | undefined)
      .filter((t): t is string => Boolean(t))
  );
  if (type) typeSet.add(type);
  const types = Array.from(typeSet);

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#0f766e]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#c9a24b]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative h-[3px] w-full bg-gradient-to-r from-transparent via-[#c9a24b] to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-50 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a24b]" />
            Live from our campus
          </span>

          <h1 className="mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Events &amp;{" "}
            <span className="bg-gradient-to-r from-[#f0e6c8] via-[#c9a24b] to-[#e8d5a3] bg-clip-text text-transparent">
              Activities
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-emerald-50/85 sm:text-base">
            Discover what&apos;s happening, relive the best moments and never
            miss an upcoming celebration.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { n: total, l: "Total events" },
              { n: featured.length, l: "Featured" },
              { n: types.length, l: "Categories" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-white backdrop-blur-sm"
              >
                <p className="text-2xl font-black tabular-nums">{s.n}</p>
                <p className="text-[11px] font-medium text-emerald-100/80">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

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
            eventsRes?.success
              ? undefined
              : eventsRes?.message || "Please try again."
          }
        />
      </main>
    </div>
  );
}