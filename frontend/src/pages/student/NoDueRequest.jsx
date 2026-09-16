import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/ToastContext';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../services/api';

const DEFAULT_CLEARANCE_AREAS = [
    { code: 'LIB-01', name: 'Central Library Clearance', faculty: 'Chief Librarian', department: 'Library' },
    { code: 'LAB-CSE', name: 'Department Computer Laboratories', faculty: 'Lab Administrator', department: 'CSE Labs' },
    { code: 'HOSTEL-01', name: 'Hostel & Mess Office Clearance', faculty: 'Chief Warden', department: 'Hostel' },
    { code: 'SPORTS-01', name: 'Physical Education & Sports Facilities', faculty: 'Physical Director', department: 'Sports' },
    { code: 'OFFICE-01', name: 'Accounts & Academic Fee Section', faculty: 'Accounts Officer', department: 'Accounts' }
];

const NoDueRequest = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [requests, setRequests] = useState([]);
    const [_loading, setLoading] = useState(true);
    const [requestingCode, setRequestingCode] = useState(null);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const res = await api.get('/nodue/my-requests');
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch {
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [user]);

    const handleRequest = async (area) => {
        try {
            setRequestingCode(area.code);
            await api.post('/nodue/request', {
                department: area.department,
                reason: `Semester clearance for ${area.name} (${area.code})`,
            });
            addToast(`No Due clearance request submitted for ${area.name}`, 'success');
            await fetchStatus();
        } catch {
            addToast('Request failed. Please try again later.', 'error');
        } finally {
            setRequestingCode(null);
        }
    };

    return (
        <div className="stu-report-page">
            <div style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--theme-text-muted)' }}>
                Home / <span style={{ color: 'var(--color-accent-gold)' }}>No Due Request</span>
            </div>

            <div className="stu-info-card" style={{ padding: '24px', background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'var(--theme-text)', borderLeft: '4px solid var(--color-accent-gold)', paddingLeft: '12px' }}>
                    Institutional Department Clearances
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)', marginBottom: '20px', paddingLeft: '16px' }}>
                    Authoritative end-of-semester clearance portal for student <strong>{user?.username || 'Register Number'}</strong>. Clearances are verified directly against backend database records.
                </p>

                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--theme-border)' }}>
                    <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
                        <thead style={{ background: 'var(--theme-bg-muted)' }}>
                            <tr>
                                <th style={{ textAlign: 'center', width: '60px', padding: '12px', color: 'var(--theme-text)' }}>S.No</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text)' }}>Department Code</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text)' }}>Clearance Scope</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text)' }}>Authorized Officer</th>
                                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--theme-text)' }}>Status</th>
                                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--theme-text)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DEFAULT_CLEARANCE_AREAS.map((area, idx) => {
                                const match = requests.find(r => r.department === area.department || (r.reason && r.reason.includes(area.code)));
                                const status = match ? match.status : 'NOT_REQUESTED';
                                const isPending = status === 'PENDING';
                                const isApproved = status === 'APPROVED';

                                return (
                                    <tr key={area.code} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                        <td style={{ textAlign: 'center', padding: '12px', color: 'var(--theme-text)' }}>{idx + 1}</td>
                                        <td style={{ padding: '12px', color: 'var(--theme-text)', fontWeight: 'bold' }}>{area.code}</td>
                                        <td style={{ padding: '12px', color: 'var(--theme-text)' }}>{area.name}</td>
                                        <td style={{ padding: '12px', color: 'var(--theme-text-muted)' }}>{area.faculty}</td>
                                        <td style={{ textAlign: 'center', padding: '12px' }}>
                                            <span className={`status-badge ${status.toLowerCase().replace('_', '-')}`} style={{
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                                                background: isApproved ? 'rgba(22, 163, 74, 0.1)' : isPending ? 'rgba(217, 119, 6, 0.1)' : 'var(--theme-bg-muted)',
                                                color: isApproved ? 'var(--color-success)' : isPending ? 'var(--color-warning)' : 'var(--theme-text-muted)'
                                            }}>
                                                {status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '12px' }}>
                                            {!match ? (
                                                <button
                                                    disabled={requestingCode === area.code}
                                                    onClick={() => handleRequest(area)}
                                                    style={{ background: 'var(--color-primary-navy)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                                >
                                                    {requestingCode === area.code ? 'Submitting...' : 'Request Clearance'}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                                                    {isApproved ? 'Clearance Granted' : 'Under Review'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NoDueRequest;
