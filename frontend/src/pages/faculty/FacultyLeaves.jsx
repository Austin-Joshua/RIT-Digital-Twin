import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { FaCalendarCheck, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

const FacultyLeaves = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaves = async () => {
            let baseLeaves = [
                { id: 1, name: 'Rahul Sharma', reg: '211520104055', type: 'Sick Leave', duration: '2 Days (Oct 24 - Oct 25)', reason: 'Fever and cold', status: 'Pending' },
                { id: 2, name: 'Priya Patel', reg: '211520104042', type: 'On-Duty (OD)', duration: '1 Day (Oct 26)', reason: 'Hackathon Participation', status: 'Pending' },
            ];

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
                baseLeaves = [...mappedLeaves, ...baseLeaves];
            } catch (error) {
                console.error("Using mock for base leaves");
            }

            // Sync with Student 'No Due' requests via localStorage
            const storedReqs = localStorage.getItem('connectivity_nodue_requests');
            if (storedReqs) {
                const connectivityReqs = JSON.parse(storedReqs).map((r, idx) => ({
                    id: `sync_${r.id}`,
                    name: r.studentName,
                    reg: r.reg,
                    type: r.type,
                    duration: 'Academic Year 2025-26',
                    reason: `Course: ${r.code} - ${r.name}`,
                    status: r.status,
                    isSynced: true,
                    originalCode: r.code
                }));
                setRequests([...baseLeaves, ...connectivityReqs]);
            } else {
                setRequests(baseLeaves);
            }
            setLoading(false);
        };

        fetchLeaves();

        // Listen for internal storage changes
        const handleStorage = () => fetchLeaves();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const handleAction = async (id, action) => {
        const req = requests.find(r => r.id === id);

        if (req?.isSynced) {
            // Update localStorage for Student Connectivity
            const storedReqs = JSON.parse(localStorage.getItem('connectivity_nodue_requests') || '[]');
            const updated = storedReqs.map(r =>
                r.code === req.originalCode ? { ...r, status: action, remarks: `Processed by Faculty: ${action}` } : r
            );
            localStorage.setItem('connectivity_nodue_requests', JSON.stringify(updated));

            setRequests(requests.map(r => r.id === id ? { ...r, status: action } : r));
            return;
        }

        try {
            await api.put(`/faculty/leaves/${id}/status`, { status: action });
            setRequests(requests.map(req =>
                req.id === id ? { ...req, status: action } : req
            ));
        } catch (error) {
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

            <div className="grid grid-cols-2 gap-4 md:gap-6" style={{ marginBottom: '24px' }}>
                <Card style={{ padding: '16px md:padding:20px', borderLeft: '4px solid var(--color-warning)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }} className="md:flex-row md:items-center md:gap-[15px]">
                    <div style={{ background: 'var(--color-warning-100)', padding: '10px', borderRadius: '50%' }} className="md:p-[15px]">
                        <FaCalendarCheck className="text-xl md:text-2xl" color="var(--color-warning)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--theme-text)' }} className="md:text-[24px]">
                            {requests.filter(r => r.status === 'Pending').length}
                        </div>
                        <div style={{ color: 'var(--theme-text-muted)', fontSize: '12px' }} className="md:text-[14px]">Pending Requests</div>
                    </div>
                </Card>
                <Card style={{ padding: '16px md:padding:20px', borderLeft: '4px solid var(--color-success)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }} className="md:flex-row md:items-center md:gap-[15px]">
                    <div style={{ background: 'var(--color-success-100)', padding: '10px', borderRadius: '50%' }} className="md:p-[15px]">
                        <FaCheck className="text-xl md:text-2xl" color="var(--color-success)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--theme-text)' }} className="md:text-[24px]">
                            {requests.filter(r => r.status === 'Approved').length}
                        </div>
                        <div style={{ color: 'var(--theme-text-muted)', fontSize: '12px' }} className="md:text-[14px]">Approved This Month</div>
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
