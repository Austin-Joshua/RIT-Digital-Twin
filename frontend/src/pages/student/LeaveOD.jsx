import React from 'react';
import { FaPlaneDeparture, FaPlus } from 'react-icons/fa';

const LeaveOD = () => {
    const leaveHistory = [
        { type: 'Leave', startDate: '2026-02-14', endDate: '2026-02-14', reason: 'Personal work', status: 'Approved' },
        { type: 'OD', startDate: '2026-02-10', endDate: '2026-02-10', reason: 'Symposium', status: 'Approved' },
        { type: 'Leave', startDate: '2026-02-05', endDate: '2026-02-05', reason: 'Fever', status: 'Approved' },
    ];

    return (
        <div className="stu-page">
            <div className="stu-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2>Apply Leave / OD</h2>
                    <p>Manage your leave and On-Duty requests</p>
                </div>
                <button className="stu-user-badge" style={{ background: '#00a65a' }}>
                    <FaPlus /> &nbsp; Apply New
                </button>
            </div>

            <div className="stu-kpi-card red" style={{ minHeight: '80px', padding: '10px 15px', marginBottom: '20px', width: '200px' }}>
                <div className="kpi-value">3</div>
                <div className="kpi-label">Taken Leave (Days)</div>
                <span className="kpi-icon"><FaPlaneDeparture /></span>
            </div>

            <div className="stu-info-card">
                <div className="info-header">Application History</div>
                <div className="stu-calendar-grid">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#bbdefb' }}>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Type</th>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Period</th>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Reason</th>
                                <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ccc' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveHistory.map((l, i) => (
                                <tr key={i}>
                                    <td style={{ padding: '10px', border: '1px solid #e0e0e0' }}>{l.type}</td>
                                    <td style={{ padding: '10px', border: '1px solid #e0e0e0' }}>{l.startDate === l.endDate ? l.startDate : `${l.startDate} to ${l.endDate}`}</td>
                                    <td style={{ padding: '10px', border: '1px solid #e0e0e0' }}>{l.reason}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: '#e8f5e9',
                                            color: '#2e7d32',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {l.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveOD;
