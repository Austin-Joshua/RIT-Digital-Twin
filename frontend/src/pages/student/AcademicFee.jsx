import React, { useState } from 'react';
import { useToast } from '../../hooks/ToastContext';
import { FaCreditCard, FaRegCheckCircle, FaFileInvoiceDollar, FaBuilding } from 'react-icons/fa';

const AcademicFee = () => {
    const { addToast } = useToast();
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success
    const [selectedFee, setSelectedFee] = useState(0);

    const feeDetails = [
        { label: 'Tuition Fee', amount: 85000, required: true },
        { label: 'Hostel Fee', amount: 45000, required: false },
        { label: 'Library & AU Fee', amount: 5000, required: true },
        { label: 'Special Equipment Fee', amount: 3000, required: true },
        { label: 'Late Fine', amount: 0, required: false },
    ];

    const totalRequired = feeDetails.filter(f => f.required).reduce((acc, curr) => acc + curr.amount, 0);

    const handlePayClick = (amount) => {
        setSelectedFee(amount);
        setPaymentStatus('processing');

        // Mock API call to gateway
        setTimeout(() => {
            setPaymentStatus('success');
            addToast(`Successfully paid ₹${amount.toLocaleString('en-IN')}`, 'success');
        }, 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section with Glassmorphism */}
            <div className="relative p-8 rounded-3xl overflow-hidden shadow-2xl border border-white/20" 
                 style={{ background: 'linear-gradient(135deg, rgba(11, 44, 107, 0.95) 0%, rgba(30, 58, 138, 0.9) 100%)', backdropFilter: 'blur(10px)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-white tracking-tight">
                            <FaFileInvoiceDollar className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" /> 
                            Academic Fee Portal
                        </h1>
                        <p className="mt-2 text-blue-100/80 font-medium max-w-xl text-lg">
                            Manage your educational investments through our secure, next-gen digital twin gateway.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-inner">
                        <span className="text-xs uppercase tracking-widest text-blue-200 font-bold block mb-1">Current Academic Year</span>
                        <span className="text-xl font-black text-white">2024 - 2025</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Payment Gateway Modal / Status Area */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="relative p-8 rounded-[32px] text-white shadow-[0_20px_50px_rgba(11,44,107,0.3)] overflow-hidden transition-transform hover:scale-[1.02] duration-500" 
                         style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        
                        {/* Decorative elements */}
                        <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-amber-500/20 rounded-full blur-[60px]"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-blue-500/20 rounded-full blur-[40px]"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="font-bold opacity-70 text-xs uppercase tracking-widest mb-1">Payable Balance</h3>
                                    <div className="text-5xl font-black tracking-tighter drop-shadow-lg">
                                        ₹{totalRequired.toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div className="bg-amber-400/20 p-3 rounded-2xl">
                                    <FaCreditCard className="text-2xl text-amber-400" />
                                </div>
                            </div>

                            {paymentStatus === 'success' ? (
                                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-6 rounded-2xl flex flex-col items-center gap-4 text-center animate-in zoom-in-95 duration-500">
                                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                        <FaRegCheckCircle className="text-3xl text-white" />
                                    </div>
                                    <div>
                                        <div className="font-black text-xl">Payment Verified</div>
                                        <div className="text-sm opacity-80 mt-1">Transaction ID: <span className="font-mono">RIT-TXN-{Math.floor(Math.random() * 900000)}</span></div>
                                    </div>
                                </div>
                            ) : paymentStatus === 'processing' ? (
                                <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-2xl flex flex-col items-center justify-center gap-4 animate-pulse">
                                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="font-bold text-blue-300 tracking-wide">Syncing with Bank...</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => handlePayClick(totalRequired)}
                                        className="group relative w-full font-black py-5 rounded-2xl transition-all shadow-2xl hover:shadow-amber-500/20 flex justify-center items-center gap-3 overflow-hidden"
                                        style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', color: '#0f172a' }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                        <FaCreditCard className="text-xl" /> 
                                        <span className="text-lg">PROCEED TO PAY</span>
                                    </button>
                                    <p className="text-[10px] text-center opacity-40 uppercase font-bold tracking-[2px]">
                                        Secure 256-bit SSL Encryption
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Ownership Card */}
                    <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 group-hover:w-2 transition-all duration-300"></div>
                        <h3 className="font-black text-slate-900 dark:text-white text-lg mb-6 flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <FaBuilding className="text-slate-500" />
                            </div>
                            Student Profile
                        </h3>
                        <div className="space-y-5">
                            {[
                                { label: 'Department', value: 'B.Tech - AI & DS', icon: '💻' },
                                { label: 'Admission Year', value: '2022-2026', icon: '📅' },
                                { label: 'Category', value: 'Merit Scholarship', icon: '⭐' }
                            ].map((info, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors hover:border-amber-200">
                                    <div className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">{info.label}</div>
                                    <div className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>{info.value}</span>
                                        <span className="text-lg opacity-40">{info.icon}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fee Breakdown Table */}
                <div className="lg:col-span-2">
                    <div className="p-1 rounded-[32px] bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-2xl">
                        <div className="bg-white dark:bg-slate-900 rounded-[31px] overflow-hidden p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-2xl">Detailed Breakdown</h3>
                                    <p className="text-sm text-slate-500 font-medium">Itemized list of all tuition and auxiliary charges</p>
                                </div>
                                <button className="px-6 py-2.5 rounded-xl text-xs font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-300 border border-blue-100 dark:border-blue-800/50 uppercase tracking-widest shadow-sm">
                                    Generate Invoice
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[11px] uppercase tracking-[2px] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                            <th className="pb-4 pt-2 font-black pl-4">Service Description</th>
                                            <th className="pb-4 pt-2 font-black">Type</th>
                                            <th className="pb-4 pt-2 font-black text-right pr-4">Total Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {feeDetails.map((fee, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200">
                                                <td className="py-6 pl-4 font-bold text-slate-700 dark:text-slate-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${fee.required ? 'bg-blue-400' : 'bg-slate-300'}`}></div>
                                                        {fee.label}
                                                        {!fee.required && (
                                                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-slate-200/50">
                                                                Optional
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-6 text-slate-500 dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">Institutional</td>
                                                <td className="py-6 pr-4 font-mono text-right text-slate-900 dark:text-white font-black text-lg">
                                                    <span className="text-amber-500 mr-1 text-sm font-sans">₹</span>{fee.amount.toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-900 dark:bg-black transition-colors">
                                            <td colSpan="2" className="py-8 pl-8 font-black uppercase text-xs tracking-[4px] text-blue-200">
                                                Total Due Amount
                                            </td>
                                            <td className="py-8 pr-8 font-black text-right text-3xl text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                                                ₹{totalRequired.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AcademicFee;
