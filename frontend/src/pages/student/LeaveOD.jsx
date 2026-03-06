import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuCalendarDays, LuClipboardList, LuCircleCheckBig, LuCircleX, LuClock, LuFileText, LuSend } from 'react-icons/lu';
import api from '../../services/api';

const STATUS_STYLES = {
    APPROVED: { bg: 'rgba(22,163,74,0.12)', color: '#166534', border: '#16a34a' },
    REJECTED: { bg: 'rgba(220,38,38,0.12)', color: '#991b1b', border: '#dc2626' },
    PENDING: { bg: 'rgba(202,138,4,0.12)', color: '#854d0e', border: '#ca8a04' },
};

const FieldGroup = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--theme-text-muted)' }}>{label}</label>
        {children}
    </div>
);

const inputStyle = {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1.5px solid var(--theme-border)',
    background: 'var(--card-bg)',
    color: 'var(--theme-text)',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};

const LeaveOD = () => {
    const [applications, setApplications] = useState([]);
    const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '', type: 'LEAVE' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('apply');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchApplications = async () => {
        try {
            const res = await api.get('/academic/leave/my-leaves');
            setApplications(res.data);
        } catch {
            setApplications([]);
        }
    };

    useEffect(() => { fetchApplications(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            showToast('End date cannot be before start date.', 'error');
            return;
        }
        setLoading(true);
        try {
            await api.post('/academic/leave/apply', formData);
            showToast('Application submitted successfully!');
            setFormData({ startDate: '', endDate: '', reason: '', type: 'LEAVE' });
            fetchApplications();
            setActiveTab('history');
        } catch {
            showToast('Could not submit application. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const counts = {
        total: applications.length,
        approved: applications.filter(a => a.status === 'APPROVED').length,
        pending: applications.filter(a => a.status === 'PENDING').length,
        rejected: applications.filter(a => a.status === 'REJECTED').length,
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
                            padding: '14px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px',
                            background: toast.type === 'success' ? '#166534' : '#991b1b', color: '#fff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px'
                        }}
                    >
                        {toast.type === 'success' ? <LuCircleCheckBig /> : <LuCircleX />} {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--color-primary-navy)', borderRadius: '10px', padding: '10px', color: 'white', fontSize: '20px', display: 'flex' }}>
                    <LuCalendarDays />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--theme-text)' }}>Leave / On-Duty Application</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-text-muted)' }}>Apply for academic leave or on-duty requests</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
                {[
                    { label: 'Total Applications', value: counts.total, color: '#3c8dbc', bg: 'rgba(60,141,188,0.1)' },
                    { label: 'Approved', value: counts.approved, color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
                    { label: 'Pending', value: counts.pending, color: '#ca8a04', bg: 'rgba(202,138,4,0.1)' },
                    { label: 'Rejected', value: counts.rejected, color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)', marginTop: '4px', fontWeight: '600' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--card-bg)', padding: '4px', borderRadius: '10px', border: '1.5px solid var(--theme-border)', width: 'fit-content' }}>
                {[
                    { id: 'apply', label: 'Apply', icon: <LuSend /> },
                    { id: 'history', label: 'History', icon: <LuClipboardList /> },
                ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                        display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
                        background: activeTab === t.id ? 'var(--color-primary-navy)' : 'transparent',
                        color: activeTab === t.id ? '#fff' : 'var(--theme-text-muted)',
                    }}>{t.icon} {t.label}</button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'apply' && (
                    <motion.div key="apply" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 24px', fontSize: '16px', fontWeight: '700', color: 'var(--theme-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <LuFileText color="var(--color-primary-navy)" /> New Application
                            </h3>
                            <form onSubmit={handleSubmit} style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                gap: '20px'
                            }}>
                                <FieldGroup label="Application Type">
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={inputStyle}>
                                        <option value="LEAVE">🏠 Leave (Medical / Personal)</option>
                                        <option value="OD">🎓 On-Duty (Event / Exam)</option>
                                    </select>
                                </FieldGroup>

                                {!isMobile && <div />} {/* spacer only on desktop */}

                                <FieldGroup label="Start Date">
                                    <input type="date" required value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        style={inputStyle} min={new Date().toISOString().split('T')[0]} />
                                </FieldGroup>

                                <FieldGroup label="End Date">
                                    <input type="date" required value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        style={inputStyle} min={formData.startDate || new Date().toISOString().split('T')[0]} />
                                </FieldGroup>

                                <FieldGroup label="Reason / Description" >
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <textarea required value={formData.reason}
                                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                            rows="4" placeholder="Provide a clear reason for your application..."
                                            style={{ ...inputStyle, resize: 'vertical' }} />
                                    </div>
                                </FieldGroup>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <button type="submit" disabled={loading} style={{
                                        width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                                        background: loading ? '#ccc' : 'var(--color-primary-navy)',
                                        color: 'white', fontWeight: '700', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
                                    }}>
                                        <LuSend /> {loading ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--theme-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <LuClipboardList color="var(--color-primary-navy)" />
                                <span style={{ fontWeight: '700', color: 'var(--theme-text)', fontSize: '16px' }}>Application History</span>
                            </div>
                            {applications.length === 0 ? (
                                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
                                    <LuCalendarDays style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.4 }} />
                                    <p>No applications found.<br />Apply for leave to see your history here.</p>
                                </div>
                            ) : isMobile ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                                    {applications.map((app, idx) => {
                                        const st = STATUS_STYLES[app.status] || STATUS_STYLES.PENDING;
                                        return (
                                            <div key={idx} style={{
                                                background: 'var(--theme-bg-muted)', borderRadius: '12px', padding: '16px',
                                                border: '1px solid var(--theme-border)', display: 'flex', flexDirection: 'column', gap: '10px'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{
                                                        background: app.applicationType === 'OD' ? 'rgba(60,141,188,0.12)' : 'rgba(11,44,107,0.08)',
                                                        color: app.applicationType === 'OD' ? '#3c8dbc' : 'var(--color-primary-navy)',
                                                        padding: '3px 10px', borderRadius: '30px', fontSize: '11px', fontWeight: '700'
                                                    }}>
                                                        {app.applicationType || 'LEAVE'}
                                                    </span>
                                                    <span style={{ padding: '3px 10px', borderRadius: '30px', fontSize: '11px', fontWeight: '700', background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--theme-text)' }}>{app.reason}</div>
                                                <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                                                    <div>From: <span style={{ color: 'var(--theme-text)' }}>{app.startDate}</span></div>
                                                    <div>To: <span style={{ color: 'var(--theme-text)' }}>{app.endDate}</span></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(11,44,107,0.07)' }}>
                                                {['Type', 'Start Date', 'End Date', 'Reason', 'Status'].map(h => (
                                                    <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-primary-navy)', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map((app, idx) => {
                                                const st = STATUS_STYLES[app.status] || STATUS_STYLES.PENDING;
                                                return (
                                                    <tr key={idx} style={{ borderBottom: '1px solid var(--theme-border)', transition: 'background 0.15s' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--theme-bg-muted)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                        <td style={{ padding: '14px 16px' }}>
                                                            <span style={{ background: app.applicationType === 'OD' ? 'rgba(60,141,188,0.12)' : 'rgba(11,44,107,0.08)', color: app.applicationType === 'OD' ? '#3c8dbc' : 'var(--color-primary-navy)', padding: '3px 10px', borderRadius: '30px', fontSize: '12px', fontWeight: '700' }}>
                                                                {app.applicationType || 'LEAVE'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--theme-text)', whiteSpace: 'nowrap' }}>{app.startDate}</td>
                                                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--theme-text)', whiteSpace: 'nowrap' }}>{app.endDate}</td>
                                                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--theme-text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.reason}</td>
                                                        <td style={{ padding: '14px 16px' }}>
                                                            <span style={{ padding: '4px 12px', borderRadius: '30px', fontSize: '12px', fontWeight: '700', background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeaveOD;
