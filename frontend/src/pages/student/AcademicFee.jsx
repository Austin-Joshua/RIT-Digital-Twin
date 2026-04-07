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
            {/* Header Section (Unified Premium Style) */}
            <div className="relative p-8 rounded-[40px] overflow-hidden shadow-2xl border border-white/20" 
                 style={{ background: 'linear-gradient(135deg, rgba(11, 44, 107, 0.95) 0%, rgba(30, 58, 138, 0.9) 100%)', backdropFilter: 'blur(10px)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tight">
                            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                                <FaFileInvoice className="text-amber-400" /> 
                            </div>
                            {isParent ? `Student Fee Portal: ${studentName}` : 'Academic Fee Portal'}
                        </h1>
                        <p className="mt-2 text-blue-100/80 font-medium max-w-xl text-lg">
                            {isParent 
                                ? "Monitor and manage your ward's educational investments securely." 
                                : "Manage your educational investments securely. Integrated with our Digital Twin treasury."
                            }
                        </p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[32px] border border-white/10 shadow-inner text-right">
                        <span className="text-[10px] uppercase tracking-[4px] text-blue-200 font-bold block mb-1">Academic Year</span>
                        <span className="text-xl font-black text-white">2024 - 2025</span>
                    </div>
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
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {feeDetails.map((fee) => (
                                            <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div className="font-bold text-slate-700 dark:text-slate-200">{fee.label}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">{fee.type}</div>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px' }}>{fee.deadline}</td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right' }} className="font-bold">₹{fee.amount.toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        fee.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
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
                        <div className="info-footer p-6 bg-slate-900 dark:bg-black rounded-b-3xl">
                            <div className="flex justify-between items-center text-white">
                                <span className="text-[10px] uppercase tracking-[4px] font-black opacity-60">Subtotal Payable</span>
                                <span className="text-2xl font-black text-amber-400">₹{totalDue.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Payment & History */}
                <div className="space-y-8">
                    {/* Payment Action Card */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="p-8 rounded-[32px] overflow-hidden shadow-2xl relative bg-slate-900 border border-slate-800 text-white"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-[40px] -mr-16 -mt-16"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="text-[10px] uppercase tracking-[6px] opacity-60 font-black mb-2 text-center">Checkout Gateway</div>
                            <h3 className="text-4xl font-black mb-8 tracking-tighter">₹{totalDue.toLocaleString('en-IN')}</h3>
                            
                            {paymentStatus === 'success' ? (
                                <div className="flex flex-col items-center gap-3 py-4 text-emerald-400 animate-in zoom-in-95">
                                    <FaCheckCircle className="text-5xl" />
                                    <span className="font-black uppercase tracking-widest">Payment Verified</span>
                                </div>
                            ) : (
                                <button 
                                    onClick={handlePayment}
                                    disabled={paymentStatus === 'processing'}
                                    className="w-full py-5 rounded-[24px] bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-extrabold flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-95 disabled:grayscale"
                                >
                                    {paymentStatus === 'processing' ? 'Processing...' : 'Complete Payment'}
                                    <FaCreditCard />
                                </button>
                            )}
                            
                            <div className="flex items-center gap-2 mt-8 opacity-40">
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
