import React, { useState, useEffect } from 'react';
import {
    FaGraduationCap, FaFileAlt, FaPercentage, FaShoppingBag,
    FaArrowCircleRight
} from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip
} from 'recharts';

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
    const [kpiData, setKpiData] = useState({ cgpa: 0, attendance: 0, arrear: 0, leave: 0 });

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
                    cgpa: calculatedCGPA,
                    attendance: 85, // Mocked for now to avoid breaking UI without the proper % endpoint
                    arrear: 0,
                    leave: 0
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchKpis();
    }, []);

    const kpis = [
        { label: 'CGPA', value: kpiData.cgpa.toFixed(2), color: 'green', icon: <FaGraduationCap />, link: '/student/gradebook' },
        { label: 'Arrears In Hand', value: kpiData.arrear, color: 'yellow', icon: <FaFileAlt />, link: '/student/gradebook' },
        { label: 'Average Attendance', value: `${kpiData.attendance.toFixed(1)}%`, color: 'teal', icon: <FaPercentage />, link: '/student/attendance' },
        { label: 'Taken Leave', value: kpiData.leave, color: 'red', icon: <FaShoppingBag />, link: '/student/leave' },
    ];

    return (
        <div className="stu-dashboard">
            {/* Institutional Branding Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                borderLeft: '4px solid #0B2C6B',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                <img
                    src="/assets/images/rit-logo.png"
                    alt="RIT Logo"
                    style={{ height: '50px', width: 'auto' }}
                />
                <div style={{ height: '40px', width: '1px', backgroundColor: '#e2e8f0' }}></div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0B2C6B', fontWeight: '700' }}>Student Academic Portal</h2>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>RAJALAKSHMI INSTITUTE OF TECHNOLOGY</div>
                </div>
            </div>

            {/* Welcome */}
            <div className="stu-welcome">
                <h2>Hi, welcome back!</h2>
                <div className="breadcrumb-bar">
                    <span className="breadcrumb-item active">Dashboard</span>
                </div>
            </div>

            {/* KPI Cards — EXACT IMS MIRROR */}
            <div className="stu-kpi-row">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className={`stu-kpi-card ${kpi.color}`}>
                        <div className="kpi-main">
                            <div className="kpi-value">{kpi.value}</div>
                            <div className="kpi-label">{kpi.label}</div>
                        </div>
                        <span className="kpi-icon">{kpi.icon}</span>
                        <Link to={kpi.link} className="kpi-more">
                            More info &nbsp;<FaArrowCircleRight />
                        </Link>
                    </div>
                ))}
            </div>

            {/* Performance Trend Chart (The "Curve") upscale */}
            <div className="stu-info-card" style={{ padding: '25px' }}>
                <div className="info-header" style={{ marginBottom: '25px', border: 'none' }}>Performance Trend (CGPA & Attendance)</div>
                <div style={{ width: '100%', height: 400 }}>
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

            {/* Announcements & Events */}
            <div className="stu-info-row">
                <div className="stu-info-card">
                    <div className="info-header">Announcements</div>
                    <div className="info-body">
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ padding: '8px 0' }}>• No Announcements</li>
                        </ul>
                    </div>
                    <div className="info-footer"><a href="#">More..</a></div>
                </div>
                <div className="stu-info-card">
                    <div className="info-header">Placement / Events Schedule</div>
                    <div className="info-body">
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ padding: '8px 0' }}>• No Events</li>
                        </ul>
                    </div>
                    <div className="info-footer"><a href="#">More..</a></div>
                </div>
            </div>

            {/* Calendar — EXACT IMS MIRROR */}
            <div className="stu-calendar-card">
                <div className="stu-calendar-header">
                    <span className="cal-title">February &nbsp; 2026</span>
                    <div className="stu-calendar-legend">
                        <span className="legend-item"><span className="legend-dot holiday"></span> HoliDay</span>
                        <span className="legend-item"><span className="legend-dot no-order"></span> No order Day</span>
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
        </div>
    );
};

export default StudentDashboard;
