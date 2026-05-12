// ─────────────────────────────────────────────────────────────
// Notice Priority
// ─────────────────────────────────────────────────────────────

export type NoticePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export const NOTICE_PRIORITY_LABELS: Record<NoticePriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const NOTICE_PRIORITY_OPTIONS = Object.entries(
  NOTICE_PRIORITY_LABELS,
).map(([value, label]) => ({
  value: value as NoticePriority,
  label,
}));

// ─────────────────────────────────────────────────────────────
// Notice Audience Type
// ─────────────────────────────────────────────────────────────

export type NoticeAudienceType =
  | "ALL"
  | "DEPARTMENT"
  | "SEMESTER"
  | "GROUP"
  | "STUDENT"
  | "TEACHER";

export const NOTICE_AUDIENCE_TYPE_LABELS: Record<NoticeAudienceType, string> = {
  ALL: "All",
  DEPARTMENT: "Department",
  SEMESTER: "Semester",
  GROUP: "Group",
  STUDENT: "Student",
  TEACHER: "Teacher",
};

export const NOTICE_AUDIENCE_TYPE_OPTIONS = Object.entries(
  NOTICE_AUDIENCE_TYPE_LABELS,
).map(([value, label]) => ({
  value: value as NoticeAudienceType,
  label,
}));

// ─────────────────────────────────────────────────────────────
// Create Notice Payload
// ─────────────────────────────────────────────────────────────

export interface ICreateNoticePayload {
  title: string;
  description: string;

  attachmentUrl?: string;

  noticeDate?: string;
  expiryDate?: string;

  isPinned?: boolean;
  isPublished?: boolean;

  priority?: NoticePriority;
  audienceType?: NoticeAudienceType;

  departmentId?: number;
  semesterId?: number;
  groupId?: number;
  studentId?: number;

  createdById?: number;
}

// ─────────────────────────────────────────────────────────────
// Update Notice Payload
// ─────────────────────────────────────────────────────────────

export interface IUpdateNoticePayload {
  title?: string;
  description?: string;

  attachmentUrl?: string;

  noticeDate?: string;
  expiryDate?: string;

  isPinned?: boolean;
  isPublished?: boolean;

  priority?: NoticePriority;
  audienceType?: NoticeAudienceType;

  departmentId?: number;
  semesterId?: number;
  groupId?: number;
  studentId?: number;
}

// ─────────────────────────────────────────────────────────────
// Notice Filter Params
// ─────────────────────────────────────────────────────────────

export interface INoticeFilterParams {
  searchTerm?: string;

  audienceType?: NoticeAudienceType;
  priority?: NoticePriority;

  departmentId?: number;
  semesterId?: number;
  groupId?: number;
  studentId?: number;

  isPinned?: boolean;
  isPublished?: boolean;

  page?: number;
  limit?: number;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─────────────────────────────────────────────────────────────
// Notice Entity
// ─────────────────────────────────────────────────────────────

export interface INotice {
  id: number;

  title: string;
  description: string;

  attachmentUrl?: string;

  noticeDate?: string;
  expiryDate?: string;

  isPinned: boolean;
  isPublished: boolean;

  priority: NoticePriority;
  audienceType: NoticeAudienceType;

  departmentId?: number;
  semesterId?: number;
  groupId?: number;
  studentId?: number;

  createdById?: number;

  createdAt: string;
  updatedAt: string;
}
