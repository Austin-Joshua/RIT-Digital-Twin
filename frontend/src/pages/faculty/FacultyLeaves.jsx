import React from 'react';
import Card from '../../components/common/Card';
import { FaCalendarCheck } from 'react-icons/fa';

const FacultyLeaves = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h2>Leave & Approval Queue</h2>
            <div className="breadcrumb-bar" style={{ marginBottom: '20px' }}>
                <span className="breadcrumb-item">Faculty</span>
                <span className="breadcrumb-item active" style={{ marginLeft: '8px' }}>/ Leaves</span>
            </div>
            <Card style={{ padding: '40px', textAlign: 'center' }}>
                <FaCalendarCheck size={48} color="#0B2C6B" style={{ marginBottom: '16px' }} />
                <h3>Student Leave Approvals</h3>
                <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                    This module handles incoming student leave and On-Duty (OD) requests. Currently, logic is being finalized for automated faculty routing.
                </p>
                <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', display: 'inline-block' }}>
                    <strong>Status:</strong> Component Under Development
                </div>
            </Card>
        </div>
    );
};

export default FacultyLeaves;
