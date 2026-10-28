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
        <div className="ims-page-container">
            {/* Header Area */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <FaClipboardList />
                    </div>
                    <div>
                        <h1 className="ims-header-title">Faculty Leave & OD Approval Hub</h1>
                        <p className="ims-header-subtitle">Monitor and process student leave and OD applications for your department</p>
                    </div>
                </div>
                <span className="ims-candy-badge" style={{ background: 'rgba(11,44,107,0.08)', color: 'var(--theme-brand-strong)' }}>
                    {requests.length} Requests in Queue
                </span>
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
                <div className="ims-card-elevated" style={{ borderTop: '4px solid var(--color-primary-navy)' }}>
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
                                                        className="ims-candy-btn ims-candy-success ims-candy-sm"
                                                        style={{ flex: 1 }}
                                                    >
                                                        {actionId === req.id ? '...' : 'Approve'}
                                                    </button>
                                                    <button 
                                                        disabled={actionId === req.id}
                                                        onClick={() => handleAction(req.id, 'Rejected')} 
                                                        className="ims-candy-btn ims-candy-danger ims-candy-sm"
                                                        style={{ flex: 1 }}
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
