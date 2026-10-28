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
        <div className="ims-page-container">
            {/* Header Banner following TransportDirectory & Simulator hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuCreditCard />
                    </div>
                    <div>
                        <h1 className="ims-header-title">Academic Fee</h1>
                        <p className="ims-header-subtitle">Official semester tuition, development, and academic composite fee ledger</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(11,44,107,0.25)' }}>
                        Academic Year : 2026-2027
                    </span>
                    <span className="ims-candy-badge" style={{ background: totalBalance === 0 ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}>
                        {totalBalance === 0 ? 'Fee Status: Cleared' : `Pending: ₹${totalBalance.toLocaleString('en-IN')}`}
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
                <span><strong>Demonstration Sandbox:</strong> Fee ledger records and payment gateway are simulated for prototype verification. No real monetary transactions are processed.</span>
                <span className="ims-candy-badge" style={{ fontSize: '0.72rem', background: '#cfe2ff', color: '#084298' }}>Simulation Mode</span>
            </div>

            {/* Top 3 Action Candy Buttons Bar (Authentic RIT IMS) */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => {
                        setPayAmount(totalBalance > 0 ? String(totalBalance) : '10000');
                        setShowPayModal(true);
                    }}
                    className="ims-candy-btn ims-candy-success"
                >
                    <LuCreditCard /> Pay Academic Fee
                </button>
                <button
                    onClick={() => setViewMode(viewMode === 'history' ? 'ledger' : 'history')}
                    className="ims-candy-btn ims-candy-warning"
                >
                    <LuHistory /> {viewMode === 'history' ? 'View Fee Ledger' : 'Payment History'}
                </button>
                <button
                    onClick={handleDownloadConsolidated}
                    className="ims-candy-btn ims-candy-danger"
                >
                    <LuFileText /> Consolidated Receipt
                </button>
            </div>

            {/* Main Content Card with Elevated Curvy Styling */}
            <div className="ims-card-elevated">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
                            {viewMode === 'history' ? 'Payment History' : 'Academic Fee Details'}
                        </h2>
                    </div>
                    {viewMode === 'ledger' && (
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Total Paid: <strong style={{ color: '#16a34a' }}>₹{totalPaid.toLocaleString('en-IN')}.00</strong>
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Outstanding: <strong style={{ color: totalBalance === 0 ? '#16a34a' : '#dc2626' }}>₹{totalBalance.toLocaleString('en-IN')}.00</strong>
                            </span>
                        </div>
                    )}
                </div>

                {viewMode === 'ledger' ? (
                    /* Fee Ledger Table */
                    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                                    <th style={{ padding: '12px 14px', width: '60px', fontWeight: '700' }}>S.No</th>
                                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Particulars</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'right', width: '150px', fontWeight: '700' }}>Amount (₹)</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'right', width: '150px', fontWeight: '700' }}>Paid (₹)</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'right', width: '150px', fontWeight: '700' }}>Balance (₹)</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'center', width: '120px', fontWeight: '700' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {FEE_BREAKDOWN.map((row, idx) => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{row.id}</td>
                                        <td style={{ padding: '12px 14px', fontWeight: '600', color: '#1e293b' }}>{row.particular}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'right', color: '#334155' }}>₹{row.amount.toLocaleString('en-IN')}.00</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'right', color: '#16a34a', fontWeight: '600' }}>₹{row.paid.toLocaleString('en-IN')}.00</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'right', color: row.balance === 0 ? '#64748b' : '#dc2626', fontWeight: '600' }}>₹{row.balance.toLocaleString('en-IN')}.00</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <span className="ims-candy-badge" style={{
                                                backgroundColor: row.balance === 0 ? '#dcfce7' : '#fef3c7',
                                                color: row.balance === 0 ? '#166534' : '#92400e',
                                                border: `1px solid ${row.balance === 0 ? '#bbf7d0' : '#fde68a'}`
                                            }}>
                                                {row.balance === 0 ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                                    <td colSpan="2" style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>Total Fee :</td>
                                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>₹{totalAmount.toLocaleString('en-IN')}.00</td>
                                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#16a34a' }}>₹{totalPaid.toLocaleString('en-IN')}.00</td>
                                    <td style={{ padding: '12px 14px', textAlign: 'right', color: totalBalance === 0 ? '#16a34a' : '#dc2626' }}>₹{totalBalance.toLocaleString('en-IN')}.00</td>
                                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                        <span className="ims-candy-badge" style={{ background: '#dcfce7', color: '#166534' }}>Clear</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    /* Payment History Table */
                    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Receipt No</th>
                                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Transaction ID</th>
                                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Date</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700' }}>Amount Paid</th>
                                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Payment Mode</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700' }}>Status</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PAYMENT_HISTORY.map((txn, idx) => (
                                    <tr key={txn.receiptNo} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                        <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0B2C6B' }}>{txn.receiptNo}</td>
                                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{txn.txnId}</td>
                                        <td style={{ padding: '12px 14px', color: '#1e293b' }}>{txn.date}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>
                                            ₹{txn.amount.toLocaleString('en-IN')}.00
                                        </td>
                                        <td style={{ padding: '12px 14px', color: '#475569' }}>{txn.mode}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <span className="ims-candy-badge" style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleDownloadReceipt(txn)}
                                                className="ims-candy-btn ims-candy-teal ims-candy-sm"
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

            {/* Pay Fee Modal with Curvy Candy Edges */}
            {showPayModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            padding: '18px 24px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f8fafc'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                                Pay Academic Fee Online
                            </h3>
                            <button
                                onClick={() => setShowPayModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px', display: 'flex' }}
                            >
                                <LuX />
                            </button>
                        </div>

                        <form onSubmit={handlePaySubmit} style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                    Amount to Pay (INR) <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    min="100"
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    className="ims-candy-search"
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                    required
                                />
                                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'block' }}>
                                    Minimum payment: ₹100.00
                                </span>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                    Payment Method <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="ims-candy-search"
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                >
                                    <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                                    <option value="NetBanking">Net Banking (HDFC, SBI, ICICI, Axis)</option>
                                    <option value="CreditCard">Credit / Debit Card</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPayModal(false)}
                                    className="ims-candy-btn ims-candy-neutral"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ims-candy-btn ims-candy-success"
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
