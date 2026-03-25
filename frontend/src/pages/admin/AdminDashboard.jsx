import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/common/Skeleton';
import { 
    FaUniversity, FaUsers, FaGraduationCap, FaChartLine, 
    FaLightbulb, FaBus, FaShieldAlt, FaCogs 
} from 'react-icons/fa';
import AIInsightPanel from '../../features/ai/components/AIInsightPanel';
import InstitutionalAnalytics from '../../features/ai/components/InstitutionalAnalytics';
import MiniCalendar from '../../components/common/MiniCalendar';
import ChatbotWidget from '../../features/ai/components/ChatbotWidget';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 1240,
        totalFaculty: 86,
        placementRate: 94.2,
        activeResearch: 12
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, fetch from /api/admin/stats
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <div style={{ padding: '24px' }}><Skeleton height="400px" /></div>;

    const adminKpis = [
        { label: 'Total Students', value: stats.totalStudents, icon: <FaUsers />, color: 'blue', link: '/management/users' },
        { label: 'Faculty strength', value: stats.totalFaculty, icon: <FaUniversity />, color: 'green', link: '/faculty/academics' },
        { label: 'Placement Rate', value: `${stats.placementRate}%`, icon: <FaGraduationCap />, color: 'teal', link: '/analytics/placement' },
        { label: 'Research Projects', value: stats.activeResearch, icon: <FaChartLine />, color: 'purple', link: '/faculty/research' },
        { label: 'Energy Efficiency', value: '88%', icon: <FaLightbulb />, color: 'yellow', link: '/simulations/energy' },
        { label: 'Transport Status', value: 'Active', icon: <FaBus />, color: 'indigo', link: '/simulations/transport' },
        { label: 'Security Status', value: 'Hardened', icon: <FaShieldAlt />, color: 'red', link: '/management/safety' },
        { label: 'System Health', value: 'Optimal', icon: <FaCogs />, color: 'orange', link: '/management/audit' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
            
            {/* KPI Row */}
            <div className="stu-kpi-row">
                {adminKpis.map((kpi, idx) => (
                    <div key={idx} className={`stu-kpi-card ${kpi.color}`} onClick={() => navigate(kpi.link)}>
                        <div className="kpi-main">
                            <div className="kpi-value">{kpi.value}</div>
                            <div className="kpi-label">{kpi.label}</div>
                        </div>
                        <div className="kpi-icon">{kpi.icon}</div>
                        <div className="kpi-more">Manage Module →</div>
                    </div>
                ))}
            </div>

            {/* AI Insights - Re-integrated */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px' }}>
                <div className="stu-info-card" style={{ borderTop: '4px solid var(--color-primary-navy)' }}>
                    <div className="info-header">Institutional AI Insights</div>
                    <div className="info-body" style={{ padding: '0' }}>
                        <AIInsightPanel role="ADMIN" />
                    </div>
                </div>
                
                <div className="stu-info-card" style={{ borderTop: '4px solid var(--color-accent-gold)' }}>
                    <div className="info-header">Inter-Departmental Analytics</div>
                    <div className="info-body" style={{ padding: '16px' }}>
                        <InstitutionalAnalytics />
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="stu-info-row">
                <div className="stu-info-card" style={{ flex: 1.5 }}>
                    <div className="info-header">System Events & Logs</div>
                    <div className="info-body">
                         <div style={{ padding: '12px', borderLeft: '4px solid #3b82f6', background: 'var(--theme-bg-muted)', marginBottom: '10px' }}>
                            <strong>System Audit:</strong> 124 logins verified in the last 1 hour.
                         </div>
                         <div style={{ padding: '12px', borderLeft: '4px solid #10b981', background: 'var(--theme-bg-muted)', marginBottom: '10px' }}>
                            <strong>Smart Campus:</strong> Energy optimization routine completed for Block A.
                         </div>
                    </div>
                    <div className="info-footer">
                        <button className="table-btn" style={{ width: '100%' }} onClick={() => navigate('/management/audit')}>View Full Audit Logs</button>
                    </div>
                </div>
                
                <div className="stu-info-card" style={{ flex: 1 }}>
                    <div className="info-header">Academic Calendar</div>
                    <div className="info-body" style={{ padding: '0' }}>
                        <MiniCalendar />
                    </div>
                </div>
            </div>

            <ChatbotWidget />
        </div>
    );
};

export default AdminDashboard;
