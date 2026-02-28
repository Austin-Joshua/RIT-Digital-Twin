import React from 'react';
import Card from '../../components/common/Card';
import { FaBook } from 'react-icons/fa';

const FacultyAcademics = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h2>Academic Management</h2>
            <div className="breadcrumb-bar" style={{ marginBottom: '20px' }}>
                <span className="breadcrumb-item">Faculty</span>
                <span className="breadcrumb-item active" style={{ marginLeft: '8px' }}>/ Academics</span>
            </div>
            <Card style={{ padding: '40px', textAlign: 'center' }}>
                <FaBook size={48} color="#0B2C6B" style={{ marginBottom: '16px' }} />
                <h3>My Courses & Materials</h3>
                <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                    Welcome to the Academic Management module. This section will soon host detailed records of your assigned courses, syllabus tracking, lecture materials, and lesson plans.
                </p>
                <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', display: 'inline-block' }}>
                    <strong>Status:</strong> Component Under Development
                </div>
            </Card>
        </div>
    );
};

export default FacultyAcademics;
