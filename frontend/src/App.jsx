import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SidebarLayout from './layouts/SidebarLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ClassroomPage from './pages/ClassroomPage';
import EnergyPage from './pages/EnergyPage';
import TransportPage from './pages/TransportPage';
import CrowdPage from './pages/CrowdPage';
import SustainabilityPage from './pages/SustainabilityPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <SidebarLayout />
            </ProtectedRoute>
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
