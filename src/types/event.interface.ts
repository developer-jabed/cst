
export type EventType =
  | "SEMINAR"
  | "WORKSHOP"
  | "SKILL_COMPETITION"
  | "CULTURAL"
  | "TOURNAMENT"
  | "DEBATE"
  | "FAREWELL"
  | "FRESHERS_RECEPTION"
  | "OTHER";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  SEMINAR: "Seminar",
  WORKSHOP: "Workshop",
  SKILL_COMPETITION: "Skill Competition",
  CULTURAL: "Cultural",
  TOURNAMENT: "Tournament",
  DEBATE: "Debate",
  FAREWELL: "Farewell",
  FRESHERS_RECEPTION: "Freshers Reception",
  OTHER: "Other",
};

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as EventType, label })
);

// ─── Payload interfaces ───────────────────────────────────────────────────────

export interface ICreateEventPayload {
  title: string;
  description: string;
  photoUrl?: string;
  eventLinks?: string[];
  driveLink?: string;
  eventType?: EventType;
  location?: string;
  eventDate?: string;
  isFeatured?: boolean;
  createdById?: number;
}

export interface IUpdateEventPayload {
  title?: string;
  description?: string;
  photoUrl?: string;
  eventLinks?: string[];
  driveLink?: string;
  eventType?: EventType;
  location?: string;
  eventDate?: string;
  isFeatured?: boolean;
}

export interface IEventFilterParams {
  search?: string;
  eventType?: EventType;
  isFeatured?: boolean;
  location?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}