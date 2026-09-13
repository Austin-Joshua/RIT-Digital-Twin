import React from 'react';
import Card from '../../components/common/Card';
import { FaExclamationTriangle } from 'react-icons/fa';

const FacultyAnalytics = () => {
    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: 'var(--theme-text)' }}>Predictive Risk Analytics</h2>
                <div className="breadcrumb-bar" style={{ marginTop: '8px' }}>
                    <span className="breadcrumb-item" style={{ color: 'var(--theme-text-muted)' }}>Faculty</span>
                    <span className="breadcrumb-item active" style={{ marginLeft: '8px', color: 'var(--theme-text)' }}>/ Analytics</span>
                </div>
            </div>

            <Card style={{ padding: '16px', marginBottom: '24px' }}>
                <p style={{ margin: 0, color: 'var(--theme-text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
                    No confidence score or risk census is stored for this page. Counts are not invented here. Class risk for assigned sections is in the heatmap below when that record exists.
                </p>
            </Card>

            <Card style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--theme-border)' }}>
                <div style={{ padding: '20px 24px', background: 'var(--theme-bg-muted)', borderBottom: '1px solid var(--theme-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaExclamationTriangle color="var(--color-error)" size={20} />
                    <h3 style={{ margin: 0, color: 'var(--theme-text)' }}>Class Performance Heatmap</h3>
                </div>
                <div style={{ padding: '20px' }}>
                    <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px', margin: 0 }}>
                        No class-risk heatmap is stored for this login. Assigned-section risk is not invented here.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default FacultyAnalytics;
