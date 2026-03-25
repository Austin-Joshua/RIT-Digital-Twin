import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/enterpriseApi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { FaChartBar, FaUserGraduate, FaExclamationTriangle } from 'react-icons/fa';

const COLORS = ['#10B981', '#F59E0B', '#EF4444']; // GREEN, YELLOW, RED for Risk

const InstitutionalAnalytics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await analyticsApi.getDepartmentAnalytics();
                setData(res.data);
            } catch (err) {
                console.error("Institutional analytics failed", err);
            }
            setLoading(false);
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div style={{ padding: '24px', color: 'var(--theme-text-muted)' }}>Loading Institutional Insights...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 4px' }}>
            <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px' }}>

                {/* Departmental CGPA & Pass % */}
                <div style={{ background: 'var(--card-bg)', padding: '16px 20px', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid var(--theme-border)' }}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--theme-text)', fontSize: '1rem' }}><FaUserGraduate color="var(--color-primary-navy, #0B2C6B)" /> Department Performance</h3>
                    <div style={{ height: '280px', minHeight: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border)" />
                                <XAxis dataKey="departmentName" tick={{ fontSize: 11 }} />
                                <YAxis yAxisId="left" orientation="left" stroke="var(--color-primary-navy, #0B2C6B)" tick={{ fontSize: 11 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#10B981" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)' }} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="averageCgpa" fill="var(--color-primary-navy, #0B2C6B)" name="Avg CGPA" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="passPercentage" fill="#10B981" name="Pass %" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Distribution */}
                <div style={{ background: 'var(--card-bg)', padding: '16px 20px', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid var(--theme-border)' }}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--theme-text)', fontSize: '1rem' }}><FaExclamationTriangle color="#EF4444" /> Institutional Risk Profile</h3>
                    <div style={{ minHeight: '200px', maxHeight: '300px', overflowY: 'auto', overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '260px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--theme-border)' }}>
                                    <th style={{ padding: '12px 8px 12px 0', color: 'var(--theme-text-muted)', fontSize: '12px' }}>Department</th>
                                    <th style={{ padding: '12px 8px', color: 'var(--theme-text-muted)', fontSize: '12px' }}>Low Risk</th>
                                    <th style={{ padding: '12px 8px', color: 'var(--theme-text-muted)', fontSize: '12px' }}>Med Risk</th>
                                    <th style={{ padding: '12px 8px', color: 'var(--theme-text-muted)', fontSize: '12px' }}>High Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(dept => {
                                    const total = Object.values(dept.riskDistribution).reduce((a, b) => a + b, 0);
                                    return (
                                        <tr key={dept.departmentName} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                            <td style={{ padding: '12px 8px 12px 0', fontWeight: 'bold', color: 'var(--theme-text)', fontSize: '13px' }}>{dept.departmentName}</td>
                                            <td style={{ background: `rgba(16, 185, 129, ${dept.riskDistribution.LOW / total || 0})`, textAlign: 'center', padding: '12px 8px', color: 'var(--theme-text)' }}>{dept.riskDistribution.LOW}</td>
                                            <td style={{ background: `rgba(245, 158, 11, ${dept.riskDistribution.MEDIUM / total || 0})`, textAlign: 'center', padding: '12px 8px', color: 'var(--theme-text)' }}>{dept.riskDistribution.MEDIUM}</td>
                                            <td style={{ background: `rgba(239, 68, 68, ${dept.riskDistribution.HIGH / total || 0})`, textAlign: 'center', padding: '12px 8px', color: 'var(--theme-text)' }}>{dept.riskDistribution.HIGH}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Placement Readiness vs Attendance */}
            <div style={{ background: 'var(--card-bg)', padding: '16px 20px', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid var(--theme-border)' }}>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--theme-text)', fontSize: '1rem' }}><FaChartBar color="#14b8a6" /> Readiness Index vs Attendance</h3>
                <div style={{ height: '300px', minHeight: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--theme-border)" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                            <YAxis dataKey="departmentName" type="category" width={90} tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)' }} />
                            <Legend />
                            <Bar dataKey="avgAttendance" fill="#14b8a6" name="Avg Attendance %" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="placementReadinessIndex" fill="#3b82f6" name="Placement Readiness Index" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default InstitutionalAnalytics;
