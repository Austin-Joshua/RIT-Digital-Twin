import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaMagic, FaCalendarCheck, FaBullhorn } from 'react-icons/fa';
import api from '../../services/api';
import AIInsightPanel from '../../features/ai/components/AIInsightPanel';
import InstitutionalAnalytics from '../../features/ai/components/InstitutionalAnalytics';
import MiniCalendar from '../../components/common/MiniCalendar';
import RingStat from '../../components/common/RingStat';
import { useToast } from '../../hooks/ToastContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        placementRate: 0,
        activeResearch: 0,
        pendingApprovals: 0,
        activeAlerts: 0,
    });
    const [auditLogs, setAuditLogs] = useState([]);
    const [_loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        api.get('/admin/dashboard')
            .then((res) => {
                if (!isMounted) return;
                if (res.data) {
                    setStats(prev => ({
                        ...prev,
                        totalStudents: res.data.totalStudents ?? 0,
                        totalFaculty: res.data.totalFaculty ?? 0,
                        placementRate: res.data.placementRate ?? 0,
                        activeResearch: res.data.activeResearch ?? 0,
                        pendingApprovals: res.data.pendingApprovals ?? 0,
                        activeAlerts: res.data.activeAlerts ?? 0,
                    }));
                    if (Array.isArray(res.data.recentAuditLogs)) {
                        setAuditLogs(res.data.recentAuditLogs);
                    }
                }
            })
            .catch(() => {
                // Production: zero-fake-metrics rule
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, []);

    const triggerBroadcast = async (e) => {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        const title = fd.get('title');
        const message = fd.get('message');
        const priority = fd.get('priority');
        try {
            await api.post('/broadcasts', {
                title,
                message,
                priority,
                audience: 'ALL'
            });
            addToast('Institutional broadcast persisted to database and dispatched via live WebSocket.', 'success');
            form.reset();
        } catch (_err) {
            addToast('Failed to emit broadcast. Ensure you have administrator permissions.', 'error');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
            {/* Quick Broadcast Command Center (Institutional Scale Feature) */}
            <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1.5px solid var(--theme-border)' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBullhorn style={{ color: 'var(--theme-brand-strong)' }} /> Principal Broadcast System
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

            {/* KPI Row */}
            <div className="ims-stat-row">
                <div onClick={() => navigate('/management/users')} style={{ cursor: 'pointer' }}>
                    <RingStat label="Students" value={String(stats.totalStudents)} center={String(stats.totalStudents)} sub="Enrolled accounts" percent={100} color="#17a2b8" />
                </div>
                <div onClick={() => navigate('/faculty/academics')} style={{ cursor: 'pointer' }}>
                    <RingStat label="Faculty" value={String(stats.totalFaculty)} center={String(stats.totalFaculty)} sub="Teaching strength" percent={Math.min(100, Math.round((stats.totalFaculty / 300) * 100))} color="#2ecc71" />
                </div>
                <div onClick={() => navigate('/analytics/placement')} style={{ cursor: 'pointer' }}>
                    <RingStat label="Placement" value={`${stats.placementRate}%`} center={`${stats.placementRate}%`} sub="Offer rate" percent={stats.placementRate} color="#f0ad4e" />
                </div>
                <div onClick={() => navigate('/faculty/leaves')} style={{ cursor: 'pointer' }}>
                    <RingStat label="Approvals" value={String(stats.pendingApprovals)} center={String(stats.pendingApprovals)} sub="Waiting on you" percent={stats.pendingApprovals ? Math.min(100, stats.pendingApprovals * 10) : 0} color="#dc3545" />
                </div>
            </div>

            {/* AI Insights & Analytics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px' }}>
                <div className="stu-info-card" style={{ borderTop: '4px solid var(--color-primary-navy)' }}>
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaMagic color="var(--theme-brand-strong)" />
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
                                    <div style={{ fontSize: '10px', marginTop: '4px', fontWeight: '700', color: 'var(--theme-brand-strong)' }}>Source: {log.user}</div>
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
                        <FaCalendarCheck color="var(--theme-brand-strong)" />
                        <span>Institutional Calendar</span>
                    </div>
                    <div className="info-body" style={{ padding: '0' }}>
                        <MiniCalendar />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
