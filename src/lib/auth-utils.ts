export type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "CR";

// ─────────────────────────────────────────────────────────────────────────────
// Route config shape
// exact    — full pathname match  e.g. "/my-profile"
// patterns — prefix / regex match e.g. /^\/dashboard\/student/
// ─────────────────────────────────────────────────────────────────────────────
export type RouteConfig = {
    exact:    string[];
    patterns: RegExp[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth (public) routes
// ─────────────────────────────────────────────────────────────────────────────
export const authRoutes = ["/login"];

// ─────────────────────────────────────────────────────────────────────────────
// Protected route definitions — ordered from most-specific to least-specific
// so getRouteOwner() resolves without overlap
// ─────────────────────────────────────────────────────────────────────────────
export const commonProtectedRoutes: RouteConfig = {
    exact:    ["/my-profile", "/settings", "/change-password"],
    patterns: [], // e.g. /^\/password\// for future password-related routes
};

export const adminProtectedRoutes: RouteConfig = {
    exact:    [],
    patterns: [/^\/admin\//],         // /admin/*
};

export const teacherProtectedRoutes: RouteConfig = {
    exact:    [],
    patterns: [/^\/teacher\//],       // /teacher/*
};

export const studentProtectedRoutes: RouteConfig = {
    exact:    [],
    patterns: [/^\/dashboard\/student\//], // /dashboard/student/*
};

export const crProtectedRoutes: RouteConfig = {
    exact:    [],
    patterns: [/^\/dashboard\/cr\//], // /dashboard/cr/*
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
export const isAuthRoute = (pathname: string): boolean =>
    authRoutes.includes(pathname);

export const isRouteMatches = (pathname: string, routes: RouteConfig): boolean =>
    routes.exact.includes(pathname) ||
    routes.patterns.some((pattern) => pattern.test(pathname));

// Returns which role "owns" the given route.
// Order matters: more-specific patterns must be checked before broader ones.
export const getRouteOwner = (
    pathname: string
): UserRole | "COMMON" | null => {
    if (isRouteMatches(pathname, adminProtectedRoutes))   return "ADMIN";
    if (isRouteMatches(pathname, teacherProtectedRoutes)) return "TEACHER";
    if (isRouteMatches(pathname, crProtectedRoutes))      return "CR";      // before STUDENT — more specific
    if (isRouteMatches(pathname, studentProtectedRoutes)) return "STUDENT";
    if (isRouteMatches(pathname, commonProtectedRoutes))  return "COMMON";
    return null;
};

export const getDefaultDashboardRoute = (role: UserRole): string => {
    const routes: Record<UserRole, string> = {
        ADMIN:   "/admin/dashboard",
        TEACHER: "/teacher/dashboard",
        STUDENT: "/dashboard/student",
        CR:      "/dashboard/cr",
    };
    return routes[role] ?? "/";
};

export const isValidRedirectForRole = (redirectPath: string, role: UserRole): boolean => {
    const routeOwner = getRouteOwner(redirectPath);
    if (routeOwner === null || routeOwner === "COMMON") return true;
    return routeOwner === role;
};