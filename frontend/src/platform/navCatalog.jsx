import {
    LuLayoutDashboard, LuMap, LuTrendingUp, LuBriefcase, LuCpu, LuShieldAlert,
    LuSchool, LuLightbulb, LuBus, LuUsers, LuCalendar, LuBook, LuAward,
    LuRefreshCcw, LuFileCode, LuKey, LuUser, LuSettings, LuClock, LuBookOpen,
    LuFileText, LuCalendarCheck2, LuPenTool, LuTestTube, LuClipboardList,
    LuBanknote, LuMessageSquare, LuCalculator, LuFileCheck, LuMail
} from 'react-icons/lu';

export const NAV_SECTIONS = [
    { id: 'campus', label: 'Campus' },
    { id: 'intelligence', label: 'Intelligence' },
    { id: 'simulation', label: 'Simulation' },
    { id: 'operations', label: 'Operations' },
    { id: 'academics', label: 'Academics' },
    { id: 'people', label: 'People' },
    { id: 'account', label: 'Account' },
];

/** Existing routes only. Hidden items appear in the command bar, not the sidebar. */
export const NAV_CATALOG = [
    { section: 'campus', roles: ['ADMIN'], path: '/', label: 'RIT Digital Twin', end: true, icon: LuLayoutDashboard, keywords: ['home', 'dashboard', 'campus', 'command'] },
    { section: 'campus', roles: ['ADMIN'], path: '/map', label: 'Map', icon: LuMap, keywords: ['digital twin', 'campus map', 'buildings'] },
    { section: 'intelligence', roles: ['ADMIN'], path: '/predictions', label: 'Predictions', icon: LuTrendingUp, keywords: ['forecast', 'view predictions', 'decisions', 'decision center'] },
    { section: 'intelligence', roles: ['ADMIN'], path: '/analytics', label: 'Analytics', end: true, icon: LuTrendingUp, keywords: ['insights', 'departments'] },
    { section: 'intelligence', roles: ['ADMIN'], path: '/analytics/placement', label: 'Placement insights', icon: LuBriefcase, keywords: ['placements'] },
    { section: 'intelligence', roles: ['ADMIN'], path: '/management/algorithms', label: 'Insights', icon: LuCpu, keywords: ['algorithms', 'smart'] },
    { section: 'simulation', roles: ['ADMIN'], path: '/simulations', label: 'Simulation lab', icon: LuSchool, keywords: ['simulation lab', 'what-if', 'run simulation', 'scenario'] },
    { section: 'operations', roles: ['ADMIN'], path: '/classrooms/allocation', label: 'Classrooms', icon: LuSchool, keywords: ['booking', 'rooms'] },
    { section: 'operations', roles: ['ADMIN'], path: '/transport', label: 'Transport', icon: LuBus, keywords: ['routes', 'bus'] },
    { section: 'operations', roles: ['ADMIN'], path: '/management/assets', label: 'Maintenance', icon: LuLightbulb, keywords: ['assets'] },
    { section: 'operations', roles: ['ADMIN'], path: '/management/inventory', label: 'Resources', icon: LuClipboardList, keywords: ['inventory'] },
    { section: 'operations', roles: ['ADMIN'], path: '/management/safety', label: 'Safety', icon: LuShieldAlert, keywords: ['alerts', 'emergency', 'open alerts'] },
    { section: 'operations', roles: ['ADMIN'], path: '/management/certificates', label: 'Certificates', icon: LuAward },
    { section: 'operations', roles: ['ADMIN'], path: '/management/substitutions', label: 'Substitutions', icon: LuRefreshCcw },
    { section: 'operations', roles: ['ADMIN'], path: '/management/audit', label: 'Audit', icon: LuFileCode },
    { section: 'operations', roles: ['ADMIN'], path: '/management/clubs', label: 'Clubs', icon: LuUsers },
    { section: 'academics', roles: ['ADMIN'], path: '/management/exam-timetable', label: 'Timetable', icon: LuCalendar },
    { section: 'academics', roles: ['ADMIN'], path: '/management/results', label: 'Results', icon: LuBook, keywords: ['marks'] },
    { section: 'people', roles: ['ADMIN'], path: '/management/users', label: 'People', icon: LuUsers, keywords: ['students', 'faculty', 'parents', 'accounts'] },
    { section: 'people', roles: ['ADMIN'], path: '/management/alumni', label: 'Alumni', icon: LuAward },
    { section: 'people', roles: ['ADMIN'], path: '/management/hr-recruitment', label: 'HR', icon: LuBriefcase },
    { section: 'account', roles: ['ADMIN'], path: '/settings', label: 'Settings', icon: LuSettings },
    { section: 'account', roles: ['ADMIN'], path: '/change-password', label: 'Change password', icon: LuKey },

    { section: 'campus', roles: ['FACULTY'], path: '/faculty', label: 'Overview', end: true, icon: LuLayoutDashboard, keywords: ['dashboard', 'home'] },
    { section: 'campus', roles: ['FACULTY'], path: '/faculty/twin', label: 'Campus state', icon: LuLayoutDashboard, keywords: ['digital twin', 'alerts', 'rooms', 'decisions'] },
    { section: 'campus', roles: ['FACULTY'], path: '/faculty/map', label: 'Map', icon: LuMap, keywords: ['digital twin', 'campus map', 'buildings'] },
    { section: 'intelligence', roles: ['FACULTY'], path: '/faculty/analytics', label: 'Analytics', icon: LuTrendingUp, keywords: ['insights'] },
    { section: 'intelligence', roles: ['FACULTY'], path: '/faculty/risk-heatmap', label: 'Class risk', icon: LuShieldAlert, keywords: ['alerts', 'heatmap'] },
    { section: 'academics', roles: ['FACULTY'], path: '/faculty/academics', label: 'Academics', icon: LuBook },
    { section: 'academics', roles: ['FACULTY'], path: '/faculty/timetable', label: 'My timetable', icon: LuCalendar },
    { section: 'academics', roles: ['FACULTY'], path: '/faculty/timetable-allocation', label: 'Timetable allocation', icon: LuCalendar },
    { section: 'academics', roles: ['FACULTY'], path: '/faculty/attendance', label: 'Attendance', icon: LuCalendarCheck2 },
    { section: 'academics', roles: ['FACULTY'], path: '/faculty/grading', label: 'Marks', icon: LuAward, keywords: ['grades'] },
    { section: 'academics', roles: ['FACULTY'], path: '/faculty/upload-marks', label: 'Upload marks', icon: LuAward },
    { section: 'academics', roles: ['FACULTY'], path: '/faculty/assignments', label: 'Assignments', icon: LuClipboardList },
    { section: 'operations', roles: ['FACULTY'], path: '/faculty/leaves', label: 'Leaves', icon: LuRefreshCcw },
    { section: 'operations', roles: ['FACULTY'], path: '/faculty/clubs', label: 'Clubs', icon: LuUsers },
    { section: 'operations', roles: ['FACULTY'], path: '/faculty/research', label: 'Research', icon: LuLightbulb },
    { section: 'people', roles: ['FACULTY'], path: '/faculty/proctor', label: 'Students', icon: LuUsers, keywords: ['proctor', 'wards'] },
    { section: 'account', roles: ['FACULTY'], path: '/settings', label: 'Settings', icon: LuSettings },
    { section: 'account', roles: ['FACULTY'], path: '/change-password', label: 'Change password', icon: LuKey },

    { section: 'campus', roles: ['HOD'], path: '/hod', label: 'Overview', end: true, icon: LuLayoutDashboard, keywords: ['dashboard', 'home', 'department', 'risk', 'attendance', 'students', 'academics'] },
    { section: 'campus', roles: ['HOD'], path: '/hod/twin', label: 'Campus state', icon: LuLayoutDashboard, keywords: ['digital twin', 'alerts', 'decisions', 'campus'] },
    { section: 'campus', roles: ['HOD'], path: '/hod/map', label: 'Map', icon: LuMap, keywords: ['digital twin', 'campus map', 'buildings'] },
    { section: 'simulation', roles: ['HOD'], path: '/hod/simulation', label: 'Simulation lab', icon: LuSchool, keywords: ['simulation lab', 'what-if', 'run simulation', 'scenario'] },
    { section: 'operations', roles: ['HOD'], path: '/hod/clubs', label: 'Clubs', icon: LuUsers },
    { section: 'account', roles: ['HOD'], path: '/hod/settings', label: 'Settings', icon: LuSettings },
    { section: 'account', roles: ['HOD'], path: '/hod/change-password', label: 'Change password', icon: LuKey },

    { section: 'campus', roles: ['STUDENT'], path: '/student', label: 'Dashboard', end: true, icon: LuLayoutDashboard, keywords: ['dashboard', 'home', 'overview'] },
    { section: 'campus', roles: ['STUDENT'], path: '/student/map', label: 'Map', icon: LuMap, keywords: ['digital twin', 'campus map', 'buildings'] },
    { section: 'simulation', roles: ['STUDENT'], path: '/student/simulator', label: 'What-if CGPA', icon: LuCalculator, keywords: ['simulation', 'run simulation', 'cgpa'] },
    { section: 'operations', roles: ['STUDENT'], path: '/student/transport', label: 'Transport', icon: LuBus },
    { section: 'operations', roles: ['STUDENT'], path: '/student/library', label: 'Library', icon: LuBook },
    { section: 'operations', roles: ['STUDENT'], path: '/student/events', label: 'Events', icon: LuCalendar },
    { section: 'academics', roles: ['STUDENT'], path: '/student/timetable', label: 'My Time Table', icon: LuClock, keywords: ['timetable'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/registration', label: 'My Subject Registration', icon: LuBookOpen, keywords: ['registration'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/attendance', label: 'Attendance', icon: LuCalendarCheck2 },
    { section: 'academics', roles: ['STUDENT'], path: '/student/cat-mark', label: 'CAT Mark', icon: LuPenTool, keywords: ['cat marks'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/lab-mark', label: 'LAB Mark', icon: LuTestTube, keywords: ['lab marks'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/assignment', label: 'Assignment Mark', icon: LuClipboardList, keywords: ['assignments'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/gradebook', label: 'Grade Book', icon: LuBook, keywords: ['gradebook'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/certificates', label: 'Apply Certificates', icon: LuAward, keywords: ['certificates'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/fee', label: 'Academic Fee', icon: LuBanknote, keywords: ['fees', 'payment'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/exam-fee', label: 'Exam Fee', icon: LuBanknote, keywords: ['exam fee'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/leave', label: 'Apply Leave / OD', icon: LuFileText, keywords: ['leave', 'od'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/feedbacks', label: 'Feedbacks', icon: LuMessageSquare, keywords: ['feedback'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/materials', label: 'Materials', icon: LuBookOpen },
    { section: 'academics', roles: ['STUDENT'], path: '/student/committee/schedule', label: 'Schedule', icon: LuCalendarCheck2, keywords: ['class committee', 'committee schedule'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/committee/minutes', label: 'Minutes Of Meet', icon: LuFileText, keywords: ['class committee', 'mom', 'minutes'] },
    { section: 'academics', roles: ['STUDENT'], path: '/student/nodue', label: 'No Due Request', icon: LuFileCheck, keywords: ['no due'] },
    { section: 'people', roles: ['STUDENT'], path: '/student/clubs', label: 'Clubs', icon: LuUsers },
    { section: 'people', roles: ['STUDENT'], path: '/student/messages', label: 'Messages', icon: LuMail },
    { section: 'account', roles: ['STUDENT'], path: '/student/profile', label: 'My Profile', icon: LuUser, keywords: ['profile'] },
    { section: 'account', roles: ['STUDENT'], path: '/student/settings', label: 'Settings', icon: LuSettings },
    { section: 'account', roles: ['STUDENT'], path: '/student/change-password', label: 'Change password', icon: LuKey },

    { section: 'campus', roles: ['PARENT'], path: '/parent', label: 'Overview', end: true, icon: LuLayoutDashboard, keywords: ['dashboard', 'home'] },
    { section: 'academics', roles: ['PARENT'], path: '/parent/grades', label: 'Grades', icon: LuAward },
    { section: 'academics', roles: ['PARENT'], path: '/parent/attendance', label: 'Attendance', icon: LuCalendarCheck2 },
    { section: 'academics', roles: ['PARENT'], path: '/parent/fees', label: 'Academic Fee', icon: LuBanknote, keywords: ['fees', 'payment'] },
    { section: 'academics', roles: ['PARENT'], path: '/parent/exam-fee', label: 'Exam Fee', icon: LuBanknote, keywords: ['exam fee'] },
    { section: 'people', roles: ['PARENT'], path: '/parent/clubs', label: 'Clubs', icon: LuUsers },
    { section: 'account', roles: ['PARENT'], path: '/parent/profile', label: 'Profile', icon: LuUser },
    { section: 'account', roles: ['PARENT'], path: '/parent/change-password', label: 'Change password', icon: LuKey },
];

export function normalizeRole(role) {
    return String(role || '').replace('ROLE_', '').toUpperCase();
}

export function itemsForRole(role) {
    const normalized = normalizeRole(role);
    return NAV_CATALOG.filter((item) => item.roles.includes(normalized));
}

export function sectionsForRole(role) {
    const items = itemsForRole(role).filter((item) => !item.hidden);
    return NAV_SECTIONS
        .map((section) => ({ ...section, items: items.filter((item) => item.section === section.id) }))
        .filter((section) => section.items.length);
}

export function searchCatalog(role, query) {
    const needle = query.trim().toLowerCase();
    if (!needle) return itemsForRole(role).slice(0, 8);
    return itemsForRole(role).filter((item) => {
        const haystack = [item.label, item.section, ...(item.keywords || [])].join(' ').toLowerCase();
        return haystack.includes(needle);
    }).slice(0, 12);
}
