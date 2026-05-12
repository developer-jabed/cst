"use client";

import { useState, useTransition } from "react";
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

export default function EventsPageClient({
  events,
}: EventsPageClientProps) {
  const [eventList, setEventList] = useState(events);

  const [isPending, startTransition] = useTransition();

  const handleToggleFeatured = async (
    id: number,
    currentStatus: boolean
  ) => {
    startTransition(async () => {
      const result = await toggleEventFeatured(id);

      if (result.success) {
        setEventList((prev) =>
          prev.map((event) =>
            event.id === id
              ? {
                  ...event,
                  isFeatured: !currentStatus,
                }
              : event
          )
        );
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold">All Events</h1>

        <p className="text-gray-500 mt-2">
          Explore upcoming and past events
        </p>
      </div>

      {eventList.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            No events found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventList.map((event) => (
            <div
              key={event.id}
              className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300"
            >
              {event.photoUrl ? (
                <img
                  src={event.photoUrl}
                  alt={event.title}
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {event.eventType
                      ? EVENT_TYPE_LABELS[event.eventType]
                      : "Other"}
                  </span>

                  {event.isFeatured && (
                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                      Featured
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold mb-2">
                  {event.title}
                </h2>

                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-500">
                  {event.location && (
                    <p>📍 {event.location}</p>
                  )}

                  {event.eventDate && (
                    <p>
                      📅{" "}
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(new Date(event.eventDate))}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-5 flex-wrap">
                  <button
                    disabled={isPending}
                    onClick={() =>
                      handleToggleFeatured(
                        event.id,
                        event.isFeatured || false
                      )
                    }
                    className={`text-sm px-4 py-2 rounded-lg text-white transition ${
                      event.isFeatured
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {event.isFeatured
                      ? "Remove Featured"
                      : "Make Featured"}
                  </button>

                  {event.driveLink && (
                    <a
                      href={event.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Drive Link
                    </a>
                  )}

                  {event.eventLinks?.[0] && (
                    <a
                      href={event.eventLinks[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Visit
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}