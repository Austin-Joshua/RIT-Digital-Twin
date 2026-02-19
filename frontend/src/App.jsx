import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

/* Layouts */
import SidebarLayout from './layouts/SidebarLayout';
import StudentLayout from './layouts/StudentLayout';

/* Auth Pages */
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

/* Admin Pages */
import Dashboard from './pages/Dashboard';
import ClassroomPage from './pages/ClassroomPage';
import EnergyPage from './pages/EnergyPage';
import TransportPage from './pages/TransportPage';
import CrowdPage from './pages/CrowdPage';
import SustainabilityPage from './pages/SustainabilityPage';

/* Student Pages */
import StudentDashboard from './pages/student/StudentDashboard';
import Timetable from './pages/student/Timetable';
import SubjectRegistration from './pages/student/SubjectRegistration';
import LeaveOD from './pages/student/LeaveOD';
import Attendance from './pages/student/Attendance';
import Certificates from './pages/student/Certificates';
import CATMark from './pages/student/CATMark';
import LABMark from './pages/student/LABMark';
import AssignmentMark from './pages/student/AssignmentMark';
import GradeBook from './pages/student/GradeBook';
import AcademicFee from './pages/student/AcademicFee';
import Feedbacks from './pages/student/Feedbacks';
import NoDueRequest from './pages/student/NoDueRequest';
import Messages from './pages/student/Messages';
import ChangePassword from './pages/student/ChangePassword';
import CommitteeSchedule from './pages/student/CommitteeSchedule';
import CommitteeMinutes from './pages/student/CommitteeMinutes';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Mode */}
          <Route path="/student" element={
            <ProtectedRoute><StudentLayout /></ProtectedRoute>
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
          </Route>

          {/* Admin / Default Mode */}
          <Route path="/" element={
            <ProtectedRoute><SidebarLayout /></ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="classroom" element={<ClassroomPage />} />
            <Route path="energy" element={<EnergyPage />} />
            <Route path="transport" element={<TransportPage />} />
            <Route path="crowd" element={<CrowdPage />} />
            <Route path="sustainability" element={<SustainabilityPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
