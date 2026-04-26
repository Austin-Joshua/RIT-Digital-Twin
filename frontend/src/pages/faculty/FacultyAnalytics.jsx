import React from 'react';
import Card from '../../components/common/Card';
import ClassRiskHeatmap from '../../features/ai/components/ClassRiskHeatmap';
import { FaExclamationTriangle, FaChartLine, FaBrain } from 'react-icons/fa';

const FacultyAnalytics = () => {

    const riskDemographics = [
        { label: 'High Risk (>80% dropout prob)', value: 2, color: 'var(--color-error)' },
        { label: 'Medium Risk (40-80% prob)', value: 8, color: 'var(--color-warning)' },
        { label: 'Low Risk (<40% prob)', value: 45, color: 'var(--color-success)' },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: 'var(--theme-text)' }}>Predictive Risk Analytics</h2>
                <div className="breadcrumb-bar" style={{ marginTop: '8px' }}>
                    <span className="breadcrumb-item" style={{ color: 'var(--theme-text-muted)' }}>Faculty</span>
                    <span className="breadcrumb-item active" style={{ marginLeft: '8px', color: 'var(--theme-text)' }}>/ Analytics</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <Card style={{
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    background: 'linear-gradient(135deg, #0B2C6B 0%, #1e3a8a 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <FaBrain size={48} style={{ opacity: 0.9, color: 'var(--color-accent-gold)' }} />
                    <div>
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '4px', fontWeight: '500' }}>AI Confidence Score</div>
                        <div style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em' }}>94.2%</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Model: Random Forest Ensemble</div>
                    </div>
                </Card>

                <Card style={{ padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: 'var(--theme-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaChartLine style={{ color: 'var(--theme-brand-strong)' }} /> Risk Demographics
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {riskDemographics.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }}></div>
                                    <span style={{ fontSize: '14px', color: 'var(--theme-text-muted)' }}>{item.label}</span>
                                </div>
                                <span style={{ fontWeight: 'bold', color: 'var(--theme-text)' }}>{item.value} Students</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--theme-border)' }}>
                <div style={{ padding: '20px 24px', background: 'var(--theme-bg-muted)', borderBottom: '1px solid var(--theme-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaExclamationTriangle color="var(--color-error)" size={20} />
                    <h3 style={{ margin: 0, color: 'var(--theme-text)' }}>Class Performance Heatmap</h3>
                </div>
                <div style={{ padding: '20px' }}>
                    <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                        The heatmap below uses a composite score combining attendance, continuous assessment marks, and behavioral flags to categorize students into risk quadrants. Click on any cell for intervention formulation.
                    </p>
                    {/* Reusing the existing intelligence component */}
                    <div style={{ background: 'var(--card-bg)', borderRadius: '8px', padding: '10px' }}>
                        <ClassRiskHeatmap />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default FacultyAnalytics;
