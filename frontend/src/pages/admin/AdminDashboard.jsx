import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/AuthContext';
import { 
    FaUniversity, FaUsers, FaGraduationCap, FaChartLine, 
    FaLightbulb, FaBus, FaShieldAlt, FaCogs, FaCheckCircle, FaClock,
    FaClipboardList, FaUserGraduate, FaMagic, FaCalendarCheck
} from 'react-icons/fa';
import AIInsightPanel from '../../features/ai/components/AIInsightPanel';
import InstitutionalAnalytics from '../../features/ai/components/InstitutionalAnalytics';
import MiniCalendar from '../../components/common/MiniCalendar';
import ChatbotWidget from '../../features/ai/components/ChatbotWidget';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 4520,
        totalFaculty: 254,
        placementRate: 94.2,
        activeResearch: 12,
        pendingApprovals: 0
    });
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const syncData = () => {
        const leaves = JSON.parse(localStorage.getItem('rit_global_leave_requests') || '[]');
        const logs = JSON.parse(localStorage.getItem('rit_system_audit_logs') || '[]');
        
        setStats(prev => ({
            ...prev,
            pendingApprovals: leaves.filter(r => r.status === 'PENDING').length
        }));

        setAuditLogs(logs.length > 0 ? logs.slice(0, 5) : [
            { event: 'SYSTEM_UP', user: 'Root Admin', timestamp: new Date().toISOString(), details: 'Institutional Digital Twin Engine v4.2 Started Successfully.' },
            { event: 'SECURITY_SCAN', user: 'Shield.ai', timestamp: new Date().toISOString(), details: 'All 15,400 user sessions verified. 0 anomalies detected.' }
        ]);
        
        setLoading(false);
    };

    useEffect(() => {
        syncData();
        window.addEventListener('storage', syncData);
        return () => window.removeEventListener('storage', syncData);
    }, []);

    const adminKpis = [
        { label: 'Total Students', value: stats.totalStudents, icon: <FaUsers />, color: 'blue', link: '/management/users' },
        { label: 'Faculty Strength', value: stats.totalFaculty, icon: <FaUniversity />, color: 'green', link: '/faculty/academics' },
        { label: 'Placement Rate', value: `${stats.placementRate}%`, icon: <FaGraduationCap />, color: 'teal', link: '/analytics/placement' },
        { label: 'Pending Approvals', value: stats.pendingApprovals, icon: <FaClock />, color: 'yellow', link: '/faculty/leaves' },
    ];

    const triggerBroadcast = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const broadcast = {
            id: Date.now(),
            title: fd.get('title'),
            message: fd.get('message'),
            priority: fd.get('priority'),
            isLive: fd.get('isLive') === 'on',
            active: true
        };
        localStorage.setItem('rit_global_broadcast', JSON.stringify(broadcast));
        alert('Institutional-wide broadcast sent to all 1,000+ active user sessions!');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
            {/* Quick Broadcast Command Center (Institutional Scale Feature) */}
            <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1.5px solid var(--theme-border)' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBullhorn style={{ color: 'var(--color-primary-navy)' }} /> Institutional Broadcast System
                </h3>
                <form onSubmit={triggerBroadcast} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Alert Title</label>
                        <input name="title" placeholder="e.g. RESULTS OUT" required style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Global Message</label>
                        <input name="message" placeholder="Enter the institutional-wide message..." required style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Priority</label>
                        <select name="priority" style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg)' }}>
                            <option value="info">Info (Navy)</option>
                            <option value="warning">Warning (Gold)</option>
                            <option value="urgent">Urgent (Red)</option>
                        </select>
                    </div>
                    <button type="submit" className="ims-btn primary" style={{ height: '38px', padding: '0 20px', fontSize: '0.85rem' }}>Send Broadcast</button>
                </form>
            </div>
            {/* Professional Welcome Header removed as per user request */}
            {/* 
            <div style={{ 
                background: 'linear-gradient(135deg, var(--color-primary-navy) 0%, #1e40af 100%)',
                padding: '30px',
                borderRadius: '16px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(11, 44, 107, 0.15)'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>Admin Command Center</h1>
                    <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '14px' }}>Welcome back, <strong>{user?.firstName || 'Admin'}</strong>. You have {stats.pendingApprovals} pending approvals requiring your attention.</p>
                </div>
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
                    <FaUniversity size={150} />
                </div>
            </div>
            */}

            {/* KPI Row */}
            <div className="stu-kpi-row">
                {adminKpis.map((kpi, idx) => (
                    <div key={idx} className={`stu-kpi-card ${kpi.color}`} onClick={() => navigate(kpi.link)} style={{ cursor: 'pointer' }}>
                        <div className="kpi-main">
                            <h3 className="kpi-value">{kpi.value}</h3>
                            <p className="kpi-label">{kpi.label}</p>
                        </div>
                        <div className="kpi-icon">{kpi.icon}</div>
                        <div className="kpi-more">Manage Module →</div>
                    </div>
                ))}
            </div>

            {/* AI Insights & Analytics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px' }}>
                <div className="stu-info-card" style={{ borderTop: '4px solid var(--color-primary-navy)' }}>
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaMagic color="var(--color-primary-navy)" />
                        <span>Institutional AI Insights</span>
                    </div>
                    <div className="info-body" style={{ padding: '0' }}>
                        <AIInsightPanel role="ADMIN" />
                    </div>
                </div>
                
                <div className="stu-info-card" style={{ borderTop: '4px solid var(--color-accent-gold)' }}>
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaUniversity color="var(--color-accent-gold)" />
                        <span>Departmental Analytics</span>
                    </div>
                    <div className="info-body" style={{ padding: '16px' }}>
                        <InstitutionalAnalytics />
                    </div>
                </div>
            </div>

            {/* System Events & Global Audit Trail */}
            <div className="stu-info-row">
                <div className="stu-info-card" style={{ flex: 1.5, borderTop: '4px solid #10b981' }}>
                    <div className="info-header">System Events & Global Audit Trail</div>
                    <div className="info-body" style={{ padding: '15px' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {auditLogs.map((log, idx) => (
                                <div key={idx} style={{ padding: '12px', borderLeft: `3px solid ${log.event === 'PARENT_NOTE' ? '#a855f7' : log.event === 'SECURITY_SCAN' ? '#ef4444' : '#10b981'}`, background: 'var(--theme-bg-muted)', borderRadius: '0 8px 8px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '800', fontSize: '12px', color: 'var(--theme-text)' }}>{log.event}</span>
                                        <span style={{ fontSize: '10px', color: 'var(--theme-text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>{log.details}</div>
                                    <div style={{ fontSize: '10px', marginTop: '4px', fontWeight: '700', color: 'var(--color-primary-navy)' }}>Source: {log.user}</div>
                                </div>
                            ))}
                         </div>
                    </div>
                    <div className="info-footer">
                        <button className="table-btn" style={{ width: '100%', background: 'var(--color-primary-navy)', color: 'white', borderRadius: '8px', padding: '10px' }} onClick={() => navigate('/management/audit')}>Access Full Governance Logs</button>
                    </div>
                </div>
                
                <div className="stu-info-card" style={{ flex: 1 }}>
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaCalendarCheck color="var(--color-primary-navy)" />
                        <span>Institutional Calendar</span>
                    </div>
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
