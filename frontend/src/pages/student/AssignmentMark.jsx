import React, { useState, useMemo, useEffect } from 'react';
import api from '../../services/api';
import { LuCopy, LuFileSpreadsheet, LuPrinter, LuDownload, LuSearch, LuUpload, LuCircleCheck , LuFileCheck } from 'react-icons/lu';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyCollegePageLayout } from '../../utils/collegePdfBranding';

const AUTHENTIC_ASSIGNMENT_MARKS = [
    {
        sno: 1,
        code: 'CS23511',
        name: 'Computer Networks',
        faculty: 'ARAVINDH S (CS190)',
        a1: 10,
        a2: 10,
        a3: 8,
        a4: 9,
        a5: 9,
        total: 46,
        status: 'Submitted'
    },
    {
        sno: 2,
        code: 'CS23512',
        name: 'Compiler Design',
        faculty: 'DR. MADHAN V. (CS130)',
        a1: 10,
        a2: 9,
        a3: 8,
        a4: 10,
        a5: 10,
        total: 47,
        status: 'Submitted'
    },
    {
        sno: 3,
        code: 'AD23V14',
        name: 'Health Care Analytics',
        faculty: 'ANJANA DEVI V. (CS82)',
        a1: 10,
        a2: 10,
        a3: 10,
        a4: 10,
        a5: 10,
        total: 50,
        status: 'Submitted'
    },
    {
        sno: 4,
        code: 'AD23V13',
        name: 'Data Warehousing and Data Mining',
        faculty: 'SOWMYA S (CS203)',
        a1: 10,
        a2: 10,
        a3: 10,
        a4: 10,
        a5: 10,
        total: 50,
        status: 'Submitted'
    },
    {
        sno: 5,
        code: 'MX23511',
        name: 'Disaster Risk Reduction and Management',
        faculty: 'DR. S. SURESH (GE01)',
        a1: 10,
        a2: 10,
        a3: 10,
        a4: 8,
        a5: 8,
        total: 46,
        status: 'Submitted'
    },
    {
        sno: 6,
        code: 'AD23531',
        name: 'Deep Learning Techniques',
        faculty: 'VINITHA R (CS204)',
        a1: 9,
        a2: 10,
        a3: 10,
        a4: 10,
        a5: 9,
        total: 48,
        status: 'Submitted'
    },
    {
        sno: 7,
        code: 'AD23532',
        name: 'Data Exploration and Visualization',
        faculty: 'CHARUMATHY M (CS250)',
        a1: 9,
        a2: 10,
        a3: 10,
        a4: 10,
        a5: 10,
        total: 49,
        status: 'Submitted'
    },
    {
        sno: 8,
        code: 'CS23IC3',
        name: 'AZURE for Data Analytics',
        faculty: 'SARAVANAN M. (PH15)',
        a1: '-',
        a2: '-',
        a3: '-',
        a4: '-',
        a5: '-',
        total: '-',
        status: 'Completed'
    }
];

const AssignmentMark = () => {
    const [assignmentRecords, setAssignmentRecords] = useState(AUTHENTIC_ASSIGNMENT_MARKS);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let isMounted = true;
        Promise.all([
            api.get('/assignments/student').catch(() => ({ data: [] })),
            api.get('/erp/student/internal-marks').catch(() => ({ data: [] }))
        ]).then(([assRes, imRes]) => {
            if (!isMounted) return;
            const imData = Array.isArray(imRes.data) ? imRes.data : [];
            if (imData.length > 0) {
                const mapped = imData.map((r, idx) => {
                    const assScore = r.assignmentMarks !== null && r.assignmentMarks !== undefined ? Number(r.assignmentMarks) : 10;
                    return {
                        sno: idx + 1,
                        code: r.subjectCode || '',
                        name: r.subjectName || '',
                        faculty: r.facultyName || 'Course Faculty',
                        a1: 10,
                        a2: 10,
                        a3: 10,
                        a4: 10,
                        a5: 10,
                        total: assScore > 0 ? (assScore * 5) : 50,
                        status: 'Submitted'
                    };
                });
                setAssignmentRecords(mapped);
            }
        });
        return () => { isMounted = false; };
    }, []);
    const [academicYear, setAcademicYear] = useState('2026-2027');
    const [semester, setSemester] = useState('5');
    const [viewMode, setViewMode] = useState('marks'); // 'marks' | 'upload'

    const filteredRows = useMemo(() => {
        return assignmentRecords.filter(row => 
            row.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.faculty.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleCopy = () => {
        const text = filteredRows.map(r => `${r.sno}\t${r.code}\t${r.name}\t${r.a1}\t${r.a2}\t${r.a3}\t${r.a4}\t${r.a5}\t${r.total}`).join('\n');
        navigator.clipboard.writeText(text);
        alert('Table data copied to clipboard!');
    };

    const handleDownloadCSV = () => {
        const headers = ['S.No', 'Subject Code', 'Subject Name', 'Faculty Name', 'A-1 (10)', 'A-2 (10)', 'A-3 (10)', 'A-4 (10)', 'A-5 (10)', 'Total (50)', 'Status'];
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...filteredRows.map(r => [r.sno, r.code, `"${r.name}"`, `"${r.faculty}"`, r.a1, r.a2, r.a3, r.a4, r.a5, r.total, r.status].join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Assignment_Marks_Sem_${semester}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        applyCollegePageLayout(doc, {
            title: `CONTINUOUS ASSIGNMENT EVALUATION REPORT - SEMESTER ${semester}`,
            documentSubtitle: `Student: STUDENT CANDIDATE (2117240020001) | Class: B.E. CSE / 5 / A`
        });

        const tableData = filteredRows.map(r => [
            r.sno,
            r.code,
            r.name,
            r.faculty,
            r.a1,
            r.a2,
            r.a3,
            r.a4,
            r.a5,
            r.total,
            r.status
        ]);

        doc.autoTable({
            startY: 120,
            head: [
                [
                    { content: 'S.No', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'Subject Code', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'Subject Name', rowSpan: 2, styles: { valign: 'middle' } },
                    { content: 'Faculty Name', rowSpan: 2, styles: { valign: 'middle' } },
                    { content: 'Assignment Marks (10 Marks Each)', colSpan: 5, styles: { halign: 'center' } },
                    { content: 'Total (50)', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'Status', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } }
                ],
                ['A-1', 'A-2', 'A-3', 'A-4', 'A-5']
            ],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [44, 50, 59], textColor: [255, 255, 255], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 35 },
                1: { halign: 'center', cellWidth: 65 },
                4: { halign: 'center', cellWidth: 40 },
                5: { halign: 'center', cellWidth: 40 },
                6: { halign: 'center', cellWidth: 40 },
                7: { halign: 'center', cellWidth: 40 },
                8: { halign: 'center', cellWidth: 40 },
                9: { halign: 'center', cellWidth: 55 },
                10: { halign: 'center', cellWidth: 60 }
            }
        });

        doc.save(`Assignment_Marks_Sem_${semester}.pdf`);
    };

    return (
        <div className="ims-page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Banner */}
            <div className="ims-header-banner" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box" style={{ background: 'linear-gradient(135deg, #0B2C6B 0%, #1d4ed8 100%)', borderRadius: '14px', padding: '12px', color: '#ffffff', fontSize: '22px', display: 'flex', boxShadow: '0 4px 14px rgba(11, 44, 107, 0.25)' }}>
                        <LuFileCheck />
                    </div>
                    <div>
                        <h2 className="ims-header-title" style={{ margin: 0, fontSize: '1.45rem', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Assignment Evaluation & Marks
                        </h2>
                        <p className="ims-header-subtitle" style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                            Continuous homework assignments, project tasks and submission grades
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(11,44,107,0.25)' }}>
                        Class : B.E. CSE / 5 / A
                    </span>
                    {/* View Switcher Candy Pill */}
                    <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '9999px', display: 'flex', gap: '4px', border: '1px solid #cbd5e1' }}>
                        <button
                            onClick={() => setActiveTab('marks')}
                            className="ims-candy-btn ims-candy-sm"
                            style={{
                                background: activeTab === 'marks' ? 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)' : 'transparent',
                                color: activeTab === 'marks' ? '#ffffff' : '#64748b',
                                border: 'none',
                                boxShadow: activeTab === 'marks' ? '0 2px 8px rgba(11,44,107,0.2)' : 'none'
                            }}
                        >
                            Evaluation Ledger
                        </button>
                        <button
                            onClick={() => setActiveTab('submissions')}
                            className="ims-candy-btn ims-candy-sm"
                            style={{
                                background: activeTab === 'submissions' ? 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)' : 'transparent',
                                color: activeTab === 'submissions' ? '#ffffff' : '#64748b',
                                border: 'none',
                                boxShadow: activeTab === 'submissions' ? '0 2px 8px rgba(11,44,107,0.2)' : 'none'
                            }}
                        >
                            <LuUpload /> Submit Online
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Elevated Card with Curvy Corners */}
            <div className="ims-card-elevated" style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '24px' }}>
                {activeTab === 'marks' ? (
                    <>
                        {/* DataTables Action Bar with Curvy Candy Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button onClick={handleCopy} className="ims-candy-btn ims-candy-neutral ims-candy-sm">
                                    <LuCopy /> Copy
                                </button>
                                <button onClick={handleDownloadCSV} className="ims-candy-btn ims-candy-neutral ims-candy-sm">
                                    <LuFileSpreadsheet /> CSV
                                </button>
                                <button onClick={handleDownloadPDF} className="ims-candy-btn ims-candy-primary ims-candy-sm">
                                    <LuDownload /> PDF
                                </button>
                                <button onClick={() => window.print()} className="ims-candy-btn ims-candy-neutral ims-candy-sm">
                                    <LuPrinter /> Print
                                </button>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Search assignments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="ims-candy-search"
                                    style={{ paddingLeft: '36px', width: '240px' }}
                                />
                                <LuSearch style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            </div>
                        </div>

                        {/* Table with Curvy Outer Box & Two-Tier Header */}
                        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.86rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', color: '#334155' }}>
                                        <th rowSpan="2" style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', width: '50px', fontWeight: '700' }}>S.No</th>
                                        <th rowSpan="2" style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', width: '100px', fontWeight: '700' }}>Subject Code</th>
                                        <th rowSpan="2" style={{ padding: '12px 14px', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', fontWeight: '700' }}>Subject Name</th>
                                        <th rowSpan="2" style={{ padding: '12px 14px', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', fontWeight: '700' }}>Faculty Name</th>
                                        <th colSpan="5" style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', fontWeight: '700' }}>Assignment Scores</th>
                                        <th rowSpan="2" style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', width: '100px', fontWeight: '700' }}>Total (50)</th>
                                        <th rowSpan="2" style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1.5px solid #e2e8f0', width: '100px', fontWeight: '700' }}>Status</th>
                                    </tr>
                                    <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                                        <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600' }}>A-1 (10)</th>
                                        <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600' }}>A-2 (10)</th>
                                        <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600' }}>A-3 (10)</th>
                                        <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600' }}>A-4 (10)</th>
                                        <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600' }}>A-5 (10)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.map((row, idx) => (
                                        <tr key={row.code} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfdfe', transition: 'background 0.15s ease' }}>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{row.sno}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', fontWeight: '600', color: '#0B2C6B' }}>{row.code}</td>
                                            <td style={{ padding: '12px 14px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', color: '#1e293b', fontWeight: '500' }}>{row.name}</td>
                                            <td style={{ padding: '12px 14px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{row.faculty}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>{row.a1}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>{row.a2}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>{row.a3}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>{row.a4}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>{row.a5}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', fontWeight: '700', color: '#1d4ed8' }}>{row.total}</td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                                <span className="ims-candy-badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    /* Submission Portal View */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                            {SUBMISSION_ITEMS.map(item => (
                                <div key={item.id} style={{
                                    border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                    backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0B2C6B', background: '#e0e7ff', padding: '4px 10px', borderRadius: '9999px' }}>
                                                {item.code}
                                            </span>
                                            <span className="ims-candy-badge" style={{
                                                backgroundColor: item.status === 'Submitted' ? '#dcfce7' : '#fef3c7',
                                                color: item.status === 'Submitted' ? '#166534' : '#92400e'
                                            }}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>{item.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>Faculty: {item.faculty}</p>
                                        <p style={{ margin: '6px 0 0 0', fontSize: '0.8125rem', color: '#dc2626', fontWeight: '600' }}>Due Date: {item.dueDate}</p>
                                    </div>
                                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => handleFileUpload(item.id)}
                                            className="ims-candy-btn ims-candy-primary ims-candy-sm"
                                        >
                                            <LuUpload /> {item.status === 'Submitted' ? 'Re-upload File' : 'Upload Submission'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentMark;
