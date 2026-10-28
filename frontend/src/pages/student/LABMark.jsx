import React, { useState, useMemo } from 'react';
import { LuCopy, LuFileSpreadsheet, LuPrinter, LuDownload, LuSearch } from 'react-icons/lu';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyCollegePageLayout } from '../../utils/collegePdfBranding';

const AUTHENTIC_LAB_MARKS = [
    {
        sno: 1,
        code: 'CS23521',
        name: 'Computer Networks Laboratory',
        faculty: 'ARAVINDH S (CS190)',
        cycle1: 81,
        cycle2: 88,
        model: 81,
        total300: 250,
        attendance: '87%',
        status: 'Approved',
        remarks: 'Approved'
    },
    {
        sno: 2,
        code: 'AD23541',
        name: 'Data Exploration and Visualization Laboratory',
        faculty: 'CHARUMATHY M (CS250)',
        cycle1: 85,
        cycle2: 90,
        model: 88,
        total300: 263,
        attendance: '92%',
        status: 'Approved',
        remarks: 'Approved'
    },
    {
        sno: 3,
        code: 'AD23542',
        name: 'Deep Learning Laboratory',
        faculty: 'VINITHA R (CS204)',
        cycle1: 82,
        cycle2: 84,
        model: 86,
        total300: 252,
        attendance: '95%',
        status: 'Approved',
        remarks: 'Approved'
    }
];

const LABMark = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [academicYear, setAcademicYear] = useState('2026-2027');
    const [semester, setSemester] = useState('5');

    const filteredRows = useMemo(() => {
        return AUTHENTIC_LAB_MARKS.filter(row => 
            row.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.faculty.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleCopy = () => {
        const text = filteredRows.map(r => `${r.sno}\t${r.code}\t${r.name}\t${r.cycle1}\t${r.cycle2}\t${r.model}\t${r.total300}\t${r.attendance}\t${r.status}`).join('\n');
        navigator.clipboard.writeText(text);
        alert('Table data copied to clipboard!');
    };

    const handleDownloadCSV = () => {
        const headers = ['S.No', 'Subject Code', 'Subject Name', 'Faculty Name', 'Cycle-1 (100)', 'Cycle-2 (100)', 'Model (100)', 'Total (300)', 'Atten %', 'Status', 'Remarks'];
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...filteredRows.map(r => [r.sno, r.code, `"${r.name}"`, `"${r.faculty}"`, r.cycle1, r.cycle2, r.model, r.total300, r.attendance, r.status, r.remarks].join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `LAB_Marks_Sem_${semester}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        applyCollegePageLayout(doc, {
            title: `LABORATORY (LAB) ASSESSMENT MARKS REPORT - SEMESTER ${semester}`,
            documentSubtitle: `Student: AUSTIN JOSHUA M (2117240020044) | Class: B.E. CSE / 5 / A`
        });

        const tableData = filteredRows.map(r => [
            r.sno,
            r.code,
            r.name,
            r.faculty,
            r.cycle1,
            r.cycle2,
            r.model,
            r.total300,
            r.attendance,
            r.status,
            r.remarks
        ]);

        doc.autoTable({
            startY: 120,
            head: [
                [
                    { content: 'S.No', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'Subject Code', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'Subject Name', rowSpan: 2, styles: { valign: 'middle' } },
                    { content: 'Faculty Name', rowSpan: 2, styles: { valign: 'middle' } },
                    { content: 'Cycle / Review Marks', colSpan: 4, styles: { halign: 'center' } },
                    { content: 'Atten %', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'Status', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'Remarks', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } }
                ],
                ['Cycle-1 (100)', 'Cycle-2 (100)', 'Model-3 (100)', 'Total (300)']
            ],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [44, 50, 59], textColor: [255, 255, 255], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 35 },
                1: { halign: 'center', cellWidth: 65 },
                4: { halign: 'center', cellWidth: 55 },
                5: { halign: 'center', cellWidth: 55 },
                6: { halign: 'center', cellWidth: 55 },
                7: { halign: 'center', cellWidth: 60 },
                8: { halign: 'center', cellWidth: 50 },
                9: { halign: 'center', cellWidth: 55 },
                10: { halign: 'center', cellWidth: 55 }
            }
        });

        doc.save(`LAB_Marks_Sem_${semester}.pdf`);
    };

    return (
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '500', color: '#333333' }}>
                            Laboratory (LAB) Assessment Marks
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
                                <th colSpan="4" style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #dee2e6', backgroundColor: '#e9ecef' }}>Cycle / Review Marks</th>
                                <th rowSpan="2" style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '80px' }}>Atten %</th>
                                <th rowSpan="2" style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '90px' }}>Status</th>
                                <th rowSpan="2" style={{ padding: '10px 8px', textAlign: 'center', width: '90px' }}>Remarks</th>
                            </tr>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem' }}>Cycle-1 (100)</th>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem' }}>Cycle-2 (100)</th>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem' }}>Model (100)</th>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontSize: '0.8125rem', fontWeight: 'bold' }}>Total (300)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((row, idx) => (
                                <tr key={row.code} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', color: '#6c757d' }}>{row.sno}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontWeight: '500', color: '#212529' }}>{row.code}</td>
                                    <td style={{ padding: '10px 12px', borderRight: '1px solid #dee2e6', color: '#212529', fontWeight: '500' }}>{row.name}</td>
                                    <td style={{ padding: '10px 12px', borderRight: '1px solid #dee2e6', color: '#495057' }}>{row.faculty}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{row.cycle1}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{row.cycle2}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{row.model}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontWeight: 'bold' }}>{row.total300}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontWeight: '500' }}>
                                        {row.attendance}
                                    </td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>
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
                                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#28a745', fontWeight: '500' }}>
                                        {row.remarks}
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

export default LABMark;
