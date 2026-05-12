import EventsPageClient from "@/components/modules/featureEvent/featureEventClient";
import { getEvents } from "@/service/event/event.service";
import { EventType } from "@/types/event.interface";

export const dynamic = "force-dynamic";

interface EventsPageProps {
  searchParams: {
    page?: string;
    search?: string;
    eventType?: string;
    sortOrder?: string;
  };
}

export default async function Events({
  searchParams,
}: EventsPageProps) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const eventType = searchParams.eventType as EventType;
  const sortOrder =
    (searchParams.sortOrder as "asc" | "desc") || "desc";

  const result = await getEvents({
    page,
    limit: 9,
    search: search || undefined,
    eventType: eventType || undefined,
    sortBy: "eventDate",
    sortOrder,
  });

  return (
    <EventsPageClient
      events={result?.data || []}
    />
  );
}