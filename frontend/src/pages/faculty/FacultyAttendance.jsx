import React, { useState } from 'react';
import Card from '../../components/common/Card';
import { FaUserClock, FaChartPie, FaDownload } from 'react-icons/fa';

const FacultyAttendance = () => {
    const [selectedCourse, setSelectedCourse] = useState('CS8651 - Internet Programming');

    const students = [
        { reg: '211520104001', name: 'Aakash S', attended: 42, total: 45, percentage: 93.3 },
        { reg: '211520104002', name: 'Balaji K', attended: 35, total: 45, percentage: 77.8 },
        { reg: '211520104003', name: 'Chandini R', attended: 44, total: 45, percentage: 97.8 },
        { reg: '211520104004', name: 'Dinesh M', attended: 28, total: 45, percentage: 62.2 },
        { reg: '211520104005', name: 'Elango P', attended: 40, total: 45, percentage: 88.9 },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#0B2C6B' }}>Class Attendance Roster</h2>
                    <div className="breadcrumb-bar" style={{ marginTop: '8px' }}>
                        <span className="breadcrumb-item">Faculty</span>
                        <span className="breadcrumb-item active" style={{ marginLeft: '8px' }}>/ Attendance</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
                    >
                        <option value="CS8651 - Internet Programming">CS8651 - Internet Programming / CSE-A</option>
                        <option value="CS8691 - Artificial Intelligence">CS8691 - Artificial Intelligence / CSE-B</option>
                    </select>
                    <button style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        <FaDownload /> Export CSV
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <Card style={{ padding: '20px', background: '#0B2C6B', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '5px' }}>Overall Class Attendance</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>84.5%</div>
                        </div>
                        <FaChartPie size={40} color="#3b82f6" opacity={0.8} />
                    </div>
                </Card>
                <Card style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>Students Below 75%</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>4</div>
                        </div>
                        <FaUserClock size={40} color="#fee2e2" />
                    </div>
                </Card>
            </div>

            <Card style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Student Roster - {selectedCourse}</h3>
                    <input type="text" placeholder="Search Registration Number..." style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '250px' }} />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Register Number</th>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Student Name</th>
                                <th style={{ padding: '12px 16px', color: '#475569', textAlign: 'center' }}>Classes Attended</th>
                                <th style={{ padding: '12px 16px', color: '#475569', textAlign: 'center' }}>Total Classes</th>
                                <th style={{ padding: '12px 16px', color: '#475569', textAlign: 'center' }}>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px', fontWeight: '500', color: '#333' }}>{student.reg}</td>
                                    <td style={{ padding: '16px', color: '#444' }}>{student.name}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#0B2C6B', fontWeight: 'bold' }}>{student.attended}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>{student.total}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{
                                            background: student.percentage >= 75 ? '#d1fae5' : '#fee2e2',
                                            color: student.percentage >= 75 ? '#059669' : '#dc2626',
                                            padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block', minWidth: '60px'
                                        }}>
                                            {student.percentage}%
                                        </span>
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

export default FacultyAttendance;
