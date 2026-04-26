import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { workflowApi } from '../../services/enterpriseApi';
import { useAuth } from '../../hooks/AuthContext';
import { useToast } from '../../hooks/ToastContext';

const Certificates = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('BONAFIDE');
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchReqs = async () => {
            try {
                const studentId = user?.id || 1;
                const res = await workflowApi.getCertificates(studentId);
                setRequests(res.data || []);
            } catch (err) { }
        };
        fetchReqs();
    }, [user]);

    const handleApply = async () => {
        setSubmitting(true);
        try {
            const studentId = user?.id || 1;
            const res = await workflowApi.requestCertificate(studentId, type);
            setRequests([...requests, res.data]);
            addToast('Certificate request submitted successfully!', 'success');
        } catch (err) {
            console.error(err);
            addToast('Your certificate request could not be submitted. Please try again later.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="stu-report-page" style={{ padding: '24px' }}>
            <div className="stu-info-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', padding: '24px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--theme-text-muted)' }}>Certificate Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="table-btn" style={{ width: '100%', padding: '12px' }}>
                        <option value="BONAFIDE">Bonafide Certificate</option>
                        <option value="FEE_RECEIPT">Fee Receipt</option>
                        <option value="TRANSCRIPT">Transcript</option>
                    </select>
                </div>
                <button
                    onClick={handleApply}
                    disabled={submitting}
                    style={{ alignSelf: 'flex-end', background: '#00a65a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: submitting ? 'wait' : 'pointer', boxShadow: '0 4px 12px rgba(0,166,90,0.3)' }}
                >
                    {submitting ? 'Applying...' : 'Apply Certificate'}
                </button>
            </div>

            <div className="stu-info-card" style={{ padding: '20px' }}>
                <div className="info-header" style={{ border: 'none', fontSize: '1.2rem', marginBottom: '16px' }}>
                    My Certificate Applications
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="stu-data-table" style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-light)' }}>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Date Requested</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Certificate Type</th>
                                <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '12px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', opacity: 0.7 }}>
                                        No certificate requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '12px' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px', fontWeight: '500' }}>{req.certificateType}</td>
                                        <td style={{ textAlign: 'center', padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                                                background: req.status === 'APPROVED' ? '#DEF7EC' : req.status === 'REJECTED' ? '#FDE8E8' : '#FEF3C7',
                                                color: req.status === 'APPROVED' ? '#03543F' : req.status === 'REJECTED' ? '#9B1C1C' : '#92400E'
                                            }}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '12px' }}>
                                            {req.status === 'APPROVED' && req.pdfUrl ? (
                                                <a href={req.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--theme-brand-strong)', fontWeight: 'bold', textDecoration: 'none' }}>Download PDF</a>
                                            ) : (
                                                <span style={{ color: 'var(--text-secondary)' }}>-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Certificates;
