import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaLightbulb, FaBolt, FaChartBar, FaSearch } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ChatbotWidget = ({ studentId }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { text: `Hello ${user?.firstName || 'there'}! I'm your RIT Global AI Assistant. How can I help you in your ${(user?.role === 'BOSS' ? 'Admin' : user?.role) || 'STUDENT'} role today?`, isBot: true }
    ]);
    const [input, setInput] = useState('');

    const getSuggestions = () => {
        const role = user?.role || 'STUDENT';
        if (role === 'FACULTY' || role === 'HOD') {
            const facultySugs = ["Check Attendance Trends", "Pending Leave OD", "Research Citation Audit"];
            if (role === 'HOD') facultySugs.push("Dept Risk Heatmap");
            return facultySugs;
        }
        if (role === 'PARENT') {
            return ["Academic Forecast", "Fee Dues", "Schedule Meeting", "Attendance Pulse"];
        }
        if (role === 'ADMIN') {
            return ["Energy Audit", "Campus Sentiment", "System Health", "Broadcast Alert"];
        }
        return ["Attendance Report", "CGPA Simulator", "Exam Hall Info", "Digital Outpass"];
    };

    const handleSend = async (queryText = input) => {
        const textToSend = queryText || input;
        if (!textToSend.trim()) return;

        const userMsg = { text: textToSend, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Context-aware AI query
            const res = await api.post(`/ai/chatbot/query?studentId=${studentId || user?.id || 1}&role=${user?.role || 'STUDENT'}`, { query: textToSend });
            const botMsg = { text: res.data.response, isBot: true };

            // Check for potential action triggers (mock logic for demo)
            if (textToSend.toLowerCase().includes('energy') || textToSend.toLowerCase().includes('audit')) {
                botMsg.action = { label: "Run Energy Audit", color: "#f39c12" };
            } else if (textToSend.toLowerCase().includes('forecast') || textToSend.toLowerCase().includes('budget') || textToSend.toLowerCase().includes('growth')) {
                botMsg.action = { label: "Generate Strategic Report", color: "#3c8dbc" };
            } else if (textToSend.toLowerCase().includes('security') || textToSend.toLowerCase().includes('risk')) {
                botMsg.action = { label: "Initiate System Scan", color: "#e74c3c" };
            }

            setTimeout(() => {
                setMessages(prev => [...prev, botMsg]);
                setIsTyping(false);
            }, 600);
        } catch (_err) {
            setIsTyping(false);
            setMessages(prev => [...prev, { text: "I'm optimizing my processing engines. Please try again in a moment.", isBot: true }]);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white/95 dark:bg-navy-800/95 border border-white/20 dark:border-navy-700/50"
                        style={{
                            width: '380px',
                            height: '550px',
                            borderRadius: '24px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            marginBottom: '16px',
                            backdropFilter: 'blur(15px)'
                        }}
                    >
                        {/* Premium Header */}
                        <div style={{ background: 'linear-gradient(135deg, #0B2C6B 0%, #1e3a8a 100%)', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px', borderRadius: '12px' }}>
                                    <FaRobot color="#fbbf24" size={20} />
                                </div>
                                <div>
                                    <span style={{ fontWeight: '800', fontSize: '15px', display: 'block' }}>RIT Command Center</span>
                                    <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: '700', textTransform: 'uppercase', tracking: '1px' }}>AI Neural Network Active</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', cursor: 'pointer', opacity: 0.8 }}>
                                <FaMinus onClick={() => setIsOpen(false)} />
                                <FaTimes onClick={() => setIsOpen(false)} />
                            </div>
                        </div>

                        {/* Search/Command Bar */}
                        <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid var(--theme-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaSearch size={12} color="var(--theme-text-muted)" />
                            <input
                                placeholder="Search commands or ask AI..."
                                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '12px', flex: 1, color: 'var(--theme-text)' }}
                            />
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                                    <div className={msg.isBot ? "bg-gray-100 dark:bg-navy-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-navy-600" : "bg-navy-900 text-white"} style={{
                                        padding: '12px 16px',
                                        borderRadius: msg.isBot ? '2px 16px 16px 16px' : '16px 16px 2px 16px',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                        lineHeight: '1.5'
                                    }}>
                                        {msg.text}
                                    </div>
                                    {msg.action && (
                                        <button style={{
                                            marginTop: '8px', width: '100%', padding: '8px', borderRadius: '10px',
                                            background: msg.action.color, color: 'white', border: 'none',
                                            fontWeight: '800', fontSize: '11px', textTransform: 'uppercase',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}>
                                            <FaBolt size={10} /> {msg.action.label}
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', background: 'var(--theme-bg-muted)', padding: '12px 16px', borderRadius: '2px 16px 16px 16px', border: '1px solid var(--theme-border)' }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {[0, 1, 2].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                                style={{ width: '5px', height: '5px', background: 'var(--theme-text-muted)', borderRadius: '50%' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Action Suggestions */}
                        <div style={{ padding: '0 20px 15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {getSuggestions().map(sug => (
                                <button
                                    key={sug}
                                    onClick={() => handleSend(sug)}
                                    style={{
                                        padding: '6px 14px', borderRadius: '30px',
                                        fontSize: '11px',
                                        fontWeight: '700', cursor: 'pointer', transition: '0.2s',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                    className="bg-gray-100 dark:bg-navy-700 text-gray-800 dark:text-white border border-gray-200 dark:border-navy-600 hover:bg-gold-500 hover:text-navy-900 dark:hover:bg-gold-500 dark:hover:text-navy-900"
                                >
                                    <FaBolt size={10} /> {sug}
                                </button>
                            ))}
                        </div>

                        {/* Footer Input */}
                        <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--theme-border)', display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Execute neural query..."
                                    className="bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-600 text-gray-800 dark:text-white"
                                    style={{ width: '100%', borderRadius: '12px', padding: '12px 15px', outline: 'none', fontSize: '14px', fontWeight: '600' }}
                                />
                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                    <FaChartBar size={14} color="#0B2C6B" opacity={0.3} />
                                </div>
                            </div>
                            <button onClick={() => handleSend()} style={{ background: '#0B2C6B', color: 'white', border: 'none', borderRadius: '12px', width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(11,44,107,0.3)' }}>
                                <FaPaperPlane />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button */}
            <motion.button
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #0B2C6B 0%, #1e3a8a 100%)',
                    color: 'white',
                    border: '2px solid #fbbf24',
                    boxShadow: '0 10px 30px rgba(11, 44, 107, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                }}
            >
                {isOpen ? <FaTimes size={24} /> : (
                    <>
                        <FaRobot size={30} />
                        <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '14px', height: '14px', background: '#22c55e', borderRadius: '50%', border: '2px solid white' }}></div>
                    </>
                )}
            </motion.button>
        </div>
    );
};

export default ChatbotWidget;
