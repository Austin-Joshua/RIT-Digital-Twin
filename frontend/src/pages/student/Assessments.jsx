import React, { useState } from 'react';
import { LuListChecks, LuDownload, LuCalendar, LuCircleCheck, LuClock } from 'react-icons/lu';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyCollegePageLayout } from '../../utils/collegePdfBranding';

const ASSESSMENTS_TIMETABLE = [
    { sno: 1, code: 'CS23511', name: 'Computer Networks', date: '24-11-2026', session: 'FN (10:00 AM - 01:00 PM)', hall: 'Hall 301' },
    { sno: 2, code: 'CS23512', name: 'Compiler Design', date: '27-11-2026', session: 'FN (10:00 AM - 01:00 PM)', hall: 'Hall 301' },
    { sno: 3, code: 'AD23V14', name: 'Health Care Analytics', date: '01-12-2026', session: 'FN (10:00 AM - 01:00 PM)', hall: 'Hall 301' },
    { sno: 4, code: 'AD23V13', name: 'Data Warehousing and Data Mining', date: '04-12-2026', session: 'FN (10:00 AM - 01:00 PM)', hall: 'Hall 301' },
    { sno: 5, code: 'MX23511', name: 'Disaster Risk Reduction and Management', date: '08-12-2026', session: 'FN (10:00 AM - 01:00 PM)', hall: 'Hall 301' },
    { sno: 6, code: 'AD23531', name: 'Deep Learning Techniques', date: '11-12-2026', session: 'FN (10:00 AM - 01:00 PM)', hall: 'Hall 301' },
    { sno: 7, code: 'AD23532', name: 'Data Exploration and Visualization', date: '15-12-2026', session: 'FN (10:00 AM - 01:00 PM)', hall: 'Hall 301' },
    { sno: 8, code: 'CS23IC3', name: 'AZURE for Data Analytics', date: '18-12-2026', session: 'FN (10:00 AM - 01:00 PM)', hall: 'Lab 2' },
    { sno: 9, code: 'CS23521', name: 'Computer Networks Laboratory', date: '21-12-2026', session: 'FN (09:00 AM - 12:00 PM)', hall: 'Networks Lab' }
];

const Assessments = () => {
    const [viewMode, setViewMode] = useState('portal'); // 'portal' (authentic blank/minimal card) | 'schedule'

    const handleDownloadHallTicket = () => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        
        // PAGE 1: Hall Ticket Candidate & Subject Schedule
        applyCollegePageLayout(doc, {
            title: 'OFFICIAL HALL TICKET - END SEMESTER EXAMINATIONS',
            documentSubtitle: 'Office of the Controller of Examinations | Nov / Dec 2026'
        });

        const startY = 120;
        doc.setDrawColor(200, 205, 215);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(40, startY, 515, 80, 4, 4, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Candidate Name:', 55, startY + 22);
        doc.setFont('helvetica', 'normal');
        doc.text('STUDENT CANDIDATE', 155, startY + 22);

        doc.setFont('helvetica', 'bold');
        doc.text('Register Number:', 55, startY + 42);
        doc.setFont('helvetica', 'normal');
        doc.text('2117240020001', 155, startY + 42);

        doc.setFont('helvetica', 'bold');
        doc.text('Degree & Branch:', 55, startY + 62);
        doc.setFont('helvetica', 'normal');
        doc.text('B.E. Computer Science and Engineering', 155, startY + 62);

        doc.setFont('helvetica', 'bold');
        doc.text('Semester & Section:', 340, startY + 22);
        doc.setFont('helvetica', 'normal');
        doc.text('Semester 5 / A', 450, startY + 22);

        doc.setFont('helvetica', 'bold');
        doc.text('Exam Center:', 340, startY + 42);
        doc.setFont('helvetica', 'normal');
        doc.text('RIT Campus (2117)', 450, startY + 42);

        doc.setFont('helvetica', 'bold');
        doc.text('No Due Clearance:', 340, startY + 62);
        doc.setTextColor(40, 167, 69);
        doc.text('VERIFIED & CLEARED', 450, startY + 62);
        doc.setTextColor(0, 0, 0);

        const examRows = ASSESSMENTS_TIMETABLE.map(t => [
            t.sno,
            t.code,
            t.name,
            t.date,
            t.session,
            ''
        ]);

        doc.autoTable({
            startY: startY + 95,
            head: [['S.No', 'Subject Code', 'Subject Title', 'Date', 'Session / Time', 'Invigilator Sign']],
            body: examRows,
            theme: 'grid',
            headStyles: { fillColor: [44, 50, 59], textColor: [255, 255, 255], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 30 },
                1: { halign: 'center', cellWidth: 65 },
                3: { halign: 'center', cellWidth: 65 },
                4: { halign: 'center', cellWidth: 120 },
                5: { halign: 'center', cellWidth: 80 }
            }
        });

        const signY = doc.lastAutoTable.finalY + 45;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Signature of the Candidate', 70, signY);
        doc.text('Controller of Examinations', 440, signY);

        // PAGE 2: Rules & Regulations
        doc.addPage();
        applyCollegePageLayout(doc, {
            title: 'RULES AND INSTRUCTIONS TO CANDIDATES',
            documentSubtitle: 'Autonomous Examination Regulations & Code of Conduct',
            pageNumber: 2,
            totalPages: 2
        });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('IMPORTANT INSTRUCTIONS (EXTRACT FROM ANNA UNIVERSITY REGULATIONS):', 40, 115);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setLineHeightFactor(1.4);

        const rulesList = [
            '1. Candidates must bring their Hall Ticket and College Identity Card to every examination session.',
            '2. Candidates should occupy their allotted seats at least 15 minutes prior to the commencement of the exam.',
            '3. No candidate will be admitted into the examination hall after 30 minutes from the start of the examination.',
            '4. No candidate shall be permitted to leave the examination hall before the expiry of 45 minutes from commencement.',
            '5. Strict silence must be maintained inside the examination hall at all times.',
            '6. Possession of programmable calculators, mobile phones, smartwatches, or electronic devices is strictly prohibited.',
            '7. Any candidate found in possession of unauthorized materials or resorting to malpractice will be penalized as per norms.',
            '8. Candidates must write their Register Number, Subject Code, and Question Paper Code correctly on the cover sheet.',
            '9. Rough work must be done only on the sheets provided specifically for that purpose.',
            '10. Tearing of any page from the answer booklet will result in disciplinary action.',
            '11. Candidates should verify that the question paper supplied to them corresponds to their enrolled regulation and branch.',
            '12. Candidate signature must be affixed on the attendance sheet before the conclusion of the session.',
            '13. All answer books must be personally handed over to the Room Invigilator before leaving.'
        ];

        let curY = 135;
        rulesList.forEach(rule => {
            const split = doc.splitTextToSize(rule, 515);
            doc.text(split, 40, curY);
            curY += (split.length * 11) + 4;
        });

        doc.save('RIT_Hall_Ticket_Nov_Dec_2026.pdf');
    };

        return (
        <div className="ims-page-container">
            {/* Header Banner following TransportDirectory & Simulator hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuListChecks />
                    </div>
                    <div>
                        <h1 className="ims-header-title">Assessments</h1>
                        <p className="ims-header-subtitle">Continuous Assessment Tests and End-Semester Examination timetable</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setViewMode(viewMode === 'schedule' ? 'portal' : 'schedule')}
                        className="ims-candy-btn ims-candy-primary"
                    >
                        {viewMode === 'schedule' ? 'Default View' : 'End Sem Exam Schedule'}
                    </button>
                    {viewMode === 'schedule' && (
                        <button
                            onClick={handleDownloadHallTicket}
                            className="ims-candy-btn ims-candy-success"
                        >
                            <LuDownload /> Download Hall Ticket
                        </button>
                    )}
                </div>
            </div>

            {/* Elevated Card with Curvy Corners */}
            <div className="ims-card-elevated">
                {viewMode === 'portal' ? (
                    /* Authentic Empty State matching authentic portal screenshot */
                    <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                            No active online assessments scheduled for today.
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                            Click &quot;End Sem Exam Schedule&quot; above to view the autonomous examination timetable.
                        </p>
                    </div>
                ) : (
                    /* Detailed End Sem Schedule View */
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                                    November / December 2026 Autonomous End Semester Examinations
                                </h3>
                                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                                    Candidate: STUDENT CANDIDATE (2117240020001) | Class: B.E. CSE / 5 / A
                                </span>
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.86rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                                        <th style={{ padding: '12px 14px', textAlign: 'center', width: '50px', fontWeight: '700' }}>S.No</th>
                                        <th style={{ padding: '12px 14px', textAlign: 'center', width: '110px', fontWeight: '700' }}>Course Code</th>
                                        <th style={{ padding: '12px 14px', fontWeight: '700' }}>Course Title</th>
                                        <th style={{ padding: '12px 14px', textAlign: 'center', width: '120px', fontWeight: '700' }}>Exam Date</th>
                                        <th style={{ padding: '12px 14px', textAlign: 'center', width: '180px', fontWeight: '700' }}>Session & Time</th>
                                        <th style={{ padding: '12px 14px', textAlign: 'center', width: '110px', fontWeight: '700' }}>Exam Hall</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ASSESSMENTS_TIMETABLE.map((t, idx) => (
                                        <tr key={t.code} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                            <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>{t.sno}</td>
                                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#0B2C6B' }}>{t.code}</td>
                                            <td style={{ padding: '12px 14px', fontWeight: '600', color: '#1e293b' }}>{t.name}</td>
                                            <td style={{ padding: '12px 14px', textAlign: 'center', color: '#334155' }}>{t.date}</td>
                                            <td style={{ padding: '12px 14px', textAlign: 'center', color: '#334155' }}>{t.session}</td>
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                <span className="ims-candy-badge" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                                                    {t.hall}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Assessments;
