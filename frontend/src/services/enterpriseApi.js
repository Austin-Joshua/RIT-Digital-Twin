import api from './api';

export const analyticsApi = {
    getDepartmentAnalytics: () => api.get('/analytics/departments'),
    getFacultyPerformance: () => api.get('/analytics/faculty-performance'),
};

export const academicAiApi = {
    getRiskPrediction: (studentId) => api.get(`/analytics/risk/${studentId}`),
    simulateCGPA: (data) => api.post(`/cgpa/simulate`, data),
    getGrowthPassport: (studentId) => api.get(`/analytics/passport/${studentId}`),
    getCareerRecommendation: (studentId) => api.get(`/analytics/career/${studentId}`),
    substituteClass: (timetableId) => api.post(`/academic-ai/substitute-class/${timetableId}`),
    generateExamTimetable: (startDate) => api.post(`/academic-ai/generate-exam-timetable?startDate=${startDate}`),
    generateClassTimetable: (payload) => api.post(`/academic/timetable/generate`, payload),
    getClassTimetableGenerateAccess: () => api.get('/academic/timetable/generate-access'),
    getStudentRanking: (studentId) => api.get(`/academic-ai/ranking/${studentId}`),
    getStudentRisk: (studentId) => api.get(`/analytics/student/${studentId}/risk`),
    triggerAttendanceAlerts: (studentId) => api.post(`/academic-ai/trigger-alerts/${studentId}`),
};

export const workflowApi = {
    getRegistrations: (studentId) => api.get(`/workflow/registrations/${studentId}`),
    registerSubject: (studentId, subjectId) => api.post(`/workflow/registrations/${studentId}/${subjectId}`),
    getCertificates: (studentId) => api.get(`/workflow/certificates/${studentId}`),
    requestCertificate: (studentId, type) => api.post(`/workflow/certificates/request/${studentId}?type=${type}`),
    approveCertificate: (requestId) => api.post(`/workflow/certificates/approve/${requestId}`),
    getResultApprovals: (departmentId, semester) => api.get(`/workflow/results/${departmentId}/${semester}`),
    uploadResults: (departmentId, semester, facultyEmail) =>
        api.post(`/workflow/results/upload?departmentId=${departmentId}&semester=${semester}&facultyEmail=${facultyEmail}`),
    publishResults: (approvalId, adminEmail) => api.post(`/workflow/results/publish/${approvalId}?adminEmail=${adminEmail}`),
    getPlacementData: (studentId) => api.get(`/workflow/placement/${studentId}`),
    updatePlacementData: (studentId, data) => api.put(`/workflow/placement/${studentId}`, data),
};

export const auditApi = {
    getAuditLogs: (page = 0, size = 50) => api.get(`/audit/logs?page=${page}&size=${size}`),
};
