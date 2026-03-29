import React, { useState, useEffect } from 'react';
import {
    FaChartBar, FaFileAlt, FaPercentage, FaShoppingBag,
    FaArrowCircleRight
} from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../hooks/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip
} from 'recharts';
import { academicAiApi } from '../../services/enterpriseApi';
import { motion, AnimatePresence } from 'framer-motion';
import ChatbotWidget from '../../features/ai/components/ChatbotWidget';
import AIInsightPanel from '../../features/ai/components/AIInsightPanel';
import Card from '../../components/common/Card';
import MiniCalendar from '../../components/common/MiniCalendar';
import DetailedReportModal from '../../components/common/DetailedReportModal';
import twinService from '../../services/twinService';
import analyticsService from '../../services/analyticsService';

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
    const [selectedModal, setSelectedModal] = useState(null);
    const [clubInvolvement, setClubInvolvement] = useState([]);
    const [clubLoading, setClubLoading] = useState(true);
    const [twinStatus, setTwinStatus] = useState({ crowd: '...', energy: '...' });

    useEffect(() => {
        const fetchTwinData = async () => {
            try {
                const crowd = await twinService.getCongestionPrediction();
                const energy = await twinService.getEnergyPrediction();
                setTwinStatus({
                    crowd: crowd.data.trend,
                    energy: energy.data.peakRiskLevel
                });
            } catch (err) {
                console.error("Twin fetch failed:", err);
            }
        };
        fetchTwinData();
    }, []);

    useEffect(() => {
        const fetchKpis = async () => {
            try {
                const cgpaRes = await api.get('/academic/student/cgpa').catch(() => ({ data: [] }));
                let calculatedCGPA = 0;
                if (Array.isArray(cgpaRes.data) && cgpaRes.data.length > 0) {
                    calculatedCGPA = cgpaRes.data.reduce((acc, curr) => acc + curr.gpa, 0) / cgpaRes.data.length;
                }

                setKpiData({
                    cgpa: calculatedCGPA || 8.42,
                    attendance: 87.5,
                    arrear: 0,
                    leave: 2
                });
            } catch (err) {
                console.error(err);
            }
        };

        fetchKpis();
    }, [user]);

    useEffect(() => {
        const fetchClubInvolvement = async () => {
            try {
                setClubLoading(true);
                const res = await api.get('/clubs/student/me/involvement');
                setClubInvolvement(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                setClubInvolvement([]);
            } finally {
                setClubLoading(false);
            }
        };
        fetchClubInvolvement();
    }, [user]);

    const kpis = [
        { id: 'cgpa', label: 'CGPA', value: kpiData.cgpa.toFixed(2), color: 'green', icon: <FaChartBar />, link: '/student/gradebook' },
        { id: 'arrears', label: 'Arrears In Hand', value: kpiData.arrear, color: 'yellow', icon: <FaFileAlt />, link: '/student/gradebook' },
        { id: 'attendance', label: 'Average Attendance', value: `${kpiData.attendance.toFixed(1)}%`, color: 'teal', icon: <FaPercentage />, link: '/student/attendance' },
        { id: 'leave', label: 'Taken Leave', value: kpiData.leave, color: 'red', icon: <FaShoppingBag />, link: '/student/leave' },
    ];

    return (
        <div className="stu-dashboard">
            {/* Main KPI Cards (Exact IMS Replica) */}
            <div className="stu-kpi-row">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className={`stu-kpi-card ${kpi.color}`}
                        onClick={() => setSelectedModal(kpi)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="kpi-main">
                            <h3 className="kpi-value">{kpi.value}</h3>
                            <p className="kpi-label">{kpi.label}</p>
                        </div>
                        <div className="kpi-icon">
                            {kpi.icon}
                        </div>
                        <div className="kpi-more" onClick={(e) => { e.stopPropagation(); navigate(kpi.link); }}>
                            More info <FaArrowCircleRight style={{ marginLeft: '5px' }} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="stu-kpi-row">
                <div className="stu-kpi-card gold" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' }}>
                    <div className="kpi-main">
                        <h3 className="kpi-value" style={{ fontSize: '18px' }}>{twinStatus.crowd}</h3>
                        <p className="kpi-label">Campus Congestion</p>
                    </div>
                    <div className="kpi-more">Campus Twin Live</div>
                </div>
                <div className="stu-kpi-card purple" style={{ background: 'linear-gradient(135deg, #581c87 0%, #7e22ce 100%)' }}>
                    <div className="kpi-main">
                        <h3 className="kpi-value" style={{ fontSize: '18px' }}>{twinStatus.energy}</h3>
                        <p className="kpi-label">Energy Risk</p>
                    </div>
                     <div className="kpi-more">Smart Grid Active</div>
                </div>
            </div>

            <DetailedReportModal
                isOpen={!!selectedModal}
                onClose={() => setSelectedModal(null)}
                title={selectedModal?.label}
                value={selectedModal?.value}
                label={selectedModal?.label}
                icon={selectedModal?.icon}
            />

            {/* Announcements & Events */}
            {/* AI Insights for Student */}

            <div className="stu-info-row">
                <div className="stu-info-card" style={{ borderTopColor: '#7c3aed' }}>
                    <div className="info-header" style={{ padding: '15px', fontSize: '18px', color: 'var(--theme-text)', borderBottom: '1px solid var(--theme-border)' }}>
                        My Club Involvement
                    </div>
                    <div className="info-body" style={{ padding: '15px', minHeight: '120px', color: 'var(--theme-text-muted)' }}>
                        {clubLoading ? (
                            <div>Loading your clubs...</div>
                        ) : clubInvolvement.length === 0 ? (
                            <div>You are not currently enrolled in any club.</div>
                        ) : (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {clubInvolvement.map((club) => (
                                    <div
                                        key={club.membershipId}
                                        style={{
                                            border: '1px solid var(--theme-border)',
                                            borderRadius: '8px',
                                            padding: '10px',
                                            background: 'var(--theme-bg-muted)'
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, color: 'var(--theme-text)' }}>{club.clubName}</div>
                                        <div style={{ fontSize: '13px' }}>{club.clubDescription}</div>
                                        <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--theme-text)' }}>
                                            Role: <strong>{club.roleType}</strong> | Coordinator: {club.facultyCoordinator}
                                        </div>
                                        <div style={{ marginTop: '4px', fontSize: '12px' }}>
                                            Joined: {club.joinedDate} | Status: {club.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="info-footer" style={{ padding: '10px 15px', textAlign: 'right', borderTop: '1px solid var(--theme-border)' }}>
                        <Link to="/student/clubs" style={{ textDecoration: 'none', fontSize: '13px', color: 'var(--color-primary-navy)' }}>View all clubs</Link>
                    </div>
                </div>

                <div className="stu-info-card">
                    <div className="info-header" style={{ padding: '15px', fontSize: '18px', color: 'var(--theme-text)', borderBottom: '1px solid var(--theme-border)' }}>Announcements</div>
                    <div className="info-body" style={{ padding: '15px', minHeight: '100px', color: 'var(--theme-text-muted)' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ padding: '8px 0', fontSize: '14px' }}>• No Announcements</li>
                        </ul>
                    </div>
                    <div className="info-footer" style={{ padding: '10px 15px', textAlign: 'right', borderTop: '1px solid var(--theme-border)' }}><a href="#" style={{ textDecoration: 'none', fontSize: '13px', color: 'var(--color-primary-navy)' }}>More..</a></div>
                </div>
                <div className="stu-info-card">
                    <div className="info-header" style={{ padding: '15px', fontSize: '18px', color: 'var(--theme-text)', borderBottom: '1px solid var(--theme-border)' }}>Placement / Events Schedule</div>
                    <div className="info-body" style={{ padding: '15px', minHeight: '100px', color: 'var(--theme-text-muted)' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ padding: '8px 0', fontSize: '14px' }}>• No Events</li>
                        </ul>
                    </div>
                    <div className="info-footer" style={{ padding: '10px 15px', textAlign: 'right', borderTop: '1px solid var(--theme-border)' }}><a href="#" style={{ textDecoration: 'none', fontSize: '13px', color: 'var(--color-primary-navy)' }}>More..</a></div>
                </div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '2px solid var(--theme-border)', paddingTop: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Advanced ERP Features</h3>


                {/* Enterprise Ranking Panel */}
                {ranking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stu-ranking-panel">
                        <div className="ranking-card rank-dept">
                            <div className="ranking-content">
                                <div className="ranking-label">Department Rank</div>
                                <div className="ranking-value">#{ranking.departmentRank}</div>
                            </div>
                            <div className="ranking-icon">🏆</div>
                        </div>
                        <div className="ranking-card rank-class">
                            <div className="ranking-content">
                                <div className="ranking-label">Class Section Rank</div>
                                <div className="ranking-value">#{ranking.classRank}</div>
                            </div>
                            <div className="ranking-icon">🎓</div>
                        </div>
                    </motion.div>
                )}

                {/* Performance Trend & Growth Passport */}
                <div className="stu-trend-row">
                    <div className="stu-info-card trend-card">
                        <div className="info-header">Performance Trend (CGPA & Attendance)</div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-primary-navy)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-primary-navy)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)', borderRadius: '8px', color: 'var(--theme-text)' }}
                                        itemStyle={{ color: 'var(--theme-text)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="gpa"
                                        stroke="var(--color-primary-navy)"
                                        fillOpacity={1}
                                        fill="url(#colorGpa)"
                                        strokeWidth={4}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Simulator Card */}
                <div className="stu-simulator-row">
                    <div className="stu-info-card simulator-card">
                        <div className="simulator-content">
                            <h4 className="simulator-title">CGPA Simulator Tool</h4>
                            <p className="simulator-text">Use the simulator in the sidebar menu to project your future CGPA.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar — Dynamic MiniCalendar */}
            <MiniCalendar />

            {/* AI Academic Chatbot */}
            <ChatbotWidget studentId={user?.studentId || 1} />
        </div>
    );
};

export default StudentDashboard;
