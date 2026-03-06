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

            <div style={{ marginTop: '20px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--theme-text)' }}>Recent Requests</h3>

                {/* Desktop View (Table-like grid) */}
                <div className="hidden md:grid grid-cols-6 gap-4 p-4 font-bold border-b" style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', borderBottomColor: 'var(--theme-border)' }}>
                    <div className="col-span-1">Student Info</div>
                    <div className="col-span-1">Leave Type</div>
                    <div className="col-span-1">Duration</div>
                    <div className="col-span-1">Reason</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1 text-center">Approve / Reject</div>
                </div>

                <div className="flex flex-col gap-4 md:gap-0 mt-4 md:mt-0">
                    {requests.map((req) => (
                        <Card key={req.id} className="md:grid md:grid-cols-6 md:gap-4 md:items-center p-4 md:border-t-0 md:border-x-0 md:rounded-none md:shadow-none" style={{ borderBottomColor: 'var(--theme-border)', borderBottomStyle: 'solid', borderBottomWidth: '1px' }}>
                            {/* Mobile Label & Desktop Content */}
                            <div className="col-span-1 mb-2 md:mb-0">
                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 block mb-1">Student Info</span>
                                <div style={{ fontWeight: 'bold', color: 'var(--theme-text)' }}>{req.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>{req.reg}</div>
                            </div>

                            <div className="col-span-1 mb-2 md:mb-0">
                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 block mb-1">Leave Type</span>
                                <span className={`status-badge ${req.type.includes('OD') ? 'od' : 'approved'}`}>
                                    {req.type}
                                </span>
                            </div>

                            <div className="col-span-1 mb-2 md:mb-0">
                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 block mb-1">Duration</span>
                                <div style={{ color: 'var(--theme-text)', fontSize: '14px' }}>{req.duration}</div>
                            </div>

                            <div className="col-span-1 mb-2 md:mb-0">
                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 block mb-1">Reason</span>
                                <div style={{ color: 'var(--theme-text-muted)', fontSize: '14px' }}>{req.reason}</div>
                            </div>

                            <div className="col-span-1 mb-4 md:mb-0">
                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 block mb-1">Status</span>
                                <span className={`status-badge ${req.status.toLowerCase()}`}>
                                    {req.status}
                                </span>
                            </div>

                            <div className="col-span-1 flex md:justify-center">
                                {req.status === 'Pending' ? (
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button onClick={() => handleAction(req.id, 'Approved')} className="flex-1 md:flex-none justify-center" style={{ background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FaCheck size={12} /> Approve
                                        </button>
                                        <button onClick={() => handleAction(req.id, 'Rejected')} className="flex-1 md:flex-none justify-center" style={{ background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FaTimes size={12} /> Reject
                                        </button>
                                    </div>
                                ) : (
                                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>Resolved</span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FacultyLeaves;
