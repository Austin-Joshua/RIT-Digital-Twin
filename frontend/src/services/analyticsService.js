import api from './api';

const analyticsService = {
  getAttendanceRisk: () => api.get('/analytics/attendance'),
  getPerformanceWarnings: () => api.get('/analytics/performance'),
  runAnalytics: () => api.post('/analytics/run'),
  getDepartmentAnalytics: () => api.get('/analytics/departments'),
  getFacultyPerformance: () => api.get('/analytics/faculty-performance'),
  getStudentRisk: (studentId) => api.get(`/analytics/student/${studentId}/risk`)
};

export default analyticsService;
