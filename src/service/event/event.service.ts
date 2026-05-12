"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { EventType, ICreateEventPayload, IEventFilterParams, IUpdateEventPayload } from "@/types/event.interface";
import { revalidateTag } from "next/cache";





export async function createEvent(prevState: any, formData: FormData) {
  try {
    const payload: ICreateEventPayload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      photoUrl: formData.get("photoUrl")
        ? (formData.get("photoUrl") as string)
        : undefined,
      eventLinks: formData.get("eventLinks")
        ? JSON.parse(formData.get("eventLinks") as string)
        : undefined,
      driveLink: formData.get("driveLink")
        ? (formData.get("driveLink") as string)
        : undefined,
      eventType: formData.get("eventType")
        ? (formData.get("eventType") as EventType)
        : undefined,
      location: formData.get("location")
        ? (formData.get("location") as string)
        : undefined,
      eventDate: formData.get("eventDate")
        ? (formData.get("eventDate") as string)
        : undefined,
      isFeatured: formData.get("isFeatured") === "true",
      createdById: formData.get("createdById")
        ? Number(formData.get("createdById"))
        : undefined,
    };

    const response = await serverFetch.post("/events", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("event-list", "max");
      revalidateTag("event-page-1", "max");
      revalidateTag("event-featured", "max");

      return {
        success: true,
        message: "Event created successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to create event",
      errors: result.errors || {},
    };
  } catch (error: any) {
    console.error("Create event error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

// ─── Create Event (direct / programmatic) ────────────────────────────────────

export async function createEventDirect(payload: ICreateEventPayload) {
  try {
    const response = await serverFetch.post("/events", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("event-list", "max");
      revalidateTag("event-page-1", "max");
      revalidateTag("event-featured", "max");

      return {
        success: true,
        message: "Event created successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to create event",
    };
  } catch (error: any) {
    console.error("Create event error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

// ─── Get All Events ───────────────────────────────────────────────────────────

export async function getEvents(params: IEventFilterParams = {}) {
  try {
    const {
      search,
      eventType,
      isFeatured,
      location,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
    } = params;

    const queryParams = new URLSearchParams();

    if (search) queryParams.append("search", search);
    if (eventType) queryParams.append("eventType", eventType);
    if (isFeatured !== undefined)
      queryParams.append("isFeatured", String(isFeatured));
    if (location) queryParams.append("location", location);
    if (fromDate) queryParams.append("fromDate", fromDate);
    if (toDate) queryParams.append("toDate", toDate);
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    const url = `/events?${queryParams.toString()}`;
    const response = await serverFetch.get(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const result = await response.json();

    const events = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result)
      ? result
      : [];

    const total = result.total || result.meta?.total || events.length;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: events,
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error: any) {
    console.error("Get events error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch events",
      data: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}

// ─── Get Featured Events ──────────────────────────────────────────────────────

export async function getFeaturedEvents() {
  try {
    const response = await serverFetch.get("/events/featured");

    if (!response.ok) {
      throw new Error(`Failed to fetch featured events: ${response.statusText}`);
    }

    const result = await response.json();

    const events = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result)
      ? result
      : [];

    return {
      success: true,
      data: events,
    };
  } catch (error: any) {
    console.error("Get featured events error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch featured events",
      data: [],
    };
  }
}


export async function getEventsByType(
  type: EventType,
  params: Pick<IEventFilterParams, "page" | "limit" | "search"> = {}
) {
  try {
    const { page = 1, limit = 10, search } = params;

    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    const url = `/events/type/${type}?${queryParams.toString()}`;
    const response = await serverFetch.get(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch events by type: ${response.statusText}`);
    }

    const result = await response.json();

    const events = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result)
      ? result
      : [];

    const total = result.total || result.meta?.total || events.length;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: events,
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error: any) {
    console.error("Get events by type error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch events",
      data: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}


export async function getEventById(id: number) {
  try {
    const response = await serverFetch.get(`/events/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.data ?? result,
    };
  } catch (error: any) {
    console.error("Get event by ID error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch event",
      data: null,
    };
  }
}


export async function updateEvent(id: number, payload: IUpdateEventPayload) {
  try {
    const response = await serverFetch.patch(`/events/${id}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("event-list", "max");
      revalidateTag(`event-${id}`, "max");
      revalidateTag("event-featured", "max");

      return {
        success: true,
        message: "Event updated successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to update event",
    };
  } catch (error: any) {
    console.error("Update event error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

// ─── Update Event (form action) ───────────────────────────────────────────────

export async function updateEventAction(prevState: any, formData: FormData) {
  try {
    const id = Number(formData.get("id"));

    const payload: IUpdateEventPayload = {
      ...(formData.get("title") && { title: formData.get("title") as string }),
      ...(formData.get("description") && {
        description: formData.get("description") as string,
      }),
      ...(formData.get("photoUrl") && {
        photoUrl: formData.get("photoUrl") as string,
      }),
      ...(formData.get("eventLinks") && {
        eventLinks: JSON.parse(formData.get("eventLinks") as string),
      }),
      ...(formData.get("driveLink") && {
        driveLink: formData.get("driveLink") as string,
      }),
      ...(formData.get("eventType") && {
        eventType: formData.get("eventType") as EventType,
      }),
      ...(formData.get("location") && {
        location: formData.get("location") as string,
      }),
      ...(formData.get("eventDate") && {
        eventDate: formData.get("eventDate") as string,
      }),
      ...(formData.get("isFeatured") !== null && {
        isFeatured: formData.get("isFeatured") === "true",
      }),
    };

    return await updateEvent(id, payload);
  } catch (error: any) {
    console.error("Update event action error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

// ─── Toggle Featured ──────────────────────────────────────────────────────────

export async function toggleEventFeatured(id: number) {
  try {
    const response = await serverFetch.patch(`/events/${id}/featured`, {
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("event-list", "max");
      revalidateTag(`event-${id}`, "max");
      revalidateTag("event-featured", "max");

      return {
        success: true,
        message: "Event featured status toggled successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to toggle featured status",
    };
  } catch (error: any) {
    console.error("Toggle event featured error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}


export async function deleteEvent(id: number) {
  try {
    const response = await serverFetch.delete(`/events/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag("event-list", "max");
      revalidateTag("event-page-1", "max");
      revalidateTag("event-featured", "max");

      return {
        success: true,
        message: "Event deleted successfully!",
      };
    }

    return {
      success: false,
      message: result.message || "Failed to delete event",
    };
  } catch (error: any) {
    console.error("Delete event error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}