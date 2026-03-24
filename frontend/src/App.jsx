import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WebSocketProvider } from './context/WebSocketContext';
import Skeleton from './components/common/Skeleton';
import BroadcastListener from './components/BroadcastListener';

/* Layouts */
import InstitutionalLayout from './layouts/InstitutionalLayout';
import StudentLayout from './layouts/StudentLayout';
import ParentLayout from './layouts/ParentLayout';
import HODLayout from './layouts/HODLayout';
import AuthLayout from './layouts/AuthLayout';

/* Lazy Loaded Auth Pages */
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

/* Lazy Loaded Admin Pages */
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ClassroomPage = lazy(() => import('./pages/ClassroomPage'));
const EnergyPage = lazy(() => import('./pages/EnergyPage'));
const TransportDirectory = lazy(() => import('./pages/TransportDirectory'));
const TransportSimulation = lazy(() => import('./pages/TransportSimulation'));
const CrowdPage = lazy(() => import('./pages/CrowdPage'));
const PredictionPage = lazy(() => import('./pages/PredictionPage'));
const CampusMap = lazy(() => import('./pages/CampusMap'));

const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));

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

/* Lazy Loaded Faculty Pages Placeholder */
const FacultyAcademics = lazy(() => import('./pages/faculty/FacultyAcademics'));
const FacultyLeaves = lazy(() => import('./pages/faculty/FacultyLeaves'));
const FacultyAttendance = lazy(() => import('./pages/faculty/FacultyAttendance'));
const FacultyAnalytics = lazy(() => import('./pages/faculty/FacultyAnalytics'));
const AssignmentGrading = lazy(() => import('./pages/faculty/AssignmentGrading'));
const FacultyGrading = lazy(() => import('./pages/faculty/FacultyGrading'));
const ProctorDashboard = lazy(() => import('./pages/faculty/ProctorDashboard'));
const ResearchTracker = lazy(() => import('./pages/faculty/ResearchTracker'));

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
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const TransportRoute = lazy(() => import('./pages/student/TransportRoute'));
const ProfilePage = lazy(() => import('./pages/student/Profile'));
const ThemeSettingsPage = lazy(() => import('./pages/ThemeSettingsPage'));
const CourseMaterials = lazy(() => import('./pages/student/CourseMaterials'));
const EventsClubs = lazy(() => import('./pages/student/EventsClubs'));
const Library = lazy(() => import('./pages/student/Library'));
const ClubsPage = lazy(() => import('./pages/clubs/ClubsPage'));

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
                    <Route index element={<Dashboard />} />
                    <Route path="simulations/classroom" element={<ClassroomPage />} />
                    <Route path="simulations/energy" element={<EnergyPage />} />
                    <Route path="simulations/transport" element={<TransportSimulation />} />
                    <Route path="transport" element={<TransportDirectory />} />
                    <Route path="simulations/crowd" element={<CrowdPage />} />
                    <Route path="simulations/sustainability" element={<SustainabilityDashboard />} />
                    <Route path="predictions" element={<PredictionPage />} />
                    <Route path="change-password" element={<ChangePassword />} />
                    <Route path="map" element={<CampusMap />} />

                    {/* Enterprise ERP Additions (Admin/Faculty) */}
                    <Route path="analytics" element={<InstitutionalAnalyticsDashboard />} />
                    <Route path="analytics/placement" element={<PlacementAnalyticsView />} />
                    <Route path="management/audit" element={<AuditLogViewer />} />
                    <Route path="management/exam-timetable" element={<ExamTimetableGeneratorUI />} />
                    <Route path="management/certificates" element={<CertificateApprovalQueue />} />
                    <Route path="management/substitutions" element={<SubstitutionOverridePanel />} />
                    <Route path="management/results" element={<AutomatedResultPublishing />} />
                    <Route path="management/safety" element={<EmergencyDashboard />} />
                    <Route path="management/assets" element={<MaintenanceModule />} />

                    <Route path="management/hr-recruitment" element={<RecruitmentHR />} />
                    <Route path="management/inventory" element={<InventoryAssets />} />
                    <Route path="management/alumni" element={<AlumniPortal />} />
                    <Route path="management/clubs" element={<ClubsPage />} />

                    <Route path="change-password" element={<ChangePassword />} />

                    {/* Specific Faculty Routes (Currently under general layout constraint) */}
                    <Route path="faculty/risk-heatmap" element={<ClassRiskHeatmap />} />
                    <Route path="faculty/upload-marks" element={<UploadMarks />} />
                    <Route path="faculty/academics" element={<FacultyAcademics />} />
                    <Route path="faculty/leaves" element={<FacultyLeaves />} />
                    <Route path="faculty/attendance" element={<FacultyAttendance />} />
                    <Route path="faculty/analytics" element={<FacultyAnalytics />} />

                    <Route path="faculty/assignments" element={<AssignmentGrading />} />
                    <Route path="faculty/grading" element={<FacultyGrading />} />
                    <Route path="faculty/proctor" element={<ProctorDashboard />} />
                    <Route path="faculty/research" element={<ResearchTracker />} />
                    <Route path="faculty/clubs" element={<ClubsPage />} />

                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<ThemeSettingsPage />} />
                  </Route>
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
