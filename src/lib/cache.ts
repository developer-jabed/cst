// lib/cache.ts
export const CACHE = {
  // Auth / User
  user: { revalidate: 1800, tags: ["user-info"] as string[] },

  // Dashboards
  adminDashboard: { revalidate: 300, tags: ["admin-dashboard"] as string[] },
  studentDashboard: { revalidate: 60, tags: ["student-dashboard"] as string[] },
  teacherDashboard: { revalidate: 60, tags: ["teacher-dashboard"] as string[] },

  // Relatively static data
  groups: { revalidate: 1800, tags: ["groups"] as string[] },
  departments: { revalidate: 3600, tags: ["departments"] as string[] },
  semesters: { revalidate: 3600, tags: ["semesters"] as string[] },
  shifts: { revalidate: 3600, tags: ["shifts"] as string[] },
  subjects: { revalidate: 1800, tags: ["subjects"] as string[] },

  // Dynamic data
  results: { revalidate: 300, tags: ["results-list"] as string[] },
  resultByRoll: (roll: string) => ({
    revalidate: 300,
    tags: [`result-${roll}`, "results-list"] as string[],
  }),
  notices: { revalidate: 120, tags: ["notices"] as string[] },
  attendance: { revalidate: 60, tags: ["attendance-list"] as string[] },
  practicals: { revalidate: 60, tags: ["practical-list"] as string[] },
  events: { revalidate: 120, tags: ["events"] as string[] },
  routines: { revalidate: 300, tags: ["routines"] as string[] },
  overview: { revalidate: 60, tags: ["overview"] as string[] },
  teachers: { revalidate: 300, tags: ["teachers-list"] as string[] },
  students: { revalidate: 120, tags: ["students-list"] as string[] },
};