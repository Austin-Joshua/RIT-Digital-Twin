/**
 * Deterministic Mock Data Generator for RIT Digital Twin
 * Provides unique, persistent academic data (CGPA, Attendance, Marks)
 * based on the student's email/ID.
 */

const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

const seededRandom = (seed) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

// Official RIT Curriculums
const CURRICULUM = {
    CSE: {
        1: [
            { code: 'MA3151', name: 'Matrices and Calculus' },
            { code: 'PH3151', name: 'Engineering Physics' },
            { code: 'CY3151', name: 'Engineering Chemistry' },
            { code: 'GE3151', name: 'Problem Solving and Python Programming' },
            { code: 'HS3151', name: 'Professional English - I' },
            { code: 'GE3171', name: 'Python Programming Lab' },
            { code: 'BS3171', name: 'Physics and Chemistry Lab' }
        ],
        2: [
            { code: 'MA3251', name: 'Statistics and Numerical Methods' },
            { code: 'PH3256', name: 'Physics for Information Science' },
            { code: 'BE3251', name: 'Basic Electrical and Electronics Engineering' },
            { code: 'GE3251', name: 'Engineering Graphics' },
            { code: 'CS3251', name: 'C Programming' },
            { code: 'CS3271', name: 'C Programming Lab' },
            { code: 'GE3271', name: 'Engineering Practices Lab' }
        ],
        3: [
            { code: 'MA3354', name: 'Discrete Mathematics' },
            { code: 'CS3351', name: 'Digital Principles and Computer Organization' },
            { code: 'CS3301', name: 'Data Structures' },
            { code: 'CS3391', name: 'Object Oriented Programming' },
            { code: 'CS3305', name: 'Operating Systems' },
            { code: 'CS3311', name: 'Data Structures Lab' },
            { code: 'CS3381', name: 'Object Oriented Programming Lab' }
        ]
    },
    CSBS: {
        1: [
            { code: 'MA101', name: 'Discrete Mathematics' },
            { code: 'ST101', name: 'Probability and Statistics' },
            { code: 'PH101', name: 'Physics for Computing Science' },
            { code: 'HS101', name: 'Business Communication - I' },
            { code: 'EC101', name: 'Principles of Economics' },
            { code: 'CS101', name: 'Fundamentals of Computer Science' },
            { code: 'CS171', name: 'Python for Business Lab' }
        ],
        2: [
            { code: 'MA201', name: 'Linear Algebra' },
            { code: 'ST201', name: 'Computational Statistics' },
            { code: 'CS201', name: 'Data Structures and Algorithms' },
            { code: 'MG201', name: 'Principles of Management' },
            { code: 'AC201', name: 'Financial Accounting' },
            { code: 'HS201', name: 'Business Communication - II' },
            { code: 'CS271', name: 'Data Structures Lab' }
        ],
        3: [
            { code: 'CS301', name: 'Formal Language and Automata Theory' },
            { code: 'CS302', name: 'Computer Organization and Architecture' },
            { code: 'CS303', name: 'Object Oriented Programming' },
            { code: 'SE301', name: 'Software Engineering' },
            { code: 'IN301', name: 'Introduction to Innovation' },
            { code: 'MG301', name: 'Marketing Management' },
            { code: 'CS371', name: 'OOP & Business Lab' }
        ]
    }
};

const getGradeForScore = (score) => {
    if (score >= 90) return 'O';
    if (score >= 80) return 'A+';
    if (score >= 70) return 'A';
    if (score >= 60) return 'B+';
    if (score >= 50) return 'B';
    return 'RA';
};

/**
 * Generates unique academic stats for a student
 */
export const getAcademicStats = (email) => {
    const seed = hashCode(email || 'guest@ritchennai.edu.in');
    const r1 = seededRandom(seed);
    const r2 = seededRandom(seed + 1);
    
    return {
        cgpa: 7.5 + (r1 * 2.3), // 7.5 to 9.8
        attendance: 82 + (r2 * 16), // 82% to 98%
        arrears: r1 > 0.9 ? 1 : 0, // 10% chance of 1 arrear
        leave: Math.floor(r2 * 5), // 0 to 4 leaves
        trend: [
            { name: 'Jan', gpa: 7.5 + (r1 * 1.5), attendance: 80 + (r2 * 10) },
            { name: 'Feb', gpa: 7.6 + (r1 * 1.6), attendance: 82 + (r2 * 11) },
            { name: 'Mar', gpa: 7.8 + (r1 * 1.7), attendance: 85 + (r2 * 12) },
            { name: 'Apr', gpa: 8.0 + (r1 * 1.8), attendance: 88 + (r2 * 10) },
            { name: 'May', gpa: 8.2 + (r1 * 1.9), attendance: 90 + (r2 * 8) },
        ]
    };
};

/**
 * Generates CAT & Assignment marks for dashboards
 */
export const getInternalMarks = (email) => {
    const seed = hashCode(email || 'guest@ritchennai.edu.in');
    
    const subjects = ['Data Structures', 'Discrete Mathematics', 'Physics', 'Digital Principles', 'Economics'];
    
    return {
        cat: subjects.map((sub, i) => ({
            subject: sub,
            score: Math.floor(38 + seededRandom(seed + i) * 11.5), // 38 to 49.5
            max: 50
        })),
        assignments: subjects.map((sub, i) => ({
            subject: sub,
            score: Math.floor(16 + seededRandom(seed + 5 + i) * 4.5), // 16 to 20
            max: 20
        }))
    };
};

/**
 * Generates Semester Results
 */
export const getSemesterResults = (email, semester) => {
    const seed = hashCode(email || 'guest@ritchennai.edu.in');
    const curriculumType = (email && (email.toLowerCase().includes('csbs') || email.toLowerCase().includes('80'))) ? 'CSBS' : 'CSE';
    const deptSubjects = CURRICULUM[curriculumType][semester] || [];
    
    return deptSubjects.map((sub, idx) => {
        const subSeed = seed + (semester * 10) + idx;
        const score = 55 + (seededRandom(subSeed) * 44); // 55 to 99
        const grade = getGradeForScore(score);
        
        return {
            year: semester <= 2 ? '2024-2025' : '2025-2026',
            sem: semester === 1 ? 'I' : semester === 2 ? 'II' : 'III',
            code: sub.code,
            title: sub.name,
            grade: grade,
            result: grade === 'RA' ? 'RA' : 'PASS',
            monthYear: semester % 2 === 1 ? 'DEC 2024' : 'MAY 2025'
        };
    });
};

/**
 * Generates HOD-Level Department Stats
 */
export const getDepartmentStats = (deptCode) => {
    const seed = hashCode(deptCode || 'CSE');
    const r1 = seededRandom(seed);
    
    return {
        totalFaculty: Math.floor(25 + r1 * 10),
        totalStudents: Math.floor(450 + r1 * 120),
        averageMarks: (72 + r1 * 12).toFixed(2),
        passPercentage: (88 + r1 * 8).toFixed(1),
        averageAttendance: (86 + r1 * 7).toFixed(1),
        internalMarksAverage: (42 + r1 * 5).toFixed(2)
    };
};
