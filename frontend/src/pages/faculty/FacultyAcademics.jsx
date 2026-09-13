import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { FaBook, FaFileAlt, FaVideo, FaDownload } from 'react-icons/fa';
import UploadMaterialModal from '../../components/common/UploadMaterialModal';
import api from '../../services/api';

const FacultyAcademics = () => {
    const [_isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [subjects, setSubjects] = useState([]);
    const [subjectNote, setSubjectNote] = useState('Reading assigned subjects.');
    const [allMaterials, setAllMaterials] = useState([]);

    useEffect(() => {
        api.get('/erp/faculty/assignments')
            .then((res) => {
                const rows = Array.isArray(res.data) ? res.data : [];
                setSubjects(rows);
                setSubjectNote(rows.length ? '' : 'No assigned subject is stored for this login. Syllabus coverage is not invented.');
            })
            .catch(() => {
                setSubjects([]);
                setSubjectNote('Assigned subjects could not be read. No course list is substituted.');
            });
    }, []);

    useEffect(() => {
        const loadMaterials = () => {
            const stored = localStorage.getItem('connectivity_materials');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setAllMaterials(Array.isArray(parsed) ? parsed : []);
                } catch {
                    setAllMaterials([]);
                }
            }
        };
        loadMaterials();
        window.addEventListener('storage', loadMaterials);
        return () => window.removeEventListener('storage', loadMaterials);
    }, []);

    const handleUpload = (newMat) => {
        const updatedMaterials = [newMat, ...allMaterials];
        setAllMaterials(updatedMaterials);
        localStorage.setItem('connectivity_materials', JSON.stringify(updatedMaterials));
        window.dispatchEvent(new Event('storage'));
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
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-text-muted)' }}>Assigned subjects and files you upload on this browser. Syllabus percent is not stored.</p>
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
            {subjectNote ? <p style={{ margin: 0, color: 'var(--theme-text-muted)' }}>{subjectNote}</p> : null}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {subjects.map((sub) => (
                    <div key={sub.facultySubjectId || `${sub.subjectCode}-${sub.section}`} className="stu-info-card" style={{
                        borderTop: '4px solid var(--color-primary-navy)',
                        padding: '20px',
                        background: 'var(--theme-card-bg)',
                        borderRadius: '12px',
                        border: '1px solid var(--theme-border)'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--theme-text)' }}>{sub.subjectName}</h3>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--theme-text-muted)', marginTop: '2px' }}>{sub.subjectCode} · Sem {sub.semester} · {sub.section}</div>
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
                            {allMaterials.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: 16, color: 'var(--theme-text-muted)' }}>No file has been uploaded from this browser. Sample materials are not listed.</td></tr>
                            ) : null}
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
