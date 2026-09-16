import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/ToastContext';
import { useAuth } from '../../hooks/AuthContext';
import api from '../../services/api';

const NoDueRequest = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [requestingCode, setRequestingCode] = useState(null);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/nodue/my-requests');
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch {
            setError('Unable to load clearance records from institutional servers.');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [user]);

    const handleRequest = async (item) => {
        try {
            setRequestingCode(item.code);
            await api.post('/nodue/request', {
                clearanceDefinitionId: item.clearanceDefinitionId,
                clearanceType: item.name
            });
            addToast(`No Due clearance request submitted for ${item.name}`, 'success');
            await fetchStatus();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Request failed. Please try again later.';
            addToast(msg, 'error');
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
                    Authoritative end-of-semester clearance portal for student <strong>{user?.username || 'Register Number'}</strong>. Clearances are verified directly against database-backed clearance definitions.
                </p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--theme-text-muted)' }}>
                        Connecting to clearance authorities...
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-danger, #ef4444)' }}>
                        {error}
                    </div>
                ) : requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--theme-text-muted)' }}>
                        No active clearance definitions configured.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--theme-border)' }}>
                        <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
                            <thead style={{ background: 'var(--theme-bg-muted)' }}>
                                <tr>
                                    <th style={{ textAlign: 'center', width: '60px', padding: '12px', color: 'var(--theme-text)' }}>S.No</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text)' }}>Clearance Code</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text)' }}>Clearance Scope</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text)' }}>Authorized Officer</th>
                                    <th style={{ textAlign: 'center', padding: '12px', color: 'var(--theme-text)' }}>Status</th>
                                    <th style={{ textAlign: 'center', padding: '12px', color: 'var(--theme-text)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((item, idx) => {
                                    const status = item.status || 'NOT_REQUESTED';
                                    const isPending = status === 'PENDING';
                                    const isApproved = status === 'APPROVED';
                                    const isRejected = status === 'REJECTED';

                                    return (
                                        <tr key={item.code || idx} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                            <td style={{ textAlign: 'center', padding: '12px', color: 'var(--theme-text)' }}>{idx + 1}</td>
                                            <td style={{ padding: '12px', color: 'var(--theme-text)', fontWeight: 'bold' }}>{item.code}</td>
                                            <td style={{ padding: '12px', color: 'var(--theme-text)' }}>{item.name}</td>
                                            <td style={{ padding: '12px', color: 'var(--theme-text-muted)' }}>{item.faculty}</td>
                                            <td style={{ textAlign: 'center', padding: '12px' }}>
                                                <span className={`status-badge ${status.toLowerCase().replace('_', '-')}`} style={{
                                                    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                                                    background: isApproved ? 'rgba(22, 163, 74, 0.1)' : isPending ? 'rgba(217, 119, 6, 0.1)' : isRejected ? 'rgba(239, 68, 68, 0.1)' : 'var(--theme-bg-muted)',
                                                    color: isApproved ? 'var(--color-success, #16a34a)' : isPending ? 'var(--color-warning, #d97706)' : isRejected ? 'var(--color-danger, #ef4444)' : 'var(--theme-text-muted)'
                                                }}>
                                                    {status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '12px' }}>
                                                {status === 'NOT_REQUESTED' ? (
                                                    <button
                                                        disabled={requestingCode === item.code}
                                                        onClick={() => handleRequest(item)}
                                                        style={{ background: 'var(--color-primary-navy, #1e3a8a)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                                    >
                                                        {requestingCode === item.code ? 'Submitting...' : 'Request Clearance'}
                                                    </button>
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                                                        {isApproved ? 'Clearance Granted' : isPending ? 'Under Review' : 'Clearance Withheld'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoDueRequest;
