import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardHome from './pages/Dashboard/DashboardHome';
import SmartClassroomPage from './pages/modules/SmartClassroomPage';
import EnergyPage from './pages/modules/EnergyPage';
import TransportPage from './pages/modules/TransportPage';
import CrowdFlowPage from './pages/modules/CrowdFlowPage';
import SustainabilityPage from './pages/modules/SustainabilityPage';
import PredictiveAnalyticsPage from './pages/modules/PredictiveAnalyticsPage';
import SettingsPage from './pages/modules/SettingsPage';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="classroom" element={<SmartClassroomPage />} />
            <Route path="energy" element={<EnergyPage />} />
            <Route path="transport" element={<TransportPage />} />
            <Route path="crowd" element={<CrowdFlowPage />} />
            <Route path="sustainability" element={<SustainabilityPage />} />
            <Route path="predictive" element={<PredictiveAnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
