import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Skeleton from './components/common/Skeleton';

/* Layouts */
import InstitutionalLayout from './layouts/InstitutionalLayout';
import StudentLayout from './layouts/StudentLayout';
import AuthLayout from './layouts/AuthLayout';

/* Lazy Loaded Auth Pages */
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

/* Lazy Loaded Admin Pages */
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ClassroomPage = lazy(() => import('./pages/ClassroomPage'));
const EnergyPage = lazy(() => import('./pages/EnergyPage'));
const TransportPage = lazy(() => import('./pages/TransportPage'));
const CrowdPage = lazy(() => import('./pages/CrowdPage'));
const PredictionPage = lazy(() => import('./pages/PredictionPage'));
const ManagementPage = lazy(() => import('./pages/ManagementPage'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));

/* Lazy Loaded Enterprise ERP Pages (Admin/Faculty) */
const InstitutionalAnalyticsDashboard = lazy(() => import('./pages/enterprise/InstitutionalAnalyticsDashboard'));
const PlacementAnalyticsView = lazy(() => import('./pages/enterprise/PlacementAnalyticsView'));
const AuditLogViewer = lazy(() => import('./pages/enterprise/AuditLogViewer'));
const ExamTimetableGeneratorUI = lazy(() => import('./pages/enterprise/ExamTimetableGeneratorUI'));
const CertificateApprovalQueue = lazy(() => import('./pages/enterprise/CertificateApprovalQueue'));
const SubstitutionOverridePanel = lazy(() => import('./pages/enterprise/SubstitutionOverridePanel'));
const AutomatedResultPublishing = lazy(() => import('./pages/enterprise/AutomatedResultPublishing'));
const ClassRiskHeatmap = lazy(() => import('./pages/enterprise/ClassRiskHeatmap'));
const UploadMarks = lazy(() => import('./pages/enterprise/UploadMarks'));

/* Lazy Loaded Student Pages */
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const Timetable = lazy(() => import('./pages/student/Timetable'));
const SubjectRegistration = lazy(() => import('./pages/student/SubjectRegistration'));
const LeaveOD = lazy(() => import('./pages/student/LeaveOD'));
const Attendance = lazy(() => import('./pages/student/Attendance'));
const Certificates = lazy(() => import('./pages/student/Certificates'));
const CATMark = lazy(() => import('./pages/student/CATMark'));
const LABMark = lazy(() => import('./pages/student/LABMark'));
const AssignmentMark = lazy(() => import('./pages/student/AssignmentMark'));
const GradeBook = lazy(() => import('./pages/student/GradeBook'));
const AcademicFee = lazy(() => import('./pages/student/AcademicFee'));
const Feedbacks = lazy(() => import('./pages/student/Feedbacks'));
const CommitteeSchedule = lazy(() => import('./pages/student/CommitteeSchedule'));
const CommitteeMinutes = lazy(() => import('./pages/student/CommitteeMinutes'));
const NoDueRequest = lazy(() => import('./pages/student/NoDueRequest'));
const Messages = lazy(() => import('./pages/student/Messages'));
const ChangePassword = lazy(() => import('./pages/student/ChangePassword'));
const TransportRoute = lazy(() => import('./pages/student/TransportRoute'));

/* Lazy Loaded Enterprise ERP Pages (Student) */
const WhatIfSimulator = lazy(() => import('./pages/enterprise/WhatIfSimulator'));

const PageLoader = () => (
  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <Skeleton height="40px" width="300px" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Skeleton height="120px" />
      <Skeleton height="120px" />
      <Skeleton height="120px" />
      <Skeleton height="120px" />
    </div>
    <Skeleton height="400px" />
  </div>
);

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-light)' }}>
      <div style={{ padding: '20px', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', borderRadius: '12px' }}>Loading Portal...</div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'STUDENT' ? '/student' : '/'} replace />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Student Mode */}
                <Route path="/student" element={
                  <ProtectedRoute requiredRole="STUDENT"><StudentLayout /></ProtectedRoute>
                }>
                  <Route index element={<StudentDashboard />} />
                  <Route path="timetable" element={<Timetable />} />
                  <Route path="registration" element={<SubjectRegistration />} />
                  <Route path="leave" element={<LeaveOD />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="certificates" element={<Certificates />} />
                  <Route path="cat-mark" element={<CATMark />} />
                  <Route path="lab-mark" element={<LABMark />} />
                  <Route path="assignment" element={<AssignmentMark />} />
                  <Route path="gradebook" element={<GradeBook />} />
                  <Route path="fee" element={<AcademicFee />} />
                  <Route path="feedbacks" element={<Feedbacks />} />
                  <Route path="committee/schedule" element={<CommitteeSchedule />} />
                  <Route path="committee/minutes" element={<CommitteeMinutes />} />
                  <Route path="nodue" element={<NoDueRequest />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="change-password" element={<ChangePassword />} />
                  <Route path="transport" element={<TransportRoute />} />

                  {/* Student ERP Additions */}
                  <Route path="simulator" element={<WhatIfSimulator />} />
                </Route>

                {/* Parent Mode */}
                <Route path="/parent" element={
                  <ProtectedRoute requiredRole="PARENT"><StudentLayout /></ProtectedRoute>
                }>
                  <Route index element={<ParentDashboard />} />
                </Route>

                {/* Super Admin Mode */}
                <Route path="/super-admin" element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN"><InstitutionalLayout /></ProtectedRoute>
                }>
                  <Route index element={<SuperAdminDashboard />} />
                </Route>

                {/* Institutional / Admin / Management / Faculty Mode */}
                <Route path="/" element={
                  <ProtectedRoute><InstitutionalLayout /></ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="simulations/classroom" element={<ClassroomPage />} />
                  <Route path="simulations/energy" element={<EnergyPage />} />
                  <Route path="simulations/transport" element={<TransportPage />} />
                  <Route path="simulations/crowd" element={<CrowdPage />} />
                  <Route path="predictions" element={<PredictionPage />} />
                  <Route path="management" element={<ManagementPage />} />

                  {/* Enterprise ERP Additions (Admin/Faculty) */}
                  <Route path="analytics" element={<InstitutionalAnalyticsDashboard />} />
                  <Route path="analytics/placement" element={<PlacementAnalyticsView />} />
                  <Route path="management/audit" element={<AuditLogViewer />} />
                  <Route path="management/exam-timetable" element={<ExamTimetableGeneratorUI />} />
                  <Route path="management/certificates" element={<CertificateApprovalQueue />} />
                  <Route path="management/substitutions" element={<SubstitutionOverridePanel />} />
                  <Route path="management/results" element={<AutomatedResultPublishing />} />
                  <Route path="change-password" element={<ChangePassword />} />

                  {/* Specific Faculty Routes (Currently under general layout constraint) */}
                  <Route path="faculty/risk-heatmap" element={<ClassRiskHeatmap />} />
                  <Route path="faculty/upload-marks" element={<UploadMarks />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
