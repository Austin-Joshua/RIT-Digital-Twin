import React, { useState } from 'react';
import { FaFileInvoice, FaReceipt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useToast } from '../../hooks/ToastContext';
import { useAuth } from '../../hooks/AuthContext';
import { academicYearLabel, examFees } from '../../utils/studentFees';

const ExamFee = () => {
    const { addToast } = useToast();
    const { user } = useAuth();
    const [feesList, setFeesList] = useState(examFees);
    const year = academicYearLabel();

    const pendingTotal = feesList
        .filter((fee) => fee.status === 'PENDING')
        .reduce((sum, fee) => sum + (fee.amount - fee.paid), 0);

    const paidTotal = feesList.reduce((sum, fee) => sum + fee.paid, 0);
    const grandTotal = feesList.reduce((sum, fee) => sum + fee.amount, 0);

    const payExamFee = (id) => {
        setFeesList(prev => prev.map(f => f.id === id ? { ...f, status: 'PAID', paid: f.amount } : f));
        const fee = feesList.find(f => f.id === id);
        addToast(`Exam fee payment of ₹${fee?.amount.toLocaleString('en-IN')} successful for ${fee?.semester}!`, 'success');
    };

    return (
        <div className="stu-dashboard space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3 text-[var(--theme-text)]">
                        <FaFileInvoice className="text-[#0B2C6B] dark:text-gold-500" /> Exam Fee Portal
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Anna University End-Semester & Arrear Exam Fee Management for Register No: <strong>{user?.username || '2117240020044'}</strong>
                    </p>
                </div>
                <div className="bg-blue-50 dark:bg-navy-900 px-4 py-2 rounded-xl border border-blue-200 dark:border-navy-700 text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-bold">Academic Session</span>
                    <strong className="text-navy-900 dark:text-gold-500">{year}</strong>
                </div>
            </div>

            {/* Overview KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white dark:bg-navy-800 p-5 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Total Exam Fee</span>
                    <h3 className="text-2xl font-black text-navy-900 dark:text-white">₹{grandTotal.toLocaleString('en-IN')}</h3>
                </div>
                <div className="bg-white dark:bg-navy-800 p-5 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Amount Paid</span>
                    <h3 className="text-2xl font-black text-green-600 dark:text-green-400 flex items-center gap-2">
                        ₹{paidTotal.toLocaleString('en-IN')} <FaCheckCircle className="text-lg" />
                    </h3>
                </div>
                <div className="bg-white dark:bg-navy-800 p-5 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Balance Due</span>
                    <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        ₹{pendingTotal.toLocaleString('en-IN')} {pendingTotal > 0 && <FaExclamationCircle className="text-lg" />}
                    </h3>
                </div>
            </div>

            {/* Exam Fee Table */}
            <div className="stu-info-card" style={{ borderTopColor: '#0b2c6b' }}>
                <div className="info-header" style={{ padding: '16px 20px' }}>
                    <span className="font-bold text-lg">Semester Exam Fee Breakdown</span>
                </div>
                <div className="info-body" style={{ padding: 0 }}>
                    <div className="overflow-x-auto">
                        <table className="stu-data-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Semester</th>
                                    <th>Fee Description</th>
                                    <th>Due Date</th>
                                    <th>Total Amount</th>
                                    <th>Paid Amount</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feesList.map((fee) => {
                                    const isPaid = fee.status === 'PAID';
                                    const balance = fee.amount - fee.paid;
                                    return (
                                        <tr key={fee.id}>
                                            <td><strong>{fee.semester}</strong></td>
                                            <td>{fee.title}</td>
                                            <td>{fee.dueDate}</td>
                                            <td>₹{fee.amount.toLocaleString('en-IN')}</td>
                                            <td className="text-green-600 font-bold">₹{fee.paid.toLocaleString('en-IN')}</td>
                                            <td className={balance > 0 ? 'text-amber-600 font-bold' : 'text-gray-400'}>₹{balance.toLocaleString('en-IN')}</td>
                                            <td>
                                                <span className={`status-badge ${isPaid ? 'approved' : 'pending'}`}>
                                                    {fee.status}
                                                </span>
                                            </td>
                                            <td>
                                                {!isPaid ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => payExamFee(fee.id)}
                                                        className="table-btn primary"
                                                        style={{ padding: '4px 12px', fontSize: '12px' }}
                                                    >
                                                        <FaReceipt /> Pay ₹{balance.toLocaleString('en-IN')}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                                                        <FaCheckCircle /> Paid
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamFee;
