import React, { useState } from 'react';
import { FaFileAlt, FaPlus, FaArrowCircleRight } from 'react-icons/fa';

const LeaveOD = () => {
    const [search, setSearch] = useState('');

    const leaveHistory = [
        { id: 1, type: 'Leave', fromDate: '2026-02-10', toDate: '2026-02-10', days: 1, reason: 'Family Function', status: 'Approved' },
        { id: 2, type: 'OD', fromDate: '2026-02-15', toDate: '2026-02-15', days: 1, reason: 'Workshop', status: 'Pending' },
    ];

    return (
        <div className="stu-report-page">
            <div className="stu-welcome">
                <h2>Leave / OD Application</h2>
                <div className="stu-breadcrumb">Student / Leave / OD</div>
            </div>

            <div style={{ padding: '0 0 15px 0' }}>
                <button className="table-btn" style={{ background: '#00a65a', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold' }}>
                    <FaPlus /> &nbsp; Apply Leave / OD
                </button>
            </div>

            <div className="stu-kpi-row">
                <div className="stu-kpi-card red">
                    <div className="kpi-main">
                        <div className="kpi-value">2</div>
                        <div className="kpi-label">Total Days Taken</div>
                    </div>
                    <span className="kpi-icon"><FaFileAlt /></span>
                    <div className="kpi-more">Attendance Impact</div>
                </div>
            </div>

            <div className="stu-info-card" style={{ padding: '15px' }}>
                <div className="info-header" style={{ border: 'none' }}>Application History</div>

                <div className="stu-table-controls">
                    <div>
                        Show &nbsp;
                        <select className="table-btn">
                            <option>10</option>
                        </select>
                        &nbsp; entries
                    </div>
                    <div>
                        Search: &nbsp;
                        <input
                            type="text"
                            className="table-btn"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <table className="stu-data-table">
                    <thead>
                        <tr>
                            <th>Type &nbsp;↕</th>
                            <th>From Date &nbsp;↕</th>
                            <th>To Date &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Days &nbsp;↕</th>
                            <th>Reason &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Status &nbsp;↕</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveHistory.map((l) => (
                            <tr key={l.id}>
                                <td>{l.type}</td>
                                <td>{l.fromDate}</td>
                                <td>{l.toDate}</td>
                                <td style={{ textAlign: 'center' }}>{l.days}</td>
                                <td>{l.reason}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: l.status === 'Approved' ? '#00a65a' : '#f39c12',
                                        color: 'white',
                                        fontSize: '11px',
                                        fontWeight: 'bold'
                                    }}>
                                        {l.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaveOD;
