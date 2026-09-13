import { academicFees, academicYearLabel, examFees, pendingAcademicFees, pendingExamFees } from '../../utils/studentFees';

const PAGES = [
    { roles: ['STUDENT'], label: 'Dashboard', path: '/student', keys: ['dashboard', 'home', 'ring', 'calendar', 'overview'], about: 'Four rings (CGPA, Attendance, Arrears, Fees Pending) and the semester calendar. Click a weekday for that day’s periods.' },
    { roles: ['STUDENT'], label: 'My Time Table', path: '/student/timetable', keys: ['timetable', 'time table', 'schedule', 'period', 'class today'], about: 'Your weekly period grid.' },
    { roles: ['STUDENT'], label: 'My Subject Registration', path: '/student/registration', keys: ['registration', 'subject registration', 'enroll', 'register subject'], about: 'Subjects you can register for this semester.' },
    { roles: ['STUDENT'], label: 'Apply Leave / OD', path: '/student/leave', keys: ['leave', 'od', 'on duty', 'absence request'], about: 'Apply for leave or on-duty and track the status.' },
    { roles: ['STUDENT'], label: 'Attendance', path: '/student/attendance', keys: ['attendance', 'absent', 'present', 'shortage'], about: 'Subject-wise periods. Keep attendance above 75%.' },
    { roles: ['STUDENT'], label: 'Apply Certificates', path: '/student/certificates', keys: ['certificate', 'bonafide', 'conduct'], about: 'Request bonafide and other certificates.' },
    { roles: ['STUDENT'], label: 'CAT Mark', path: '/student/cat-mark', keys: ['cat', 'internal test', 'cat mark'], about: 'Continuous assessment marks.' },
    { roles: ['STUDENT'], label: 'LAB Mark', path: '/student/lab-mark', keys: ['lab mark', 'laboratory', 'practical mark'], about: 'Lab and practical marks.' },
    { roles: ['STUDENT'], label: 'Assignment Mark', path: '/student/assignment', keys: ['assignment', 'homework'], about: 'Assignment marks by subject.' },
    { roles: ['STUDENT'], label: 'Grade Book', path: '/student/gradebook', keys: ['grade book', 'gradebook', 'semester grade', 'result'], about: 'Semester grades and results.' },
    { roles: ['STUDENT'], label: 'Academic Fee', path: '/student/fee', keys: ['academic fee', 'tuition', 'fees pending', 'fee due'], about: 'Tuition and college fee lines for the academic year.' },
    { roles: ['STUDENT'], label: 'Exam Fee', path: '/student/exam-fee', keys: ['exam fee', 'examination fee'], about: 'Theory, practical, and arrear exam fees.' },
    { roles: ['STUDENT'], label: 'Feedbacks', path: '/student/feedbacks', keys: ['feedback', 'survey'], about: 'Course and faculty feedback forms.' },
    { roles: ['STUDENT'], label: 'CGPA Simulator', path: '/student/simulator', keys: ['simulator', 'what if', 'what-if', 'predict cgpa'], about: 'Try a what-if CGPA using expected grades.' },
    { roles: ['STUDENT'], label: 'Club Management', path: '/student/clubs', keys: ['club', 'clubs'], about: 'College clubs you can browse or join.' },
    { roles: ['STUDENT'], label: 'Transport Directory', path: '/student/transport', keys: ['bus', 'transport', 'route', 'boarding'], about: 'Bus routes and timings.' },
    { roles: ['STUDENT'], label: 'Campus IoT Map', path: '/student/map', keys: ['map', 'campus map', 'iot'], about: 'Campus map and live building view.' },
    { roles: ['STUDENT'], label: 'Class Committee Schedule', path: '/student/committee/schedule', keys: ['committee', 'class committee', 'meeting schedule'], about: 'Class committee meeting dates.' },
    { roles: ['STUDENT'], label: 'Minutes of Meeting', path: '/student/committee/minutes', keys: ['minutes', 'mom'], about: 'Minutes from class committee meetings.' },
    { roles: ['STUDENT'], label: 'My Profile', path: '/student/profile', keys: ['profile', 'my account', 'who am i'], about: 'Your name, register number, and contact details.' },
    { roles: ['STUDENT'], label: 'No Due Request', path: '/student/nodue', keys: ['no due', 'nodue', 'clearance'], about: 'Request a no-due clearance.' },
    { roles: ['STUDENT'], label: 'Messages', path: '/student/messages', keys: ['message', 'inbox', 'mail'], about: 'Messages from the college.' },
    { roles: ['STUDENT'], label: 'Change Password', path: '/student/change-password', keys: ['password', 'change password'], about: 'Update the password for this login.' },
    { roles: ['STUDENT'], label: 'Course Materials', path: '/student/materials', keys: ['material', 'notes', 'syllabus'], about: 'Notes and course files.' },
    { roles: ['STUDENT'], label: 'Events', path: '/student/events', keys: ['event', 'fest'], about: 'Campus events.' },
    { roles: ['STUDENT'], label: 'Library', path: '/student/library', keys: ['library', 'book', 'issue'], about: 'Issued books and library status.' },
    { roles: ['STUDENT'], label: 'Theme Settings', path: '/student/settings', keys: ['theme', 'dark mode', 'light mode', 'settings'], about: 'Switch light, dark, or system theme.' },

    { roles: ['PARENT'], label: 'Parent Dashboard', path: '/parent', keys: ['dashboard', 'ward', 'overview', 'ring'], about: 'Ward rings for CGPA, attendance, arrears, and fees.' },
    { roles: ['PARENT'], label: 'My Profile', path: '/parent/profile', keys: ['profile', 'my account'], about: 'Parent account details.' },
    { roles: ['PARENT'], label: 'Academic Grades', path: '/parent/grades', keys: ['grade', 'cgpa', 'result', 'marks'], about: 'Linked student’s grade book.' },
    { roles: ['PARENT'], label: 'Attendance Feed', path: '/parent/attendance', keys: ['attendance', 'absent'], about: 'Linked student’s attendance.' },
    { roles: ['PARENT'], label: 'Academic Fee', path: '/parent/fees', keys: ['fee', 'due', 'tuition'], about: 'Academic fee lines for the linked student.' },
    { roles: ['PARENT'], label: 'Exam Fee', path: '/parent/exam-fee', keys: ['exam fee'], about: 'Exam fee lines for the linked student.' },
    { roles: ['PARENT'], label: 'Club Participation', path: '/parent/clubs', keys: ['club'], about: 'Clubs the linked student can join.' },
    { roles: ['PARENT'], label: 'Change Password', path: '/parent/change-password', keys: ['password'], about: 'Change this parent login’s password.' },

    { roles: ['FACULTY'], label: 'Faculty Dashboard', path: '/faculty', keys: ['dashboard', 'home'], about: 'Your faculty home.' },
    { roles: ['FACULTY'], label: 'Academics', path: '/faculty/academics', keys: ['academic', 'subject', 'course'], about: 'Subjects and academic work assigned to you.' },
    { roles: ['FACULTY'], label: 'My Timetable', path: '/faculty/timetable', keys: ['timetable', 'schedule', 'my class'], about: 'Your teaching timetable.' },
    { roles: ['FACULTY'], label: 'Timetable Allocation', path: '/faculty/timetable-allocation', keys: ['allocation', 'assign period'], about: 'Adjust timetable slots.' },
    { roles: ['FACULTY'], label: 'Performance Grading', path: '/faculty/grading', keys: ['grading', 'grade', 'marks'], about: 'Enter and review student performance.' },
    { roles: ['FACULTY'], label: 'Attendance', path: '/faculty/attendance', keys: ['attendance', 'roll'], about: 'Mark or review class attendance.' },
    { roles: ['FACULTY'], label: 'Leaves & Approvals', path: '/faculty/leaves', keys: ['leave', 'approval', 'od'], about: 'Student leave and OD requests waiting on you.' },
    { roles: ['FACULTY'], label: 'Class Analytics', path: '/faculty/analytics', keys: ['analytics', 'class performance'], about: 'Class-level academic analytics.' },
    { roles: ['FACULTY'], label: 'Proctor Wards', path: '/faculty/proctor', keys: ['proctor', 'ward', 'mentee'], about: 'Students assigned to you as proctor.' },
    { roles: ['FACULTY'], label: 'Upload Marks', path: '/faculty/upload-marks', keys: ['upload', 'cat mark', 'internal'], about: 'Upload CAT, lab, or assignment marks.' },
    { roles: ['FACULTY'], label: 'Class Risk Heatmap', path: '/faculty/risk-heatmap', keys: ['risk', 'heatmap'], about: 'Students who may be at academic risk.' },
    { roles: ['FACULTY'], label: 'Research Tracker', path: '/faculty/research', keys: ['research', 'paper', 'publication'], about: 'Your research and publication tracker.' },
    { roles: ['FACULTY'], label: 'Club Management', path: '/faculty/clubs', keys: ['club'], about: 'Clubs you advise.' },
    { roles: ['FACULTY'], label: 'Assignment Grading', path: '/faculty/assignments', keys: ['assignment grading', 'grade assignment'], about: 'Grade submitted assignments.' },
    { roles: ['FACULTY', 'ADMIN'], label: 'My Profile', path: '/profile', keys: ['profile', 'my account'], about: 'Your staff profile.' },
    { roles: ['FACULTY', 'ADMIN'], label: 'Theme Settings', path: '/settings', keys: ['theme', 'dark mode', 'light mode', 'settings'], about: 'Light, dark, or system theme.' },
    { roles: ['FACULTY', 'HOD', 'ADMIN'], label: 'Classroom Allocation', path: '/classrooms/allocation', keys: ['classroom allocation', 'room allocation', 'allocate room'], about: 'Assign rooms to classes.' },
    { roles: ['FACULTY'], label: 'Change Password', path: '/change-password', keys: ['password'], about: 'Change this faculty login’s password.' },

    { roles: ['HOD'], label: 'HOD Dashboard', path: '/hod', keys: ['dashboard', 'department', 'performance'], about: 'Department overview for the head of department.' },
    { roles: ['HOD'], label: 'Clubs', path: '/hod/clubs', keys: ['club'], about: 'Department club management.' },
    { roles: ['HOD'], label: 'Change Password', path: '/hod/change-password', keys: ['password'], about: 'Change this HOD login’s password.' },
    { roles: ['HOD'], label: 'Theme Settings', path: '/hod/settings', keys: ['theme', 'settings', 'dark mode'], about: 'Light, dark, or system theme.' },

    { roles: ['ADMIN'], label: 'Admin Home', path: '/', keys: ['dashboard', 'home', 'overview'], about: 'Institutional home.' },
    { roles: ['ADMIN'], label: 'Analytics', path: '/analytics', keys: ['analytics', 'kpi'], about: 'Institutional analytics.' },
    { roles: ['ADMIN'], label: 'Placements', path: '/analytics/placement', keys: ['placement', 'company', 'offer'], about: 'Placement analytics.' },
    { roles: ['ADMIN'], label: 'Audit Logs', path: '/management/audit', keys: ['audit', 'log'], about: 'Who changed what in the portal.' },
    { roles: ['ADMIN'], label: 'User Accounts', path: '/management/users', keys: ['user', 'account', 'login', 'role'], about: 'Create and manage student, faculty, parent, and admin logins.' },
    { roles: ['ADMIN'], label: 'Exam Timetables', path: '/management/exam-timetable', keys: ['exam timetable', 'hall', 'exam schedule'], about: 'Build and publish exam timetables.' },
    { roles: ['ADMIN'], label: 'Results', path: '/management/results', keys: ['result', 'publish'], about: 'Publish semester results.' },
    { roles: ['ADMIN'], label: 'Club Management', path: '/management/clubs', keys: ['club'], about: 'College-wide clubs.' },
    { roles: ['ADMIN'], label: 'Class Substitutions', path: '/management/substitutions', keys: ['substitution', 'substitute'], about: 'Cover a class when faculty are unavailable.' },
    { roles: ['ADMIN'], label: 'Certificates', path: '/management/certificates', keys: ['certificate', 'approval'], about: 'Approve student certificate requests.' },
    { roles: ['ADMIN'], label: 'Simulation lab', path: '/simulations', keys: ['simulation', 'what-if', 'scenario', 'classroom', 'crowd', 'energy scenario'], about: 'Compare simulated intake, rooms, timetable load, HVAC formula, and bus seats. Results are not campus state.' },
    { roles: ['ADMIN'], label: 'Energy formula', path: '/simulations/energy', keys: ['energy', 'power'], about: 'Stored energy formula. Not a meter.' },
    { roles: ['ADMIN'], label: 'Transport Directory', path: '/transport', keys: ['bus', 'transport directory', 'route'], about: 'Campus bus directory.' },
    { roles: ['ADMIN'], label: 'Predictive Analysis', path: '/predictions', keys: ['predict', 'forecast'], about: 'Campus predictive analysis.' },
    { roles: ['ADMIN'], label: 'Smart Algorithms', path: '/management/algorithms', keys: ['algorithm', 'smart'], about: 'Allocation and optimization algorithms.' },
    { roles: ['ADMIN'], label: 'Safety', path: '/management/safety', keys: ['safety', 'emergency'], about: 'Emergency and safety dashboard.' },
    { roles: ['ADMIN'], label: 'Assets', path: '/management/assets', keys: ['asset', 'maintenance'], about: 'Maintenance and campus assets.' },
    { roles: ['ADMIN'], label: 'HR Recruitment', path: '/management/hr-recruitment', keys: ['hr', 'recruit', 'hiring'], about: 'Recruitment records.' },
    { roles: ['ADMIN'], label: 'Inventory', path: '/management/inventory', keys: ['inventory', 'stock'], about: 'Stores and inventory.' },
    { roles: ['ADMIN'], label: 'Alumni', path: '/management/alumni', keys: ['alumni'], about: 'Alumni portal.' },
    { roles: ['ADMIN'], label: 'Campus Map', path: '/map', keys: ['map', 'campus map'], about: 'Campus map.' },
    { roles: ['ADMIN'], label: 'Change Password', path: '/change-password', keys: ['password'], about: 'Change this admin login’s password.' },
];

const ROLE_BLURB = {
    STUDENT: 'Student login: dashboard rings, timetable, attendance, marks, fees, leave, certificates, clubs, transport, and profile.',
    PARENT: 'Parent login: the linked student’s CGPA, attendance, grades, and fees. It cannot open faculty or admin tools.',
    FACULTY: 'Faculty login: your timetable, attendance, grading, leave approvals, proctor wards, and research.',
    HOD: 'HOD login: department dashboard, clubs, and theme. It sits between faculty and admin.',
    ADMIN: 'Admin login: accounts, exams, results, certificates, placements, and the digital-twin simulations.',
};

function roleOf(user) {
    return String(user?.role || 'STUDENT').replace(/^ROLE_/, '').toUpperCase();
}

function displayName(user) {
    const full = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return full || user?.username || 'there';
}

function pagesFor(role) {
    return PAGES.filter((page) => page.roles.includes(role));
}

function money(amount) {
    if (amount == null || Number.isNaN(Number(amount))) return 'Not stored';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function studentSnapshot(_user, live) {
    const cgpa = live?.cgpa == null ? null : Number(live.cgpa);
    return {
        cgpa: Number.isNaN(cgpa) ? null : cgpa,
        attendance: live?.attendance == null ? null : Math.round(Number(live.attendance)),
        arrears: live?.arrears == null ? null : Number(live.arrears),
        leave: live?.leave == null ? null : Number(live.leave),
        marks: live?.marks || null,
        results: live?.results || [],
        academicDue: pendingAcademicFees(),
        examDue: pendingExamFees(),
    };
}

function feeLines() {
    const academic = academicFees.length
        ? academicFees.map((fee) => `${fee.label}: ${money(fee.amount)}`).join('\n')
        : 'No academic fee ledger is stored for this login. The official IMS fields are tuition, hostel, other, AU / library, fine and breakage.';
    const exams = examFees.length
        ? examFees.map((fee) => `${fee.label}: ${money(fee.amount)}`).join('\n')
        : 'No exam-fee row is stored. Official rows are semester, exam month and year, and amount.';
    return { academic, exams };
}

function scorePage(query, page) {
    const words = query.split(/[^a-z0-9]+/).filter((word) => word.length > 2);
    return page.keys.reduce((sum, key) => {
        if (query.includes(key)) return sum + key.length + 4;
        const hits = key.split(' ').filter((part) => words.includes(part)).length;
        return sum + hits;
    }, 0) + (query.includes(page.label.toLowerCase()) ? 8 : 0);
}

function bestPage(query, role) {
    let best = null;
    let bestScore = 0;
    pagesFor(role).forEach((page) => {
        const score = scorePage(query, page);
        if (score > bestScore) {
            best = page;
            bestScore = score;
        }
    });
    return bestScore > 2 ? best : null;
}

function personalBrief(user, live) {
    const role = roleOf(user);
    const name = displayName(user);
    if (role === 'STUDENT') {
        const snap = studentSnapshot(user, live);
        return `${name}${user?.registerNo ? ` (${user.registerNo})` : ''}: CGPA ${snap.cgpa == null ? 'Not stored' : snap.cgpa.toFixed(2)}, attendance ${snap.attendance == null ? 'Not stored' : `${snap.attendance}%`}, arrears ${snap.arrears == null ? 'Not stored' : snap.arrears}, academic fees pending ${money(snap.academicDue)}, exam fees pending ${money(snap.examDue)}.`;
    }
    if (role === 'PARENT') {
        return `${name}, parent login. No linked student record is available to this guide, so CGPA, attendance, and fees are not stated here.`;
    }
    if (role === 'FACULTY' || role === 'HOD') {
        return `${name}, ${role.toLowerCase()} login${user?.department ? ` in ${user.department}` : ''}. Department census is not stored in this guide.`;
    }
    return `${name}, admin login${user?.email ? ` (${user.email})` : ''}. You can open accounts, exams, results, certificates, placements, and the campus simulations.`;
}

function allLoginsReply(user, live) {
    const current = roleOf(user);
    const others = Object.entries(ROLE_BLURB)
        .map(([role, blurb]) => `${role === current ? '• Current' : '•'} ${role}: ${blurb}`)
        .join('\n');
    return {
        text: `${personalBrief(user, live)}\n\nEvery login on this website:\n${others}\n\nI answer with this account’s numbers. I will not open another login’s pages from here.`,
    };
}

function openReply(page, lead) {
    return {
        text: `${lead}\n\nOpen ${page.label}. ${page.about}`,
        path: page.path,
        label: `Open ${page.label}`,
    };
}

function menuReply(user) {
    const role = roleOf(user);
    const lines = pagesFor(role).map((page) => `• ${page.label}`).join('\n');
    return {
        text: `${displayName(user)}, this ${role.toLowerCase()} login can open:\n\n${lines}\n\nAsk for any of these by name, for example “open attendance” or “what is my CGPA?”.`,
    };
}

function otherLoginReply(user, askedRole) {
    const current = roleOf(user);
    if (askedRole === current) return menuReply(user);
    return {
        text: `You are on the ${current.toLowerCase()} login as ${displayName(user)}. I will not open ${askedRole.toLowerCase()} pages from this account.\n\n${ROLE_BLURB[askedRole]}\n\nSign in with that login if you need those pages. From here, ask about your own ${current.toLowerCase()} pages.`,
    };
}

function studentFacts(query, user, live) {
    const snap = studentSnapshot(user, live);
    const fees = feeLines();
    const name = displayName(user);
    if (query.includes('attendance')) {
        return {
            text: snap.attendance == null
                ? `${name}, attendance is not stored for this guide. Subject-wise periods are on Attendance.`
                : `${name}, your attendance ring is ${snap.attendance}%.\n\nKeep it above 75%. Subject-wise periods are on Attendance.`,
            path: '/student/attendance',
            label: 'Open Attendance',
        };
    }
    if (query.includes('arrear')) {
        return {
            text: snap.arrears == null
                ? `${name}, arrears are not stored for this guide. Open Grade Book for the stored result rows.`
                : `${name}, your arrears ring shows ${snap.arrears}.`,
            path: '/student/gradebook',
            label: 'Open Grade Book',
        };
    }
    if (query.includes('cat')) {
        return { text: `${name}, CAT marks are not stored for this guide.`, path: '/student/cat-mark', label: 'Open CAT Mark' };
    }
    if (query.includes('assignment')) {
        return { text: `${name}, assignment marks are not stored for this guide.`, path: '/student/assignment', label: 'Open Assignment Mark' };
    }
    if (query.includes('cgpa') || query.includes('gpa') || /\bgrade\b/.test(query) || query.includes('grade book')) {
        return {
            text: snap.cgpa == null
                ? `${name}, CGPA is not stored for this guide. Open Grade Book for stored results.`
                : `${name}, your CGPA ring is ${snap.cgpa.toFixed(2)} / 10.`,
            path: '/student/gradebook',
            label: 'Open Grade Book',
        };
    }
    if (query.includes('exam fee')) {
        return { text: `${name}, exam fees pending: ${money(snap.examDue)}.\n\n${fees.exams}`, path: '/student/exam-fee', label: 'Open Exam Fee' };
    }
    if (query.includes('fee') || query.includes('due') || query.includes('tuition') || query.includes('pay')) {
        return {
            text: `${name}, academic fees pending: ${money(snap.academicDue)} for AY ${academicYearLabel()}.\nExam fees pending: ${money(snap.examDue)}.\n\n${fees.academic}`,
            path: '/student/fee',
            label: 'Open Academic Fee',
        };
    }
    if (query.includes('leave') || query.includes('on duty') || query.includes(' od')) {
        return { text: `${name}, recorded leave count on your profile data is ${snap.leave}. Apply or track requests on Apply Leave / OD.`, path: '/student/leave', label: 'Open Leave / OD' };
    }
    return null;
}

function parentFacts(query, user) {
    const fees = feeLines();
    const name = displayName(user);
    if (query.includes('attendance') || query.includes('ward') || query.includes('child') || query.includes('cgpa') || query.includes('grade') || query.includes('gpa')) {
        return {
            text: `${name}, no linked student record is available to this guide, so attendance and CGPA are not stated here.`,
            path: '/parent/attendance',
            label: 'Open Attendance Feed',
        };
    }
    if (query.includes('fee') || query.includes('due') || query.includes('pay')) {
        return {
            text: `${name}, no linked fee ledger is stored for this parent login.\n\n${fees.academic}`,
            path: '/parent/fees',
            label: 'Open Academic Fee',
        };
    }
    return null;
}

function facultyFacts(query, user) {
    const name = displayName(user);
    if (query.includes('department') || query.includes('hod') || query.includes('pass percent')) {
        return {
            text: `${name}, no department census is stored in this guide, so student counts and pass percentage are not stated here.`,
            path: roleOf(user) === 'HOD' ? '/hod' : '/faculty/analytics',
            label: roleOf(user) === 'HOD' ? 'Open HOD Dashboard' : 'Open Class Analytics',
        };
    }
    return null;
}

export function greetingFor(user, live) {
    return `Hello ${displayName(user)}.\n\n${personalBrief(user, live)}\n\nI only use this website and this login. Ask for a page, your numbers, or “all logins”.`;
}

export function suggestionsFor(user) {
    const role = roleOf(user);
    if (role === 'PARENT') return ['Who is my ward?', 'Ward attendance', 'Fee dues', 'What can I open?'];
    if (role === 'FACULTY') return ['My timetable', 'Leave approvals', 'Proctor wards', 'What can I open?'];
    if (role === 'HOD') return ['Department snapshot', 'Clubs', 'What can I open?'];
    if (role === 'ADMIN') return ['User accounts', 'Exam timetables', 'Energy optimization', 'What can I open?'];
    return ['What is my CGPA?', 'My attendance', 'Academic fees', 'What can I open?'];
}

export function answerForUser(query, user, extras = {}) {
    const text = String(query || '').trim().toLowerCase();
    const role = roleOf(user);
    if (!text) return { text: 'Type a question about this login.' };

    if (/^(open|go|show|take me)( it| that| there)?$/.test(text) && extras.lastPath) {
        const page = PAGES.find((item) => item.path === extras.lastPath);
        return { text: `Opening ${page?.label || 'that page'}.`, path: extras.lastPath, label: `Open ${page?.label || 'page'}` };
    }

    if (/\b(this page|where am i|current page)\b/.test(text)) {
        const here = pagesFor(role).find((page) => page.path === extras.here);
        if (here) return openReply(here, `${displayName(user)}, you are on ${here.label}.`);
    }

    const wantsPage = /^(open|go to|show|take me)\b/.test(text);
    if (/\b(all logins|every login|other logins|which logins|logins)\b/.test(text)) return allLoginsReply(user, extras.live);
    if (!wantsPage && /\b(who am i|my login|my account|which login|my summary|how am i)\b/.test(text)) {
        return { text: personalBrief(user, extras.live) };
    }
    if (!wantsPage && /\b(what can i|which pages|menu|help|what do you know|everything)\b/.test(text)) return menuReply(user);
    if (!wantsPage && /^(hi|hello|hey|good morning|good evening)\b/.test(text)) return { text: greetingFor(user, extras.live) };

    if (/\bfaculty login\b|\bas a faculty\b|\bfaculty pages\b/.test(text)) return otherLoginReply(user, 'FACULTY');
    if (/\bparent login\b|\bas a parent\b|\bparent pages\b/.test(text)) return otherLoginReply(user, 'PARENT');
    if (/\bstudent login\b|\bas a student\b|\bstudent pages\b/.test(text)) return otherLoginReply(user, 'STUDENT');
    if (/\badmin login\b|\bas an admin\b|\badmin pages\b/.test(text)) return otherLoginReply(user, 'ADMIN');
    if (/\bhod login\b|\bas hod\b|\bhod pages\b/.test(text)) return otherLoginReply(user, 'HOD');

    if (role === 'STUDENT' || role === 'PARENT') {
        const personal = role === 'PARENT' ? parentFacts(text, user) : studentFacts(text, user, extras.live);
        if (personal && !text.startsWith('open ') && !text.startsWith('go to ')) return personal;
    }
    if (role === 'FACULTY' || role === 'HOD') {
        const personal = facultyFacts(text, user);
        if (personal) return personal;
    }

    const page = bestPage(text, role);
    if (page) {
        return openReply(page, `${displayName(user)}, that is on your ${role.toLowerCase()} login.`);
    }

    const foreign = PAGES.find((item) => !item.roles.includes(role) && item.keys.some((key) => key.length > 3 && text.includes(key)));
    if (foreign) {
        return {
            text: `${displayName(user)}, “${foreign.label}” is on the ${foreign.roles[0].toLowerCase()} login, not this ${role.toLowerCase()} account.\n\n${ROLE_BLURB[foreign.roles[0]]}\n\nYour account: ${personalBrief(user, extras.live)}`,
        };
    }

    return {
        text: `${personalBrief(user, extras.live)}\n\nI don’t have a matching page for that on this login. Ask “what can I open?” or name a page, such as attendance, fees, timetable, or clubs.`,
    };
}
