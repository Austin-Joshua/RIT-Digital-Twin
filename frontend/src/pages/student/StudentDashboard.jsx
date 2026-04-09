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
import { getAcademicStats, getInternalMarks, getDepartmentStats } from '../../utils/MockDataGenerator';

const performanceDataStatic = [
    { name: 'Jan', gpa: 7.8, attendance: 82 },
    { name: 'Feb', gpa: 8.1, attendance: 85 },
    { name: 'Mar', gpa: 8.3, attendance: 88 },
    { name: 'Apr', gpa: 8.5, attendance: 92 },
    { name: 'May', gpa: 8.4, attendance: 90 },
];

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const email = user?.email || 'guest@ritchennai.edu.in';
    const initialStats = getAcademicStats(email);
    const initialMarks = getInternalMarks(email);

    const [kpiData, setKpiData] = useState({
        cgpa: initialStats.cgpa,
        attendance: initialStats.attendance,
        arrear: initialStats.arrears,
        leave: initialStats.leave
    });
    const [performanceData, setPerformanceData] = useState(initialStats.trend);
    const [marks, setMarks] = useState(initialMarks);
    
    const [selectedModal, setSelectedModal] = useState(null);
    const [clubInvolvement, setClubInvolvement] = useState([]);
    const [clubLoading, setClubLoading] = useState(true);
    const [twinStatus, setTwinStatus] = useState({ crowd: 'Normal', energy: 'Balanced' });
    const [ranking, setRanking] = useState(null);

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
                let apiCgpa = 0;
                if (Array.isArray(cgpaRes.data) && cgpaRes.data.length > 0) {
                    apiCgpa = cgpaRes.data.reduce((acc, curr) => acc + curr.gpa, 0) / cgpaRes.data.length;
                }
                if (apiCgpa > 0) {
                    setKpiData(prev => ({ ...prev, cgpa: apiCgpa }));
                }
            } catch (err) {
                console.error("KPI sync silent fail:", err);
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
        { id: 'cgpa', label: 'CGPA', value: (kpiData?.cgpa || 0).toFixed(2), color: 'green', icon: <FaChartBar />, link: '/student/gradebook' },
        { id: 'arrears', label: 'Arrears In Hand', value: kpiData?.arrear || 0, color: 'yellow', icon: <FaFileAlt />, link: '/student/gradebook' },
        { id: 'attendance', label: 'Average Attendance', value: `${(kpiData?.attendance || 0).toFixed(1)}%`, color: 'teal', icon: <FaPercentage />, link: '/student/attendance' },
        { id: 'leave', label: 'Taken Leave', value: kpiData?.leave || 0, color: 'red', icon: <FaShoppingBag />, link: '/student/leave' },
    ];

    useEffect(() => {
        const fetchStudentMarks = async () => {
            if (!user?.studentId) return;
            try {
                const res = await api.get(`/academic/marks/student/${user.studentId}`);
                if (Array.isArray(res.data) && res.data.length > 0) {
                    const apiMarks = res.data;
                    const catMarks = apiMarks.filter(m => m.type === 'CAT').map(m => ({
                        subject: m.subjectName || m.subject?.subjectName,
                        score: m.score,
                        max: 50
                    }));
                    const assignmentMarks = apiMarks.filter(m => m.type === 'ASSIGNMENT').map(m => ({
                        subject: m.subjectName || m.subject?.subjectName,
                        score: m.score,
                        max: 20
                    }));
                    if (catMarks.length > 0 || assignmentMarks.length > 0) {
                        setMarks({
                            cat: catMarks.length > 0 ? catMarks : initialMarks.cat,
                            assignments: assignmentMarks.length > 0 ? assignmentMarks : initialMarks.assignments
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to sync marks from API:", err);
            }
        };
        fetchStudentMarks();
    }, [user?.studentId]);

    return (
        <div className="stu-dashboard">
            <div className="stu-kpi-row">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.id}
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

            <div className="stu-info-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                <div className="stu-info-card" style={{ borderTopColor: 'var(--color-primary-navy)' }}>
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', borderBottom: '1px solid var(--theme-border)' }}>
                        <FaFileAlt color="var(--color-primary-navy)" />
                        Recent Assessments (CAT & ASSG)
                    </div>
                    <div className="info-body">
                        <div className="stu-data-table-wrapper" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            <table className="stu-data-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Type</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marks.cat.map((m, idx) => (
                                        <tr key={`cat-${idx}`}>
                                            <td>{m.subject}</td>
                                            <td style={{ fontSize: '10px', fontWeight: '800', color: 'var(--theme-text-muted)' }}>CAT</td>
                                            <td className="text-right font-bold" style={{ color: 'var(--color-primary-navy)' }}>{m.score}/50</td>
                                        </tr>
                                    ))}
                                    {marks.assignments.map((m, idx) => (
                                        <tr key={`assg-${idx}`}>
                                            <td>{m.subject}</td>
                                            <td style={{ fontSize: '10px', fontWeight: '800', color: 'var(--theme-text-muted)' }}>ASSG</td>
                                            <td className="text-right font-bold" style={{ color: 'var(--color-success)' }}>{m.score}/20</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="info-footer" style={{ padding: '10px 15px', textAlign: 'right', borderTop: '1px solid var(--theme-border)' }}>
                        <Link to="/student/gradebook" style={{ textDecoration: 'none', fontSize: '13px', color: 'var(--color-primary-navy)', fontWeight: '800' }}>View Full Gradebook</Link>
                    </div>
                </div>

                <div className="stu-info-card" style={{ borderTopColor: '#7c3aed' }}>
                    <div className="info-header" style={{ padding: '15px', fontSize: '18px', color: 'var(--theme-text)', borderBottom: '1px solid var(--theme-border)' }}>
                        Club & EC Involvement
                    </div>
                    <div className="info-body" style={{ padding: '15px', minHeight: '120px', color: 'var(--theme-text-muted)' }}>
                        {clubLoading ? (
                            <div>Loading your clubs...</div>
                        ) : clubInvolvement.length === 0 ? (
                            <div style={{ padding: '10px', textAlign: 'center' }}>
                                <p style={{ fontSize: '13px' }}>You are not currently enrolled in any clubs.</p>
                                <Link to="/student/clubs" className="table-btn" style={{ background: '#7c3aed', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', display: 'inline-block', marginTop: '8px' }}>Explore Clubs</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {clubInvolvement.slice(0, 2).map((club) => (
                                    <div key={club.membershipId} style={{ border: '1px solid var(--theme-border)', borderRadius: '8px', padding: '8px', background: 'var(--theme-bg-muted)' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--theme-text)', fontSize: '14px' }}>{club.clubName}</div>
                                        <div style={{ fontSize: '11px' }}>Role: <strong>{club.roleType}</strong></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="stu-info-card">
                    <div className="info-header" style={{ padding: '15px', fontSize: '18px', color: 'var(--theme-text)', borderBottom: '1px solid var(--theme-border)' }}>Campus Bulletins</div>
                    <div className="info-body" style={{ padding: '15px', minHeight: '100px', color: 'var(--theme-text-muted)' }}>
                        <div style={{ padding: '10px', background: 'rgba(234, 179, 8, 0.1)', borderLeft: '4px solid #eab308', borderRadius: '4px', marginBottom: '10px' }}>
                            <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--theme-text)' }}>End Semester Timetable</div>
                            <div style={{ fontSize: '12px' }}>The November 2025 exam schedule is now available in the Timetable section.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '2px solid var(--theme-border)', paddingTop: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Advanced ERP Features</h3>

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

                <div className="stu-simulator-row">
                    <div className="stu-info-card simulator-card">
                        <div className="simulator-content">
                            <h4 className="simulator-title">CGPA Simulator Tool</h4>
                            <p className="simulator-text">Use the simulator in the sidebar menu to project your future CGPA.</p>
                        </div>
                    </div>
                </div>
            </div>

            <MiniCalendar />
        </div>
    );
};

export default StudentDashboard;
