import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaMinus, FaBolt, FaChartBar, FaSearch, FaMicrophone } from 'react-icons/fa';
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
    const [hasInteracted, setHasInteracted] = useState(false);
    const [desktopPos, setDesktopPos] = useState(() => {
        if (typeof window === 'undefined') return { top: 120, left: 0 };
        const saved = localStorage.getItem('rit_chatbot_position');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (typeof parsed?.top === 'number' && typeof parsed?.left === 'number') return parsed;
            } catch (_e) {
                // no-op
            }
        }
        return { top: Math.max(80, window.innerHeight - 620), left: Math.max(20, window.innerWidth - 430) };
    });
    const dragRef = useRef({ active: false, dx: 0, dy: 0 });

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const panelWidth = isMobile ? 'calc(100vw - 16px)' : 'min(415px, calc(100vw - 40px))';
    const panelHeight = isMobile ? 'min(78vh, 635px)' : 'min(645px, calc(100vh - 120px))';
    const widgetContainerStyle = useMemo(() => ({
        position: 'fixed',
        bottom: isMobile ? 'max(8px, env(safe-area-inset-bottom))' : 'auto',
        right: isMobile ? '8px' : 'auto',
        left: isMobile ? '8px' : `${desktopPos.left}px`,
        top: isMobile ? 'auto' : `${desktopPos.top}px`,
        zIndex: 1100,
        pointerEvents: 'auto',
        touchAction: 'none'
    }), [isMobile, desktopPos.left, desktopPos.top]);

    const startDrag = (clientX, clientY) => {
        if (isMobile) return;
        dragRef.current.active = true;
        dragRef.current.dx = clientX - desktopPos.left;
        dragRef.current.dy = clientY - desktopPos.top;
    };

    useEffect(() => {
        if (isMobile) return undefined;
        const onMove = (event) => {
            if (!dragRef.current.active) return;
            const x = Math.max(8, Math.min(window.innerWidth - 90, event.clientX - dragRef.current.dx));
            const y = Math.max(8, Math.min(window.innerHeight - 90, event.clientY - dragRef.current.dy));
            setDesktopPos({ top: y, left: x });
        };
        const onUp = () => {
            if (!dragRef.current.active) return;
            dragRef.current.active = false;
            localStorage.setItem('rit_chatbot_position', JSON.stringify(desktopPos));
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [desktopPos, isMobile]);

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
                            marginBottom: isMobile ? '10px' : '14px',
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
                            padding: isMobile ? '14px 16px' : '20px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: isMobile ? 'default' : 'move'
                        }}
                        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}>
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
                                    <span style={{ fontWeight: '900', fontSize: isMobile ? '15px' : '18px', display: 'block', letterSpacing: '-0.5px' }}>RIT Intellect</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
                                        <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Neural Engine Active</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '18px', cursor: 'pointer', opacity: 0.8, position: 'relative', zIndex: 1 }}>
                                <FaMinus onClick={() => setIsOpen(false)} style={{ transition: '0.2s' }} />
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, padding: isMobile ? '12px' : '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                                        background: 'rgba(255,255,255,0.8)', color: '#0B2C6B', border: '1px solid rgba(11, 44, 107, 0.2)',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                                    }}
                                >
                                    <FaBolt size={10} className="text-amber-500" /> {sug}
                                </motion.button>
                            ))}
                        </div>
                        )}

                        {/* Footer Controls */}
                        <div style={{ padding: isMobile ? '10px 12px' : '14px 16px', background: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask your assistant..."
                                    style={{
                                        width: '100%', borderRadius: '16px', padding: isMobile ? '10px 12px' : '12px 14px', outline: 'none', fontSize: isMobile ? '14px' : '15px', fontWeight: '600',
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
                onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
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
};

export default ChatbotWidget;
