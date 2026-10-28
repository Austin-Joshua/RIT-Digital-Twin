import React, { useState } from 'react';
import { LuReceiptText, LuDownload, LuPrinter, LuCircleCheck, LuCreditCard, LuFileText } from 'react-icons/lu';
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
        <div className="ims-page-container">
            {/* Header Banner following TransportDirectory & Simulator hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuReceiptText />
                    </div>
                    <div>
                        <h1 className="ims-header-title">Exam Fee</h1>
                        <p className="ims-header-subtitle">Anna University Autonomous End-Semester & Arrear Examination Fee Ledger</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(11,44,107,0.25)' }}>
                        Register No: 2117240020001
                    </span>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(22,163,74,0.25)' }}>
                        Clearance: Completed
                    </span>
                </div>
            </div>

            {/* Sandbox Notice Banner */}
            <div style={{
                backgroundColor: '#e8f4fd',
                border: '1px solid #b6d4fe',
                borderRadius: '12px',
                padding: '12px 18px',
                fontSize: '0.8125rem',
                color: '#084298',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <span><strong>Demonstration Sandbox:</strong> Examination fee schedule and payment receipts are simulated for institutional twin verification.</span>
                <span className="ims-candy-badge" style={{ fontSize: '0.72rem', background: '#cfe2ff', color: '#084298' }}>Simulation Mode</span>
            </div>

            {/* Session Cards with Elevated Curvy Styling */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {sessions.map((item) => (
                    <div key={item.id} className="ims-card-elevated" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{item.session}</strong>
                                <span className="ims-candy-badge" style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                                    {item.semester}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="ims-candy-badge" style={{
                                    backgroundColor: '#dcfce7',
                                    color: '#166534',
                                    border: '1px solid #bbf7d0'
                                }}>
                                    <LuCircleCheck /> {item.status}
                                </span>
                                <button
                                    onClick={() => handleDownloadReceipt(item)}
                                    className="ims-candy-btn ims-candy-success ims-candy-sm"
                                >
                                    <LuDownload /> Download Receipt
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.875rem' }}>
                                <div>
                                    <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Total Registered Courses:</span>
                                    <strong style={{ color: '#1e293b' }}>{item.totalSubjects} Subjects ({item.theorySubjectsCount} Theory + {item.labSubjectsCount} Practical)</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Receipt Number:</span>
                                    <strong style={{ color: '#0B2C6B' }}>{item.receiptNo}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Date of Payment:</span>
                                    <strong style={{ color: '#1e293b' }}>{item.paymentDate}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Total Amount Paid:</span>
                                    <strong style={{ color: '#16a34a', fontSize: '1.05rem' }}>₹{item.amountPaid.toLocaleString('en-IN')}.00</strong>
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
