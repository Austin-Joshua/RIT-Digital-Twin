import React from 'react';
import AdminDashboard from './AdminDashboard';
import FacultyDashboard from '../faculty/FacultyDashboard';
import { useAuth } from '../../hooks/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'FACULTY') {
        return <FacultyDashboard />;
    }

    return <AdminDashboard />;
};

export default Dashboard;
