import React, { useState } from 'react';
import { LuDownload, LuPrinter, LuCopy, LuFileSpreadsheet, LuSearch } from 'react-icons/lu';
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
        doc.text('Student Name: AUSTIN JOSHUA M', 40, 115);
        doc.text('Register No: 2117240020044', 40, 130);
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
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Filter Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px', padding: '16px 20px' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: '500', color: '#333333' }}>
                    Grade Book
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                            Academic Semester <span style={{ color: '#dc3545' }}>*</span> :
                        </label>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            style={{
                                padding: '6px 16px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                minWidth: '180px'
                            }}
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
                        style={{
                            backgroundColor: '#007bff',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '7px 20px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Submit
                    </button>
                </form>
            </div>

            {/* Results Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            onClick={handleDownloadPDF}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#007bff',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 14px',
                                fontSize: '0.8125rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            <LuDownload /> Download Official Grade Sheet
                        </button>
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
                                    width: '180px'
                                }}
                            />
                            <LuSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto', padding: '16px 20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                <th style={{ padding: '10px 8px', textAlign: 'center', width: '50px' }}>S.No</th>
                                <th style={{ padding: '10px 10px', textAlign: 'center', width: '120px' }}>Academic Year</th>
                                <th style={{ padding: '10px 10px', textAlign: 'center', width: '70px' }}>Sem</th>
                                <th style={{ padding: '10px 10px', textAlign: 'center', width: '110px' }}>Subject Code</th>
                                <th style={{ padding: '10px 12px' }}>Subject Title</th>
                                <th style={{ padding: '10px 10px', textAlign: 'center', width: '80px' }}>Credits</th>
                                <th style={{ padding: '10px 10px', textAlign: 'center', width: '80px' }}>Grade</th>
                                <th style={{ padding: '10px 10px', textAlign: 'center', width: '90px' }}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                                        No grade records available for Semester {selectedSemester}.
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((r, idx) => (
                                    <tr key={r.code} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                                        <td style={{ padding: '10px 8px', textAlign: 'center', color: '#6c757d' }}>{r.sno}</td>
                                        <td style={{ padding: '10px 10px', textAlign: 'center', color: '#495057' }}>{r.year}</td>
                                        <td style={{ padding: '10px 10px', textAlign: 'center', color: '#495057' }}>{r.sem}</td>
                                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: '500', color: '#212529' }}>{r.code}</td>
                                        <td style={{ padding: '10px 12px', color: '#212529', fontWeight: '500' }}>{r.title}</td>
                                        <td style={{ padding: '10px 10px', textAlign: 'center', color: '#495057' }}>{r.credits}</td>
                                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 'bold', color: r.grade === 'O' ? '#28a745' : '#007bff' }}>
                                            {r.grade}
                                        </td>
                                        <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '3px 8px',
                                                borderRadius: '3px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                backgroundColor: r.result === 'PASS' ? '#28a745' : '#dc3545',
                                                color: '#ffffff'
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

                {/* Grade Calculation Summary */}
                {filteredRows.length > 0 && (
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #dee2e6', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                        <span>Total Credits: <strong>{filteredRows.reduce((acc, c) => acc + (c.credits || 0), 0)}</strong></span>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <span>Semester SGPA: <strong style={{ color: '#28a745' }}>8.92</strong></span>
                            <span>Cumulative CGPA: <strong style={{ color: '#007bff' }}>8.76</strong></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Anna University Grade Legends */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', padding: '16px 20px', marginTop: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', fontWeight: '600', color: '#495057', textTransform: 'uppercase' }}>
                    Grading System & Legend
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.8125rem', color: '#6c757d' }}>
                    <div><strong>O</strong> (91-100) : Outstanding (10 Points)</div>
                    <div><strong>A+</strong> (81-90) : Excellent (9 Points)</div>
                    <div><strong>A</strong> (71-80) : Very Good (8 Points)</div>
                    <div><strong>B+</strong> (61-70) : Good (7 Points)</div>
                    <div><strong>B</strong> (50-60) : Average (6 Points)</div>
                    <div><strong>RA</strong> (&lt; 50) : Reappearance Required</div>
                    <div><strong>RA*</strong> : Absent in End Semester</div>
                    <div><strong>W / WD</strong> : Withdrawal from Examination</div>
                    <div><strong>SA</strong> : Shortage of Attendance</div>
                    <div><strong>WH</strong> : Results Withheld</div>
                </div>
            </div>
        </div>
    );
};

export default GradeBook;
