export function academicYearLabel(date = new Date()) {
    const start = date.getMonth() >= 5 ? date.getFullYear() : date.getFullYear() - 1;
    return `${start}-${start + 1}`;
}

export const academicFees = [
    { id: 1, label: 'Tuition Fee', amount: 85000, deadline: '2026-06-30', status: 'UNPAID', type: 'ACADEMIC' },
    { id: 2, label: 'Library & AU Fee', amount: 5000, deadline: '2026-06-30', status: 'UNPAID', type: 'ACADEMIC' },
    { id: 3, label: 'Special Equipment Fee', amount: 3000, deadline: '2026-06-30', status: 'UNPAID', type: 'ACADEMIC' },
    { id: 4, label: 'Hostel Fee (Optional)', amount: 45000, deadline: '2026-07-15', status: 'PENDING', type: 'HOSTELLER' },
];

export const examFees = [
    { id: 'theory', label: 'Semester theory exam fee', amount: 1500, deadline: '2026-10-15', status: 'UNPAID' },
    { id: 'practical', label: 'Practical exam fee', amount: 750, deadline: '2026-10-15', status: 'UNPAID' },
    { id: 'arrear-exam', label: 'Arrear exam fee', amount: 0, deadline: '2026-10-15', status: 'PAID' },
];

export function pendingAcademicFees() {
    return academicFees
        .filter((fee) => fee.status === 'UNPAID' && fee.type === 'ACADEMIC')
        .reduce((sum, fee) => sum + fee.amount, 0);
}

export function pendingExamFees() {
    return examFees
        .filter((fee) => fee.status === 'UNPAID' && fee.amount > 0)
        .reduce((sum, fee) => sum + fee.amount, 0);
}
