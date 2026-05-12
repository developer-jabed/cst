
import EventsClient from "@/components/modules/events/EventClient";
import { getEvents } from "@/service/event/event.service";
export const dynamic = "force-dynamic";


interface EventsPageProps {
  searchParams: {
    page?: string;
    search?: string;
    eventType?: string;
    sortOrder?: string;
  };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const eventType = searchParams.eventType as any;
  const sortOrder = (searchParams.sortOrder as "asc" | "desc") || "desc";

  const result = await getEvents({
    page,
    limit: 9,
    search: search || undefined,
    eventType: eventType || undefined,
    sortBy: "eventDate",
    sortOrder,
  });

  return (
    <EventsClient
      initialEvents={result.data || []}
      total={result.total || 0}
      totalPages={result.totalPages || 1}
      currentPage={page}
      initialSearch={search}
      initialEventType={eventType || ""}
    />
  );
}