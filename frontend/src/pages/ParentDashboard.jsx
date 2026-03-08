import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import api from '../services/api';
import { FaChild, FaCalendarAlt, FaExclamationTriangle, FaFileAlt, FaTimes, FaChalkboardTeacher, FaClock, FaRupeeSign, FaFileInvoice, FaShieldAlt, FaMagic, FaMedal, FaTrophy, FaStar, FaHandshake, FaChartLine as FaChartIcon } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import AIInsightPanel from '../components/intelligence/AIInsightPanel';
import ChatbotWidget from '../components/intelligence/ChatbotWidget';

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
    const [_loading, setLoading] = useState(true);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const { addToast } = useToast();

    // Mock data for marks - strictly as requested
    const mockMarks = {
        cat: [
            { subject: 'Discrete Mathematics', score: 45, max: 50 },
            { subject: 'Economics', score: 42, max: 50 },
            { subject: 'Object Oriented Programming', score: 48, max: 50 }
        ],
        assignments: [
            { subject: 'Discrete Mathematics', score: 18, max: 20 },
            { subject: 'Business Analytics', score: 19, max: 20 },
            { subject: 'English', score: 20, max: 20 }
        ],
        semester: [
            { subject: 'Matrices and Calculus', grade: 'A+', gpa: 9.5 },
            { subject: 'Engineering Chemistry', grade: 'A', gpa: 9.0 }
        ]
    };

    const generateMockStudents = () => {
        return [
            {
                id: 1,
                user: { firstName: 'Ram', lastName: 'Kumar' },
                studentIdNumber: 'RIT2021001',
                currentCgpa: 8.5,
                attendance: 92,
                marks: mockMarks
            }
        ];
    };

    useEffect(() => {
        const fetchLinkedStudents = async () => {
            try {
                const res = await api.get('/api/parent/students');
                if (res.data && res.data.length > 0) {
                    setStudents(res.data.map(s => ({ ...s, attendance: 88, marks: mockMarks })));
                } else {
                    setStudents(generateMockStudents());
                }
            } catch (err) {
                setStudents(generateMockStudents());
            }
            setLoading(false);
        };
        fetchLinkedStudents();
    }, []);

    const handleCardClick = (title, content) => {
        setSelectedDetail({ title, content });
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
            {selectedDetail && <DetailModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <FaHandshake className="text-blue-600 dark:text-gold-500" /> Parent Portal
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400 mt-1 font-medium">Celebrating and monitoring your child's academic journey at RIT.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 dark:bg-green-900/30 text-emerald-700 dark:text-green-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-green-800 shadow-sm">
                        Institutional Access Verified
                    </div>
                </div>
            </div>

            {students.map(student => (
                <div key={student.id} className="space-y-6">
                    {/* Compact Header */}
                    <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                                <FaChild />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white m-0">{student.user.firstName} {student.user.lastName}</h3>
                                <p className="text-sm font-bold text-slate-500 dark:text-gray-400 m-0 uppercase tracking-widest">{student.studentIdNumber} • CSE-A • Year 3</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:gap-4 w-full md:w-auto">
                            <div className="text-center bg-slate-50 dark:bg-navy-900 px-4 md:px-6 py-3 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-sm">
                                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Current CGPA</div>
                                <div className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400">{student.currentCgpa}</div>
                            </div>
                            <div className="text-center bg-slate-50 dark:bg-navy-900 px-4 md:px-6 py-3 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-sm">
                                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Attendance</div>
                                <div className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">{student.attendance}%</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Marks Summary Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* CAT Marks Card */}
                            <div className="bg-white dark:bg-navy-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-navy-700">
                                <h4 className="text-lg font-black text-navy-900 dark:text-white flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600"><FaFileAlt /></div>
                                    CAT Performance
                                </h4>
                                <div className="space-y-4">
                                    {student.marks.cat.map((m, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-700">
                                            <span className="font-bold text-gray-700 dark:text-blue-200">{m.subject}</span>
                                            <span className="font-black text-navy-900 dark:text-white">{m.score} / {m.max}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Assignment Marks */}
                                <div className="bg-white dark:bg-navy-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-navy-700">
                                    <h4 className="text-base font-black text-navy-900 dark:text-white flex items-center gap-2 mb-4 text-emerald-600">
                                        <FaMedal /> Assignments
                                    </h4>
                                    <div className="space-y-3">
                                        {student.marks.assignments.map((m, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-medium">{m.subject}</span>
                                                <span className="font-bold text-navy-900 dark:text-white">{m.score}/20</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Semester Results */}
                                <div className="bg-navy-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                                        <FaTrophy size={100} />
                                    </div>
                                    <h4 className="text-base font-black flex items-center gap-2 mb-4 text-gold-400">
                                        <FaStar /> Semester Highlights
                                    </h4>
                                    <div className="space-y-3">
                                        {student.marks.semester.map((m, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <span className="opacity-80 font-medium">{m.subject}</span>
                                                <span className="font-black text-gold-400">{m.grade}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Insights & Positive Trajectory Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <AIInsightPanel role="PARENT" />

                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl">
                                <h4 className="font-black flex items-center gap-2 mb-4 text-blue-200 uppercase text-xs tracking-widest">
                                    <FaMagic className="animate-pulse" /> Growth Perspective
                                </h4>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                        <div className="text-xs opacity-70 mb-1">Success Index</div>
                                        <div className="text-2xl font-black">95.4%</div>
                                        <div className="w-full bg-white/20 h-1 rounded-full mt-2">
                                            <div className="bg-gold-400 h-full w-[95%]" />
                                        </div>
                                    </div>
                                    <p className="text-xs leading-relaxed italic opacity-90">
                                        "Excellent consistency in lab performance. Ram's focus on practical application is a key strength this semester."
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleCardClick("Detailed Analytics", "Extended performance tracking and historical trends are currently being aggregated for the mid-term review.")}
                                className="w-full bg-white dark:bg-navy-800 py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-navy-600 text-gray-500 font-bold hover:border-gold-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaChartIcon /> Detailed performance stats
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            <ChatbotWidget />
        </div>
    );
};

export default ParentDashboard;
