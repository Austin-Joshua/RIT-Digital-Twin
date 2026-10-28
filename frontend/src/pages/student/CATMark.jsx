import React, { useState, useMemo, useEffect } from 'react';
import api from '../../services/api';
import { LuCopy, LuFileSpreadsheet, LuPrinter, LuDownload, LuSearch, LuAward } from 'react-icons/lu';
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
    const [catRecords, setCatRecords] = useState(AUTHENTIC_CAT_MARKS);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let isMounted = true;
        api.get('/erp/student/internal-marks')
            .then(res => {
                if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
                    const mapped = res.data.map((r, idx) => {
                        const c1 = r.cat1Marks !== null && r.cat1Marks !== undefined ? Number(r.cat1Marks) : null;
                        const c2 = r.cat2Marks !== null && r.cat2Marks !== undefined ? Number(r.cat2Marks) : null;
                        const c3 = r.cat3Marks !== null && r.cat3Marks !== undefined ? Number(r.cat3Marks) : null;
                        const sum = (c1 || 0) + (c2 || 0) + (c3 || 0);
                        return {
                            sno: idx + 1,
                            code: r.subjectCode || '',
                            name: r.subjectName || '',
                            faculty: r.facultyName || 'Course Faculty',
                            cat1: c1 !== null ? c1 : '-',
                            cat2: c2 !== null ? c2 : '-',
                            cat3: c3 !== null ? c3 : '-',
                            total150: (c1 !== null || c2 !== null || c3 !== null) ? sum : '-',
                            weightage20: (c1 !== null || c2 !== null || c3 !== null) ? ((sum / 150) * 20).toFixed(2) : '-',
                            status: 'Eligible'
                        };
                    });
                    setCatRecords(mapped);
                }
            })
            .catch(() => {});
        return () => { isMounted = false; };
    }, []);
    const [academicYear, setAcademicYear] = useState('2026-2027');
    const [semester, setSemester] = useState('5');

    const filteredRows = useMemo(() => {
        return catRecords.filter(row => 
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
            documentSubtitle: `Student: STUDENT CANDIDATE (2117240020001) | Class: B.E. CSE / 5 / A`
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
        <div className="ims-page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Banner - Matches Transport & Simulator Hierarchy */}
            <div className="ims-header-banner" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box" style={{ background: 'linear-gradient(135deg, #0B2C6B 0%, #1d4ed8 100%)', borderRadius: '14px', padding: '12px', color: '#ffffff', fontSize: '22px', display: 'flex', boxShadow: '0 4px 14px rgba(11, 44, 107, 0.25)' }}>
                        <LuAward />
                    </div>
                    <div>
                        <h2 className="ims-header-title" style={{ margin: 0, fontSize: '1.45rem', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Continuous Assessment Test (CAT) Marks
                        </h2>
                        <p className="ims-header-subtitle" style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                            Official semester internal assessment ledger and performance weightages
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(11,44,107,0.25)' }}>
                        Class : B.E. CSE / 5 / A
                    </span>
                    <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="ims-candy-search"
                        style={{ padding: '7px 16px', fontSize: '0.8125rem', fontWeight: '600', cursor: 'pointer' }}
                    >
                        <option value="2026-2027">2026-2027</option>
                        <option value="2025-2026">2025-2026</option>
                    </select>
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="ims-candy-search"
                        style={{ padding: '7px 16px', fontSize: '0.8125rem', fontWeight: '600', cursor: 'pointer' }}
                    >
                        <option value="5">Semester V</option>
                        <option value="4">Semester IV</option>
                        <option value="3">Semester III</option>
                    </select>
                </div>
            </div>

            {/* Main Elevated Card with Curvy Corners */}
            <div className="ims-card-elevated" style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '24px' }}>
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
                            placeholder="Search subjects or faculty..."
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
                                <th colSpan="4" style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', fontWeight: '700' }}>CAT Marks</th>
                                <th rowSpan="2" style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', width: '120px', fontWeight: '700' }}>Internal (20)</th>
                                <th rowSpan="2" style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1.5px solid #e2e8f0', width: '100px', fontWeight: '700' }}>Status</th>
                            </tr>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600' }}>CAT-1 (50)</th>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600' }}>CAT-2 (50)</th>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600' }}>CAT-3 (50)</th>
                                <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '700' }}>Total (150)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((row, idx) => (
                                <tr key={row.code} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfdfe', transition: 'background 0.15s ease' }}>
                                    <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{row.sno}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', fontWeight: '600', color: '#0B2C6B' }}>{row.code}</td>
                                    <td style={{ padding: '12px 14px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', color: '#1e293b', fontWeight: '500' }}>{row.name}</td>
                                    <td style={{ padding: '12px 14px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{row.faculty}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>{row.cat1}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>{row.cat2}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>{row.cat3}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', fontWeight: '700' }}>{row.total150}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', fontWeight: '700', color: '#1d4ed8' }}>
                                        {row.weightage20}
                                    </td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                        <span className="ims-candy-badge" style={{
                                            backgroundColor: row.status === 'Eligible' || row.status === 'Completed' ? '#dcfce7' : '#fee2e2',
                                            color: row.status === 'Eligible' || row.status === 'Completed' ? '#166534' : '#991b1b',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
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
