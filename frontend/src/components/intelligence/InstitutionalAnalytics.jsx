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

    if (loading) return <div>Loading Institutional Insights...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>

                {/* Departmental CGPA & Pass % */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><FaUserGraduate color="#0B2C6B" /> Department Performance</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="departmentName" />
                                <YAxis yAxisId="left" orientation="left" stroke="#0B2C6B" />
                                <YAxis yAxisId="right" orientation="right" stroke="#10B981" domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="averageCgpa" fill="#0B2C6B" name="Avg CGPA" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="passPercentage" fill="#10B981" name="Pass %" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Distribution Heatmap Placeholder */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><FaExclamationTriangle color="#EF4444" /> Institutional Risk Profile</h3>
                    <div style={{ height: '300px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                    <th style={{ padding: '12px 0' }}>Department</th>
                                    <th>Low Risk</th>
                                    <th>Med Risk</th>
                                    <th>High Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(dept => {
                                    const total = Object.values(dept.riskDistribution).reduce((a, b) => a + b, 0);
                                    return (
                                        <tr key={dept.departmentName} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                            <td style={{ padding: '12px 0', fontWeight: 'bold' }}>{dept.departmentName}</td>
                                            <td style={{ background: `rgba(16, 185, 129, ${dept.riskDistribution.LOW / total || 0})`, textAlign: 'center' }}>{dept.riskDistribution.LOW}</td>
                                            <td style={{ background: `rgba(245, 158, 11, ${dept.riskDistribution.MEDIUM / total || 0})`, textAlign: 'center' }}>{dept.riskDistribution.MEDIUM}</td>
                                            <td style={{ background: `rgba(239, 68, 68, ${dept.riskDistribution.HIGH / total || 0})`, textAlign: 'center' }}>{dept.riskDistribution.HIGH}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Placement Readiness vs Attendance */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><FaChartBar color="#14b8a6" /> Readiness Index vs Attendance</h3>
                <div style={{ height: '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="departmentName" type="category" width={100} />
                            <Tooltip />
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
