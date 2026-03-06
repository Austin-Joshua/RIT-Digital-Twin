import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { FaBook, FaFileAlt, FaVideo, FaDownload } from 'react-icons/fa';
import UploadMaterialModal from '../../components/common/UploadMaterialModal';

const FacultyAcademics = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const subjects = [
        { code: 'CS8651', name: 'Internet Programming', semester: 'VI', branch: 'CSE', students: 60, syllabusCovered: 85 },
        { code: 'CS8691', name: 'Artificial Intelligence', semester: 'VI', branch: 'CSE', students: 62, syllabusCovered: 70 },
        { code: 'IT8076', name: 'Software Testing', semester: 'VIII', branch: 'IT', students: 55, syllabusCovered: 90 },
    ];

    const defaultMaterials = [
        { id: 1, title: 'Unit 1: React Fundamentals', type: 'PDF', date: 'Oct 12', size: '2.4 MB', subject: 'Internet Programming' },
        { id: 2, title: 'Lecture: Node.js Architecture', type: 'Video', date: 'Oct 15', size: '145 MB', subject: 'Internet Programming' },
        { id: 3, title: 'Assignment 2 Guidelines', type: 'Doc', date: 'Oct 18', size: '1.1 MB', subject: 'Internet Programming' },
        { id: 4, title: 'Unit 2: Express Routing', type: 'PDF', date: 'Oct 20', size: '3.2 MB', subject: 'Internet Programming' },
    ];

    const [allMaterials, setAllMaterials] = useState(defaultMaterials);

    useEffect(() => {
        const loadMaterials = () => {
            const stored = localStorage.getItem('connectivity_materials');
            if (stored) {
                setAllMaterials(JSON.parse(stored));
            } else {
                localStorage.setItem('connectivity_materials', JSON.stringify(defaultMaterials));
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
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: '20px',
                gap: '16px'
            }}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--theme-text)', fontSize: isMobile ? '1.5rem' : '1.875rem' }}>Academic Management</h2>
                    <div className="breadcrumb-bar" style={{ marginTop: '8px' }}>
                        <span className="breadcrumb-item" style={{ color: 'var(--theme-text-muted)' }}>Faculty</span>
                        <span className="breadcrumb-item active" style={{ marginLeft: '8px', color: 'var(--theme-text)' }}>/ Academics</span>
                    </div>
                </div>
                <button onClick={() => setIsUploadOpen(true)} className="table-btn w-full md:w-auto text-center justify-center flex hover:opacity-90 active:scale-95 transition-all" style={{ background: 'var(--color-primary-navy)', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>
                    + Upload Material
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-6">
                {subjects.map((sub, idx) => (
                    <Card key={idx} className="p-3 md:p-5 flex flex-col justify-between" style={{ borderTop: '4px solid var(--color-primary-navy)' }}>
                        <div className="flex justify-between items-start mb-2 md:mb-4">
                            <div>
                                <h3 className="m-0 text-sm md:text-lg" style={{ color: 'var(--theme-text)' }}>{sub.name}</h3>
                                <div className="text-[10px] md:text-sm font-bold" style={{ color: 'var(--theme-text-muted)' }}>{sub.code}</div>
                            </div>
                            <span className="status-badge od px-2 py-1 rounded-md text-[9px] md:text-xs whitespace-nowrap ml-2" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-navy)' }}>
                                Sem {sub.semester}
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between text-[10px] md:text-sm mb-3 md:mb-4 gap-1 sm:gap-0" style={{ color: 'var(--theme-text-muted)' }}>
                            <span>Branch: <strong style={{ color: 'var(--theme-text)' }}>{sub.branch}</strong></span>
                            <span>Students: <strong style={{ color: 'var(--theme-text)' }}>{sub.students}</strong></span>
                        </div>
                        <div className="mt-auto">
                            <div className="flex justify-between text-[9px] md:text-xs mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                                <span>Syllabus Covered</span>
                                <span>{sub.syllabusCovered}%</span>
                            </div>
                            <div className="w-full h-1.5 md:h-2 rounded-full overflow-hidden" style={{ background: 'var(--theme-bg-muted)' }}>
                                <div className="h-full rounded-full" style={{ width: `${sub.syllabusCovered}%`, background: sub.syllabusCovered > 80 ? 'var(--color-success)' : 'var(--color-warning)' }}></div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--theme-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaBook style={{ color: 'var(--color-primary-navy)' }} /> Recent Uploaded Materials
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
                                        <button style={{ background: 'transparent', border: 'none', color: 'var(--color-primary-navy)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto', fontWeight: 'bold', fontSize: '13px' }}>
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
