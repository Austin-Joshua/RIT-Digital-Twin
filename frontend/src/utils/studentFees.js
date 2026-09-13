export function academicYearLabel(date = new Date()) {
    const start = date.getMonth() >= 5 ? date.getFullYear() : date.getFullYear() - 1;
    return `${start}-${start + 1}`;
}

export const academicFees = [];
export const examFees = [];

export function pendingAcademicFees() {
    return null;
}

export function pendingExamFees() {
    return null;
}
