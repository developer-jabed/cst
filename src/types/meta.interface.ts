// types/meta.interface.ts

export interface IDepartmentRef {
  id: number;
  name: string;
  shortName: string;
}

export interface INoticeRef {
  id: number;
  title: string;
  audienceType: string;
  priority: string;
  isPublished: boolean;
  createdAt: string;
}

export interface IEventRef {
  id: number;
  title: string;
  eventType: string;
  eventDate: string | null;
  location: string | null;
}

// Monthly
export interface IMonthlyAttendance {
  label: string;
  year: number;
  month: number;
  sessions: number;
  present: number;
  absent: number;
  late: number;
  total: number;
  attendanceRate: number;
}

export interface IMonthlyDiplomaResult {
  label: string;
  year: number;
  month: number;
  passed: number;
  failed: number;
  referred: number;
  withheld: number;
  total: number;
  passRate: number;
}

// Admin Dashboard Full Interface
export interface IAdminOverview {
  totalStudents: number;
  totalTeachers: number;
  totalGroups: number;
  totalDepartments: number;
  totalSubjects: number;
  totalSubjectGroups: number;
  totalNotices: number;
  publishedNotices: number;
  totalEvents: number;
  totalAttendanceSessions: number;
  totalPracticals: number;
  totalPracticalJobs: number;
  totalPracticalCombined: number;
  overallAttendanceRate: number;
  diplomaPassRate: number;
}

export interface IAdminBreakdownItem {
  department: IDepartmentRef | null;
  count: number;
}

export interface IAdminBreakdowns {
  studentsByDepartment: IAdminBreakdownItem[];
  teachersByDepartment: IAdminBreakdownItem[];
  groupsByDepartment: IAdminBreakdownItem[];
  noticesByAudience: { audienceType: string; count: number }[];
  noticesByPriority: { priority: string; count: number }[];
  diplomaResults: { status: string; count: number }[];
  attendance: { status: string; count: number }[];
}

export interface ILastSemesterResults {
  semesterName: string;
  examYear: number;
  total: number;
  passed: number;
  failed: number;
  referred: number;
  withheld: number;
  passRate: number;
  failRate: number;
  referredRate: number;
  gpa: {
    avgGpa1: number | null;
    maxGpa1: number | null;
    minGpa1: number | null;
  };
  byGroup: any[];
}

export interface ILastMonthAttendance {
  month: string;
  sessions: number;
  present: number;
  absent: number;
  late: number;
  total: number;
  attendanceRate: number;
  byGroup: {
    groupId: number;
    groupName: string;
    session: string;
    departmentId: number;
    present: number;
    absent: number;
    late: number;
    total: number;
    attendanceRate: number;
  }[];
}

export interface IDiplomaAnalysis {
  bySemester: Record<
    string,
    {
      passed: number;
      failed: number;
      referred: number;
      withheld: number;
      total: number;
      passRate: number;
    }
  >;
  byYear: Record<
    number,
    {
      passed: number;
      failed: number;
      referred: number;
      withheld: number;
      total: number;
      passRate: number;
    }
  >;
  gpaDistribution: {
    semesterName: string;
    avgGpa: number | null;
    count: number;
  }[];
  topReferredSubjects: { subject: string; count: number }[];
  topFailedSubjects: { subject: string; count: number }[];
}

export interface IAdminDashboard {
  overview: IAdminOverview;
  breakdowns: IAdminBreakdowns;
  lastSemesterDiplomaResults: ILastSemesterResults | null;
  lastMonthAttendance: ILastMonthAttendance;
  monthly: {
    attendance: IMonthlyAttendance[];
    diplomaResults: IMonthlyDiplomaResult[];
  };
  diplomaAnalysis: IDiplomaAnalysis;
  recent: {
    notices: INoticeRef[];
    events: IEventRef[];
  };
}
