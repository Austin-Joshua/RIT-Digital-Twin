import React, { useState } from 'react';

const GradeBook = () => {
    const [semester, setSemester] = useState('');
    const [showData, setShowData] = useState(false);

    const grades = [
        { year: '2024-2025', sem: '01', code: 'CY23111', title: 'Engineering Chemistry', grade: 'B+', result: 'PASS', monthYear: 'November 2024' },
        { year: '2024-2025', sem: '01', code: 'GE23111', title: 'Problem Solving and C Programming', grade: 'B+', result: 'PASS', monthYear: 'November 2024' },
        { year: '2024-2025', sem: '01', code: 'GE23131', title: 'Engineering Graphics', grade: 'B+', result: 'PASS', monthYear: 'November 2024' },
        { year: '2024-2025', sem: '01', code: 'HS23111', title: 'Communicative English', grade: 'B+', result: 'PASS', monthYear: 'November 2024' },
        { year: '2024-2025', sem: '01', code: 'MA23111', title: 'Matrices and Calculus', grade: 'A', result: 'PASS', monthYear: 'November 2024' },
        { year: '2024-2025', sem: '01', code: 'CY23121', title: 'Chemistry Laboratory', grade: 'O', result: 'PASS', monthYear: 'November 2024' },
        { year: '2024-2025', sem: '01', code: 'GE23121', title: 'Problem Solving and C Programming Laboratory', grade: 'A+', result: 'PASS', monthYear: 'November 2024' },
        { year: '2024-2025', sem: '01', code: 'GE23112', title: 'Heritage of Tamil', grade: 'A', result: 'PASS', monthYear: 'November 2024' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (semester === '1') setShowData(true);
        else setShowData(false);
    };

    return (
        <div className="stu-report-page">
            <div className="stu-info-card" style={{ padding: '20px', marginBottom: '15px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #f4f4f4', paddingBottom: '10px', marginBottom: '20px' }}>
                    Grade Book
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
                    <div style={{ flex: '0 0 250px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                            Semester <span style={{ color: 'red' }}>*</span>
                        </label>
                        <select
                            className="table-btn"
                            style={{ width: '100%', height: '34px' }}
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        >
                            <option value="">Select Semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="table-btn" style={{ background: '#007bff', color: 'white', border: 'none', height: '34px', padding: '0 20px', borderRadius: '4px', fontWeight: 'bold' }}>
                        Submit
                    </button>
                </form>
            </div>

            {showData ? (
                <div className="stu-info-card" style={{ padding: '15px' }}>
                    <div className="stu-table-controls">
                        <div>
                            Show &nbsp;
                            <select className="table-btn">
                                <option>10</option>
                            </select>
                            &nbsp; entries &nbsp;
                            <button className="table-btn" style={{ background: '#007bff', color: 'white', border: 'none' }}>
                                Download PDF
                            </button>
                        </div>
                        <div>
                            Search: &nbsp;
                            <input type="text" className="table-btn" style={{ width: '150px' }} />
                        </div>
                    </div>

                    <table className="stu-data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '30px' }}><input type="checkbox" /></th>
                                <th style={{ textAlign: 'center' }}>Academic Year &nbsp;↕</th>
                                <th style={{ textAlign: 'center' }}>Semester &nbsp;↕</th>
                                <th style={{ textAlign: 'center' }}>Subject Code &nbsp;↕</th>
                                <th>Subject Title &nbsp;↕</th>
                                <th style={{ textAlign: 'center' }}>Grade &nbsp;↕</th>
                                <th style={{ textAlign: 'center' }}>Result &nbsp;↕</th>
                                <th>Exam Month and Exam Year &nbsp;↕</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((g, i) => (
                                <tr key={i}>
                                    <td style={{ textAlign: 'center' }}><input type="checkbox" /></td>
                                    <td style={{ textAlign: 'center' }}>{g.year}</td>
                                    <td style={{ textAlign: 'center' }}>{g.sem}</td>
                                    <td style={{ textAlign: 'center' }}>{g.code}</td>
                                    <td>{g.title}</td>
                                    <td style={{ textAlign: 'center' }}>{g.grade}</td>
                                    <td style={{ textAlign: 'center' }}>{g.result}</td>
                                    <td>{g.monthYear}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <span style={{ color: '#777' }}>Showing 1 to 8 of 8 entries</span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="table-btn" disabled>Previous</button>
                            <span className="table-btn active" style={{ background: '#007bff', color: 'white' }}>1</span>
                            <button className="table-btn" disabled>Next</button>
                        </div>
                    </div>

                    <div style={{ marginTop: '25px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', fontSize: '12px', color: '#333', fontWeight: 'bold', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                        <div>RA – Reappearance is required</div>
                        <div>RA* - Absent for End Exam</div>
                        <div>W/WD – Withdrawal</div>
                        <div>SA – Shortage of Attendance</div>
                        <div>SE – Sports Exemption</div>
                        <div>WH1 – Suspected Malpractice</div>
                        <div>WH2 – Contact COE office</div>
                    </div>
                </div>
            ) : (
                <div className="stu-info-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', fontSize: '12px', color: '#333', fontWeight: 'bold' }}>
                        <div>RA – Reappearance is required</div>
                        <div>RA* - Absent for End Exam</div>
                        <div>W/WD – Withdrawal</div>
                        <div>SA – Shortage of Attendance</div>
                        <div>SE – Sports Exemption</div>
                        <div>WH1 – Suspected Malpractice</div>
                        <div>WH2 – Contact COE office</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradeBook;
