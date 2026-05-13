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
).map(([value, label]) => ({ value: value as NoticePriority, label }));

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
).map(([value, label]) => ({ value: value as NoticeAudienceType, label }));

// ─────────────────────────────────────────────────────────────
// Viewer Context Types
// ─────────────────────────────────────────────────────────────

export interface IStudentViewerContext {
  role: "student";
  studentId: number;
  groupId?: number;
  semesterId?: number;
  departmentId?: number;
}

export interface ITeacherViewerContext {
  role: "teacher";
  teacherId: number;
  departmentId?: number;
}

export interface IGroupViewerContext {
  role: "group";
  groupId: number;
  semesterId?: number;
  departmentId?: number;
}

export type IViewerContext =
  | IStudentViewerContext
  | ITeacherViewerContext
  | IGroupViewerContext;

// ─────────────────────────────────────────────────────────────
// Nested Relation Types
// ─────────────────────────────────────────────────────────────

export interface INoticeDepartment {
  id: number;
  name: string;
}

export interface INoticeSemester {
  id: number;
  name: string;
}

export interface INoticeGroup {
  id: number;
  name: string;
}

export interface INoticeStudent {
  id: number;
  name: string;
}

export interface INoticeTeacher {
  id: number;
  name: string;
}

export interface INoticeCreatedBy {
  id: number;
  name: string;
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

  // FK ids
  departmentId?: number;
  semesterId?: number;
  groupId?: number;
  studentId?: number;
  teacherId?: number;
  createdById?: number;

  // Populated relations
  department?: INoticeDepartment | null;
  semester?: INoticeSemester | null;
  group?: INoticeGroup | null;
  student?: INoticeStudent | null;
  teacher?: INoticeTeacher | null;
  createdBy?: INoticeCreatedBy | null;

  createdAt: string;
  updatedAt: string;
}

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
  teacherId?: number;
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
  teacherId?: number;
}

// ─────────────────────────────────────────────────────────────
// Notice Filter Params (frontend)
// ─────────────────────────────────────────────────────────────

export interface INoticeFilterParams {
  searchTerm?: string;

  audienceType?: NoticeAudienceType;
  priority?: NoticePriority;

  departmentId?: number;
  semesterId?: number;
  groupId?: number;
  studentId?: number;
  teacherId?: number;

  isPinned?: boolean;
  isPublished?: boolean;

  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
