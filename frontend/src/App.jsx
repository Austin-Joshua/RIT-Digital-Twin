import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ClassroomAllocation from './pages/ClassroomAllocation';
import EnergyOptimization from './pages/EnergyOptimization';
import TransportManager from './pages/TransportManager';
import CrowdMonitor from './pages/CrowdMonitor';
import Sustainability from './pages/Sustainability';
import Analytics from './pages/Analytics';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // In a real app, we might wait for a "loading" state
  // For now, assuming synchronous token check from localStorage init
  const token = localStorage.getItem('token');
  return (isAuthenticated || token) ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="classrooms" element={<ClassroomAllocation />} />
            <Route path="energy" element={<EnergyOptimization />} />
            <Route path="transport" element={<TransportManager />} />
            <Route path="crowd" element={<CrowdMonitor />} />
            <Route path="sustainability" element={<Sustainability />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
