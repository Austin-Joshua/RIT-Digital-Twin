const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api";

const API_TIMEOUT = 30000;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL.replace(/\/+$/, ""),
  TIMEOUT: API_TIMEOUT,
  ENDPOINTS: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh",
    VERIFY_TOKEN: "/auth/verify",
    STUDENT_DASHBOARD: "/student/dashboard",
    STUDENT_COURSES: "/student/courses",
    STUDENT_GRADES: "/student/grades",
    STUDENT_ATTENDANCE: "/student/attendance",
    STUDENT_PROFILE: "/student/profile",
    FACULTY_DASHBOARD: "/faculty/dashboard",
    FACULTY_COURSES: "/faculty/courses",
    FACULTY_STUDENTS: "/faculty/students",
    FACULTY_ATTENDANCE: "/faculty/attendance",
    FACULTY_GRADES: "/faculty/grades",
    ADMIN_DASHBOARD: "/admin/dashboard",
    ADMIN_USERS: "/admin/users",
    ADMIN_COURSES: "/admin/courses",
    ADMIN_DEPARTMENTS: "/admin/departments",
    ADMIN_REPORTS: "/admin/reports",
    CLASSROOMS: "/classrooms",
    CLASSROOM_BOOKINGS: "/classrooms/bookings",
    CLASSROOM_AVAILABILITY: "/classrooms/availability",
  },
};

export default API_CONFIG;
