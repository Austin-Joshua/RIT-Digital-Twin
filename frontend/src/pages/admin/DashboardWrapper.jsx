import React from 'react';
import AdminDashboard from './AdminDashboard';
import FacultyDashboard from '../faculty/FacultyDashboard';
import { useAuth } from '../../hooks/AuthContext';
import { normalizeRole } from '../../platform/navCatalog';

const Dashboard = () => {
    const { user } = useAuth();

    if (normalizeRole(user?.role) === 'FACULTY') {
        return <FacultyDashboard />;
    }

    return <AdminDashboard />;
};

export default Dashboard;
