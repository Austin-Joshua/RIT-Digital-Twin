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

    const primary = students[0] || generateMockStudents()[0];

    const kpis = [
        { id: 'cgpa', label: 'Current CGPA', value: primary.currentCgpa.toFixed(2), color: 'green', icon: <FaChartIcon /> },
        { id: 'attendance', label: 'Overall Attendance', value: `${primary.attendance}%`, color: 'teal', icon: <FaCalendarAlt /> },
        { id: 'cat', label: 'CAT Avg (Mock)', value: '45 / 50', color: 'blue', icon: <FaFileAlt /> },
        { id: 'wellbeing', label: 'Wellbeing Index', value: 'High', color: 'purple', icon: <FaChild /> },
    ];

    return (
        <div className="stu-dashboard">
            {selectedDetail && <DetailModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} />}

            {/* Parent header */}
            <div className="stu-welcome" style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Parent Guardian Overview</h2>
                <p style={{ marginTop: 6, color: 'var(--theme-text-muted)' }}>
                    Linked student: <strong>{primary.user.firstName} {primary.user.lastName}</strong> ({primary.studentIdNumber})
                </p>
            </div>

            {/* KPI strip – mirror student mode styling */}
            <div className="stu-kpi-row">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.id}
                        className={`stu-kpi-card ${kpi.color}`}
                        style={{ cursor: 'default' }}
                    >
                        <div className="kpi-main">
                            <h3 className="kpi-value">{kpi.value}</h3>
                            <p className="kpi-label">{kpi.label}</p>
                        </div>
                        <div className="kpi-icon">
                            {kpi.icon}
                        </div>
                        <div className="kpi-more">
                            Snapshot for this semester
                        </div>
                    </div>
                ))}
            </div>

            {/* Academic + AI insights row */}
            <div className="stu-info-row">
                <div className="stu-info-card">
                    <div className="info-header">
                        Academic Snapshot – CAT & Assignments
                    </div>
                    <div className="info-body">
                        <div className="stu-data-table-wrapper">
                            <table className="stu-data-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Component</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {primary.marks.cat.map((m, idx) => (
                                        <tr key={`cat-${idx}`}>
                                            <td>{m.subject}</td>
                                            <td>CAT</td>
                                            <td className="text-right font-bold">{m.score} / {m.max}</td>
                                        </tr>
                                    ))}
                                    {primary.marks.assignments.map((m, idx) => (
                                        <tr key={`assg-${idx}`}>
                                            <td>{m.subject}</td>
                                            <td>Assignments</td>
                                            <td className="text-right font-bold">{m.score} / {m.max}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="stu-info-card">
                    <div className="info-header">
                        RIT AI Wisdom – Parent
                    </div>
                    <div className="info-body">
                        <AIInsightPanel role="PARENT" />
                    </div>
                </div>
            </div>

            {/* Semester highlights reused but slimmer */}
            <div className="stu-info-row">
                <div className="stu-info-card" style={{ borderTopColor: '#0B2C6B' }}>
                    <div className="info-header flex items-center gap-2">
                        <FaStar style={{ color: '#D4AF37' }} /> Semester Highlights
                    </div>
                    <div className="info-body">
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {primary.marks.semester.map((m, idx) => (
                                <li
                                    key={idx}
                                    style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}
                                >
                                    <span>{m.subject}</span>
                                    <span style={{ fontWeight: 800, color: '#0B2C6B' }}>{m.grade}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <ChatbotWidget />
        </div>
    );
};

export default ParentDashboard;
