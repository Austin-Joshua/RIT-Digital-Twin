import React from 'react';
import Card from '../../components/common/Card';
import { FaUserClock } from 'react-icons/fa';

const FacultyAttendance = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h2>Class Attendance Roster</h2>
            <div className="breadcrumb-bar" style={{ marginBottom: '20px' }}>
                <span className="breadcrumb-item">Faculty</span>
                <span className="breadcrumb-item active" style={{ marginLeft: '8px' }}>/ Attendance</span>
            </div>
            <Card style={{ padding: '40px', textAlign: 'center' }}>
                <FaUserClock size={48} color="#0B2C6B" style={{ marginBottom: '16px' }} />
                <h3>Attendance Tracking</h3>
                <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                    View granular class attendance mappings and export weekly rosters. Detailed views for student absence tracking will be available here.
                </p>
                <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', display: 'inline-block' }}>
                    <strong>Status:</strong> Component Under Development
                </div>
            </Card>
        </div>
    );
};

export default FacultyAttendance;
