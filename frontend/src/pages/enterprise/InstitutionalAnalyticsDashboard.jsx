import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { analyticsApi } from '../../services/enterpriseApi';
import Skeleton from '../../components/common/Skeleton';

const InstitutionalAnalyticsDashboard = () => {
    const [deptStats, setDeptStats] = useState([]);
    const [facultyStats, setFacultyStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [deptRes, facRes] = await Promise.all([
                    analyticsApi.getDepartmentAnalytics(),
                    analyticsApi.getFacultyPerformance()
                ]);
                setDeptStats(deptRes.data);
                setFacultyStats(facRes.data);
            } catch (error) {
                console.error("Failed to fetch analytical aggregates", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    };

    const cardVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Skeleton height="40px" width="300px" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <Skeleton height="300px" />
                    <Skeleton height="300px" />
                </div>
            </div>
        );
    }

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Enterprise Analytics Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Aggregated departmental pass rates, CGPA averages, and faculty performance indexes.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Chart 1: Pass Percentage by Department */}
                <motion.div variants={cardVariants} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Department Pass Rates (%)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={deptStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="departmentName" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                                <Bar dataKey="passPercentage" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Chart 2: Average CGPA */}
                <motion.div variants={cardVariants} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Average CGPA by Department</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={deptStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="departmentName" stroke="var(--text-secondary)" />
                                <YAxis domain={[0, 10]} stroke="var(--text-secondary)" />
                                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                                <Bar dataKey="averageCgpa" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Faculty Performance Table */}
                <motion.div variants={cardVariants} style={{ gridColumn: '1 / -1', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Faculty Performance Index</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Faculty Name</th>
                                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Department</th>
                                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Avg Class Pass %</th>
                                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Feedback Score / 100</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facultyStats.map((fac, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>{fac.facultyName}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{fac.departmentName}</td>
                                    <td style={{ padding: '12px', color: fac.averageClassPassRate < 70 ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>{fac.averageClassPassRate.toFixed(1)}%</td>
                                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{fac.studentFeedbackScore.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default InstitutionalAnalyticsDashboard;
