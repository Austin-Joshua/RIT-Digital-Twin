export function academicYearLabel(date = new Date()) {
    const start = date.getMonth() >= 5 ? date.getFullYear() : date.getFullYear() - 1;
    return `${start}-${start + 1}`;
}

export const academicFees = [
    { id: 1, title: 'Tuition Fee', description: 'Annual Academic Tuition Fee', amount: 87000, paid: 87000, dueDate: '2026-06-30', status: 'PAID', category: 'Academic' },
    { id: 2, title: 'Other Fee', description: 'Institutional & Campus Facilities Fee', amount: 138000, paid: 138000, dueDate: '2026-06-30', status: 'PAID', category: 'Academic' },
    { id: 3, title: 'AU / Library Fee', description: 'Anna University Affiliation & Digital Library Fee', amount: 625, paid: 625, dueDate: '2026-06-30', status: 'PAID', category: 'Academic' }
];

export const examFees = [
    { id: 101, semester: 'Semester IV', title: 'Anna University End Semester Exam Fee (Sem IV)', amount: 2950, paid: 2950, dueDate: '2026-05-05', status: 'PAID' },
    { id: 102, semester: 'Semester V', title: 'Anna University End Semester Exam Fee (Sem V)', amount: 2950, paid: 0, dueDate: '2026-09-15', status: 'PENDING' }
];

export function pendingAcademicFees() {
    return academicFees.filter(f => f.status === 'UNPAID' || f.status === 'PENDING');
}

export function pendingExamFees() {
    return examFees.filter(f => f.status === 'PENDING');
}
