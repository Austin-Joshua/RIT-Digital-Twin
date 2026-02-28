import React from 'react';
import Card from '../../components/common/Card';
import { FaExclamationTriangle } from 'react-icons/fa';

const FacultyAnalytics = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h2>At-Risk Student Analytics</h2>
            <div className="breadcrumb-bar" style={{ marginBottom: '20px' }}>
                <span className="breadcrumb-item">Faculty</span>
                <span className="breadcrumb-item active" style={{ marginLeft: '8px' }}>/ Analytics</span>
            </div>
            <Card style={{ padding: '40px', textAlign: 'center' }}>
                <FaExclamationTriangle size={48} color="#0B2C6B" style={{ marginBottom: '16px' }} />
                <h3>Predictive Risk Center</h3>
                <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                    Detailed records of students predicted to fall behind academically based on the AI model. Individual student intervention plans will be drafted here.
                </p>
                <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', display: 'inline-block' }}>
                    <strong>Status:</strong> Component Under Development
                </div>
            </Card>
        </div>
    );
};

export default FacultyAnalytics;
