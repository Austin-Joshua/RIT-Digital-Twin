import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const LeaveOD = () => {
    const [applications, setApplications] = useState([]);
    const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '', type: 'LEAVE' });
    const [loading, setLoading] = useState(false);

    const fetchApplications = async () => {
        try {
            const res = await api.get('/academic/leave/my-leaves');
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/academic/leave/apply', formData);
            alert('Application submitted successfully!');
            setFormData({ startDate: '', endDate: '', reason: '', type: 'LEAVE' });
            fetchApplications();
        } catch (err) {
            alert('Your application could not be submitted. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', color: 'var(--color-primary-navy)' }}>Apply for Leave / On-Duty</h2>

            <div className="stu-info-card" style={{ padding: '24px', marginBottom: '32px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label>Application Type</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
                            <option value="LEAVE">Leave</option>
                            <option value="OD">On-Duty</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            <label>Start Date</label>
                            <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg)', color: 'var(--theme-text)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            <label>End Date</label>
                            <input type="date" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg)', color: 'var(--theme-text)' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / span 2' }}>
                        <label>Reason / Description</label>
                        <textarea required value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} rows="3" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--theme-border)', resize: 'vertical', background: 'var(--theme-bg)', color: 'var(--theme-text)' }}></textarea>
                    </div>

                    <button type="submit" disabled={loading} style={{ gridColumn: '1 / span 2', padding: '12px', background: 'var(--color-primary-navy)', color: 'white', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>
            </div>

            <h3 style={{ marginBottom: '16px' }}>My Application History</h3>
            <div className="stu-info-card" style={{ overflow: 'hidden' }}>
                <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '16px' }}>Type</th>
                            <th style={{ padding: '16px' }}>Start Date</th>
                            <th style={{ padding: '16px' }}>End Date</th>
                            <th style={{ padding: '16px' }}>Reason</th>
                            <th style={{ padding: '16px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length > 0 ? applications.map((app, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>{app.applicationType || 'LEAVE'}</td>
                                <td style={{ padding: '16px' }}>{app.startDate}</td>
                                <td style={{ padding: '16px' }}>{app.endDate}</td>
                                <td style={{ padding: '16px', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{app.reason}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                                        background: app.status === 'APPROVED' ? '#dcfce7' : app.status === 'REJECTED' ? '#fee2e2' : '#fef9c3',
                                        color: app.status === 'APPROVED' ? '#166534' : app.status === 'REJECTED' ? '#991b1b' : '#854d0e'
                                    }}>
                                        {app.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No past applications found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaveOD;
