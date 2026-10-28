import React, { useState } from 'react';
import { LuGraduationCap, LuDownload, LuPrinter, LuCopy, LuFileSpreadsheet, LuSearch } from 'react-icons/lu';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyCollegePageLayout } from '../../utils/collegePdfBranding';

const SEMESTER_GRADE_DATA = {
    '1': [
        { sno: 1, year: '2024-2025', sem: 'I', code: 'HS21151', title: 'Professional English - I', credits: 3, grade: 'A+', result: 'PASS' },
        { sno: 2, year: '2024-2025', sem: 'I', code: 'MA21151', title: 'Matrices and Calculus', credits: 4, grade: 'O', result: 'PASS' },
        { sno: 3, year: '2024-2025', sem: 'I', code: 'PH21151', title: 'Engineering Physics', credits: 3, grade: 'A+', result: 'PASS' },
        { sno: 4, year: '2024-2025', sem: 'I', code: 'CY21151', title: 'Engineering Chemistry', credits: 3, grade: 'A', result: 'PASS' },
        { sno: 5, year: '2024-2025', sem: 'I', code: 'GE21151', title: 'Problem Solving and Python Programming', credits: 3, grade: 'O', result: 'PASS' },
        { sno: 6, year: '2024-2025', sem: 'I', code: 'GE21161', title: 'Python Programming Laboratory', credits: 2, grade: 'O', result: 'PASS' },
        { sno: 7, year: '2024-2025', sem: 'I', code: 'BS21161', title: 'Physics and Chemistry Laboratory', credits: 2, grade: 'A+', result: 'PASS' },
    ],
    '2': [
        { sno: 1, year: '2024-2025', sem: 'II', code: 'HS21251', title: 'Professional English - II', credits: 2, grade: 'A+', result: 'PASS' },
        { sno: 2, year: '2024-2025', sem: 'II', code: 'MA21251', title: 'Transforms and Partial Differential Equations', credits: 4, grade: 'A+', result: 'PASS' },
        { sno: 3, year: '2024-2025', sem: 'II', code: 'PH21251', title: 'Physics for Information Science', credits: 3, grade: 'A', result: 'PASS' },
        { sno: 4, year: '2024-2025', sem: 'II', code: 'BE21251', title: 'Basic Electrical and Electronics Engineering', credits: 3, grade: 'A', result: 'PASS' },
        { sno: 5, year: '2024-2025', sem: 'II', code: 'GE21251', title: 'Engineering Graphics', credits: 4, grade: 'A+', result: 'PASS' },
        { sno: 6, year: '2024-2025', sem: 'II', code: 'CS21251', title: 'Programming in C', credits: 3, grade: 'O', result: 'PASS' },
        { sno: 7, year: '2024-2025', sem: 'II', code: 'CS21261', title: 'C Programming Laboratory', credits: 2, grade: 'O', result: 'PASS' },
    ],
    '3': [
        { sno: 1, year: '2025-2026', sem: 'III', code: 'MA22351', title: 'Discrete Mathematics', credits: 4, grade: 'A+', result: 'PASS' },
        { sno: 2, year: '2025-2026', sem: 'III', code: 'CS22311', title: 'Digital Principles and Computer Organization', credits: 4, grade: 'A', result: 'PASS' },
        { sno: 3, year: '2025-2026', sem: 'III', code: 'CS22312', title: 'Data Structures', credits: 3, grade: 'O', result: 'PASS' },
        { sno: 4, year: '2025-2026', sem: 'III', code: 'CS22313', title: 'Object Oriented Programming with Java', credits: 3, grade: 'A+', result: 'PASS' },
        { sno: 5, year: '2025-2026', sem: 'III', code: 'CS22321', title: 'Data Structures Laboratory', credits: 2, grade: 'O', result: 'PASS' },
        { sno: 6, year: '2025-2026', sem: 'III', code: 'CS22322', title: 'Java Programming Laboratory', credits: 2, grade: 'O', result: 'PASS' },
    ],
    '4': [
        { sno: 1, year: '2025-2026', sem: 'IV', code: 'CS22411', title: 'Design and Analysis of Algorithms', credits: 4, grade: 'O', result: 'PASS' },
        { sno: 2, year: '2025-2026', sem: 'IV', code: 'CS22412', title: 'Operating Systems', credits: 3, grade: 'A+', result: 'PASS' },
        { sno: 3, year: '2025-2026', sem: 'IV', code: 'CS22413', title: 'Database Management Systems', credits: 3, grade: 'O', result: 'PASS' },
        { sno: 4, year: '2025-2026', sem: 'IV', code: 'CS22414', title: 'Software Engineering', credits: 3, grade: 'A+', result: 'PASS' },
        { sno: 5, year: '2025-2026', sem: 'IV', code: 'CS22421', title: 'Operating Systems Laboratory', credits: 2, grade: 'O', result: 'PASS' },
        { sno: 6, year: '2025-2026', sem: 'IV', code: 'CS22422', title: 'Database Management Systems Laboratory', credits: 2, grade: 'O', result: 'PASS' },
    ]
};

const GradeBook = () => {
    const [selectedSemester, setSelectedSemester] = useState('4');
    const [activeRecords, setActiveRecords] = useState(SEMESTER_GRADE_DATA['4']);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setActiveRecords(SEMESTER_GRADE_DATA[selectedSemester] || []);
    };

    const filteredRows = activeRecords.filter(r =>
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCopy = () => {
        const text = filteredRows.map(r => `${r.sno}\t${r.year}\t${r.sem}\t${r.code}\t${r.title}\t${r.credits}\t${r.grade}\t${r.result}`).join('\n');
        navigator.clipboard.writeText(text);
        alert('Grade records copied to clipboard!');
    };

    const handleDownloadCSV = () => {
        const headers = ['S.No', 'Academic Year', 'Sem', 'Course Code', 'Course Title', 'Credits', 'Grade', 'Result'];
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...filteredRows.map(r => [r.sno, r.year, r.sem, r.code, `"${r.title}"`, r.credits, r.grade, r.result].join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `GradeBook_Sem_${selectedSemester}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        applyCollegePageLayout(doc, {
            title: `SEMESTER GRADE REPORT - SEMESTER ${selectedSemester}`,
            documentSubtitle: 'Office of the Controller of Examinations'
        });

        // Student details strip
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Student Name: STUDENT CANDIDATE', 40, 115);
        doc.text('Register No: 2117240020001', 40, 130);
        doc.text('Degree & Branch: B.E. Computer Science and Engineering', 320, 115);
        doc.text(`Semester: ${selectedSemester} | Session: ${selectedSemester % 2 === 1 ? 'Nov / Dec' : 'Apr / May'} 2025-2026`, 320, 130);

        const tableData = filteredRows.map(r => [
            r.sno,
            r.year,
            r.sem,
            r.code,
            r.title,
            r.credits,
            r.grade,
            r.result
        ]);

        doc.autoTable({
            startY: 150,
            head: [['S.No', 'Academic Year', 'Sem', 'Course Code', 'Course Title', 'Credits', 'Grade', 'Result']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [44, 50, 59], textColor: [255, 255, 255], fontSize: 9 },
            bodyStyles: { fontSize: 9 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 35 },
                1: { halign: 'center', cellWidth: 80 },
                2: { halign: 'center', cellWidth: 40 },
                3: { halign: 'center', cellWidth: 70 },
                5: { halign: 'center', cellWidth: 50 },
                6: { halign: 'center', cellWidth: 50 },
                7: { halign: 'center', cellWidth: 60 }
            }
        });

        const finalY = doc.lastAutoTable.finalY + 40;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Controller of Examinations', 450, finalY, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Rajalakshmi Institute of Technology', 450, finalY + 14, { align: 'center' });

        doc.save(`RIT_Grade_Report_Sem_${selectedSemester}.pdf`);
    };

        return (
        <div className="ims-page-container">
            {/* Header Banner following TransportDirectory & Simulator hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuGraduationCap />
                    </div>
                    <div>
                        <h1 className="ims-header-title">Grade Book</h1>
                        <p className="ims-header-subtitle">Semester academic transcript, credit achievements, and grade distribution</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(11,44,107,0.25)' }}>
                        Regulation: 2021 Autonomous
                    </span>
                    <button
                        onClick={handleDownloadPDF}
                        className="ims-candy-btn ims-candy-success"
                    >
                        <LuDownload /> Official Grade Sheet
                    </button>
                </div>
            </div>

            {/* Filter Card */}
            <div className="ims-card-elevated" style={{ padding: '20px 24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                            Academic Semester <span style={{ color: '#dc2626' }}>*</span> :
                        </label>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="ims-candy-search"
                            style={{ minWidth: '220px', cursor: 'pointer' }}
                        >
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                            <option value="3">Semester 3</option>
                            <option value="4">Semester 4</option>
                            <option value="5">Semester 5 (Current - In Progress)</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="ims-candy-btn ims-candy-primary"
                    >
                        Submit
                    </button>
                </form>
            </div>

            {/* Results Card with DataTables Action Bar */}
            <div className="ims-card-elevated">
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
                            placeholder="Search course or grade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="ims-candy-search"
                            style={{ paddingLeft: '36px', width: '220px' }}
                        />
                        <LuSearch style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                </div>

                {/* Table with Curvy Outer Box */}
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.86rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '50px', fontWeight: '700' }}>S.No</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '100px', fontWeight: '700' }}>Academic Year</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '60px', fontWeight: '700' }}>Sem</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '110px', fontWeight: '700' }}>Course Code</th>
                                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Course Title</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '80px', fontWeight: '700' }}>Credits</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '80px', fontWeight: '700' }}>Grade</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '90px', fontWeight: '700' }}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                        No course records found for the selected semester.
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((r, idx) => (
                                    <tr key={r.code} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>{r.sno}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>{r.year}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#0B2C6B' }}>{r.sem}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#0B2C6B' }}>{r.code}</td>
                                        <td style={{ padding: '12px 14px', fontWeight: '600', color: '#1e293b' }}>{r.title}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#334155' }}>{r.credits}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <span className="ims-candy-badge" style={{
                                                backgroundColor: r.grade === 'O' ? '#dcfce7' : r.grade.startsWith('A') ? '#e0f2fe' : '#fef3c7',
                                                color: r.grade === 'O' ? '#166534' : r.grade.startsWith('A') ? '#0369a1' : '#92400e',
                                                border: `1px solid ${r.grade === 'O' ? '#bbf7d0' : r.grade.startsWith('A') ? '#bae6fd' : '#fde68a'}`,
                                                minWidth: '36px',
                                                justifyContent: 'center'
                                            }}>
                                                {r.grade}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <span className="ims-candy-badge" style={{
                                                backgroundColor: r.result === 'PASS' ? '#dcfce7' : '#fee2e2',
                                                color: r.result === 'PASS' ? '#166534' : '#991b1b',
                                                border: `1px solid ${r.result === 'PASS' ? '#bbf7d0' : '#fecaca'}`
                                            }}>
                                                {r.result}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GradeBook;
