import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import api from '../services/api';
import { FaChild, FaCalendarAlt, FaExclamationTriangle, FaFileAlt, FaTimes, FaChalkboardTeacher, FaClock, FaRupeeSign, FaFileInvoice, FaShieldAlt } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

// Simple Modal reused for standard details
const DetailModal = ({ detail, onClose }) => {
    if (!detail) return null;
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                    style={{ background: 'var(--theme-card-bg, #fff)', color: 'var(--theme-text, #333)', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }} className="dark:text-white">{detail.title}</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <FaTimes size={20} className="text-gray-400 hover:text-red-500" />
                        </button>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        <p>{detail.content}</p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Scheduler Modal Component
const AppointmentModal = ({ student, onClose }) => {
    const { addToast } = useToast();
    const [faculty, setFaculty] = useState('Dr. Sarah - class advisor');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    if (!student) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        addToast(`Appointment requested with ${faculty} for ${date} at ${time}.`, 'success');
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-navy-800 rounded-2xl w-full max-w-md p-6 shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-navy-700 pb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-navy-900 dark:text-white">
                            <FaChalkboardTeacher className="text-gold-500" /> Faculty Scheduler
                        </h2>
                        <button onClick={onClose}><FaTimes className="text-gray-400 hover:text-red-500" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center"><FaChild className="text-blue-600 dark:text-blue-400" /></div>
                            <div>
                                <div className="font-bold text-navy-900 dark:text-blue-200">Regarding: {student.user.firstName}</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">{student.studentIdNumber}</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Select Faculty/Advisor</label>
                            <select value={faculty} onChange={e => setFaculty(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-lg bg-gray-50 dark:bg-navy-900 text-gray-800 dark:text-white outline-none">
                                <option>Dr. Sarah (Class Advisor)</option>
                                <option>Prof. Ramanathan (HOD - CSE)</option>
                                <option>Dr. Anitha (Maths Faculty)</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Date</label>
                                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-lg bg-gray-50 dark:bg-navy-900 text-gray-800 dark:text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Time Slot</label>
                                <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-lg bg-gray-50 dark:bg-navy-900 text-gray-800 dark:text-white outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Reason for Meet</label>
                            <textarea placeholder="Briefly describe what you'd like to discuss..." required className="w-full p-3 border border-gray-200 dark:border-navy-600 rounded-lg bg-gray-50 dark:bg-navy-900 text-gray-800 dark:text-white outline-none resize-none h-20"></textarea>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-navy-700 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Cancel</button>
                            <button type="submit" className="px-4 py-2 font-bold bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                                <FaClock /> Request Appointment
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Payment Modal Component
const PaymentModal = ({ pendingAmount, onClose, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate Gateway Delay
        setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
        }, 2500);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    className="bg-white dark:bg-navy-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 dark:border-navy-700"
                >
                    {isProcessing ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <h3 className="text-xl font-bold text-navy-900 dark:text-white">Processing Payment</h3>
                            <p className="text-gray-500 mt-2 text-sm">Please do not close this window...</p>
                            <div className="mt-6 flex items-center gap-2 text-green-600 text-xs font-bold">
                                <FaShieldAlt /> 256-bit Secure Gateway
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-navy-900 text-white p-6 text-center relative">
                                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                                    <FaTimes size={18} />
                                </button>
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaRupeeSign className="text-gold-500 text-xl" />
                                </div>
                                <h2 className="text-2xl font-black mb-1">Razorpay Connect</h2>
                                <p className="text-sm opacity-80">RIT Fee Collection Portal</p>
                            </div>

                            <div className="p-6">
                                <div className="bg-gray-50 dark:bg-navy-900 rounded-xl p-4 mb-6 border border-gray-200 dark:border-navy-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600 dark:text-gray-400 text-sm font-bold">Total Payable</span>
                                        <span className="text-xl font-black text-navy-900 dark:text-white">₹{pendingAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1 font-bold">
                                        <FaShieldAlt /> Includes PG Charges
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    Pay ₹{pendingAmount.toLocaleString()} Now
                                </button>

                                <div className="mt-4 flex justify-center items-center gap-3 opacity-50">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="MC" className="h-6" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4" />
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const ParentDashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [schedulingFor, setSchedulingFor] = useState(null);
    const [paymentFor, setPaymentFor] = useState(null);
    const { addToast } = useToast();

    // Mock data for in-depth analytics
    const perfData = [
        { month: 'Aug', marks: 65, avg: 60 },
        { month: 'Sep', marks: 78, avg: 62 },
        { month: 'Oct', marks: 72, avg: 65 },
        { month: 'Nov', marks: 84, avg: 68 },
        { month: 'Dec', marks: 89, avg: 70 },
    ];

    const generateMockStudents = () => {
        return [
            {
                id: 1,
                user: { firstName: 'Ram', lastName: 'Kumar' },
                studentIdNumber: 'RIT2021001',
                currentCgpa: 8.5,
                feeTotal: 150000,
                feePaid: 150000,
                feeDue: 0
            },
            {
                id: 2,
                user: { firstName: 'Sita', lastName: 'Kumar' },
                studentIdNumber: 'RIT2022045',
                currentCgpa: 8.9,
                feeTotal: 120000,
                feePaid: 80000,
                feeDue: 40000
            }
        ];
    };

    useEffect(() => {
        const fetchLinkedStudents = async () => {
            try {
                // Try to fetch, if it fails or returns empty, use mock
                const res = await api.get('/api/parent/students');
                if (res.data && res.data.length > 0) {
                    // Add mock fee data to existing students since backend doesn't have it yet
                    const enriched = res.data.map(s => ({
                        ...s,
                        feeTotal: 120000,
                        feePaid: 80000,
                        feeDue: 40000
                    }));
                    setStudents(enriched);
                } else {
                    setStudents(generateMockStudents());
                }
            } catch (err) {
                console.warn("Failed to fetch parent students, using mocks", err);
                setStudents(generateMockStudents());
            }
            setLoading(false);
        };
        fetchLinkedStudents();
    }, []);

    const handleCardClick = (title, content, data = null) => {
        setSelectedDetail({ title, content, data });
    };

    const handlePaymentSuccess = () => {
        addToast(`Payment of ₹${paymentFor.feeDue.toLocaleString()} was successful! Receipt #TXN${Math.floor(Math.random() * 100000)} generated.`, 'success');

        // Update local state to show paid
        setStudents(prev => prev.map(s => {
            if (s.id === paymentFor.id) {
                return { ...s, feePaid: s.feeTotal, feeDue: 0 };
            }
            return s;
        }));
        setPaymentFor(null);
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {selectedDetail && <DetailModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} />}
            {schedulingFor && <AppointmentModal student={schedulingFor} onClose={() => setSchedulingFor(null)} />}
            {paymentFor && <PaymentModal pendingAmount={paymentFor.feeDue} onClose={() => setPaymentFor(null)} onSuccess={handlePaymentSuccess} />}

            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        Parent & Guardian Portal
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor academic trajectory, behavioral analytics, and campus involvement.</p>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {students.map(student => (
                    <div key={student.id} className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">

                        {/* Student Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-navy-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-navy-900/50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 rounded-full flex items-center justify-center text-xl shadow-inner">
                                    <FaChild />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-navy-900 dark:text-white m-0">{student.user.firstName} {student.user.lastName}</h3>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 m-0">
                                        Roll No: {student.studentIdNumber} • Section: CSE-A • Year 3
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="bg-white dark:bg-navy-900 px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-navy-700 text-center">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current CGPA</div>
                                    <div className="text-lg font-black text-blue-600 dark:text-blue-400">{student.currentCgpa}</div>
                                </div>
                                <button
                                    onClick={() => setSchedulingFor(student)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
                                >
                                    <FaClock /> Schedule Meet
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* KPI Metrics */}
                            <div className="lg:col-span-1 space-y-4">
                                <div
                                    className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 cursor-pointer hover:shadow-md transition-all group"
                                    onClick={() => handleCardClick(`${student.user.firstName}'s Attendance`, `Current attendance is 88%. This student has attended 44 out of 50 classes this semester.`)}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm uppercase flex items-center gap-2"><FaCalendarAlt /> Attendance</h4>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <p className="text-4xl font-black text-emerald-600">88<span className="text-xl">%</span></p>
                                        <span className="text-xs font-bold text-emerald-600/70 mb-1">Excellent</span>
                                    </div>
                                    <div className="w-full bg-emerald-200/50 dark:bg-emerald-900/50 h-2 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-emerald-500 h-full" style={{ width: '88%' }}></div>
                                    </div>
                                </div>

                                <div
                                    className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 cursor-pointer hover:shadow-md transition-all group"
                                    onClick={() => handleCardClick(`Risk Factor: ${student.user.firstName}`, `Student is currently at a LOW risk level. Behavior score is 95/100.`)}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm uppercase flex items-center gap-2"><FaExclamationTriangle /> Overall Risk</h4>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <p className="text-4xl font-black text-amber-600">LOW</p>
                                    </div>
                                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-2 font-medium">Safe academic trajectory detected.</p>
                                </div>
                            </div>

                            {/* In-depth Analytics Chart */}
                            <div className="lg:col-span-2 border border-gray-100 dark:border-navy-700 rounded-xl p-5 bg-white dark:bg-navy-900/20">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-2"><FaFileAlt className="text-blue-500" /> Academic Performance Trend</h4>
                                    <span className="text-xs bg-gray-100 dark:bg-navy-800 px-2 py-1 rounded text-gray-500 dark:text-gray-400 font-bold">Internal Marks</span>
                                </div>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={perfData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="marks" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMarks)" name="Student's Avg" />
                                            <Line type="monotone" dataKey="avg" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" name="Class Avg" dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center justify-center gap-6 mt-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Student Score</span>
                                    <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-dashed border-gray-400"></span> Class Average</span>
                                </div>
                            </div>

                        </div>

                        {/* Financials / Fees Section */}
                        <div className="p-6 border-t border-gray-100 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <div className="md:col-span-2">
                                <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-2 mb-4">
                                    <FaRupeeSign className="text-gold-500" /> Financial Dues & Receipts
                                </h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 font-bold mb-1">Total Fee</p>
                                        <p className="font-black text-navy-900 dark:text-white">₹{student.feeTotal.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 font-bold mb-1">Paid</p>
                                        <p className="font-black text-green-600 dark:text-green-500">₹{student.feePaid.toLocaleString()}</p>
                                    </div>
                                    <div className="lg:col-span-2">
                                        <p className="text-gray-500 dark:text-gray-400 font-bold mb-1">Due Amount</p>
                                        <p className={`font-black ${student.feeDue > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                            ₹{student.feeDue.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-navy-700 h-2 rounded-full mt-4 overflow-hidden">
                                    <div
                                        className="bg-green-500 h-full transition-all duration-1000"
                                        style={{ width: `${(student.feePaid / student.feeTotal) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 justify-center">
                                {student.feeDue > 0 ? (
                                    <button
                                        onClick={() => setPaymentFor(student)}
                                        className="w-full bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-900 dark:hover:bg-gold-400 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        <FaRupeeSign /> Pay ₹{student.feeDue.toLocaleString()}
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-green-200 dark:border-green-800"
                                    >
                                        <FaShieldAlt /> Fully Paid
                                    </button>
                                )}
                                <button className="w-full bg-white dark:bg-navy-800 border-2 border-gray-200 dark:border-navy-600 hover:border-blue-500 dark:hover:border-gold-500 text-navy-900 dark:text-white py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm">
                                    <FaFileInvoice /> Download Statement
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParentDashboard;
