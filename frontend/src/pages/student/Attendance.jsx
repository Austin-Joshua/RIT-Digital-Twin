import React from 'react';
import { FaCalendarCheck, FaChartBar } from 'react-icons/fa';

const Attendance = () => {
    const attendanceData = [
        { code: 'CS1001', subject: 'Data Structures', total: 45, attended: 42, percent: '93.3%' },
        { code: 'CS1002', subject: 'Digital Logic', total: 42, attended: 38, percent: '90.5%' },
        { code: 'MA1003', subject: 'Engineering Maths', total: 48, attended: 40, percent: '83.3%' },
        { code: 'PH1004', subject: 'Physics', total: 36, attended: 35, percent: '97.2%' },
        { code: 'GE1005', subject: 'Professional Ethics', total: 30, attended: 30, percent: '100%' },
    ];

    return (
        <div className="stu-page">
            <div className="stu-page-header">
                <h2>Attendance Report</h2>
                <p>Subject-wise attendance summary for Feb 2026</p>
            </div>

            <div className="stu-kpi-card teal" style={{ minHeight: '80px', padding: '10px 15px', marginBottom: '20px', width: '200px' }}>
                <div className="kpi-value">92.8%</div>
                <div className="kpi-label">Average Attendance</div>
                <span className="kpi-icon"><FaChartBar /></span>
            </div>

            <div className="stu-info-card">
                <div className="info-header">Current Semester Attendance</div>
                <div className="stu-calendar-grid">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#bbdefb' }}>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Code</th>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Subject</th>
                                <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ccc' }}>Total</th>
                                <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ccc' }}>Attended</th>
                                <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ccc' }}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceData.map((a, i) => (
                                <tr key={i}>
                                    <td style={{ padding: '10px', border: '1px solid #e0e0e0' }}>{a.code}</td>
                                    <td style={{ padding: '10px', border: '1px solid #e0e0e0' }}>{a.subject}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #e0e0e0' }}>{a.total}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #e0e0e0' }}>{a.attended}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #e0e0e0', fontWeight: 'bold', color: parseFloat(a.percent) < 85 ? '#d32f2f' : '#2e7d32' }}>
                                        {a.percent}
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

export default Attendance;
