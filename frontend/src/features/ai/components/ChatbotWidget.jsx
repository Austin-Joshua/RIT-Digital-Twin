import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaBolt, FaChartBar, FaSearch, FaMicrophone } from 'react-icons/fa';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/AuthContext';

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
    const [isListening, setIsListening] = useState(false);

    const toggleVoice = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Voice Recognition.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => {
            console.error("Speech Recognition Error:", e.error);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev ? `${prev} ${transcript}` : transcript);
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (e) {
            console.error(e);
            setIsListening(false);
        }
    };


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
                        initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            width: '420px',
                            height: '650px',
                            borderRadius: '32px',
                            boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            marginBottom: '20px',
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            zIndex: 1001
                        }}
                    >
                        {/* Premium Header */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #0B2C6B 0%, #1e3a8a 100%)', 
                            color: 'white', 
                            padding: '24px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '150px', height: '150px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '50%', blur: '40px' }}></div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
                                <motion.div 
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    style={{ background: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}
                                >
                                    <FaRobot color="#fbbf24" size={24} />
                                </motion.div>
                                <div>
                                    <span style={{ fontWeight: '900', fontSize: '18px', display: 'block', letterSpacing: '-0.5px' }}>RIT Intellect</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
                                        <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Neural Engine Active</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '18px', cursor: 'pointer', opacity: 0.8, position: 'relative', zIndex: 1 }}>
                                <FaMinus onClick={() => setIsOpen(false)} style={{ transition: '0.2s' }} />
                                <FaTimes onClick={() => setIsOpen(false)} style={{ transition: '0.2s' }} />
                            </div>
                        </div>

                        {/* Search Bar Refined */}
                        <div style={{ padding: '12px 24px', background: 'rgba(241, 245, 249, 0.5)', borderBottom: '1px solid rgba(203, 213, 225, 0.5)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FaSearch size={14} style={{ color: '#64748b' }} />
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Command the twin (e.g. attendance, grades)..."
                                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', flex: 1, color: '#1e293b', fontWeight: '500' }}
                            />
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {messages.map((msg, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: '88%' }}
                                >
                                    <div
                                        style={{
                                            padding: '16px 20px',
                                            borderRadius: msg.isBot ? '4px 24px 24px 24px' : '24px 24px 4px 24px',
                                            fontSize: '0.95rem',
                                            fontWeight: '500',
                                            lineHeight: 1.6,
                                            boxShadow: msg.isBot ? '0 4px 15px rgba(0,0,0,0.05)' : '0 10px 25px rgba(11,44,107,0.2)',
                                            ...(msg.isBot
                                                ? { background: '#ffffff', color: '#1a202c', border: '1px solid #e2e8f0' }
                                                : { background: 'linear-gradient(135deg, #0B2C6B 0%, #1e3a8a 100%)', color: '#ffffff' }
                                            )
                                        }}
                                    >
                                        {msg.isBot ? <MessageContent text={msg.text} /> : msg.text}
                                    </div>
                                    {msg.action && (
                                        <motion.button 
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                marginTop: '10px', width: '100%', padding: '12px', borderRadius: '14px',
                                                background: msg.action.color, color: 'white', border: 'none',
                                                fontWeight: '800', fontSize: '12px', textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                                boxShadow: `0 8px 20px ${msg.action.color}44`
                                            }}
                                        >
                                            <FaBolt size={12} /> {msg.action.label}
                                        </motion.button>
                                    )}
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', background: '#ffffff', padding: '16px 20px', borderRadius: '4px 24px 24px 24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {[0, 1, 2].map(j => (
                                            <motion.div
                                                key={j}
                                                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                                                transition={{ repeat: Infinity, duration: 0.8, delay: j * 0.15 }}
                                                style={{ width: 8, height: 8, background: '#94a3b8', borderRadius: '50%' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggestions Layer */}
                        <div style={{ padding: '0 24px 20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {getSuggestions().map(sug => (
                                <motion.button
                                    key={sug}
                                    whileHover={{ scale: 1.05, background: 'rgba(11, 44, 107, 0.08)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSend(sug)}
                                    style={{
                                        padding: '10px 18px', borderRadius: '25px',
                                        fontSize: '13px',
                                        fontWeight: '700', cursor: 'pointer', transition: '0.3s',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        background: 'rgba(255,255,255,0.8)', color: '#0B2C6B', border: '1px solid rgba(11, 44, 107, 0.2)',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                                    }}
                                >
                                    <FaBolt size={10} className="text-amber-500" /> {sug}
                                </motion.button>
                            ))}
                        </div>

                        {/* Footer Controls */}
                        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your query..."
                                    style={{
                                        width: '100%', borderRadius: '18px', padding: '16px 20px', outline: 'none', fontSize: '15px', fontWeight: '600',
                                        background: '#ffffff', color: '#1a202c', border: '2px solid #e2e8f0', transition: 'border-color 0.3s',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                />
                            </div>
                            
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleVoice} 
                                style={{ 
                                    background: isListening ? '#ef4444' : '#f8fafc', 
                                    color: isListening ? '#ffffff' : '#64748b', 
                                    border: '2px solid',
                                    borderColor: isListening ? '#ef4444' : '#e2e8f0', 
                                    borderRadius: '18px', 
                                    width: '56px', height: '56px',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    cursor: 'pointer', 
                                    boxShadow: isListening ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 4px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                {isListening ? (
                                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                                        <FaMicrophone size={20} />
                                    </motion.div>
                                ) : (
                                    <FaMicrophone size={20} />
                                )}
                            </motion.button>

                            <motion.button 
                                whileHover={{ scale: 1.1, backgroundColor: '#1e3a8a' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleSend()} 
                                style={{ 
                                    background: '#0B2C6B', color: '#fff', border: 'none', borderRadius: '18px', 
                                    width: '56px', height: '56px', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                                    boxShadow: '0 8px 20px rgba(11,44,107,0.3)' 
                                }}
                            >
                                <FaPaperPlane size={20} />
                            </motion.button>
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
