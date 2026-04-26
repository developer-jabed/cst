export type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "CR";

// ─────────────────────────────────────────────────────────────────────────────
// Route config shape
// ─────────────────────────────────────────────────────────────────────────────
export type RouteConfig = {
  exact: string[];
  patterns: RegExp[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Public routes (no auth required)
// ─────────────────────────────────────────────────────────────────────────────
export const authRoutes = ["/login", "/register"];

// ─────────────────────────────────────────────────────────────────────────────
// Protected route definitions
// ─────────────────────────────────────────────────────────────────────────────
export const commonProtectedRoutes: RouteConfig = {
  exact: ["/my-profile", "/settings", "/change-password"],
  patterns: [],
};

export const adminProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/admin\//],
};

export const teacherProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/teacher\//],
};

export const studentProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/dashboard\/student\//],
};

export const crProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/dashboard\/cr\//],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
export const isAuthRoute = (pathname: string): boolean =>
  authRoutes.includes(pathname);

export const isRouteMatches = (pathname: string, routes: RouteConfig): boolean =>
  routes.exact.includes(pathname) ||
  routes.patterns.some((pattern) => pattern.test(pathname));

// Returns which role owns this route
export const getRouteOwner = (pathname: string): UserRole | "COMMON" | null => {
  if (isRouteMatches(pathname, adminProtectedRoutes)) return "ADMIN";
  if (isRouteMatches(pathname, teacherProtectedRoutes)) return "TEACHER";
  if (isRouteMatches(pathname, crProtectedRoutes)) return "CR"; // CR before STUDENT
  if (isRouteMatches(pathname, studentProtectedRoutes)) return "STUDENT";
  if (isRouteMatches(pathname, commonProtectedRoutes)) return "COMMON";
  return null;
};


export const getDefaultDashboardRoute = (role: UserRole): string => {
  const routes: Record<UserRole, string> = {
    ADMIN: "/admin/dashboard",
    TEACHER: "/teacher/dashboard",
    STUDENT: "/dashboard/student",
    CR: "/dashboard/cr",
  };
  return routes[role] ?? "/";
};


export const getUserDashboardRoute = (role: UserRole | null): string => {
  if (!role) return "/login"; // Not logged in → go to login
  return getDefaultDashboardRoute(role);
};

// Check if a redirect path is valid for the user's role
export const isValidRedirectForRole = (
  redirectPath: string,
  role: UserRole
): boolean => {
  const routeOwner = getRouteOwner(redirectPath);
  if (routeOwner === null || routeOwner === "COMMON") return true;
  return routeOwner === role;
};


export const handleDashboardClick = (currentRole: UserRole | null): string => {
  return getUserDashboardRoute(currentRole);
};

