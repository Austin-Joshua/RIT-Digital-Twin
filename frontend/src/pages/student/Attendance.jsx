import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';

const AttendanceReport = () => {
    const [search, setSearch] = useState('');

    const attendanceRecords = [
        { slNo: 1, code: 'CS23411', name: 'Database Management Systems', faculty: 'PANDIARAJAN T.', attended: 17, total: 22, percent: 77 },
        { slNo: 2, code: 'CS23413', name: 'Theory of Computation', faculty: 'ANGALAPARAMESWARI ANBAZHAGAN', attended: 21, total: 28, percent: 75 },
        { slNo: 3, code: 'CS23414', name: 'Software Development Practices', faculty: 'SRINIVASAN M.L.', attended: 12, total: 13, percent: 92 },
        { slNo: 4, code: 'CS23431', name: 'Design and Analysis of Algorithms', faculty: 'MURUGAN P', attended: 21, total: 24, percent: 88 },
        { slNo: 5, code: 'AL23432', name: 'Machine Learning Techniques', faculty: 'ARAVINDH S', attended: 21, total: 31, percent: 68 },
        { slNo: 6, code: 'CS23421', name: 'Database Management Lab', faculty: 'PANDIARAJAN T.', attended: 7, total: 9, percent: 78 },
    ];

    return (
        <div className="stu-report-page">
            <div className="stu-report-header">
                <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>Attendance Report</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
                    <span>Academic Year : <b>2025-2026</b></span>
                    <span>Semester : <b>IV</b></span>
                </div>
            </div>

            <div className="stu-info-card" style={{ padding: '15px' }}>
                <div className="stu-table-controls">
                    <div>
                        Show &nbsp;
                        <select className="table-btn">
                            <option>10</option>
                            <option>25</option>
                        </select>
                        &nbsp; entries
                    </div>
                    <div>
                        <div className="stu-table-actions" style={{ display: 'inline-flex', marginRight: '20px' }}>
                            <button className="table-btn primary">Select all</button>
                            <button className="table-btn">Deselect all</button>
                            <button className="table-btn">Copy</button>
                            <button className="table-btn">CSV</button>
                            <button className="table-btn">Excel</button>
                            <button className="table-btn">PDF</button>
                            <button className="table-btn">Print</button>
                            <button className="table-btn">Columns</button>
                        </div>
                        Search: &nbsp;
                        <input
                            type="text"
                            className="table-btn"
                            style={{ width: '150px' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <table className="stu-data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '30px' }}><input type="checkbox" /></th>
                            <th style={{ textAlign: 'center' }}>Sl/No &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Subject Code &nbsp;↕</th>
                            <th>Subject Name &nbsp;↕</th>
                            <th>Faculty Name &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>No Of Periods Attended &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Total No Of Periods &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Attendance Percentage &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceRecords.map((rec) => (
                            <tr key={rec.slNo}>
                                <td style={{ textAlign: 'center' }}><input type="checkbox" /></td>
                                <td style={{ textAlign: 'center' }}>{rec.slNo}</td>
                                <td style={{ textAlign: 'center' }}>{rec.code}</td>
                                <td>{rec.name}</td>
                                <td>{rec.faculty}</td>
                                <td style={{ textAlign: 'center' }}>{rec.attended}</td>
                                <td style={{ textAlign: 'center' }}>{rec.total}</td>
                                <td style={{ textAlign: 'center', backgroundColor: rec.percent <= 70 ? '#f39c12' : 'transparent', color: rec.percent <= 70 ? 'white' : 'inherit' }}>
                                    {rec.percent}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button className="btn-view">view</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#777' }}>
                    <span>Showing 1 to 6 of 6 entries</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button className="table-btn" disabled>Previous</button>
                        <button className="table-btn" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReport;
