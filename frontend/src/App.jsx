import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import { ThemeProvider } from './hooks/ThemeContext';
import { ToastProvider } from './hooks/ToastContext';
import { WebSocketProvider } from './hooks/WebSocketContext';
import Skeleton from './components/common/Skeleton';

/* Layouts */
import InstitutionalLayout from './layouts/InstitutionalLayout';
import StudentLayout from './layouts/StudentLayout';
import ParentLayout from './layouts/ParentLayout';
import HODLayout from './layouts/HODLayout';
import AuthLayout from './layouts/AuthLayout';

/* Lazy Loaded Auth Pages */
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

/* Lazy Loaded Admin Pages */
const Dashboard = lazy(() => import('./pages/admin/DashboardWrapper'));
const ClassroomPage = lazy(() => import('./pages/enterprise/ClassroomPage'));
const ClassroomAllocation = lazy(() => import('./pages/enterprise/ClassroomAllocation'));
const EnergyPage = lazy(() => import('./pages/enterprise/EnergyPage'));
const TransportDirectory = lazy(() => import('./pages/enterprise/TransportDirectory'));
const TransportSimulation = lazy(() => import('./pages/enterprise/TransportSimulation'));
const CrowdPage = lazy(() => import('./pages/enterprise/CrowdPage'));
const PredictionPage = lazy(() => import('./pages/enterprise/PredictionPage'));
const SmartAlgorithms = lazy(() => import('./pages/enterprise/SmartAlgorithms'));
const CampusMap = lazy(() => import('./pages/enterprise/CampusMap'));

const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard'));

/* HOD (Head of Department) */
const HODDashboard = lazy(() => import('./pages/hod/HODDashboard'));
const HODStudentPerformance = lazy(() => import('./pages/hod/HODStudentPerformance'));

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
const EmergencyDashboard = lazy(() => import('./pages/enterprise/EmergencyDashboard'));
const MaintenanceModule = lazy(() => import('./pages/enterprise/MaintenanceModule'));
const SustainabilityDashboard = lazy(() => import('./pages/enterprise/SustainabilityDashboard'));
const RecruitmentHR = lazy(() => import('./pages/enterprise/RecruitmentHR'));
const AlumniPortal = lazy(() => import('./pages/enterprise/AlumniPortal'));
const InventoryAssets = lazy(() => import('./pages/enterprise/InventoryAssets'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));

/* Lazy Loaded Faculty Pages Placeholder */
const FacultyAcademics = lazy(() => import('./pages/faculty/FacultyAcademics'));
const FacultyLeaves = lazy(() => import('./pages/faculty/FacultyLeaves'));
const FacultyAttendance = lazy(() => import('./pages/faculty/FacultyAttendance'));
const FacultyAnalytics = lazy(() => import('./pages/faculty/FacultyAnalytics'));
const AssignmentGrading = lazy(() => import('./pages/faculty/AssignmentGrading'));
const FacultyGrading = lazy(() => import('./pages/faculty/FacultyGrading'));
const ProctorDashboard = lazy(() => import('./pages/faculty/ProctorDashboard'));
const ResearchTracker = lazy(() => import('./pages/faculty/ResearchTracker'));
const FacultyTimetable = lazy(() => import('./pages/faculty/FacultyTimetable'));

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
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'));
const TransportRoute = lazy(() => import('./pages/student/TransportRoute'));
const ProfilePage = lazy(() => import('./pages/student/Profile'));
const ThemeSettingsPage = lazy(() => import('./pages/enterprise/ThemeSettingsPage'));
const CourseMaterials = lazy(() => import('./pages/student/CourseMaterials'));
const EventsClubs = lazy(() => import('./pages/student/EventsClubs'));
const Library = lazy(() => import('./pages/student/Library'));
const ClubsPage = lazy(() => import('./pages/clubs/ClubsPage'));

/* Lazy Loaded Enterprise ERP Pages (Student) */
const WhatIfSimulator = lazy(() => import('./pages/enterprise/WhatIfSimulator'));

const PageLoader = () => (
  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-out' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--theme-text)', opacity: 0.9, fontWeight: 700 }}>
      <div className="app-soft-loader" />
      Loading your workspace...
    </div>
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.replace('ROLE_', '').toUpperCase();

  if (requiredRole && userRole !== requiredRole.toUpperCase()) {
    if (userRole === 'STUDENT') return <Navigate to="/student" replace />;
    if (userRole === 'PARENT') return <Navigate to="/parent" replace />;
    if (userRole === 'HOD') return <Navigate to="/hod" replace />;
    return <Navigate to="/" replace />;
  }

  if (!requiredRole) {
    if (userRole === 'STUDENT') return <Navigate to="/student" replace />;
    if (userRole === 'PARENT') return <Navigate to="/parent" replace />;
    if (userRole === 'HOD') return <Navigate to="/hod" replace />;
  }

  return children;
};

const RouteRoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const userRole = user?.role?.replace('ROLE_', '').toUpperCase();

  if (!userRole || !allowedRoles?.includes(userRole)) {
    if (userRole === 'FACULTY') return <Navigate to="/faculty/academics" replace />;
    if (userRole === 'ADMIN') return <Navigate to="/" replace />;
    if (userRole === 'HOD') return <Navigate to="/hod" replace />;
    if (userRole === 'STUDENT') return <Navigate to="/student" replace />;
    if (userRole === 'PARENT') return <Navigate to="/parent" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

const InstitutionalIndexRoute = () => {
  const { user } = useAuth();
  const userRole = user?.role?.replace('ROLE_', '').toUpperCase();
  if (userRole === 'FACULTY') return <Navigate to="/faculty" replace />;
  return <Dashboard />;
};

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <WebSocketProvider>
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
                    <Route path="transport" element={<TransportDirectory />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<ThemeSettingsPage />} />
                    <Route path="materials" element={<CourseMaterials />} />
                    <Route path="events" element={<EventsClubs />} />
                    <Route path="clubs" element={<ClubsPage />} />
                    <Route path="library" element={<Library />} />
                    <Route path="map" element={<CampusMap />} />

                    {/* Student ERP Additions */}
                    <Route path="simulator" element={<WhatIfSimulator />} />
                  </Route>

                  {/* Parent Mode */}
                  <Route path="/parent" element={
                    <ProtectedRoute requiredRole="PARENT"><ParentLayout /></ProtectedRoute>
                  }>
                    <Route index element={<ParentDashboard />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="grades" element={<GradeBook />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="fees" element={<AcademicFee />} />
                    <Route path="change-password" element={<ChangePassword />} />
                    <Route path="clubs" element={<ClubsPage />} />
                  </Route>

                  {/* HOD (Head of Department) Mode – intermediate between Admin and Faculty */}
                  <Route path="/hod" element={
                    <ProtectedRoute requiredRole="HOD"><HODLayout /></ProtectedRoute>
                  }>
                    <Route index element={<HODDashboard />} />
                    <Route path="student/:studentId" element={<HODStudentPerformance />} />
                    <Route path="change-password" element={<ChangePassword />} />
                    <Route path="settings" element={<ThemeSettingsPage />} />
                    <Route path="clubs" element={<ClubsPage />} />
                  </Route>

                  {/* Institutional / Admin / Management / Faculty Mode */}
                  <Route path="/" element={
                    <ProtectedRoute><InstitutionalLayout /></ProtectedRoute>
                  }>
                    <Route index element={<InstitutionalIndexRoute />} />
                    <Route path="simulations/classroom" element={<RouteRoleGuard allowedRoles={['ADMIN']}><ClassroomPage /></RouteRoleGuard>} />
                    <Route path="classrooms/allocation" element={<RouteRoleGuard allowedRoles={['ADMIN','FACULTY','HOD']}><ClassroomAllocation /></RouteRoleGuard>} />
                    <Route path="simulations/energy" element={<RouteRoleGuard allowedRoles={['ADMIN']}><EnergyPage /></RouteRoleGuard>} />
                    <Route path="simulations/transport" element={<RouteRoleGuard allowedRoles={['ADMIN']}><TransportSimulation /></RouteRoleGuard>} />
                    <Route path="transport" element={<RouteRoleGuard allowedRoles={['ADMIN']}><TransportDirectory /></RouteRoleGuard>} />
                    <Route path="simulations/crowd" element={<RouteRoleGuard allowedRoles={['ADMIN']}><CrowdPage /></RouteRoleGuard>} />
                    <Route path="simulations/sustainability" element={<RouteRoleGuard allowedRoles={['ADMIN']}><SustainabilityDashboard /></RouteRoleGuard>} />
                    <Route path="predictions" element={<RouteRoleGuard allowedRoles={['ADMIN']}><PredictionPage /></RouteRoleGuard>} />
                    <Route path="change-password" element={<ChangePassword />} />
                    <Route path="map" element={<RouteRoleGuard allowedRoles={['ADMIN']}><CampusMap /></RouteRoleGuard>} />

                    {/* Enterprise ERP Additions (Admin/Faculty) */}
                    <Route path="analytics" element={<RouteRoleGuard allowedRoles={['ADMIN']}><InstitutionalAnalyticsDashboard /></RouteRoleGuard>} />
                    <Route path="analytics/placement" element={<RouteRoleGuard allowedRoles={['ADMIN']}><PlacementAnalyticsView /></RouteRoleGuard>} />
                    <Route path="management/audit" element={<RouteRoleGuard allowedRoles={['ADMIN']}><AuditLogViewer /></RouteRoleGuard>} />
                    <Route path="management/exam-timetable" element={<RouteRoleGuard allowedRoles={['ADMIN']}><ExamTimetableGeneratorUI /></RouteRoleGuard>} />
                    <Route path="management/certificates" element={<RouteRoleGuard allowedRoles={['ADMIN']}><CertificateApprovalQueue /></RouteRoleGuard>} />
                    <Route path="management/substitutions" element={<RouteRoleGuard allowedRoles={['ADMIN']}><SubstitutionOverridePanel /></RouteRoleGuard>} />
                    <Route path="management/results" element={<RouteRoleGuard allowedRoles={['ADMIN']}><AutomatedResultPublishing /></RouteRoleGuard>} />
                    <Route path="management/safety" element={<RouteRoleGuard allowedRoles={['ADMIN']}><EmergencyDashboard /></RouteRoleGuard>} />
                    <Route path="management/assets" element={<RouteRoleGuard allowedRoles={['ADMIN']}><MaintenanceModule /></RouteRoleGuard>} />
                    <Route path="management/users" element={<RouteRoleGuard allowedRoles={['ADMIN']}><UserManagement /></RouteRoleGuard>} />
                    <Route path="management/algorithms" element={<RouteRoleGuard allowedRoles={['ADMIN']}><SmartAlgorithms /></RouteRoleGuard>} />

                    <Route path="management/hr-recruitment" element={<RouteRoleGuard allowedRoles={['ADMIN']}><RecruitmentHR /></RouteRoleGuard>} />
                    <Route path="management/inventory" element={<RouteRoleGuard allowedRoles={['ADMIN']}><InventoryAssets /></RouteRoleGuard>} />
                    <Route path="management/alumni" element={<RouteRoleGuard allowedRoles={['ADMIN']}><AlumniPortal /></RouteRoleGuard>} />
                    <Route path="management/clubs" element={<RouteRoleGuard allowedRoles={['ADMIN']}><ClubsPage /></RouteRoleGuard>} />

                    <Route path="change-password" element={<ChangePassword />} />

                    {/* Faculty-only routes */}
                    <Route path="faculty" element={<RouteRoleGuard allowedRoles={['FACULTY']}><Dashboard /></RouteRoleGuard>} />
                    <Route path="faculty/risk-heatmap" element={<RouteRoleGuard allowedRoles={['FACULTY']}><ClassRiskHeatmap /></RouteRoleGuard>} />
                    <Route path="faculty/upload-marks" element={<RouteRoleGuard allowedRoles={['FACULTY']}><UploadMarks /></RouteRoleGuard>} />
                    <Route path="faculty/academics" element={<RouteRoleGuard allowedRoles={['FACULTY']}><FacultyAcademics /></RouteRoleGuard>} />
                    <Route path="faculty/timetable" element={<RouteRoleGuard allowedRoles={['FACULTY']}><FacultyTimetable /></RouteRoleGuard>} />
                    <Route path="faculty/timetable-allocation" element={<RouteRoleGuard allowedRoles={['FACULTY']}><ExamTimetableGeneratorUI /></RouteRoleGuard>} />
                    <Route path="faculty/leaves" element={<RouteRoleGuard allowedRoles={['FACULTY']}><FacultyLeaves /></RouteRoleGuard>} />
                    <Route path="faculty/attendance" element={<RouteRoleGuard allowedRoles={['FACULTY']}><FacultyAttendance /></RouteRoleGuard>} />
                    <Route path="faculty/analytics" element={<RouteRoleGuard allowedRoles={['FACULTY']}><FacultyAnalytics /></RouteRoleGuard>} />

                    <Route path="faculty/assignments" element={<RouteRoleGuard allowedRoles={['FACULTY']}><AssignmentGrading /></RouteRoleGuard>} />
                    <Route path="faculty/grading" element={<RouteRoleGuard allowedRoles={['FACULTY']}><FacultyGrading /></RouteRoleGuard>} />
                    <Route path="faculty/proctor" element={<RouteRoleGuard allowedRoles={['FACULTY']}><ProctorDashboard /></RouteRoleGuard>} />
                    <Route path="faculty/research" element={<RouteRoleGuard allowedRoles={['FACULTY']}><ResearchTracker /></RouteRoleGuard>} />
                    <Route path="faculty/clubs" element={<RouteRoleGuard allowedRoles={['FACULTY']}><ClubsPage /></RouteRoleGuard>} />

                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<ThemeSettingsPage />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </WebSocketProvider>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
