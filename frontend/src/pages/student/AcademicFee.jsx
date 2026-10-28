import React, { useState } from 'react';
import { LuCreditCard, LuHistory, LuFileText, LuDownload, LuCircleCheck, LuX, LuPrinter, LuSearch } from 'react-icons/lu';
import { useToast } from '../../hooks/ToastContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyCollegePageLayout } from '../../utils/collegePdfBranding';

const FEE_BREAKDOWN = [
    { id: 1, particular: 'Tuition Fee', amount: 85000, paid: 85000, balance: 0 },
    { id: 2, particular: 'Development & Infrastructure Fee', amount: 15000, paid: 15000, balance: 0 },
    { id: 3, particular: 'Library & Laboratory Maintenance Fee', amount: 10000, paid: 10000, balance: 0 },
    { id: 4, particular: 'Placement, Training & Industry Readiness', amount: 15000, paid: 15000, balance: 0 },
    { id: 5, particular: 'Internet & Value Added Course (VAC) Fee', amount: 5000, paid: 5000, balance: 0 }
];

const PAYMENT_HISTORY = [
    { receiptNo: 'RIT/ACAD/2026/0891', txnId: 'TXN892301920', date: '08-07-2026', amount: 85000, mode: 'Online (HDFC NetBanking)', status: 'Success' },
    { receiptNo: 'RIT/ACAD/2026/1420', txnId: 'TXN918237190', date: '14-08-2026', amount: 45000, mode: 'Online (UPI / GooglePay)', status: 'Success' }
];

const AcademicFee = () => {
    const { addToast } = useToast();
    const [viewMode, setViewMode] = useState('ledger'); // 'ledger' | 'history'
    const [showPayModal, setShowPayModal] = useState(false);
    const [payAmount, setPayAmount] = useState('0');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [searchTerm, setSearchTerm] = useState('');

    const totalAmount = FEE_BREAKDOWN.reduce((acc, curr) => acc + curr.amount, 0);
    const totalPaid = FEE_BREAKDOWN.reduce((acc, curr) => acc + curr.paid, 0);
    const totalBalance = totalAmount - totalPaid;

    const handleDownloadReceipt = (receipt) => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        applyCollegePageLayout(doc, {
            title: 'OFFICIAL ACADEMIC FEE RECEIPT',
            documentSubtitle: 'Finance & Accounts Department'
        });

        const startY = 125;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Receipt No: ${receipt.receiptNo}`, 40, startY);
        doc.text(`Transaction Ref: ${receipt.txnId}`, 40, startY + 16);
        doc.text(`Date of Payment: ${receipt.date}`, 380, startY);
        doc.text(`Payment Mode: ${receipt.mode}`, 380, startY + 16);

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
        doc.text('Academic Year:', 320, startY + 72);
        doc.setFont('helvetica', 'normal');
        doc.text('2026-2027 (Semester V)', 420, startY + 72);

        doc.autoTable({
            startY: startY + 110,
            head: [['S.No', 'Particulars / Fee Head', 'Amount Paid (INR)']],
            body: [
                ['1', 'Academic Tuition & Semester Composite Fee', `Rs. ${receipt.amount.toLocaleString('en-IN')}.00`],
                ['', 'Total Amount Received:', `Rs. ${receipt.amount.toLocaleString('en-IN')}.00`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [44, 50, 59], textColor: [255, 255, 255] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 50 },
                2: { halign: 'right', cellWidth: 160 }
            }
        });

        const finalY = doc.lastAutoTable.finalY + 50;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Accounts Officer / Cashier', 420, finalY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Rajalakshmi Institute of Technology', 420, finalY + 14);

        doc.save(`${receipt.receiptNo.replace(/\//g, '_')}.pdf`);
    };

    const handleDownloadConsolidated = () => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        applyCollegePageLayout(doc, {
            title: 'CONSOLIDATED ANNUAL FEE RECEIPT - 2026-2027',
            documentSubtitle: 'Office of the Accounts Directorate'
        });

        const startY = 125;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Student: STUDENT CANDIDATE (Reg No: 2117240020001)`, 40, startY);
        doc.text(`Degree & Branch: B.E. Computer Science and Engineering (V / A)`, 40, startY + 16);
        doc.text(`Academic Session: 2026-2027`, 380, startY);
        doc.text(`Status: FULLY PAID (NO ARREARS)`, 380, startY + 16);

        const tableData = FEE_BREAKDOWN.map(f => [
            f.id,
            f.particular,
            `Rs. ${f.amount.toLocaleString('en-IN')}.00`,
            `Rs. ${f.paid.toLocaleString('en-IN')}.00`,
            `Rs. ${f.balance.toLocaleString('en-IN')}.00`
        ]);

        tableData.push([
            '',
            'Total Consolidated Fee',
            `Rs. ${totalAmount.toLocaleString('en-IN')}.00`,
            `Rs. ${totalPaid.toLocaleString('en-IN')}.00`,
            `Rs. ${totalBalance.toLocaleString('en-IN')}.00`
        ]);

        doc.autoTable({
            startY: startY + 36,
            head: [['S.No', 'Particulars', 'Total Amount', 'Amount Paid', 'Balance']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [44, 50, 59], textColor: [255, 255, 255] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 40 },
                2: { halign: 'right', cellWidth: 100 },
                3: { halign: 'right', cellWidth: 100 },
                4: { halign: 'right', cellWidth: 100 }
            }
        });

        const finalY = doc.lastAutoTable.finalY + 50;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Administrative Officer', 420, finalY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Rajalakshmi Institute of Technology', 420, finalY + 14);

        doc.save(`RIT_Consolidated_Fee_Receipt_2026_2027.pdf`);
    };

    const handlePaySubmit = (e) => {
        e.preventDefault();
        setShowPayModal(false);
        addToast(`Payment of ₹${Number(payAmount).toLocaleString('en-IN')} processed successfully!`, 'success');
    };

    return (
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Top 3 Action Buttons Bar (Authentic RIT IMS) */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => {
                        setPayAmount(totalBalance > 0 ? String(totalBalance) : '10000');
                        setShowPayModal(true);
                    }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#28a745',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '9px 20px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                >
                    <LuCreditCard /> Pay Academic Fee
                </button>
                <button
                    onClick={() => setViewMode(viewMode === 'history' ? 'ledger' : 'history')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#ffc107',
                        color: '#212529',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '9px 20px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                >
                    <LuHistory /> {viewMode === 'history' ? 'View Fee Ledger' : 'Payment History'}
                </button>
                <button
                    onClick={handleDownloadConsolidated}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#dc3545',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '9px 20px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                >
                    <LuFileText /> Consolidated Receipt
                </button>
            </div>

            {/* Main Content Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '500', color: '#333333' }}>
                            {viewMode === 'history' ? 'Payment History' : 'Academic Fee Details'}
                        </h2>
                        <span style={{ backgroundColor: '#007bff', color: '#ffffff', padding: '3px 10px', borderRadius: '3px', fontSize: '0.8125rem', fontWeight: '500' }}>
                            Academic Year : 2026-2027
                        </span>
                    </div>
                    {viewMode === 'ledger' && (
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                Total Paid: <strong style={{ color: '#28a745' }}>₹{totalPaid.toLocaleString('en-IN')}.00</strong>
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                Outstanding: <strong style={{ color: totalBalance === 0 ? '#28a745' : '#dc3545' }}>₹{totalBalance.toLocaleString('en-IN')}.00</strong>
                            </span>
                        </div>
                    )}
                </div>

                {viewMode === 'ledger' ? (
                    /* Fee Ledger Table */
                    <div style={{ overflowX: 'auto', padding: '16px 20px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                    <th style={{ padding: '12px 10px', width: '60px' }}>S.No</th>
                                    <th style={{ padding: '12px 10px' }}>Particulars</th>
                                    <th style={{ padding: '12px 10px', textAlign: 'right', width: '150px' }}>Amount (₹)</th>
                                    <th style={{ padding: '12px 10px', textAlign: 'right', width: '150px' }}>Paid (₹)</th>
                                    <th style={{ padding: '12px 10px', textAlign: 'right', width: '150px' }}>Balance (₹)</th>
                                    <th style={{ padding: '12px 10px', textAlign: 'center', width: '120px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {FEE_BREAKDOWN.map((row, idx) => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                                        <td style={{ padding: '12px 10px', color: '#6c757d' }}>{row.id}</td>
                                        <td style={{ padding: '12px 10px', fontWeight: '500', color: '#212529' }}>{row.particular}</td>
                                        <td style={{ padding: '12px 10px', textAlign: 'right', color: '#495057' }}>₹{row.amount.toLocaleString('en-IN')}.00</td>
                                        <td style={{ padding: '12px 10px', textAlign: 'right', color: '#28a745', fontWeight: '500' }}>₹{row.paid.toLocaleString('en-IN')}.00</td>
                                        <td style={{ padding: '12px 10px', textAlign: 'right', color: row.balance === 0 ? '#6c757d' : '#dc3545', fontWeight: '500' }}>₹{row.balance.toLocaleString('en-IN')}.00</td>
                                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '3px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                backgroundColor: row.balance === 0 ? '#28a745' : '#ffc107',
                                                color: row.balance === 0 ? '#ffffff' : '#212529'
                                            }}>
                                                {row.balance === 0 ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ backgroundColor: '#f1f3f5', fontWeight: 'bold', borderTop: '2px solid #dee2e6' }}>
                                    <td colSpan="2" style={{ padding: '12px 10px', textAlign: 'right' }}>Total Fee :</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>₹{totalAmount.toLocaleString('en-IN')}.00</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'right', color: '#28a745' }}>₹{totalPaid.toLocaleString('en-IN')}.00</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'right', color: totalBalance === 0 ? '#28a745' : '#dc3545' }}>₹{totalBalance.toLocaleString('en-IN')}.00</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                        <span style={{ color: '#28a745' }}>Clear</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    /* Payment History Table */
                    <div style={{ overflowX: 'auto', padding: '16px 20px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                    <th style={{ padding: '12px 10px' }}>Receipt No</th>
                                    <th style={{ padding: '12px 10px' }}>Transaction ID</th>
                                    <th style={{ padding: '12px 10px' }}>Date</th>
                                    <th style={{ padding: '12px 10px', textAlign: 'right' }}>Amount Paid</th>
                                    <th style={{ padding: '12px 10px' }}>Payment Mode</th>
                                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PAYMENT_HISTORY.map((txn, idx) => (
                                    <tr key={txn.receiptNo} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                                        <td style={{ padding: '12px 10px', fontWeight: '500', color: '#007bff' }}>{txn.receiptNo}</td>
                                        <td style={{ padding: '12px 10px', color: '#6c757d' }}>{txn.txnId}</td>
                                        <td style={{ padding: '12px 10px', color: '#333333' }}>{txn.date}</td>
                                        <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>
                                            ₹{txn.amount.toLocaleString('en-IN')}.00
                                        </td>
                                        <td style={{ padding: '12px 10px', color: '#495057' }}>{txn.mode}</td>
                                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: '3px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#28a745', color: '#ffffff' }}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleDownloadReceipt(txn)}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    backgroundColor: '#17a2b8',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '3px',
                                                    padding: '5px 10px',
                                                    fontSize: '0.8125rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <LuDownload /> Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pay Fee Modal */}
            {showPayModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #dee2e6',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '500', color: '#333333' }}>
                                Pay Academic Fee
                            </h3>
                            <button
                                onClick={() => setShowPayModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6c757d' }}
                            >
                                <LuX />
                            </button>
                        </div>
                        <form onSubmit={handlePaySubmit} style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                    Amount to Pay (INR) <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        border: '1px solid #ced4da',
                                        fontSize: '0.875rem'
                                    }}
                                    required
                                    min="1"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                    Payment Mode
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        border: '1px solid #ced4da',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                                    <option value="NetBanking">Net Banking (HDFC, SBI, ICICI, Axis)</option>
                                    <option value="CreditCard">Credit / Debit Card</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #dee2e6', paddingTop: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPayModal(false)}
                                    style={{
                                        backgroundColor: '#6c757d',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 20px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Proceed to Pay ₹{Number(payAmount).toLocaleString('en-IN')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicFee;
