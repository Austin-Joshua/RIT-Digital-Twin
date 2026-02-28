import React from 'react';
import Card from '../../components/common/Card';
import ClassRiskHeatmap from '../../components/intelligence/ClassRiskHeatmap';
import { FaExclamationTriangle, FaChartLine, FaBrain } from 'react-icons/fa';

const FacultyAnalytics = () => {

    const riskDemographics = [
        { label: 'High Risk (>80% dropout prob)', value: 2, color: '#ef4444' },
        { label: 'Medium Risk (40-80% prob)', value: 8, color: '#f59e0b' },
        { label: 'Low Risk (<40% prob)', value: 45, color: '#10b981' },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#0B2C6B' }}>Predictive Risk Analytics</h2>
                <div className="breadcrumb-bar" style={{ marginTop: '8px' }}>
                    <span className="breadcrumb-item">Faculty</span>
                    <span className="breadcrumb-item active" style={{ marginLeft: '8px' }}>/ Analytics</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(135deg, #0B2C6B, #1e40af)', color: 'white' }}>
                    <FaBrain size={48} opacity={0.8} />
                    <div>
                        <div style={{ fontSize: '14px', color: '#bfdbfe', marginBottom: '4px' }}>AI Confidence Score</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>94.2%</div>
                        <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: '4px' }}>Model: Random Forest Ensemble</div>
                    </div>
                </Card>

                <Card style={{ padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaChartLine color="#0B2C6B" /> Risk Demographics
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {riskDemographics.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }}></div>
                                    <span style={{ fontSize: '14px', color: '#475569' }}>{item.label}</span>
                                </div>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>{item.value} Students</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaExclamationTriangle color="#ef4444" size={20} />
                    <h3 style={{ margin: 0, color: '#333' }}>Class Performance Heatmap</h3>
                </div>
                <div style={{ padding: '20px' }}>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                        The heatmap below uses a composite score combining attendance, continuous assessment marks, and behavioral flags to categorize students into risk quadrants. Click on any cell for intervention formulation.
                    </p>
                    {/* Reusing the existing intelligence component */}
                    <div style={{ background: 'white', borderRadius: '8px', padding: '10px' }}>
                        <ClassRiskHeatmap />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default FacultyAnalytics;
