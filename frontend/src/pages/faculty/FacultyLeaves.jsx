import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { FaCalendarCheck, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

const FacultyLeaves = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const response = await api.get('/faculty/leaves');
                const mappedLeaves = response.data.map(l => ({
                    id: l.id,
                    name: l.facultyName,
                    reg: l.facultyId,
                    type: l.leaveType,
                    duration: `${l.startDate} to ${l.endDate}`,
                    reason: 'Leave Application',
                    status: l.status
                }));
                setRequests(mappedLeaves);
            } catch (error) {
                console.error("Failed to fetch leaves, using mock", error);
                setRequests([
                    { id: 1, name: 'Rahul Sharma', reg: '211520104055', type: 'Sick Leave', duration: '2 Days (Oct 24 - Oct 25)', reason: 'Fever and cold', status: 'Pending' },
                    { id: 2, name: 'Priya Patel', reg: '211520104042', type: 'On-Duty (OD)', duration: '1 Day (Oct 26)', reason: 'Hackathon Participation', status: 'Pending' },
                    { id: 3, name: 'Vijay Kumar', reg: '211520104088', type: 'Casual Leave', duration: '1 Day (Oct 27)', reason: 'Family Function', status: 'Pending' },
                    { id: 4, name: 'Sneha Reddy', reg: '211520104067', type: 'Sick Leave', duration: '3 Days (Oct 20 - Oct 22)', reason: 'Viral Fever', status: 'Approved' },
                    { id: 5, name: 'Abhishek Iyer', reg: '211520104012', type: 'On-Duty (OD)', duration: '2 Days (Oct 15 - Oct 16)', reason: 'Sports Tournament', status: 'Rejected' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaves();
    }, []);

    const handleAction = async (id, action) => {
        try {
            await api.put(`/faculty/leaves/${id}/status`, { status: action });
            setRequests(requests.map(req =>
                req.id === id ? { ...req, status: action } : req
            ));
        } catch (error) {
            console.error("Failed to update leave status", error);
            setRequests(requests.map(req =>
                req.id === id ? { ...req, status: action } : req
            ));
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: 'var(--theme-text)' }}>Leave & Approval Queue</h2>
                <div className="breadcrumb-bar" style={{ marginTop: '8px' }}>
                    <span className="breadcrumb-item" style={{ color: 'var(--theme-text-muted)' }}>Faculty</span>
                    <span className="breadcrumb-item active" style={{ marginLeft: '8px', color: 'var(--theme-text)' }}>/ Leaves</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <Card style={{ padding: '20px', borderLeft: '4px solid var(--color-warning)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'var(--color-warning-100)', padding: '15px', borderRadius: '50%' }}>
                        <FaCalendarCheck size={24} color="var(--color-warning)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--theme-text)' }}>
                            {requests.filter(r => r.status === 'Pending').length}
                        </div>
                        <div style={{ color: 'var(--theme-text-muted)', fontSize: '14px' }}>Pending Requests</div>
                    </div>
                </Card>
                <Card style={{ padding: '20px', borderLeft: '4px solid var(--color-success)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'var(--color-success-100)', padding: '15px', borderRadius: '50%' }}>
                        <FaCheck size={24} color="var(--color-success)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--theme-text)' }}>
                            {requests.filter(r => r.status === 'Approved').length}
                        </div>
                        <div style={{ color: 'var(--theme-text-muted)', fontSize: '14px' }}>Approved This Month</div>
                    </div>
                </Card>
            </div>

            <Card style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--theme-text)' }}>Recent Requests</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: 'var(--theme-bg-muted)', textAlign: 'left', borderBottom: '2px solid var(--theme-border)' }}>
                                <th style={{ padding: '12px 16px', color: 'var(--theme-text)' }}>Student Info</th>
                                <th style={{ padding: '12px 16px', color: 'var(--theme-text)' }}>Leave Type</th>
                                <th style={{ padding: '12px 16px', color: 'var(--theme-text)' }}>Duration</th>
                                <th style={{ padding: '12px 16px', color: 'var(--theme-text)' }}>Reason</th>
                                <th style={{ padding: '12px 16px', color: 'var(--theme-text)' }}>Status</th>
                                <th style={{ padding: '12px 16px', color: 'var(--theme-text)', textAlign: 'center' }}>Approve / Reject</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--theme-text)' }}>{req.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>{req.reg}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={`status-badge ${req.type.includes('OD') ? 'od' : 'approved'}`}>
                                            {req.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--theme-text)', fontSize: '14px' }}>{req.duration}</td>
                                    <td style={{ padding: '16px', color: 'var(--theme-text-muted)', fontSize: '14px' }}>{req.reason}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={`status-badge ${req.status.toLowerCase()}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {req.status === 'Pending' ? (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button onClick={() => handleAction(req.id, 'Approved')} style={{ background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FaCheck size={12} /> Approve
                                                </button>
                                                <button onClick={() => handleAction(req.id, 'Rejected')} style={{ background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FaTimes size={12} /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#9ca3af', fontSize: '13px' }}>Resolved</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default FacultyLeaves;
