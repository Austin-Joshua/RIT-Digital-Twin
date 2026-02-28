import React from 'react';
import Card from '../../components/common/Card';
import { FaBook, FaFileAlt, FaVideo, FaDownload } from 'react-icons/fa';

const FacultyAcademics = () => {
    const subjects = [
        { code: 'CS8651', name: 'Internet Programming', semester: 'VI', branch: 'CSE', students: 60, syllabusCovered: 85 },
        { code: 'CS8691', name: 'Artificial Intelligence', semester: 'VI', branch: 'CSE', students: 62, syllabusCovered: 70 },
        { code: 'IT8076', name: 'Software Testing', semester: 'VIII', branch: 'IT', students: 55, syllabusCovered: 90 },
    ];

    const materials = [
        { title: 'Unit 1: React Fundamentals', type: 'PDF', date: 'Oct 12', size: '2.4 MB' },
        { title: 'Lecture: Node.js Architecture', type: 'Video', date: 'Oct 15', size: '145 MB' },
        { title: 'Assignment 2 Guidelines', type: 'Doc', date: 'Oct 18', size: '1.1 MB' },
        { title: 'Unit 2: Express Routing', type: 'PDF', date: 'Oct 20', size: '3.2 MB' },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#0B2C6B' }}>Academic Management</h2>
                    <div className="breadcrumb-bar" style={{ marginTop: '8px' }}>
                        <span className="breadcrumb-item">Faculty</span>
                        <span className="breadcrumb-item active" style={{ marginLeft: '8px' }}>/ Academics</span>
                    </div>
                </div>
                <button className="table-btn" style={{ background: '#0B2C6B', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>
                    + Upload Material
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {subjects.map((sub, idx) => (
                    <Card key={idx} style={{ padding: '20px', borderTop: '4px solid #0B2C6B' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{sub.name}</h3>
                                <div style={{ color: '#666', fontSize: '14px', fontWeight: 'bold' }}>{sub.code}</div>
                            </div>
                            <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                Sem {sub.semester}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '16px', color: '#555' }}>
                            <span>Branch: <strong>{sub.branch}</strong></span>
                            <span>Students: <strong>{sub.students}</strong></span>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                <span>Syllabus Covered</span>
                                <span>{sub.syllabusCovered}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${sub.syllabusCovered}%`, height: '100%', background: sub.syllabusCovered > 80 ? '#10b981' : '#f59e0b' }}></div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaBook color="#0B2C6B" /> Recent Uploaded Materials
                </h3>
                <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '12px 16px', color: '#475569' }}>Material Title</th>
                            <th style={{ padding: '12px 16px', color: '#475569' }}>Type</th>
                            <th style={{ padding: '12px 16px', color: '#475569' }}>Uploaded On</th>
                            <th style={{ padding: '12px 16px', color: '#475569' }}>Size</th>
                            <th style={{ padding: '12px 16px', color: '#475569', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map((mat, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500' }}>
                                    {mat.type === 'Video' ? <FaVideo color="#ef4444" /> : <FaFileAlt color="#3b82f6" />}
                                    {mat.title}
                                </td>
                                <td style={{ padding: '16px', color: '#666' }}>{mat.type}</td>
                                <td style={{ padding: '16px', color: '#666' }}>{mat.date}</td>
                                <td style={{ padding: '16px', color: '#666' }}>{mat.size}</td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button style={{ background: 'transparent', border: 'none', color: '#0B2C6B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto' }}>
                                        <FaDownload /> Download
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default FacultyAcademics;
