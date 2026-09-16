import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { FaCalendarCheck, FaCheck, FaTimes, FaUserAlt, FaClock, FaClipboardList, FaHandshake, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../services/api';
import { useToast } from '../../hooks/ToastContext';

const FacultyLeaves = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const { addToast } = useToast();

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/academic/leave/pending');
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch {
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id, action) => {
        try {
            setActionId(id);
            await api.put(`/academic/leave/${id}/status`, { status: action.toUpperCase() });
            addToast(`Request marked as ${action} in ERP database!`, 'success');
            await fetchRequests();
        } catch {
            addToast('Approval action failed. Please try again.', 'error');
        } finally {
            setActionId(null);
        }
    };

    const counts = {
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
    };

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'var(--color-primary-navy)', padding: '12px', borderRadius: '12px', color: 'white', display: 'flex', boxShadow: '0 4px 12px rgba(11, 44, 107, 0.2)' }}>
                    <FaClipboardList size={22} />
                </div>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--theme-text)', fontSize: '1.4rem', fontWeight: '800' }}>Faculty Approval Hub</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--theme-text-muted)', fontSize: '13px' }}>Monitor and manage student leave and OD applications for your department.</p>
                </div>
            </div>

            {/* KPI Row */}
            <div className="stu-kpi-row">
                <div className="stu-kpi-card yellow">
                    <div className="kpi-main">
                        <h3 className="kpi-value">{counts.pending}</h3>
                        <p className="kpi-label">Pending Approval</p>
                    </div>
                    <div className="kpi-icon"><FaClock /></div>
                    <div className="kpi-more">High Priority Queue</div>
                </div>
                <div className="stu-kpi-card teal">
                    <div className="kpi-main">
                        <h3 className="kpi-value">{counts.approved}</h3>
                        <p className="kpi-label">Leaves Approved</p>
                    </div>
                    <div className="kpi-icon"><FaCheck /></div>
                    <div className="kpi-more">This Semester</div>
                </div>
                <div className="stu-kpi-card purple" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)' }}>
                    <div className="kpi-main">
                        <h3 className="kpi-value">{requests.length}</h3>
                        <p className="kpi-label">Total Submissions</p>
                    </div>
                    <div className="kpi-icon"><FaHandshake /></div>
                    <div className="kpi-more">Database Records</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div className="stu-info-card" style={{ borderTop: '4px solid var(--color-primary-navy)' }}>
                    <div className="info-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Active Student Requests Queue (Database SOT)</span>
                        <span style={{ fontSize: '12px', background: 'var(--theme-bg-muted)', padding: '4px 10px', borderRadius: '20px', color: 'var(--theme-text-muted)' }}>{requests.length} records</span>
                    </div>
                    
                    <div style={{ padding: '0 16px' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>Loading authoritative leave applications...</div>
                        ) : requests.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>No leave or OD applications in queue.</div>
                        ) : (
                            <div className="requests-grid" style={{ display: 'flex', flexDirection: 'column' }}>
                                {requests.map((req) => (
                                    <div key={req.id} style={{ background: 'var(--card-bg)', padding: '16px', display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr 120px 180px', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--theme-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--theme-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-brand-strong)' }}><FaUserAlt size={16} /></div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '800' }}>{req.studentName || 'Student'}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>{req.studentId}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '12px' }}>
                                            <div style={{ fontWeight: '800', color: 'var(--theme-brand-strong)' }}>{req.type}</div>
                                            <div style={{ color: 'var(--theme-text-muted)' }}>{req.startDate} → {req.endDate}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', marginTop: '2px' }}>{req.reason}</div>
                                        </div>
                                        <div>
                                            <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: '900', background: req.status === 'PENDING' ? '#fef3c7' : '#dcfce7', color: req.status === 'PENDING' ? '#92400e' : '#166534' }}>{req.status}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {req.status === 'PENDING' ? (
                                                <>
                                                    <button 
                                                        disabled={actionId === req.id}
                                                        onClick={() => handleAction(req.id, 'Approved')} 
                                                        style={{ flex: 1, background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '11px' }}
                                                    >
                                                        {actionId === req.id ? '...' : 'Approve'}
                                                    </button>
                                                    <button 
                                                        disabled={actionId === req.id}
                                                        onClick={() => handleAction(req.id, 'Rejected')} 
                                                        style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '11px' }}
                                                    >
                                                        {actionId === req.id ? '...' : 'Reject'}
                                                    </button>
                                                </>
                                            ) : (
                                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--theme-text-muted)', textAlign: 'center', width: '100%' }}>Finalized</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyLeaves;
