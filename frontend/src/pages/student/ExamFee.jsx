import React, { useState } from 'react';
import { LuDownload, LuPrinter, LuCircleCheck, LuCreditCard, LuFileText } from 'react-icons/lu';
import { useToast } from '../../hooks/ToastContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyCollegePageLayout } from '../../utils/collegePdfBranding';

const EXAM_FEE_SESSIONS = [
    {
        id: 'EXAM-2026-NOV',
        session: 'November / December 2026 Examinations',
        semester: 'Semester V',
        theorySubjectsCount: 8,
        labSubjectsCount: 1,
        totalSubjects: 9,
        theoryFee: 1800,
        labFee: 450,
        markSheetFee: 150,
        totalFee: 2400,
        amountPaid: 2400,
        balance: 0,
        paymentDate: '15-10-2026',
        receiptNo: 'RIT/COE/REC/2026/0541',
        txnId: 'PAY20261015091244',
        status: 'PAID'
    },
    {
        id: 'EXAM-2026-APR',
        session: 'April / May 2026 Examinations',
        semester: 'Semester IV',
        theorySubjectsCount: 4,
        labSubjectsCount: 2,
        totalSubjects: 6,
        theoryFee: 900,
        labFee: 900,
        markSheetFee: 150,
        totalFee: 1950,
        amountPaid: 1950,
        balance: 0,
        paymentDate: '12-04-2026',
        receiptNo: 'RIT/COE/REC/2026/0122',
        txnId: 'PAY20260412081190',
        status: 'PAID'
    }
];

const ExamFee = () => {
    const { addToast } = useToast();
    const [sessions, setSessions] = useState(EXAM_FEE_SESSIONS);

    const handleDownloadReceipt = (item) => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        applyCollegePageLayout(doc, {
            title: 'OFFICIAL EXAMINATION FEE RECEIPT',
            documentSubtitle: 'Office of the Controller of Examinations'
        });

        const startY = 125;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Receipt No: ${item.receiptNo}`, 40, startY);
        doc.text(`Transaction Ref: ${item.txnId}`, 40, startY + 16);
        doc.text(`Payment Date: ${item.paymentDate}`, 380, startY);
        doc.text(`Session: ${item.session}`, 380, startY + 16);

        // Student Box
        doc.setDrawColor(220, 224, 230);
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(40, startY + 30, 515, 60, 4, 4, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.text('Student Name:', 55, startY + 52);
        doc.setFont('helvetica', 'normal');
        doc.text('STUDENT CANDIDATE', 145, startY + 52);

        doc.setFont('helvetica', 'bold');
        doc.text('Register No:', 55, startY + 72);
        doc.setFont('helvetica', 'normal');
        doc.text('2117240020001', 145, startY + 72);

        doc.setFont('helvetica', 'bold');
        doc.text('Degree / Branch:', 320, startY + 52);
        doc.setFont('helvetica', 'normal');
        doc.text('B.E. Computer Science and Engineering', 420, startY + 52);

        doc.setFont('helvetica', 'bold');
        doc.text('Semester:', 320, startY + 72);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.semester} / Section A`, 420, startY + 72);

        doc.autoTable({
            startY: startY + 110,
            head: [['S.No', 'Exam Fee Component', 'Rate (INR)', 'Qty', 'Total Amount (INR)']],
            body: [
                ['1', 'Theory Examination Fee', 'Rs. 225.00', String(item.theorySubjectsCount), `Rs. ${item.theoryFee.toLocaleString('en-IN')}.00`],
                ['2', 'Practical / Laboratory Exam Fee', 'Rs. 450.00', String(item.labSubjectsCount), `Rs. ${item.labFee.toLocaleString('en-IN')}.00`],
                ['3', 'Statement of Marks Fee', 'Rs. 150.00', '1', `Rs. ${item.markSheetFee.toLocaleString('en-IN')}.00`],
                ['', 'Total Examination Fee Paid:', '', '', `Rs. ${item.amountPaid.toLocaleString('en-IN')}.00`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [44, 50, 59], textColor: [255, 255, 255] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 40 },
                2: { halign: 'right', cellWidth: 90 },
                3: { halign: 'center', cellWidth: 50 },
                4: { halign: 'right', cellWidth: 120 }
            }
        });

        const finalY = doc.lastAutoTable.finalY + 50;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Controller of Examinations', 420, finalY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Rajalakshmi Institute of Technology', 420, finalY + 14);

        doc.save(`${item.receiptNo.replace(/\//g, '_')}.pdf`);
    };

    return (
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Header Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '500', color: '#333333' }}>
                            Exam Fee
                        </h2>
                        <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                            Anna University Autonomous End-Semester & Arrear Examination Fee Ledger
                        </span>
                    </div>
                    <span style={{ backgroundColor: '#007bff', color: '#ffffff', padding: '4px 12px', borderRadius: '3px', fontSize: '0.8125rem', fontWeight: '500' }}>
                        Register No: 2117240020001
                    </span>
                </div>
            </div>

            {/* Session Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {sessions.map((item) => (
                    <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <strong style={{ fontSize: '1rem', color: '#212529' }}>{item.session}</strong>
                                <span style={{ backgroundColor: '#e9ecef', color: '#495057', padding: '2px 8px', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    {item.semester}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 10px',
                                    borderRadius: '3px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    backgroundColor: '#28a745',
                                    color: '#ffffff'
                                }}>
                                    <LuCircleCheck /> {item.status}
                                </span>
                                <button
                                    onClick={() => handleDownloadReceipt(item)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        backgroundColor: '#28a745',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '3px',
                                        padding: '5px 12px',
                                        fontSize: '0.8125rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <LuDownload /> Download Receipt
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px', fontSize: '0.875rem' }}>
                                <div>
                                    <span style={{ color: '#6c757d', display: 'block', marginBottom: '2px' }}>Total Registered Courses:</span>
                                    <strong>{item.totalSubjects} Subjects ({item.theorySubjectsCount} Theory + {item.labSubjectsCount} Practical)</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#6c757d', display: 'block', marginBottom: '2px' }}>Receipt Number:</span>
                                    <strong style={{ color: '#007bff' }}>{item.receiptNo}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#6c757d', display: 'block', marginBottom: '2px' }}>Date of Payment:</span>
                                    <strong>{item.paymentDate}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#6c757d', display: 'block', marginBottom: '2px' }}>Total Amount Paid:</span>
                                    <strong style={{ color: '#28a745', fontSize: '1rem' }}>₹{item.amountPaid.toLocaleString('en-IN')}.00</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamFee;
