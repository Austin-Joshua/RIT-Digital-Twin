import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { FaBook, FaFileAlt, FaVideo, FaDownload } from 'react-icons/fa';
import UploadMaterialModal from '../../components/common/UploadMaterialModal';
import api from '../../services/api';

const DEFAULT_MATERIALS = [
    { id: 1, title: 'Unit 1: React Fundamentals & Virtual DOM', type: 'PDF', date: 'Oct 12', size: '2.4 MB', subject: 'Web Technologies' },
    { id: 2, title: 'Lecture 4: Database Transactions & ACID', type: 'Video', date: 'Oct 15', size: '145 MB', subject: 'Database Management' },
    { id: 3, title: 'Assignment 2 Guidelines & Rubrics', type: 'Doc', date: 'Oct 18', size: '1.1 MB', subject: 'Software Engineering' },
];

const FacultyAcademics = () => {
    const [_isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [allMaterials, setAllMaterials] = useState(DEFAULT_MATERIALS);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let isMounted = true;
        api.get('/erp/faculty/assignments')
            .then(res => {
                if (!isMounted) return;
                const rows = Array.isArray(res.data) ? res.data : [];
                if (rows.length > 0) {
                    setSubjects(rows.map(r => ({
                        code: r.subjectCode,
                        name: r.subjectName,
                        semester: `Sem ${r.semester}`,
                        branch: `Section ${r.section}`,
                        students: 60,
                        syllabusCovered: 85
                    })));
                } else {
                    setSubjects([]);
                }
            })
            .catch(() => {
                if (isMounted) setSubjects([]);
            });

        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let isMounted = true;
        api.get('/materials')
            .then(res => {
                if (!isMounted) return;
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setAllMaterials(res.data.map(m => ({
                        id: m.id,
                        title: m.title,
                        type: m.fileType || 'PDF',
                        date: 'Recently Uploaded',
                        size: m.fileSize || '2.0 MB',
                        subject: m.subjectCode
                    })));
                }
            })
            .catch(() => {});

        return () => { isMounted = false; };
    }, []);

    const handleUpload = async (newMat) => {
        try {
            await api.post('/materials', {
                subjectCode: newMat.subject || 'GENERIC',
                title: newMat.title,
                type: newMat.type,
                size: newMat.size
            });
            const updatedMaterials = [newMat, ...allMaterials];
            setAllMaterials(updatedMaterials);
        } catch (_err) {
            const updatedMaterials = [newMat, ...allMaterials];
            setAllMaterials(updatedMaterials);
        }
    };

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--color-primary-navy)', padding: '10px', borderRadius: '10px', color: 'white', display: 'flex' }}>
                        <FaBook size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, color: 'var(--theme-text)', fontSize: '1.4rem', fontWeight: '800' }}>Academic Management</h2>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-text-muted)' }}>Manage course materials and syllabus progress</p>
                    </div>
                </div>
                <button onClick={() => setIsUploadOpen(true)} className="table-btn" style={{ 
                    background: 'var(--color-primary-navy)', 
                    color: 'white', 
                    padding: '12px 24px', 
                    borderRadius: '10px', 
                    border: 'none', 
                    fontWeight: '800', 
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(11, 44, 107, 0.2)'
                }}>
                    + New Material
                </button>
            </div>

            {/* Premium Subject Cards Grid (3 Column for Tab) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {subjects.map((sub, idx) => (
                    <div key={idx} className="stu-info-card" style={{ 
                        borderTop: '4px solid var(--color-primary-navy)',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '180px',
                        background: 'var(--theme-card-bg)',
                        borderRadius: '12px',
                        border: '1px solid var(--theme-border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--theme-text)' }}>{sub.name}</h3>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--theme-text-muted)', marginTop: '2px' }}>{sub.code} • Sem {sub.semester}</div>
                            </div>
                            <span style={{ 
                                background: 'rgba(11, 44, 107, 0.08)', 
                                color: 'var(--theme-brand-strong)', 
                                padding: '4px 10px', 
                                borderRadius: '6px', 
                                fontSize: '11px', 
                                fontWeight: '800' 
                            }}>
                                {sub.branch}
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--theme-text-muted)', margin: '15px 0 10px' }}>
                            <span>Students: <strong style={{ color: 'var(--theme-text)' }}>{sub.students}</strong></span>
                            <span>Syllabus: <strong style={{ color: 'var(--theme-text)' }}>{sub.syllabusCovered}%</strong></span>
                        </div>

                        <div style={{ width: '100%', height: '6px', background: 'var(--theme-bg-muted)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: `${sub.syllabusCovered}%`, 
                                height: '100%', 
                                background: 'linear-gradient(90deg, var(--color-primary-navy) 0%, #3b82f6 100%)',
                                borderRadius: '10px'
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            <Card style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--theme-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaBook style={{ color: 'var(--theme-brand-strong)' }} /> Recent Uploaded Materials
                </h3>
                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--theme-border)' }}>
                    <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ background: 'var(--theme-bg-muted)', textAlign: 'left' }}>
                                <th style={{ padding: '12px 16px', color: 'var(--theme-text)', fontSize: '13px' }}>Material Title</th>
                                <th style={{ padding: '12px 16px', color: 'var(--theme-text)', fontSize: '13px' }}>Type</th>
                                <th style={{ padding: '12px 16px', color: 'var(--theme-text)', fontSize: '13px' }}>Uploaded On</th>
                                <th style={{ padding: '12px 16px', color: 'var(--theme-text)', fontSize: '13px' }}>Size</th>
                                <th style={{ padding: '12px 16px', color: 'var(--theme-text)', textAlign: 'right', fontSize: '13px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allMaterials.map((mat, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', color: 'var(--theme-text)' }}>
                                        {mat.type === 'Video' ? <FaVideo color="var(--color-error)" /> : <FaFileAlt color="var(--color-primary-600)" />}
                                        <div className="flex flex-col">
                                            <span style={{ fontSize: '14px' }}>{mat.title}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--theme-text-muted)', marginTop: '2px' }}>{mat.subject}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--theme-text-muted)', fontSize: '13px' }}>{mat.type}</td>
                                    <td style={{ padding: '16px', color: 'var(--theme-text-muted)', fontSize: '13px' }}>{mat.date}</td>
                                    <td style={{ padding: '16px', color: 'var(--theme-text-muted)', fontSize: '13px' }}>{mat.size}</td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button style={{ background: 'transparent', border: 'none', color: 'var(--theme-brand-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto', fontWeight: 'bold', fontSize: '13px' }}>
                                            <FaDownload /> Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <UploadMaterialModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={handleUpload}
            />
        </div>
    );
};

export default FacultyAcademics;
