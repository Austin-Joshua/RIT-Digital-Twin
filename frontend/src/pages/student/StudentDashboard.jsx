import React, { useState, useEffect } from 'react';
import {
    FaChartBar, FaFileAlt, FaPercentage, FaShoppingBag,
    FaArrowCircleRight
} from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip
} from 'recharts';
import { academicAiApi } from '../../services/enterpriseApi';
import { motion, AnimatePresence } from 'framer-motion';
import ChatbotWidget from '../../components/intelligence/ChatbotWidget';
import Card from '../../components/common/Card';

const performanceData = [
    { name: 'Jan', gpa: 7.8, attendance: 82 },
    { name: 'Feb', gpa: 8.1, attendance: 85 },
    { name: 'Mar', gpa: 8.3, attendance: 88 },
    { name: 'Apr', gpa: 8.5, attendance: 92 },
    { name: 'May', gpa: 8.4, attendance: 90 },
];

/* Feb 2026: starts on Sunday */
const feb2026 = [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
];
const holidays = [14, 26];
const noOrderDays = [];
const now = new Date();
const todayDate = now.getDate();
const isCurrentMonth = now.getMonth() === 1 && now.getFullYear() === 2026;


const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [kpiData, setKpiData] = useState({ cgpa: 0, attendance: 0, arrear: 0, leave: 0 });
    const [riskScore, setRiskScore] = useState(null);
    const [ranking, setRanking] = useState(null);

    useEffect(() => {
        const fetchKpis = async () => {
            try {
                // In a real app we would call these specific metric endpoints
                // For now, these default to 0 if endpoints don't strictly exist for numbers yet.
                // Assuming AcademicController has these endpoints.
                const cgpaRes = await api.get('/academic/student/cgpa').catch(() => ({ data: [] }));

                // Let's just mock with sensible data or sum if we got a list
                let calculatedCGPA = 0;
                if (Array.isArray(cgpaRes.data) && cgpaRes.data.length > 0) {
                    calculatedCGPA = cgpaRes.data.reduce((acc, curr) => acc + curr.gpa, 0) / cgpaRes.data.length;
                }

                setKpiData({
                    cgpa: calculatedCGPA || 8.42, // Fallback for demonstration
                    attendance: 87.5, // Mocked for now to avoid breaking UI without the proper % endpoint
                    arrear: 0,
                    leave: 2
                });
            } catch (err) {
                console.error(err);
            }
        };

        const fetchEnterpriseData = async () => {
            try {
                const sId = user?.id || 1;
                const [riskRes, rankRes] = await Promise.all([
                    academicAiApi.getRiskPrediction(sId).catch(() => ({ data: null })),
                    academicAiApi.getStudentRanking(sId).catch(() => ({ data: null }))
                ]);
                if (riskRes.data) setRiskScore(riskRes.data);
                if (rankRes.data) setRanking(rankRes.data);
            } catch (err) {
                console.error("Enterprise metrics failed", err);
            }
        }

        fetchKpis();
        fetchEnterpriseData();
    }, [user]);

    const kpis = [
        { label: 'CGPA', value: kpiData.cgpa.toFixed(2), color: 'green', icon: <FaChartBar />, link: '/student/gradebook' },
        { label: 'Arrears In Hand', value: kpiData.arrear, color: 'yellow', icon: <FaFileAlt />, link: '/student/gradebook' },
        { label: 'Average Attendance', value: `${kpiData.attendance.toFixed(1)}%`, color: 'teal', icon: <FaPercentage />, link: '/student/attendance' },
        { label: 'Taken Leave', value: kpiData.leave, color: 'red', icon: <FaShoppingBag />, link: '/student/leave' },
    ];

    return (
        <div className="stu-dashboard">



            {/* Main KPI Cards (Exact IMS Replica) */}
            <div className="stu-kpi-row">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className={`stu-kpi-card ${kpi.color}`}
                        onClick={() => navigate(kpi.link)}
                    >
                        <div className="kpi-main">
                            <h3 className="kpi-value">{kpi.value}</h3>
                            <p className="kpi-label">{kpi.label}</p>
                        </div>
                        <div className="kpi-icon">
                            {kpi.icon}
                        </div>
                        <div className="kpi-more">
                            More info <FaArrowCircleRight style={{ marginLeft: '5px' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Announcements & Events */}
            <div className="stu-info-row">
                <div className="stu-info-card">
                    <div className="info-header" style={{ padding: '15px', borderBottom: '1px solid #f4f4f4', fontSize: '18px' }}>Announcements</div>
                    <div className="info-body" style={{ padding: '15px', minHeight: '100px' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#333' }}>
                            <li style={{ padding: '8px 0', fontSize: '14px' }}>• No Announcements</li>
                        </ul>
                    </div>
                    <div className="info-footer" style={{ padding: '10px 15px', borderTop: '1px solid #f4f4f4', textAlign: 'right' }}><a href="#" style={{ color: '#444', textDecoration: 'none', fontSize: '13px' }}>More..</a></div>
                </div>
                <div className="stu-info-card">
                    <div className="info-header" style={{ padding: '15px', borderBottom: '1px solid #f4f4f4', fontSize: '18px' }}>Placement / Events Schedule</div>
                    <div className="info-body" style={{ padding: '15px', minHeight: '100px' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#333' }}>
                            <li style={{ padding: '8px 0', fontSize: '14px' }}>• No Events</li>
                        </ul>
                    </div>
                    <div className="info-footer" style={{ padding: '10px 15px', borderTop: '1px solid #f4f4f4', textAlign: 'right' }}><a href="#" style={{ color: '#444', textDecoration: 'none', fontSize: '13px' }}>More..</a></div>
                </div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>Advanced ERP Features</h3>

                {/* Enterprise AI Risk Banner */}
                <AnimatePresence>
                    {riskScore && riskScore.riskLevel !== 'LOW' && (
                        <motion.div initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} style={{
                            background: riskScore.riskLevel === 'HIGH' ? '#FEF2F2' : '#FFFBEB',
                            borderLeft: `4px solid ${riskScore.riskLevel === 'HIGH' ? '#EF4444' : '#F59E0B'}`,
                            padding: '16px 20px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ fontSize: '1.5rem' }}>⚠️</div>
                            <div>
                                <h3 style={{ margin: 0, color: riskScore.riskLevel === 'HIGH' ? '#991B1B' : '#92400E', fontSize: '1.1rem' }}>Academic Risk Warning</h3>
                                <p style={{ margin: '4px 0 0 0', color: riskScore.riskLevel === 'HIGH' ? '#B91C1C' : '#B45309', fontSize: '0.9rem' }}>
                                    Your AI-predicted failure risk is <strong>{riskScore.failureProbability.toFixed(1)}% ({riskScore.riskLevel})</strong>. Action recommended: {riskScore.suggestedActions}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Enterprise Ranking Panel */}
                {ranking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #0B2C6B 0%, #1e3a8a 100%)', color: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Department Rank</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '4px' }}>#{ranking.departmentRank}</div>
                            </div>
                            <div style={{ fontSize: '3rem', opacity: 0.2 }}>🏆</div>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Class Section Rank</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '4px' }}>#{ranking.classRank}</div>
                            </div>
                            <div style={{ fontSize: '3rem', opacity: 0.2 }}>🎓</div>
                        </div>
                    </motion.div>
                )}

                {/* Performance Trend & Growth Passport */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '24px' }}>
                    <div className="stu-info-card" style={{ padding: '25px', marginBottom: 0 }}>
                        <div className="info-header" style={{ marginBottom: '25px', border: 'none' }}>Performance Trend (CGPA & Attendance)</div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <AreaChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3c8dbc" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3c8dbc" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 14 }} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="gpa"
                                        stroke="#3c8dbc"
                                        fillOpacity={1}
                                        fill="url(#colorGpa)"
                                        strokeWidth={4}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* CGPA Simulator */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '24px' }}>
                    {/* Placeholder for Simulator child component if it exists. Avoiding full component import break. */}
                    <div className="stu-info-card" style={{ padding: '20px' }}>
                        <h4 style={{ margin: 0 }}>CGPA Simulator Tool</h4>
                        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>Use the simulator in the sidebar menu to project your future CGPA.</p>
                    </div>
                </div>
            </div>

            {/* Calendar — EXACT IMS MIRROR */}
            <div className="stu-calendar-card">
                <div className="stu-calendar-header">
                    <span className="cal-title">February &nbsp; 2026</span>
                    <div className="stu-calendar-legend">
                        <span className="legend-item"><span className="legend-dot holiday"></span> Holiday</span>
                        <span className="legend-item"><span className="legend-dot no-order"></span> No Order Day</span>
                        <span className="legend-item"><span className="legend-dot today"></span> Today</span>
                    </div>
                </div>
                <div className="stu-calendar-grid">
                    <table>
                        <thead>
                            <tr>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <th key={d}>{d}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {feb2026.map((week, wi) => (
                                <tr key={wi}>
                                    {week.map((day, di) => {
                                        let cls = '';
                                        if (day === 0) cls = 'empty';
                                        else if (isCurrentMonth && day === todayDate) cls = 'today';
                                        else if (holidays.includes(day)) cls = 'holiday';
                                        else if (noOrderDays.includes(day)) cls = 'no-order';
                                        return <td key={di} className={cls}>{day > 0 ? day : ''}</td>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI Academic Chatbot */}
            <ChatbotWidget studentId={user?.studentId || 1} />
        </div>
    );
};

export default StudentDashboard;
