import React, { useState, useMemo } from 'react';
import { LuCopy, LuFileSpreadsheet, LuPrinter, LuDownload, LuSearch } from 'react-icons/lu';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyCollegePageLayout } from '../../utils/collegePdfBranding';

const AUTHENTIC_CAT_MARKS = [
    {
        sno: 1,
        code: 'CS23511',
        name: 'Computer Networks',
        faculty: 'ARAVINDH S (CS190)',
        cat1: 35,
        cat2: 23,
        cat3: 33,
        total150: 91,
        weightage20: 12.13,
        status: 'Eligible'
    },
    {
        sno: 2,
        code: 'CS23512',
        name: 'Compiler Design',
        faculty: 'DR. MADHAN V. (CS130)',
        cat1: 46,
        cat2: 22,
        cat3: 42,
        total150: 110,
        weightage20: 14.67,
        status: 'Eligible'
    },
    {
        sno: 3,
        code: 'AD23V14',
        name: 'Health Care Analytics',
        faculty: 'ANJANA DEVI V. (CS82)',
        cat1: 31,
        cat2: 17,
        cat3: 37,
        total150: 85,
        weightage20: 11.33,
        status: 'Eligible'
    },
    {
        sno: 4,
        code: 'AD23V13',
        name: 'Data Warehousing and Data Mining',
        faculty: 'SOWMYA S (CS203)',
        cat1: 30,
        cat2: 14,
        cat3: 33,
        total150: 77,
        weightage20: 10.27,
        status: 'Eligible'
    },
    {
        sno: 5,
        code: 'MX23511',
        name: 'Disaster Risk Reduction and Management',
        faculty: 'DR. S. SURESH (GE01)',
        cat1: 42,
        cat2: 16,
        cat3: 38,
        total150: 96,
        weightage20: 12.80,
        status: 'Eligible'
    },
    {
        sno: 6,
        code: 'AD23531',
        name: 'Deep Learning Techniques',
        faculty: 'VINITHA R (CS204)',
        cat1: 36,
        cat2: 15,
        cat3: 36,
        total150: 87,
        weightage20: 11.60,
        status: 'Eligible'
    },
    {
        sno: 7,
        code: 'AD23532',
        name: 'Data Exploration and Visualization',
        faculty: 'CHARUMATHY M (CS250)',
        cat1: 25,
        cat2: 18,
        cat3: 28,
        total150: 71,
        weightage20: 9.47,
        status: 'Eligible'
    },
    {
        sno: 8,
        code: 'CS23IC3',
        name: 'AZURE for Data Analytics',
        faculty: 'SARAVANAN M. (PH15)',
        cat1: '-',
        cat2: '-',
        cat3: '-',
        total150: '-',
        weightage20: '-',
        status: 'Completed'
    }
];

const CATMark = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [academicYear, setAcademicYear] = useState('2026-2027');
    const [semester, setSemester] = useState('5');

    const filteredRows = useMemo(() => {
        return AUTHENTIC_CAT_MARKS.filter(row => 
            row.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.faculty.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleCopy = () => {
        const text = filteredRows.map(r => `${r.sno}\t${r.code}\t${r.name}\t${r.cat1}\t${r.cat2}\t${r.cat3}\t${r.total150}\t${r.weightage20}`).join('\n');
        navigator.clipboard.writeText(text);
        alert('Table data copied to clipboard!');
    };

    const handleDownloadCSV = () => {
        const headers = ['S.No', 'Subject Code', 'Subject Name', 'Faculty Name', 'CAT-1 (50)', 'CAT-2 (50)', 'CAT-3 (50)', 'Total (150)', 'Internal Weightage (20)', 'Status'];
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...filteredRows.map(r => [r.sno, r.code, `"${r.name}"`, `"${r.faculty}"`, r.cat1, r.cat2, r.cat3, r.total150, r.weightage20, r.status].join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `CAT_Marks_Sem_${semester}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        applyCollegePageLayout(doc, {
            title: `CONTINUOUS ASSESSMENT TEST (CAT) MARKS REPORT - SEMESTER ${semester}`,
            documentSubtitle: `Student: AUSTIN JOSHUA M (2117240020044) | Class: B.E. CSE / 5 / A`
        });

        const tableData = filteredRows.map(r => [
            r.sno,
            r.code,
            r.name,
            r.faculty,
            r.cat1,
            r.cat2,
            r.cat3,
            r.total150,
            r.weightage20,
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
                    { content: 'CAT Marks', colSpan: 4, styles: { halign: 'center' } },
                    { content: 'Internal (20)', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'Status', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } }
                ],
                ['CAT-1 (50)', 'CAT-2 (50)', 'CAT-3 (50)', 'Total (150)']
            ],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [44, 50, 59], textColor: [255, 255, 255], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 35 },
                1: { halign: 'center', cellWidth: 65 },
                4: { halign: 'center', cellWidth: 50 },
                5: { halign: 'center', cellWidth: 50 },
                6: { halign: 'center', cellWidth: 50 },
                7: { halign: 'center', cellWidth: 55 },
                8: { halign: 'center', cellWidth: 60 },
                9: { halign: 'center', cellWidth: 55 }
            }
        });

        doc.save(`CAT_Marks_Sem_${semester}.pdf`);
    };

    return (
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '500', color: '#333333' }}>
                            Continuous Assessment Test (CAT) Marks
                        </h2>
                        <span style={{ backgroundColor: '#007bff', color: '#ffffff', padding: '3px 10px', borderRadius: '3px', fontSize: '0.8125rem', fontWeight: '500' }}>
                            Class : B.E. CSE / 5 / A
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                                <th colSpan="4" style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #dee2e6', backgroundColor: '#e9ecef' }}>CAT Marks</th>
                                <th rowSpan="2" style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '110px' }}>Internal (20)</th>
                                <th rowSpan="2" style={{ padding: '10px 8px', textAlign: 'center', width: '90px' }}>Status</th>
                            </tr>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem' }}>CAT-1 (50)</th>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem' }}>CAT-2 (50)</th>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem' }}>CAT-3 (50)</th>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem', fontWeight: 'bold' }}>Total (150)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((row, idx) => (
                                <tr key={row.code} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', color: '#6c757d' }}>{row.sno}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontWeight: '500', color: '#212529' }}>{row.code}</td>
                                    <td style={{ padding: '10px 12px', borderRight: '1px solid #dee2e6', color: '#212529', fontWeight: '500' }}>{row.name}</td>
                                    <td style={{ padding: '10px 12px', borderRight: '1px solid #dee2e6', color: '#495057' }}>{row.faculty}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{row.cat1}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{row.cat2}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{row.cat3}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontWeight: 'bold' }}>{row.total150}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontWeight: 'bold', color: '#007bff' }}>
                                        {row.weightage20}
                                    </td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '3px 8px',
                                            borderRadius: '3px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: row.status === 'Eligible' || row.status === 'Completed' ? '#d4edda' : '#f8d7da',
                                            color: row.status === 'Eligible' || row.status === 'Completed' ? '#155724' : '#721c24'
                                        }}>
                                            {row.status}
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

export default CATMark;
