import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaMinus, FaBolt, FaMicrophone, FaExpand, FaCompress } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/AuthContext';
import { answerForUser, greetingFor, suggestionsFor } from '../campusGuide';
import './chatbot.css';

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

const ChatbotWidget = ({ studentId: _studentId }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const lastPath = useRef(null);
    const [liveCgpa, setLiveCgpa] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [customSize, setCustomSize] = useState(null);
    const [viewport, setViewport] = useState(() => ({
        w: typeof window === 'undefined' ? 1280 : window.innerWidth,
        h: typeof window === 'undefined' ? 800 : window.innerHeight,
    }));
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState(() => [
        { text: greetingFor(user, null), isBot: true }
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

    useEffect(() => {
        const role = String(user?.role || '').replace(/^ROLE_/, '').toUpperCase();
        if (role !== 'STUDENT') return undefined;
        let cancelled = false;
        api.get('/academic/student/cgpa')
            .then((res) => {
                if (cancelled || !Array.isArray(res.data) || res.data.length === 0) return;
                const average = res.data.reduce((sum, row) => sum + Number(row.gpa || 0), 0) / res.data.length;
                if (average > 0) setLiveCgpa(average);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [user?.id, user?.role]);

    const isMobile = viewport.w <= 768;
    const margin = 16;
    const launcher = isMobile ? 52 : 58;
    const gap = 10;
    const maxWidth = Math.max(280, viewport.w - margin * 2);
    const openBudget = Math.max(280, viewport.h - margin * 2 - launcher - gap);
    const panelWidth = expanded
        ? maxWidth
        : Math.min(customSize?.w || Math.min(380, maxWidth), maxWidth);
    const panelHeight = expanded
        ? Math.max(280, viewport.h - margin * 2)
        : Math.min(customSize?.h || Math.min(520, openBudget), openBudget);
    const widgetContainerStyle = useMemo(() => ({
        position: 'fixed',
        right: margin,
        bottom: margin,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap,
        width: expanded ? panelWidth : 'auto',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 32px)',
        pointerEvents: 'auto'
    }), [expanded, panelWidth]);

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

    const startResize = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const startX = event.clientX;
        const startY = event.clientY;
        const startW = panelWidth;
        const startH = panelHeight;
        const limitW = Math.max(300, viewport.w - 32);
        const limitH = Math.max(280, viewport.h - 32 - launcher - gap);
        const onMove = (moveEvent) => {
            setExpanded(false);
            setCustomSize({
                w: Math.max(300, Math.min(limitW, startW + (startX - moveEvent.clientX))),
                h: Math.max(320, Math.min(limitH, startH + (startY - moveEvent.clientY))),
            });
        };
        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };


    const getSuggestions = () => suggestionsFor(user);

    const handleSend = (queryText = input) => {
        const textToSend = queryText || input;
        if (!textToSend.trim()) return;
        if (!hasInteracted) setHasInteracted(true);

        setMessages((prev) => [...prev, { text: textToSend, isBot: false }]);
        setInput('');
        setIsTyping(true);

        const reply = answerForUser(textToSend, user, {
            live: liveCgpa ? { cgpa: liveCgpa } : null,
            lastPath: lastPath.current,
            here: location.pathname,
        });
        if (reply.path) lastPath.current = reply.path;

        window.setTimeout(() => {
            setMessages((prev) => [...prev, {
                text: reply.text,
                isBot: true,
                action: reply.path ? { label: reply.label || 'Open page', path: reply.path } : null,
            }]);
            setIsTyping(false);
        }, 220);
    };

    const widget = (
        <div style={widgetContainerStyle}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="rit-chat-panel"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            width: expanded ? '100%' : panelWidth,
                            height: panelHeight,
                            position: 'relative',
                            borderRadius: isMobile ? '20px' : '28px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            marginBottom: 0,
                            transformOrigin: 'bottom right',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            zIndex: 1001
                        }}
                    >
                        <button type="button" className="rit-chat-resize" aria-label="Resize chat" onPointerDown={startResize} />
                        <div className="rit-chat-header" style={{
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
                                    <span style={{ fontWeight: 800, fontSize: isMobile ? '15px' : '17px', display: 'block', letterSpacing: '-0.3px' }}>RIT Assistant</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
                                        <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Campus answers</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '14px', position: 'relative', zIndex: 1 }}>
                                <button type="button" aria-label={expanded ? 'Restore chat size' : 'Enlarge chat'} onClick={() => setExpanded((value) => !value)} style={{ background: 'transparent', border: 0, color: 'white', cursor: 'pointer' }}>
                                        {expanded ? <FaCompress /> : <FaExpand />}
                                    </button>
                                <button type="button" aria-label="Close chat" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 0, color: 'white', cursor: 'pointer' }}>
                                    <FaMinus />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="rit-chat-messages" style={{ flex: 1, minHeight: 0, padding: isMobile ? '12px' : '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {messages.map((msg, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: isMobile ? '96%' : '88%' }}
                                >
                                    <div
                                        className={msg.isBot ? 'rit-chat-bot' : 'rit-chat-user'}
                                        style={{
                                            padding: isMobile ? '10px 12px' : '14px 16px',
                                            borderRadius: msg.isBot ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
                                            fontSize: isMobile ? '0.9rem' : '0.95rem',
                                            fontWeight: 500,
                                            lineHeight: 1.55,
                                        }}
                                    >
                                        {msg.isBot ? <MessageContent text={msg.text} /> : msg.text}
                                    </div>
                                    {msg.action && (
                                        <motion.button 
                                            type="button"
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                if (!msg.action?.path) return;
                                                navigate(msg.action.path);
                                                setIsOpen(false);
                                            }}
                                            style={{
                                                marginTop: '10px', width: '100%', padding: '12px', borderRadius: '14px',
                                                background: '#0B2C6B', color: 'white', border: 'none',
                                                fontWeight: 650, fontSize: '12px',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                            }}
                                        >
                                            <FaBolt size={12} /> {msg.action.label}
                                        </motion.button>
                                    )}
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="rit-chat-bot" style={{ alignSelf: 'flex-start', padding: '16px 20px', borderRadius: '4px 18px 18px 18px' }}>
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
                        <div className="rit-chat-suggestions" style={{ padding: isMobile ? '0 12px 10px' : '0 18px 12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {getSuggestions().map(sug => (
                                <motion.button
                                    key={sug}
                                    className="rit-chat-chip"
                                    onClick={() => handleSend(sug)}
                                    style={{
                                        padding: isMobile ? '8px 12px' : '9px 14px', borderRadius: '25px',
                                        fontSize: isMobile ? '12px' : '13px',
                                        fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}
                                >
                                    <FaBolt size={10} className="text-amber-500" /> {sug}
                                </motion.button>
                            ))}
                        </div>
                        )}

                        {/* Footer Controls */}
                        <div className="rit-chat-footer" style={{ padding: isMobile ? '10px 12px' : '14px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask your assistant..."
                                    className="rit-chat-input"
                                    style={{ padding: isMobile ? '10px 12px' : '12px 14px', fontSize: isMobile ? '14px' : '15px' }}
                                />
                            </div>
                            
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleVoice} 
                                className={isListening ? 'rit-chat-mic is-listening' : 'rit-chat-mic'}
                                style={{ 
                                    borderRadius: '14px', 
                                    width: isMobile ? '42px' : '48px', height: isMobile ? '42px' : '48px',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    cursor: 'pointer'
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
            {!expanded && (
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
                    position: 'relative',
                    flexShrink: 0
                }}
            >
                <>
                    <FaRobot size={isMobile ? 18 : 24} />
                    <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '14px', height: '14px', background: '#22c55e', borderRadius: '50%', border: '2px solid white' }}></div>
                </>
            </motion.button>
            )}
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(widget, document.body);
    }
    return widget;
};

export default ChatbotWidget;
