import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    FaCreditCard, FaHistory, FaFileInvoice, FaShieldAlt, 
    FaCheckCircle, FaExclamationCircle, FaReceipt 
} from 'react-icons/fa';
import { useToast } from '../../hooks/ToastContext';
import { useAuth } from '../../hooks/AuthContext';
import Card from '../../components/common/Card';

const AcademicFee = () => {
    const { addToast } = useToast();
    const { user } = useAuth();
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success
    const [studentName, setStudentName] = useState('');
    
    const isParent = user?.role === 'PARENT' || user?.role === 'ROLE_PARENT';

    useEffect(() => {
        if (isParent) {
            // In a real app, we'd fetch the linked student's profile
            setStudentName('Ram Kumar'); 
        }
    }, [isParent]);

    const feeDetails = [
        { id: 1, label: 'Tuition Fee', amount: 85000, deadline: '2025-06-30', status: 'UNPAID', type: 'ACADEMIC' },
        { id: 2, label: 'Library & AU Fee', amount: 5000, deadline: '2025-06-30', status: 'UNPAID', type: 'ACADEMIC' },
        { id: 3, label: 'Special Equipment Fee', amount: 3000, deadline: '2025-06-30', status: 'UNPAID', type: 'ACADEMIC' },
        { id: 4, label: 'Hostel Fee (Optional)', amount: 45000, deadline: '2025-07-15', status: 'PENDING', type: 'HOSTELLER' },
    ];

    const paymentHistory = [
        { id: 'TXN001', date: '2024-12-15', amount: 85000, method: 'UPI', status: 'SUCCESS' },
        { id: 'TXN002', date: '2024-08-10', amount: 15000, method: 'Net Banking', status: 'SUCCESS' },
    ];

    const totalDue = feeDetails.filter(f => f.status === 'UNPAID' && f.type === 'ACADEMIC')
                               .reduce((acc, curr) => acc + curr.amount, 0);
    const totalPaid = paymentHistory.reduce((acc, curr) => acc + curr.amount, 0);

    const handlePayment = () => {
        setPaymentStatus('processing');
        setTimeout(() => {
            setPaymentStatus('success');
            addToast(`Payment of ₹${totalDue.toLocaleString('en-IN')} successful!`, 'success');
        }, 2000);
    };

    const kpis = [
        { label: 'Net Payable Balance', value: `₹${totalDue.toLocaleString('en-IN')}`, color: 'red', icon: <FaCreditCard /> },
        { label: 'Total Fees Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: 'green', icon: <FaCheckCircle /> },
        { label: 'Scholarship / Rebate', value: '₹10,500', color: 'teal', icon: <FaFileInvoice /> },
        { label: 'Next Due Date', value: '30 Jun 2025', color: 'yellow', icon: <FaExclamationCircle /> },
    ];

    return (
        <div className="stu-dashboard space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section (Clean UI) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 px-2">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-4 text-[var(--theme-text)] tracking-tight">
                        <FaFileInvoice className="text-[#0B2C6B] dark:text-blue-400" />
                        {isParent ? `Student Fee Portal: ${studentName}` : 'Academic Fee Portal'}
                    </h1>
                    <p className="mt-2 text-[var(--theme-text-muted)] font-medium max-w-xl text-lg">
                        {isParent 
                            ? "Monitor and manage your ward's educational investments securely." 
                            : "Manage your educational investments securely."
                        }
                    </p>
                </div>
                <div className="bg-[var(--theme-bg-muted)] p-4 rounded-xl border border-[var(--theme-border)] text-right">
                    <span className="text-[10px] uppercase tracking-[4px] text-[var(--theme-text-muted)] font-bold block mb-1">Academic Year</span>
                    <span className="text-xl font-black text-[var(--theme-text)]">2024 - 2025</span>
                </div>
            </div>

            {/* KPI Row (Standard Dashboard Pattern) */}
            <div className="stu-kpi-row">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className={`stu-kpi-card ${kpi.color}`}>
                        <div className="kpi-main">
                            <h3 className="kpi-value" style={{ fontSize: '28px' }}>{kpi.value}</h3>
                            <p className="kpi-label">{kpi.label}</p>
                        </div>
                        <div className="kpi-icon">{kpi.icon}</div>
                        <div className="kpi-more">Details <FaReceipt style={{marginLeft: '4px'}} /></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Detailed Breakdown Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="stu-info-card" style={{ borderTopColor: 'var(--color-primary-navy)' }}>
                        <div className="info-header" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="flex items-center gap-3">
                                <FaReceipt className="text-lg text-slate-400" />
                                <span className="font-bold">Detailed Fee Breakdown</span>
                            </div>
                            <button className="table-btn primary" style={{ fontSize: '11px', padding: '6px 12px' }}>Download Invoice</button>
                        </div>
                        <div className="info-body p-0">
                            <div className="overflow-x-auto">
                                <table className="stu-data-table" style={{ width: '100%', border: 'none' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--theme-bg-muted)' }}>
                                            <th style={{ padding: '16px 24px', textAlign: 'left' }}>Fee Description</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'center' }}>Deadline</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Amount</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'center' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--theme-border)]">
                                        {feeDetails.map((fee) => (
                                            <tr key={fee.id} className="hover:bg-[var(--theme-bg-muted)] transition-colors">
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div className="font-bold text-[var(--theme-text)]">{fee.label}</div>
                                                    <div className="text-[10px] text-[var(--theme-text-muted)] uppercase tracking-widest">{fee.type}</div>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px', color: 'var(--theme-text)' }}>{fee.deadline}</td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--theme-text)' }} className="font-bold">₹{fee.amount.toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        fee.status === 'PAID' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                        {fee.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="info-footer p-6 bg-[var(--theme-bg-muted)] rounded-b-3xl border-t border-[var(--theme-border)]">
                            <div className="flex justify-between items-center text-[var(--theme-text)]">
                                <span className="text-[10px] uppercase tracking-[4px] font-black opacity-60">Subtotal Payable</span>
                                <span className="text-2xl font-black text-[#0B2C6B] dark:text-blue-400">₹{totalDue.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Payment & History */}
                <div className="space-y-8">
                    {/* Payment Action Card */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="stu-info-card p-8 flex flex-col items-center"
                    >
                        <div className="z-10 flex flex-col items-center w-full">
                            <div className="text-[10px] uppercase tracking-[6px] text-[var(--theme-text-muted)] font-black mb-2 text-center">Checkout Gateway</div>
                            <h3 className="text-4xl font-black mb-8 tracking-tighter text-[var(--theme-text)]">₹{totalDue.toLocaleString('en-IN')}</h3>
                            
                            {paymentStatus === 'success' ? (
                                <div className="flex flex-col items-center gap-3 py-4 text-emerald-500 animate-in zoom-in-95">
                                    <FaCheckCircle className="text-5xl" />
                                    <span className="font-black uppercase tracking-widest">Payment Verified</span>
                                </div>
                            ) : (
                                <button 
                                    onClick={handlePayment}
                                    disabled={paymentStatus === 'processing'}
                                    className="w-full py-4 rounded-xl bg-[var(--color-primary-navy)] text-white font-extrabold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:grayscale shadow-lg"
                                >
                                    {paymentStatus === 'processing' ? 'Processing...' : 'Complete Payment'}
                                    <FaCreditCard />
                                </button>
                            )}
                            
                            <div className="flex items-center gap-2 mt-8 text-[var(--theme-text-muted)] opacity-80">
                                <FaShieldAlt className="text-xs" />
                                <span className="text-[9px] uppercase tracking-widest font-bold">256-Bit SSL Encrypted Gateway</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick History Card */}
                    <div className="stu-info-card" style={{ borderTop: 'none' }}>
                        <div className="info-header" style={{ padding: '20px', borderBottom: '1px solid var(--theme-border)' }}>
                            <div className="flex items-center gap-2">
                                <FaHistory className="text-sm text-slate-400" />
                                <span className="font-black text-sm uppercase tracking-widest">Payment History</span>
                            </div>
                        </div>
                        <div className="info-body p-4 space-y-4">
                            {paymentHistory.map((txn, i) => (
                                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="font-bold text-sm text-slate-900 dark:text-white">Transaction {txn.id}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{txn.date}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-xs text-emerald-600">₹{txn.amount.toLocaleString('en-IN')}</div>
                                        <div className="text-[9px] text-slate-400 uppercase font-black">{txn.method}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="info-footer p-4 pt-0 text-center">
                            <span className="text-[10px] uppercase font-black text-slate-400 cursor-pointer hover:text-blue-500 transition-colors">View All Statements</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcademicFee;
