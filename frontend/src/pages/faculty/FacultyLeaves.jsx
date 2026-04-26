import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { FaCalendarCheck, FaCheck, FaTimes, FaUserAlt, FaClock, FaClipboardList, FaHandshake, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../services/api';
import { useToast } from '../../hooks/ToastContext';

const FacultyLeaves = () => {
    const [requests, setRequests] = useState([]);
    const [parentNotes, setParentNotes] = useState({});
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        // Load Leaves
        let syncReqs = JSON.parse(localStorage.getItem('rit_global_leave_requests') || '[]');
        if (syncReqs.length === 0) {
            syncReqs = [
                { id: 'm1', studentName: 'Sachin S', reg: '2117240080119', dept: 'CSE', type: 'LEAVE', startDate: '2026-04-10', endDate: '2026-04-12', reason: 'Common cold and medical rest.', status: 'PENDING', appliedDate: '07/04/2026' },
                { id: 'm2', studentName: 'Sanjana M', reg: '2117240080121', dept: 'CSE', type: 'OD', startDate: '2026-04-15', endDate: '2026-04-15', reason: 'Inter-college Hackathon participation.', status: 'PENDING', appliedDate: '07/04/2026' }
            ];
            localStorage.setItem('rit_global_leave_requests', JSON.stringify(syncReqs));
        }
        setRequests(syncReqs);

        // Load Parent Notes
        const notes = JSON.parse(localStorage.getItem('rit_parent_faculty_notes') || '{}');
        setParentNotes(notes);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        window.addEventListener('storage', fetchData);
        return () => window.removeEventListener('storage', fetchData);
    }, []);

    const handleAction = async (id, action) => {
        try {
            const globalReqs = JSON.parse(localStorage.getItem('rit_global_leave_requests') || '[]');
            const updated = globalReqs.map(r => 
                r.id === id ? { ...r, status: action === 'Approved' ? 'APPROVED' : 'REJECTED' } : r
            );
            localStorage.setItem('rit_global_leave_requests', JSON.stringify(updated));
            setRequests(updated);
            addToast(`Request ${action} successfully!`, 'success');
            
            api.put(`/faculty/leaves/${id}/status`, { status: action.toUpperCase() }).catch(() => null);
        } catch (error) {
            addToast('Action failed. Please try again.', 'error');
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
                        <h3 className="kpi-value">{Object.keys(parentNotes).length}</h3>
                        <p className="kpi-label">Parent Notes</p>
                    </div>
                    <div className="kpi-icon"><FaHandshake /></div>
                    <div className="kpi-more">Pastoral Messages</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }} className="faculty-main-grid">
                <div className="stu-info-card" style={{ borderTop: '4px solid var(--color-primary-navy)' }}>
                    <div className="info-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Active Requests Queue</span>
                        <span style={{ fontSize: '12px', background: 'var(--theme-bg-muted)', padding: '4px 10px', borderRadius: '20px', color: 'var(--theme-text-muted)' }}>{requests.length} records</span>
                    </div>
                    
                    <div style={{ padding: '0 16px' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>Synchronizing...</div>
                        ) : requests.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>No pending requests.</div>
                        ) : (
                            <div className="requests-grid" style={{ display: 'flex', flexDirection: 'column' }}>
                                {requests.map((req) => (
                                    <div key={req.id} style={{ background: 'var(--card-bg)', padding: '16px', display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr 120px 140px', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--theme-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--theme-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-brand-strong)' }}><FaUserAlt size={16} /></div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '800' }}>{req.studentName}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>{req.reg}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '12px' }}>
                                            <div style={{ fontWeight: '800', color: 'var(--theme-brand-strong)' }}>{req.type}</div>
                                            <div style={{ color: 'var(--theme-text-muted)' }}>{req.startDate} → {req.endDate}</div>
                                        </div>
                                        <div>
                                            <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: '900', background: req.status === 'PENDING' ? '#fef3c7' : '#dcfce7', color: req.status === 'PENDING' ? '#92400e' : '#166534' }}>{req.status}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {req.status === 'PENDING' ? (
                                                <button onClick={() => handleAction(req.id, 'Approved')} style={{ flex: 1, background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '11px' }}>Approve</button>
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

                <div className="stu-info-card" style={{ borderTop: '4px solid #7c3aed' }}>
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaHandshake color="#7c3aed" /> Parent Outreach Hub
                    </div>
                    <div className="info-body" style={{ padding: '15px' }}>
                        {Object.keys(parentNotes).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', fontSize: '13px', color: 'var(--theme-text-muted)' }}>No pastoral notes from parents.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {Object.entries(parentNotes).map(([studentId, note]) => (
                                    <div key={studentId} style={{ padding: '12px', background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#7c3aed', marginBottom: '6px' }}>Student: {studentId}</div>
                                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-text)', fontStyle: 'italic', lineHeight: '1.4' }}>"{note}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={{ padding: '15px', background: 'rgba(234, 179, 8, 0.05)', borderTop: '1px solid var(--theme-border)', borderRadius: '0 0 12px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px', color: '#92400e' }}>
                            <FaExclamationTriangle size={14} />
                            <span style={{ fontSize: '11px', fontWeight: '700' }}>Advisor Tip: Address parental concerns during proctor meetings.</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .request-row-hover {
                    transition: all 0.2s ease;
                }
                .request-row-hover:hover {
                    background: var(--theme-bg-muted) !important;
                    transform: scale(1.002);
                }
                @media (max-width: 1100px) {
                    .faculty-main-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 1024px) {
                    .requests-grid > div {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 15px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default FacultyLeaves;
