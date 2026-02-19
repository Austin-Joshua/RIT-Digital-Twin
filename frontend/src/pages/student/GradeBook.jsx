import React from 'react';
import { FaBook, FaMedal, FaExclamationCircle } from 'react-icons/fa';

const GradeBook = () => {
    const grades = [
        { semester: 'Semester 1', gpa: '8.5', result: 'Pass', arrears: 0 },
        { semester: 'Semester 2', gpa: '8.2', result: 'Pass', arrears: 0 },
        { semester: 'Semester 3', gpa: '7.9', result: 'Pass', arrears: 0 },
        { semester: 'Semester 4', gpa: '0.0', result: 'Pending', arrears: 0 },
    ];

    return (
        <div className="stu-page">
            <div className="stu-page-header">
                <h2>Grade Book</h2>
                <p>Academic performance and semester-wise grade summary</p>
            </div>

            <div className="stu-kpi-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '20px' }}>
                <div className="stu-kpi-card green" style={{ minHeight: '80px', padding: '10px 15px' }}>
                    <div className="kpi-value">8.20</div>
                    <div className="kpi-label">Cumulative GPA (CGPA)</div>
                    <span className="kpi-icon"><FaMedal /></span>
                </div>
                <div className="stu-kpi-card yellow" style={{ minHeight: '80px', padding: '10px 15px' }}>
                    <div className="kpi-value">0</div>
                    <div className="kpi-label">Total Arrears in Hand</div>
                    <span className="kpi-icon"><FaExclamationCircle /></span>
                </div>
            </div>

            <div className="stu-info-card">
                <div className="info-header">Semester Summary</div>
                <div className="stu-calendar-grid">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#bbdefb' }}>
                                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Semester</th>
                                <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ccc' }}>GPA</th>
                                <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ccc' }}>Arrears</th>
                                <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ccc' }}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((g, i) => (
                                <tr key={i}>
                                    <td style={{ padding: '10px', border: '1px solid #e0e0e0' }}>{g.semester}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #e0e0e0', fontWeight: 'bold' }}>{g.gpa}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #e0e0e0' }}>{g.arrears}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: g.result === 'Pass' ? '#e8f5e9' : '#fff3e0',
                                            color: g.result === 'Pass' ? '#2e7d32' : '#ef6c00',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {g.result}
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

export default GradeBook;
