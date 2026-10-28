import React, { useState, useMemo } from 'react';
import { LuCopy, LuFileSpreadsheet, LuPrinter, LuDownload, LuSearch, LuUpload, LuCircleCheck } from 'react-icons/lu';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [academicYear, setAcademicYear] = useState('2026-2027');
    const [semester, setSemester] = useState('5');
    const [viewMode, setViewMode] = useState('marks'); // 'marks' | 'upload'

    const filteredRows = useMemo(() => {
        return AUTHENTIC_ASSIGNMENT_MARKS.filter(row => 
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
            documentSubtitle: `Student: AUSTIN JOSHUA M (2117240020044) | Class: B.E. CSE / 5 / A`
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
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '500', color: '#333333' }}>
                            Assignment Mark
                        </h2>
                        <span style={{ backgroundColor: '#007bff', color: '#ffffff', padding: '3px 10px', borderRadius: '3px', fontSize: '0.8125rem', fontWeight: '500' }}>
                            Class : B.E. CSE / 5 / A
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={() => setViewMode(viewMode === 'marks' ? 'upload' : 'marks')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: '1px solid #007bff',
                                backgroundColor: viewMode === 'upload' ? '#007bff' : '#ffffff',
                                color: viewMode === 'upload' ? '#ffffff' : '#007bff',
                                fontSize: '0.8125rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            <LuUpload /> {viewMode === 'upload' ? 'View Mark Ledger' : 'Assignment Portal'}
                        </button>
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            style={{ padding: '6px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '0.875rem' }}
                        >
                            <option value="2026-2027">2026-2027</option>
                            <option value="2025-2026">2025-2026</option>
                        </select>
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            style={{ padding: '6px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '0.875rem' }}
                        >
                            <option value="5">Semester V</option>
                            <option value="4">Semester IV</option>
                            <option value="3">Semester III</option>
                        </select>
                    </div>
                </div>

                {viewMode === 'marks' ? (
                    <>
                        {/* DataTables Action Bar */}
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', backgroundColor: '#fafbfc' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleCopy}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', border: '1px solid #ced4da', borderRadius: '3px', background: '#ffffff', fontSize: '0.8125rem', cursor: 'pointer' }}
                                >
                                    <LuCopy /> Copy
                                </button>
                                <button
                                    onClick={handleDownloadCSV}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', border: '1px solid #ced4da', borderRadius: '3px', background: '#ffffff', fontSize: '0.8125rem', cursor: 'pointer' }}
                                >
                                    <LuFileSpreadsheet /> CSV
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', border: '1px solid #ced4da', borderRadius: '3px', background: '#ffffff', fontSize: '0.8125rem', cursor: 'pointer' }}
                                >
                                    <LuDownload /> PDF
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', border: '1px solid #ced4da', borderRadius: '3px', background: '#ffffff', fontSize: '0.8125rem', cursor: 'pointer' }}
                                >
                                    <LuPrinter /> Print
                                </button>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '6px 12px 6px 30px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        width: '200px'
                                    }}
                                />
                                <LuSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                            </div>
                        </div>

                        {/* Table with Two-Tier Header */}
                        <div style={{ overflowX: 'auto', padding: '16px 20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f1f3f5', borderBottom: '1px solid #dee2e6', color: '#495057' }}>
                                        <th rowSpan="2" style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '50px' }}>S.No</th>
                                        <th rowSpan="2" style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '90px' }}>Subject Code</th>
                                        <th rowSpan="2" style={{ padding: '10px 12px', borderRight: '1px solid #dee2e6' }}>Subject Name</th>
                                        <th rowSpan="2" style={{ padding: '10px 12px', borderRight: '1px solid #dee2e6' }}>Faculty Name</th>
                                        <th colSpan="5" style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #dee2e6', backgroundColor: '#e9ecef' }}>Assignment Marks</th>
                                        <th rowSpan="2" style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '80px' }}>Total (50)</th>
                                        <th rowSpan="2" style={{ padding: '10px 8px', textAlign: 'center', width: '90px' }}>Status</th>
                                    </tr>
                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                        <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem' }}>A-1</th>
                                        <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem' }}>A-2</th>
                                        <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem' }}>A-3</th>
                                        <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem' }}>A-4</th>
                                        <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem' }}>A-5</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.map((row, idx) => (
                                        <tr key={row.code} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                                            <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', color: '#6c757d' }}>{row.sno}</td>
                                            <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontWeight: '500', color: '#212529' }}>{row.code}</td>
                                            <td style={{ padding: '10px 12px', borderRight: '1px solid #dee2e6', color: '#212529', fontWeight: '500' }}>{row.name}</td>
                                            <td style={{ padding: '10px 12px', borderRight: '1px solid #dee2e6', color: '#495057' }}>{row.faculty}</td>
                                            <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{row.a1}</td>
                                            <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{row.a2}</td>
                                            <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{row.a3}</td>
                                            <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{row.a4}</td>
                                            <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{row.a5}</td>
                                            <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontWeight: 'bold', color: '#007bff' }}>{row.total}</td>
                                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '3px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    backgroundColor: '#28a745',
                                                    color: '#ffffff'
                                                }}>
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
                    <div style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#333' }}>
                            Course Assignment Submissions
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                            {filteredRows.filter(r => r.code !== 'CS23IC3').map((row) => (
                                <div key={row.code} style={{ border: '1px solid #dee2e6', borderRadius: '6px', padding: '16px', backgroundColor: '#fafbfc' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#007bff', textTransform: 'uppercase' }}>{row.code}</span>
                                            <h4 style={{ margin: '4px 0', fontSize: '0.95rem', color: '#212529' }}>{row.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6c757d' }}>{row.faculty}</p>
                                        </div>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#d4edda', color: '#155724', padding: '3px 8px', borderRadius: '3px', fontSize: '0.75rem', fontWeight: '600' }}>
                                            <LuCircleCheck /> Completed
                                        </span>
                                    </div>
                                    <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '10px', marginTop: '10px', fontSize: '0.8125rem', color: '#495057' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span>Assignments Evaluated:</span>
                                            <strong>5 / 5</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span>Consolidated Score:</span>
                                            <strong style={{ color: '#007bff' }}>{row.total} / 50 Marks</strong>
                                        </div>
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
