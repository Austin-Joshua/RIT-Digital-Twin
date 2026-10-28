import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuCreditCard, LuDownload, LuCircleCheck, LuTriangleAlert, LuFileCheck } from 'react-icons/lu';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyCollegePageLayout } from '../../utils/collegePdfBranding';

const AUTHENTIC_SUBJECTS = [
    {
        sno: 1,
        code: 'CS23511',
        name: 'Computer Networks',
        a1: '10', a2: '10', a3: '8', a4: '9', a5: '9',
        cat1: '35', cat2: '23', cat3: '33', total: '137',
        atten: '82%',
        attenLow: false,
        status: 'Approved',
        remarks: 'Approved'
    },
    {
        sno: 2,
        code: 'CS23512',
        name: 'Compiler Design',
        a1: '10', a2: '9', a3: '8', a4: '10', a5: '10',
        cat1: '46', cat2: '22', cat3: '42', total: '157',
        atten: '71%',
        attenLow: true,
        status: 'Approved',
        remarks: 'Approved'
    },
    {
        sno: 3,
        code: 'AD23V14',
        name: 'Health Care Analytics',
        a1: '10', a2: '10', a3: '10', a4: '10', a5: '10',
        cat1: '31', cat2: '17', cat3: '37', total: '135',
        atten: '76%',
        attenLow: false,
        status: 'Approved',
        remarks: 'Approved'
    },
    {
        sno: 4,
        code: 'AD23V13',
        name: 'Data Warehousing and Data Mining',
        a1: '10', a2: '10', a3: '10', a4: '10', a5: '10',
        cat1: '30', cat2: '14', cat3: '33', total: '127',
        atten: '67%',
        attenLow: true,
        status: 'Approved',
        remarks: 'Approved'
    },
    {
        sno: 5,
        code: 'MX23511',
        name: 'Disaster Risk Reduction and Management',
        a1: '10', a2: '10', a3: '10', a4: '8', a5: '8',
        cat1: '42', cat2: '16', cat3: '38', total: '142',
        atten: '100%',
        attenLow: false,
        status: 'Approved',
        remarks: 'Approved'
    },
    {
        sno: 6,
        code: 'AD23531',
        name: 'Deep Learning Techniques',
        a1: '9', a2: '10', a3: '10', a4: '10', a5: '9',
        cat1: '36', cat2: '15', cat3: '36', total: '135',
        atten: '97%',
        attenLow: false,
        status: 'Approved',
        remarks: 'Approved'
    },
    {
        sno: 7,
        code: 'AD23532',
        name: 'Data Exploration and Visualization',
        a1: '9', a2: '10', a3: '10', a4: '10', a5: '10',
        cat1: '25', cat2: '18', cat3: '28', total: '120',
        atten: '83%',
        attenLow: false,
        status: 'Approved',
        remarks: 'Approved'
    },
    {
        sno: 8,
        code: 'CS23IC3',
        name: 'AZURE for Data Analytics',
        a1: '-', a2: '-', a3: '-', a4: '-', a5: '-',
        cat1: '-', cat2: '-', cat3: '-', total: '-',
        atten: '100%',
        attenLow: false,
        status: 'Approved',
        remarks: 'Approved'
    }
];

const AUTHENTIC_LABS = [
    {
        sno: 1,
        code: 'CS23521',
        name: 'Computer Networks Laboratory',
        cycle1: '81',
        cycle2: '88',
        model: '81',
        total: '250',
        atten: '87%',
        status: 'Approved',
        remarks: 'Approved'
    }
];

const NoDueRequest = () => {
    const navigate = useNavigate();

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

        const examRows = [
            ['1', 'CS23511', 'Computer Networks', '24-11-2026', 'FN (10:00 AM - 01:00 PM)', ''],
            ['2', 'CS23512', 'Compiler Design', '27-11-2026', 'FN (10:00 AM - 01:00 PM)', ''],
            ['3', 'AD23V14', 'Health Care Analytics', '01-12-2026', 'FN (10:00 AM - 01:00 PM)', ''],
            ['4', 'AD23V13', 'Data Warehousing and Data Mining', '04-12-2026', 'FN (10:00 AM - 01:00 PM)', ''],
            ['5', 'MX23511', 'Disaster Risk Reduction and Management', '08-12-2026', 'FN (10:00 AM - 01:00 PM)', ''],
            ['6', 'AD23531', 'Deep Learning Techniques', '11-12-2026', 'FN (10:00 AM - 01:00 PM)', ''],
            ['7', 'AD23532', 'Data Exploration and Visualization', '15-12-2026', 'FN (10:00 AM - 01:00 PM)', ''],
            ['8', 'CS23IC3', 'AZURE for Data Analytics', '18-12-2026', 'FN (10:00 AM - 01:00 PM)', ''],
            ['9', 'CS23521', 'Computer Networks Laboratory', '21-12-2026', 'FN (09:00 AM - 12:00 PM)', '']
        ];

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

        // PAGE 2: 21 Official Instructions to Candidates
        doc.addPage();
        applyCollegePageLayout(doc, {
            title: 'RULES AND INSTRUCTIONS TO CANDIDATES',
            documentSubtitle: 'Autonomous Examination Regulations & Code of Conduct',
            pageNumber: 2,
            totalPages: 2
        });

        const rulesStartY = 115;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('IMPORTANT INSTRUCTIONS (EXTRACT FROM ANNA UNIVERSITY REGULATIONS):', 40, rulesStartY);

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
            '12. Borrowing of writing instruments, mathematical tools, or erasers inside the hall is prohibited.',
            '13. Candidate signature must be affixed on the attendance sheet before the conclusion of the session.',
            '14. All answer books must be personally handed over to the Room Invigilator before leaving.',
            '15. No Due clearance certificate is mandatory for downloading and validating this hall ticket.',
            '16. Standard dress code must be strictly adhered to during all examination sessions.',
            '17. Failure to adhere to these statutory instructions may result in debarment from present and subsequent exams.'
        ];

        let curY = rulesStartY + 18;
        rulesList.forEach(rule => {
            const split = doc.splitTextToSize(rule, 515);
            doc.text(split, 40, curY);
            curY += (split.length * 11) + 4;
        });

        doc.save('RIT_Hall_Ticket_Nov_Dec_2026.pdf');
    };

    return (
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '20px' }}>
                {/* Title & Pay Exam Fee Button (Matches Authentic IMS) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #dee2e6', paddingBottom: '16px' }}>
                    <div style={{ width: '100%', textAlign: 'center', position: 'relative' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '500', color: '#333333' }}>
                            No Due Request
                        </h2>
                        <button
                            onClick={() => navigate('/student/exam-fee')}
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: '#ffc107',
                                color: '#212529',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '8px 18px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                        >
                            Pay Exam Fee
                        </button>
                    </div>
                </div>

                {/* Section 1: Subjects */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '500', color: '#212529', marginBottom: '12px' }}>
                        Subjects
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem', border: '1px solid #dee2e6' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', color: '#495057' }}>
                                    <th rowSpan="2" style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '40px' }}>S.No</th>
                                    <th rowSpan="2" style={{ padding: '8px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '85px' }}>Subject Code</th>
                                    <th rowSpan="2" style={{ padding: '8px 12px', borderRight: '1px solid #dee2e6' }}>Subject Name</th>
                                    <th colSpan="5" style={{ padding: '6px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', backgroundColor: '#f1f3f5' }}>Assignment Marks</th>
                                    <th colSpan="4" style={{ padding: '6px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', backgroundColor: '#f1f3f5' }}>CAT Marks</th>
                                    <th rowSpan="2" style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '65px' }}>Atten %</th>
                                    <th rowSpan="2" style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '80px' }}>Status</th>
                                    <th rowSpan="2" style={{ padding: '8px 8px', textAlign: 'center', width: '80px' }}>Remarks</th>
                                </tr>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>A-1</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>A-2</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>A-3</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>A-4</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>A-5</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>CAT-1</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>CAT-2</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>CAT-3</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {AUTHENTIC_SUBJECTS.map((sub, idx) => (
                                    <tr key={sub.code} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6', color: '#6c757d' }}>{sub.sno}</td>
                                        <td style={{ padding: '8px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', color: '#212529', fontWeight: '500' }}>{sub.code}</td>
                                        <td style={{ padding: '8px 12px', borderRight: '1px solid #dee2e6', color: '#212529' }}>{sub.name}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{sub.a1}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{sub.a2}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{sub.a3}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{sub.a4}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{sub.a5}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{sub.cat1}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{sub.cat2}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{sub.cat3}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontWeight: '500' }}>{sub.total}</td>
                                        {/* Attendance Column with Solid Red Highlight for < 75% (Matches Screenshot!) */}
                                        <td style={{
                                            padding: '8px 6px',
                                            textAlign: 'center',
                                            borderRight: '1px solid #dee2e6',
                                            backgroundColor: sub.attenLow ? '#dc3545' : 'transparent',
                                            color: sub.attenLow ? '#ffffff' : '#212529',
                                            fontWeight: sub.attenLow ? 'bold' : 'normal'
                                        }}>
                                            {sub.atten}
                                        </td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: '3px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                backgroundColor: '#28a745',
                                                color: '#ffffff'
                                            }}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 8px', textAlign: 'center', color: '#28a745', fontWeight: '500' }}>
                                            {sub.remarks}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 2: Labs / Projects */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '500', color: '#212529', marginBottom: '12px' }}>
                        Labs / Projects
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem', border: '1px solid #dee2e6' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', color: '#495057' }}>
                                    <th rowSpan="2" style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '40px' }}>S.No</th>
                                    <th rowSpan="2" style={{ padding: '8px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '85px' }}>Subject Code</th>
                                    <th rowSpan="2" style={{ padding: '8px 12px', borderRight: '1px solid #dee2e6' }}>Subject Name</th>
                                    <th colSpan="4" style={{ padding: '6px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', backgroundColor: '#f1f3f5' }}>Cycle/Review Marks</th>
                                    <th rowSpan="2" style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '65px' }}>Atten %</th>
                                    <th rowSpan="2" style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6', width: '80px' }}>Status</th>
                                    <th rowSpan="2" style={{ padding: '8px 8px', textAlign: 'center', width: '80px' }}>Remarks</th>
                                </tr>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>Cycle/Review-1</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>Cycle/Review-2</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>Model/Review-3</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {AUTHENTIC_LABS.map((lab, idx) => (
                                    <tr key={lab.code} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6', color: '#6c757d' }}>{lab.sno}</td>
                                        <td style={{ padding: '8px 8px', textAlign: 'center', borderRight: '1px solid #dee2e6', color: '#212529', fontWeight: '500' }}>{lab.code}</td>
                                        <td style={{ padding: '8px 12px', borderRight: '1px solid #dee2e6', color: '#212529' }}>{lab.name}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{lab.cycle1}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{lab.cycle2}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{lab.model}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6', fontWeight: '500' }}>{lab.total}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>{lab.atten}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #dee2e6' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: '3px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                backgroundColor: '#28a745',
                                                color: '#ffffff'
                                            }}>
                                                {lab.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 8px', textAlign: 'center', color: '#28a745', fontWeight: '500' }}>
                                            {lab.remarks}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 3: Institutional Clearance Action & Hall Ticket Download */}
                <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#007bff',
                            color: '#ffffff',
                            padding: '6px 14px',
                            borderRadius: '3px',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}>
                            <LuFileCheck /> All Submitted
                        </span>
                        <span style={{ fontSize: '0.875rem', color: '#28a745', fontWeight: '500' }}>
                            ✓ Clearance Approved across all academic departments, laboratories & accounts.
                        </span>
                    </div>

                    <button
                        onClick={handleDownloadHallTicket}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#28a745',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '9px 20px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(40,167,69,0.3)'
                        }}
                    >
                        <LuDownload /> Download Hall Ticket (2-Page PDF)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoDueRequest;
