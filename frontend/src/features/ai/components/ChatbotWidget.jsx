import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaBolt, FaChartBar, FaSearch } from 'react-icons/fa';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// Render bot text with newlines so answers are readable and high-contrast
const MessageContent = ({ text }) => {
    const s = (text || '').trim();
    if (!s) return null;
    const parts = s.split(/\n/).filter(Boolean);
    if (parts.length <= 1) return <span>{s}</span>;
    return (
        <span>
            {parts.map((line, i) => (
                <span key={i} style={{ display: 'block', marginTop: i > 0 ? 6 : 0 }}>
                    {line}
                </span>
            ))}
        </span>
    );
};

const ChatbotWidget = ({ studentId }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { text: `Hello ${user?.firstName || 'there'}! I'm your RIT AI Assistant. Ask about attendance, grades, exams, transport, library, or outpass — or use the quick actions below.`, isBot: true }
    ]);
    const [input, setInput] = useState('');

    const getSuggestions = () => {
        const role = user?.role || 'STUDENT';
        if (role === 'FACULTY' || role === 'HOD') {
            const facultySugs = ["Pending grading", "Leave approvals", "Proctor wards", "Department performance"];
            if (role === 'HOD') facultySugs.push("Faculty load allocation");
            return facultySugs;
        }
        if (role === 'PARENT') {
            return ["Ward attendance", "Fee dues", "Schedule meeting", "Academic forecast"];
        }
        if (role === 'ADMIN') {
            return ["Energy audit", "Broadcast alert", "System health", "Campus overview"];
        }
        return ["My attendance", "CGPA / grades", "Exam schedule", "Transport routes", "Library / Outpass"];
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
                        style={{
                            width: '380px',
                            height: '550px',
                            borderRadius: '24px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            marginBottom: '16px',
                            background: '#f8fafc',
                            border: '1px solid #94a3b8'
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

                        {/* Search/Command Bar - same as main input for quick commands */}
                        <div style={{ padding: '8px 16px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaSearch size={12} style={{ color: '#475569' }} />
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Search or ask (e.g. my attendance, exam schedule)..."
                                style={{ background: '#fff', border: '1px solid #94a3b8', borderRadius: 8, outline: 'none', fontSize: 13, flex: 1, color: '#1e293b', padding: '8px 12px' }}
                            />
                        </div>

                        {/* Messages - high contrast: bot = light bg + dark text, user = dark bg + white */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                                    <div
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: msg.isBot ? '2px 16px 16px 16px' : '16px 16px 2px 16px',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            lineHeight: 1.55,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            ...(msg.isBot
                                                ? { background: '#ffffff', color: '#1a1a1a', border: '1px solid #cbd5e1' }
                                                : { background: '#0B2C6B', color: '#ffffff', border: '1px solid #0B2C6B' }
                                            )
                                        }}
                                    >
                                        {msg.isBot ? <MessageContent text={msg.text} /> : msg.text}
                                    </div>
                                    {msg.action && (
                                        <button style={{
                                            marginTop: '8px', width: '100%', padding: '8px', borderRadius: '10px',
                                            background: msg.action.color, color: 'white', border: 'none',
                                            fontWeight: '700', fontSize: '11px', textTransform: 'uppercase',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}>
                                            <FaBolt size={10} /> {msg.action.label}
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', background: '#ffffff', color: '#1a1a1a', padding: '12px 16px', borderRadius: '2px 16px 16px 16px', border: '1px solid #cbd5e1' }}>
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        {[0, 1, 2].map(j => (
                                            <motion.div
                                                key={j}
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: j * 0.1 }}
                                                style={{ width: 6, height: 6, background: '#64748b', borderRadius: '50%' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Action Suggestions - high contrast */}
                        <div style={{ padding: '0 20px 15px', display: 'flex', flexWrap: 'wrap', gap: '8px', background: '#f1f5f9', borderTop: '1px solid #cbd5e1' }}>
                            {getSuggestions().map(sug => (
                                <button
                                    key={sug}
                                    onClick={() => handleSend(sug)}
                                    style={{
                                        padding: '8px 14px', borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600', cursor: 'pointer', transition: '0.2s',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: '#ffffff', color: '#0B2C6B', border: '1px solid #0B2C6B'
                                    }}
                                >
                                    <FaBolt size={10} /> {sug}
                                </button>
                            ))}
                        </div>

                        {/* Footer Input - high contrast */}
                        <div style={{ padding: '16px 20px', background: '#e2e8f0', borderTop: '1px solid #94a3b8', display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask: attendance, grades, exam, transport..."
                                    style={{
                                        width: '100%', borderRadius: 12, padding: '12px 15px', outline: 'none', fontSize: 14, fontWeight: 500,
                                        background: '#ffffff', color: '#1a1a1a', border: '1px solid #64748b'
                                    }}
                                />
                                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                                    <FaChartBar size={14} style={{ color: '#64748b' }} />
                                </div>
                            </div>
                            <button onClick={() => handleSend()} style={{ background: '#0B2C6B', color: '#fff', border: 'none', borderRadius: 12, width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(11,44,107,0.35)' }}>
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
