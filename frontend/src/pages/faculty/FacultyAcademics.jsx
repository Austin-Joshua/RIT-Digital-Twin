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
                    <h2 style={{ margin: 0, color: 'var(--theme-text)' }}>Academic Management</h2>
                    <div className="breadcrumb-bar" style={{ marginTop: '8px' }}>
                        <span className="breadcrumb-item" style={{ color: 'var(--theme-text-muted)' }}>Faculty</span>
                        <span className="breadcrumb-item active" style={{ marginLeft: '8px', color: 'var(--theme-text)' }}>/ Academics</span>
                    </div>
                </div>
                <button className="table-btn" style={{ background: 'var(--color-primary-navy)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>
                    + Upload Material
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {subjects.map((sub, idx) => (
                    <Card key={idx} style={{ padding: '20px', borderTop: '4px solid var(--color-primary-navy)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--theme-text)' }}>{sub.name}</h3>
                                <div style={{ color: 'var(--theme-text-muted)', fontSize: '14px', fontWeight: 'bold' }}>{sub.code}</div>
                            </div>
                            <span className="status-badge od">
                                Sem {sub.semester}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '16px', color: 'var(--theme-text-muted)' }}>
                            <span>Branch: <strong style={{ color: 'var(--theme-text)' }}>{sub.branch}</strong></span>
                            <span>Students: <strong style={{ color: 'var(--theme-text)' }}>{sub.students}</strong></span>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: 'var(--theme-text-muted)' }}>
                                <span>Syllabus Covered</span>
                                <span>{sub.syllabusCovered}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--theme-bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${sub.syllabusCovered}%`, height: '100%', background: sub.syllabusCovered > 80 ? 'var(--color-success)' : 'var(--color-warning)' }}></div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--theme-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaBook style={{ color: 'var(--color-primary-navy)' }} /> Recent Uploaded Materials
                </h3>
                <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--theme-bg-muted)', textAlign: 'left', borderBottom: '2px solid var(--theme-border)' }}>
                            <th style={{ padding: '12px 16px', color: 'var(--theme-text)' }}>Material Title</th>
                            <th style={{ padding: '12px 16px', color: 'var(--theme-text)' }}>Type</th>
                            <th style={{ padding: '12px 16px', color: 'var(--theme-text)' }}>Uploaded On</th>
                            <th style={{ padding: '12px 16px', color: 'var(--theme-text)' }}>Size</th>
                            <th style={{ padding: '12px 16px', color: 'var(--theme-text)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map((mat, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', color: 'var(--theme-text)' }}>
                                    {mat.type === 'Video' ? <FaVideo color="var(--color-error)" /> : <FaFileAlt color="var(--color-primary-600)" />}
                                    {mat.title}
                                </td>
                                <td style={{ padding: '16px', color: 'var(--theme-text-muted)' }}>{mat.type}</td>
                                <td style={{ padding: '16px', color: 'var(--theme-text-muted)' }}>{mat.date}</td>
                                <td style={{ padding: '16px', color: 'var(--theme-text-muted)' }}>{mat.size}</td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--color-primary-navy)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto', fontWeight: 'bold' }}>
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
