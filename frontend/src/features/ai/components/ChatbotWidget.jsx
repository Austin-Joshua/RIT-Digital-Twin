import React, { useContext, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaMinus, FaBolt, FaMicrophone, FaExpand, FaCompress } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/AuthContext';
import { ThemeContext } from '../../../hooks/ThemeContext';
import { getAcademicStats } from '../../../utils/MockDataGenerator';
import { pendingAcademicFees, pendingExamFees } from '../../../utils/studentFees';

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

function localAnswer(query, role, email) {
    const q = (query || '').toLowerCase();
    const stats = getAcademicStats(email || 'guest@ritchennai.edu.in');
    const fees = pendingAcademicFees();
    const examFees = pendingExamFees();
    if (q.includes('attendance')) {
        return `Attendance on your dashboard ring is ${Math.round(stats.attendance)}%.\n\nOpen Attendance for subject-wise periods. Keep it above 75%.`;
    }
    if (q.includes('cgpa') || q.includes('gpa') || q.includes('grade')) {
        return `CGPA on your dashboard ring is ${stats.cgpa.toFixed(2)} / 10.\n\nOpen Grade Book for semester grades, or CGPA Simulator for a what-if.`;
    }
    if (q.includes('fee') || q.includes('due') || q.includes('pay')) {
        return `Academic fees pending: ₹${fees.toLocaleString('en-IN')}.\nExam fees pending: ₹${examFees.toLocaleString('en-IN')}.\n\nOpen Academic Fee or Exam Fee to review the breakdown.`;
    }
    if (q.includes('exam') || q.includes('timetable') || q.includes('schedule')) {
        return 'Open My Time Table for the weekly grid, or the dashboard calendar and click a weekday for that day’s periods.';
    }
    if (q.includes('bus') || q.includes('transport') || q.includes('route')) {
        return 'Open Transport Directory in the sidebar for route numbers and timings.';
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
        return `Hello. I can answer from your campus data for ${role.toLowerCase()} pages: attendance, CGPA, fees, timetable, and transport.`;
    }
    return 'I can help with attendance, CGPA, fees, timetable, and transport. Try “What is my CGPA?” or use a quick action.';
}

const ChatbotWidget = ({ studentId }) => {
    const { user } = useAuth();
    const theme = useContext(ThemeContext) || {};
    const isDarkMode = Boolean(theme.isDarkMode);
    const [isOpen, setIsOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [viewport, setViewport] = useState(() => ({
        w: typeof window === 'undefined' ? 1280 : window.innerWidth,
        h: typeof window === 'undefined' ? 800 : window.innerHeight,
    }));
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { text: `Hello ${user?.firstName || 'there'}! I'm your RIT AI Assistant. Ask about attendance, grades, exams, transport, library, or outpass — or use the quick actions below.`, isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    useEffect(() => {
        try { localStorage.removeItem('rit_chatbot_position'); } catch (_e) { /* ignore */ }
        const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const isMobile = viewport.w <= 768;
    const panelWidth = isMobile
        ? Math.max(280, viewport.w - 16)
        : Math.min(expanded ? 480 : 360, viewport.w - 40);
    const chrome = isMobile ? 112 : 124;
    const maxPanel = Math.max(280, viewport.h - chrome);
    const panelHeight = Math.min(expanded ? maxPanel : (isMobile ? Math.round(viewport.h * 0.62) : 480), maxPanel);
    const widgetContainerStyle = useMemo(() => ({
        position: 'fixed',
        right: isMobile ? 8 : 20,
        bottom: isMobile ? 'max(12px, env(safe-area-inset-bottom))' : 20,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
        maxWidth: 'calc(100vw - 16px)',
        pointerEvents: 'auto'
    }), [isMobile]);

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
        if (!hasInteracted) setHasInteracted(true);

        const userMsg = { text: textToSend, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const campusText = localAnswer(textToSend, user?.role || 'STUDENT', user?.email);
        const asksCampusData = /attendance|cgpa|gpa|grade|fee|due|pay|exam|timetable|schedule|bus|transport|route/.test(textToSend.toLowerCase());
        if (asksCampusData) {
            setTimeout(() => {
                setMessages(prev => [...prev, { text: campusText, isBot: true }]);
                setIsTyping(false);
            }, 250);
            return;
        }

        try {
            const res = await api.post(`/ai/chatbot/query?studentId=${studentId || user?.id || 1}&role=${user?.role || 'STUDENT'}`, { query: textToSend });
            const botMsg = { text: res.data?.response || campusText, isBot: true };

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
            }, 400);
        } catch (_err) {
            setIsTyping(false);
            setMessages(prev => [...prev, { text: campusText, isBot: true }]);
        }
    };

    const widget = (
        <div style={widgetContainerStyle}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            width: panelWidth,
                            height: panelHeight,
                            borderRadius: isMobile ? '20px' : '28px',
                            boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            marginBottom: 0,
                            transformOrigin: 'bottom right',
                            maxWidth: 'calc(100vw - 16px)',
                            maxHeight: `calc(100vh - ${isMobile ? 96 : 108}px)`,
                            background: isDarkMode ? 'var(--card-bg)' : 'rgba(255, 255, 255, 0.96)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid var(--theme-border)',
                            color: 'var(--theme-text)',
                            zIndex: 1001
                        }}
                    >
                        {/* Premium Header */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #0B2C6B 0%, #1e3a8a 100%)', 
                            color: 'white', 
                            padding: isMobile ? '14px 16px' : '20px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'default'
                        }}>
                            <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '150px', height: '150px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '50%', blur: '40px' }}></div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
                                <motion.div 
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    style={{ background: 'rgba(255,255,255,0.15)', padding: isMobile ? '8px' : '10px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)' }}
                                >
                                    <FaRobot color="#fbbf24" size={isMobile ? 20 : 24} />
                                </motion.div>
                                <div>
                                    <span style={{ fontWeight: 650, fontSize: isMobile ? '15px' : '17px', display: 'block', letterSpacing: '-0.3px' }}>RIT Assistant</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
                                        <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Campus answers</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '14px', position: 'relative', zIndex: 1 }}>
                                {!isMobile && (
                                    <button type="button" aria-label={expanded ? 'Restore chat size' : 'Enlarge chat'} onClick={() => setExpanded((value) => !value)} style={{ background: 'transparent', border: 0, color: 'white', cursor: 'pointer' }}>
                                        {expanded ? <FaCompress /> : <FaExpand />}
                                    </button>
                                )}
                                <button type="button" aria-label="Close chat" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 0, color: 'white', cursor: 'pointer' }}>
                                    <FaMinus />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, minHeight: 0, padding: isMobile ? '12px' : '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {messages.map((msg, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: isMobile ? '96%' : '88%' }}
                                >
                                    <div
                                        style={{
                                            padding: isMobile ? '10px 12px' : '14px 16px',
                                            borderRadius: msg.isBot ? '4px 24px 24px 24px' : '24px 24px 4px 24px',
                                            fontSize: isMobile ? '0.87rem' : '0.95rem',
                                            fontWeight: '500',
                                            lineHeight: 1.6,
                                            boxShadow: msg.isBot ? '0 4px 15px rgba(0,0,0,0.05)' : '0 10px 25px rgba(11,44,107,0.2)',
                                            ...(msg.isBot
                                                ? { background: isDarkMode ? 'var(--theme-bg-muted)' : '#ffffff', color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }
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
                                <div style={{ alignSelf: 'flex-start', background: isDarkMode ? 'var(--theme-bg-muted)' : '#ffffff', padding: '16px 20px', borderRadius: '4px 24px 24px 24px', border: '1px solid var(--theme-border)' }}>
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

                        {/* Suggestions Layer (auto-hide after first interaction) */}
                        {!hasInteracted && (
                        <div style={{ padding: isMobile ? '0 12px 10px' : '0 18px 12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {getSuggestions().map(sug => (
                                <motion.button
                                    key={sug}
                                    whileHover={{ scale: 1.05, background: 'rgba(11, 44, 107, 0.08)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSend(sug)}
                                    style={{
                                        padding: isMobile ? '8px 12px' : '9px 14px', borderRadius: '25px',
                                        fontSize: isMobile ? '12px' : '13px',
                                        fontWeight: '700', cursor: 'pointer', transition: '0.3s',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        background: isDarkMode ? 'var(--theme-bg-muted)' : 'rgba(255,255,255,0.9)', color: isDarkMode ? 'var(--theme-text)' : '#0B2C6B', border: '1px solid var(--theme-border)',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                                    }}
                                >
                                    <FaBolt size={10} className="text-amber-500" /> {sug}
                                </motion.button>
                            ))}
                        </div>
                        )}

                        {/* Footer Controls */}
                        <div style={{ padding: isMobile ? '10px 12px' : '14px 16px', background: isDarkMode ? 'var(--theme-bg)' : 'rgba(255,255,255,0.7)', borderTop: '1px solid var(--theme-border)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask your assistant..."
                                    style={{
                                        width: '100%', borderRadius: '16px', padding: isMobile ? '10px 12px' : '12px 14px', outline: 'none', fontSize: isMobile ? '14px' : '15px', fontWeight: '600',
                                        background: isDarkMode ? 'var(--theme-bg-muted)' : '#ffffff', color: 'var(--theme-text)', border: '1px solid var(--theme-border)', transition: 'border-color 0.2s',
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
                                    borderRadius: '14px', 
                                    width: isMobile ? '42px' : '48px', height: isMobile ? '42px' : '48px',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    cursor: 'pointer', 
                                    boxShadow: isListening ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 4px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                {isListening ? (
                                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                                        <FaMicrophone size={isMobile ? 16 : 18} />
                                    </motion.div>
                                ) : (
                                    <FaMicrophone size={isMobile ? 16 : 18} />
                                )}
                            </motion.button>

                            <motion.button 
                                whileHover={{ scale: 1.1, backgroundColor: '#1e3a8a' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleSend()} 
                                style={{ 
                                    background: '#0B2C6B', color: '#fff', border: 'none', borderRadius: '14px', 
                                    width: isMobile ? '42px' : '48px', height: isMobile ? '42px' : '48px', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                                    boxShadow: '0 8px 20px rgba(11,44,107,0.3)' 
                                }}
                            >
                                <FaPaperPlane size={isMobile ? 16 : 18} />
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
                    width: isMobile ? '49px' : '55px',
                    height: isMobile ? '49px' : '55px',
                    borderRadius: isMobile ? '16px' : '18px',
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
                <>
                    <FaRobot size={isMobile ? 18 : 24} />
                    <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '14px', height: '14px', background: '#22c55e', borderRadius: '50%', border: '2px solid white' }}></div>
                </>
            </motion.button>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(widget, document.body);
    }
    return widget;
};

export default ChatbotWidget;
