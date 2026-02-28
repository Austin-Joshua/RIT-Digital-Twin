import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        <FaFileInvoiceDollar className="text-gold-500" /> Academic Fee Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Review dues and make payments securely via internal gateway</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Payment Gateway Modal / Status Area */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card bg-navy-900 text-white shadow-xl relative overflow-hidden">
                        {/* Decorative circle */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>

                        <h3 className="font-bold mb-4 opacity-90 text-sm uppercase tracking-wider">Total Outstanding Due</h3>
                        <div className="text-4xl font-black mb-6">₹{totalRequired.toLocaleString('en-IN')}</div>

                        {paymentStatus === 'success' ? (
                            <div className="bg-green-500 text-white p-4 rounded-xl flex items-center justify-between shadow-inner">
                                <div className="flex items-center gap-3">
                                    <FaRegCheckCircle className="text-2xl" />
                                    <div>
                                        <div className="font-bold">Payment Successful</div>
                                        <div className="text-xs opacity-80">Txn: RIT_{Math.floor(Math.random() * 900000)}</div>
                                    </div>
                                </div>
                            </div>
                        ) : paymentStatus === 'processing' ? (
                            <div className="bg-white/10 p-4 rounded-xl flex items-center justify-center gap-3 animate-pulse">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="font-bold text-sm">Processing with Gateway...</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => handlePayClick(totalRequired)}
                                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-3 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
                            >
                                <FaCreditCard /> Pay Full Amount Now
                            </button>
                        )}
                        <p className="text-[10px] text-center mt-4 opacity-60">Powered by RIT Payment Services Platform</p>
                    </div>

                    {/* Student Info */}
                    <div className="card border border-gray-100 dark:border-navy-700">
                        <h3 className="font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                            <FaBuilding className="text-gray-400" /> Account Owner
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-100 dark:border-navy-800 pb-2">
                                <span className="text-gray-500">Degree</span>
                                <span className="font-bold text-navy-900 dark:text-gray-200">B.Tech IT</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-navy-800 pb-2">
                                <span className="text-gray-500">Admission Yr</span>
                                <span className="font-bold text-navy-900 dark:text-gray-200">2022</span>
                            </div>
                            <div className="flex justify-between pb-2">
                                <span className="text-gray-500">Quota</span>
                                <span className="font-bold text-navy-900 dark:text-gray-200">Management</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fee Breakdown Table */}
                <div className="lg:col-span-2">
                    <div className="card overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-navy-900 dark:text-white text-lg">Fee Breakdown (Current AY)</h3>
                            <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Download Proforma Invoice</button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-navy-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="p-3 font-bold rounded-tl-lg">Description</th>
                                        <th className="p-3 font-bold">Category</th>
                                        <th className="p-3 font-bold text-right rounded-tr-lg">Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {feeDetails.map((fee, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 dark:border-navy-800 hover:bg-gray-50 dark:hover:bg-navy-900/50 transition-colors">
                                            <td className="p-4 font-bold text-navy-900 dark:text-white">
                                                {fee.label}
                                                {!fee.required && <span className="ml-2 text-[10px] bg-gray-100 dark:bg-navy-700 text-gray-500 px-2 py-0.5 rounded-full font-normal">Optional</span>}
                                            </td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400">Recurring</td>
                                            <td className="p-4 font-mono text-right text-gray-800 dark:text-gray-300">
                                                {fee.amount.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-blue-50/50 dark:bg-navy-900/30">
                                        <td colSpan="2" className="p-4 font-black text-navy-900 dark:text-white text-right uppercase text-xs tracking-widest">Total Mandatory Dues</td>
                                        <td className="p-4 font-black text-right text-lg text-navy-900 dark:text-gold-500">
                                            ₹{totalRequired.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {paymentStatus !== 'success' && (
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => handlePayClick(totalRequired)}
                                    className="bg-navy-900 text-white font-bold py-2 px-6 rounded-lg hover:bg-navy-800 transition-colors shadow-sm focus:ring-4 focus:ring-navy-900/30"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AcademicFee;
