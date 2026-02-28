import React, { useState } from 'react';
import Card from '../../components/common/Card';
import { FaCalendarCheck, FaCheck, FaTimes } from 'react-icons/fa';

const FacultyLeaves = () => {
    const [requests, setRequests] = useState([
        { id: 1, name: 'Rahul Sharma', reg: '211520104055', type: 'Sick Leave', duration: '2 Days (Oct 24 - Oct 25)', reason: 'Fever and cold', status: 'Pending' },
        { id: 2, name: 'Priya Patel', reg: '211520104042', type: 'On-Duty (OD)', duration: '1 Day (Oct 26)', reason: 'Hackathon Participation', status: 'Pending' },
        { id: 3, name: 'Vijay Kumar', reg: '211520104088', type: 'Casual Leave', duration: '1 Day (Oct 27)', reason: 'Family Function', status: 'Pending' },
        { id: 4, name: 'Sneha Reddy', reg: '211520104067', type: 'Sick Leave', duration: '3 Days (Oct 20 - Oct 22)', reason: 'Viral Fever', status: 'Approved' },
        { id: 5, name: 'Abhishek Iyer', reg: '211520104012', type: 'On-Duty (OD)', duration: '2 Days (Oct 15 - Oct 16)', reason: 'Sports Tournament', status: 'Rejected' },
    ]);

    const handleAction = (id, action) => {
        setRequests(requests.map(req =>
            req.id === id ? { ...req, status: action } : req
        ));
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#0B2C6B' }}>Leave & Approval Queue</h2>
                <div className="breadcrumb-bar" style={{ marginTop: '8px' }}>
                    <span className="breadcrumb-item">Faculty</span>
                    <span className="breadcrumb-item active" style={{ marginLeft: '8px' }}>/ Leaves</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <Card style={{ padding: '20px', borderLeft: '4px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '50%' }}>
                        <FaCalendarCheck size={24} color="#d97706" />
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                            {requests.filter(r => r.status === 'Pending').length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Pending Requests</div>
                    </div>
                </Card>
                <Card style={{ padding: '20px', borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#d1fae5', padding: '15px', borderRadius: '50%' }}>
                        <FaCheck size={24} color="#059669" />
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                            {requests.filter(r => r.status === 'Approved').length}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>Approved This Month</div>
                    </div>
                </Card>
            </div>

            <Card style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Recent Requests</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Student Info</th>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Leave Type</th>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Duration</th>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Reason</th>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Status</th>
                                <th style={{ padding: '12px 16px', color: '#475569', textAlign: 'center' }}>Approve / Reject</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 'bold', color: '#0B2C6B' }}>{req.name}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{req.reg}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            background: req.type.includes('OD') ? '#e0f2fe' : '#f3f4f6',
                                            color: req.type.includes('OD') ? '#0284c7' : '#4b5563',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                                        }}>
                                            {req.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', color: '#444', fontSize: '14px' }}>{req.duration}</td>
                                    <td style={{ padding: '16px', color: '#666', fontSize: '14px' }}>{req.reason}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            background: req.status === 'Pending' ? '#fef3c7' : req.status === 'Approved' ? '#d1fae5' : '#fee2e2',
                                            color: req.status === 'Pending' ? '#d97706' : req.status === 'Approved' ? '#059669' : '#dc2626',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                                        }}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {req.status === 'Pending' ? (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button onClick={() => handleAction(req.id, 'Approved')} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FaCheck size={12} /> Approve
                                                </button>
                                                <button onClick={() => handleAction(req.id, 'Rejected')} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
