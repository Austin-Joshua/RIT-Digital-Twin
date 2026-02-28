import React from 'react';
import Card from '../../components/common/Card';
import { FaLeaf } from 'react-icons/fa';

const SustainabilityDashboard = () => {
    return (
        <div style={{ padding: '24px' }}>
            <div className="section-header">
                <h2>Sustainability Dashboard</h2>
            </div>
            <div className="breadcrumb-bar" style={{ marginBottom: '20px' }}>
                <span className="breadcrumb-item">Campus Operations</span>
                <span className="breadcrumb-item active" style={{ marginLeft: '8px' }}>/ Sustainability</span>
            </div>
            <Card style={{ padding: '40px', textAlign: 'center', borderColor: '#10B981' }}>
                <FaLeaf size={48} color="#10B981" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: '#0B2C6B' }}>Environmental Tracking</h3>
                <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                    Track environmental impact, analyze carbon footprint reduction strategies, and monitor sustainable development goals across campus infrastructure.
                </p>
                <div style={{ marginTop: '24px', padding: '16px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', display: 'inline-block', border: '1px solid #a7f3d0' }}>
                    <strong>Status:</strong> Detailed Tracking Component Under Development
                </div>
            </Card>
        </div>
    );
};

export default SustainabilityDashboard;
