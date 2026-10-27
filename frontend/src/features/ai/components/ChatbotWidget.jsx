import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaRobot, FaPaperPlane, FaMinus, FaBolt, FaMicrophone, 
    FaExpand, FaCompress, FaThumbsUp, FaThumbsDown, FaBookOpen,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/AuthContext';
import { answerForUser, greetingFor } from '../campusGuide';
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
    const messagesEndRef = useRef(null);
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
        { 
            text: greetingFor(user, null) + ' I can assist you with classroom utilization, campus energy trends, crowd simulations, transport metrics, and ESG sustainability reporting.', 
            isBot: true,
            provenance: 'LIVE',
            confidence: 1.0,
            timestamp: new Date().toISOString()
        }
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const isMobile = viewport.w <= 768;
    const margin = 16;
    const launcher = isMobile ? 52 : 58;
    const gap = 10;
    const maxWidth = Math.max(280, viewport.w - margin * 2);
    const openBudget = Math.max(280, viewport.h - margin * 2 - launcher - gap);
    const panelWidth = expanded
        ? maxWidth
        : Math.min(customSize?.w || Math.min(420, maxWidth), maxWidth);
    const panelHeight = expanded
        ? Math.max(280, viewport.h - margin * 2)
        : Math.min(customSize?.h || Math.min(560, openBudget), openBudget);

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

    const getSuggestions = () => {
        const role = String(user?.role || '').replace(/^ROLE_/, '').toUpperCase();
        if (role === 'ADMIN' || role === 'HOD') {
            return [
                'Show me the buildings with verified geometry.',
                'Which campus buildings still need geometry verification?',
                'Which classrooms have the lowest utilization today?',
                'Explain the campus energy consumption trend.',
                'Which buildings show unusual energy usage?',
                'What happens to crowd distribution if this entrance is closed?',
                'Explain the latest ESG score and metrics.',
                'Generate campus operational report'
            ];
        }
        if (role === 'FACULTY') {
            return [
                'Show me the buildings with verified geometry.',
                'Which classrooms are available tomorrow at 11?',
                'Which classrooms have the lowest utilization today?',
                'What is the energy usage in Computer Science building?',
                'What are the sustainability guidelines for RIT?'
            ];
        }
        return [
            'Show me the buildings with verified geometry.',
            'Which classrooms have the lowest utilization today?',
            'Explain the campus energy consumption trend.',
            'Show campus shuttle and transport metrics.',
            'What is our latest ESG sustainability score?'
        ];
    };

    useEffect(() => {
        const handleCopilotAsk = (e) => {
            const query = e.detail?.query;
            if (query) {
                setIsOpen(true);
                setHasInteracted(true);
                handleSend(query);
            }
        };
        window.addEventListener('rit-copilot-ask', handleCopilotAsk);
        return () => window.removeEventListener('rit-copilot-ask', handleCopilotAsk);
    }, []);

    const activeAbortController = useRef(null);

    const handleSend = async (queryText = input) => {
        const raw = (queryText || input).trim();
        if (!raw || isTyping) return;
        const textToSend = raw.slice(0, 1000); // 1000 char bounding for prompt injection and DoS defense
        if (!hasInteracted) setHasInteracted(true);

        if (activeAbortController.current) {
            activeAbortController.current.abort();
        }
        activeAbortController.current = new AbortController();

        setMessages((prev) => [...prev, { text: textToSend, isBot: false }]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await api.post('/ai/copilot/ask', {
                query: textToSend,
                page: location.pathname,
                entity: null
            }, {
                signal: activeAbortController.current.signal
            });

            const data = response.data || {};
            const botMsg = {
                text: data.answer || 'No response returned from campus records.',
                isBot: true,
                provenance: data.provenance || 'ESTIMATED',
                confidence: typeof data.confidence === 'number' ? data.confidence : 0.9,
                cards: Array.isArray(data.cards) ? data.cards : [],
                table: (data.table && Array.isArray(data.table.headers)) ? data.table : null,
                actions: Array.isArray(data.actions) ? data.actions : (data.path ? [{ label: data.label || 'Open page', path: data.path }] : []),
                citations: Array.isArray(data.citations) ? data.citations : [],
                because: data.because || '',
                timestamp: data.timestamp || new Date().toISOString(),
                requestId: data.requestId || null
            };

            if (botMsg.actions.length > 0 && botMsg.actions[0].path) {
                lastPath.current = botMsg.actions[0].path;
            }

            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            console.warn('Campus copilot API failed, using offline fallback:', err);
            const reply = answerForUser(textToSend, user, {
                live: liveCgpa ? { cgpa: liveCgpa } : null,
                lastPath: lastPath.current,
                here: location.pathname,
            });
            if (reply.path) lastPath.current = reply.path;

            setMessages((prev) => [...prev, {
                text: reply.text || 'Unable to connect to digital twin copilot.',
                isBot: true,
                isOfflineFallback: true,
                provenance: 'UNAVAILABLE',
                confidence: 0.4,
                because: 'Fallback response generated from local offline catalog (copilot backend unreachable). This response is from a static catalog and does NOT represent real-time digital twin telemetry.',
                actions: reply.path ? [{ label: reply.label || 'Open page', path: reply.path }] : [],
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleFeedback = (msgIdx, type) => {
        setMessages((prev) => prev.map((m, idx) => {
            if (idx !== msgIdx) return m;
            const current = m.feedback;
            return { ...m, feedback: current === type ? null : type };
        }));
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
                            padding: isMobile ? '14px 16px' : '18px 20px', 
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
                                    <span style={{ fontWeight: 800, fontSize: isMobile ? '15px' : '17px', display: 'block', letterSpacing: '-0.3px' }}>Digital Twin Copilot</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
                                        <span style={{ fontSize: '10px', opacity: 0.9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Smart Campus Intelligence</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '14px', position: 'relative', zIndex: 1, alignItems: 'center' }}>
                                <button
                                    type="button"
                                    aria-label="Open full Copilot Workspace"
                                    title="Open full Copilot Workspace"
                                    onClick={() => {
                                        const isStudent = String(user?.role || '').replace(/^ROLE_/, '').toUpperCase() === 'STUDENT';
                                        navigate(isStudent ? '/student/copilot' : '/copilot');
                                        setIsOpen(false);
                                    }}
                                    style={{ background: 'transparent', border: 0, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    <FaExternalLinkAlt size={13} />
                                </button>
                                <button type="button" aria-label={expanded ? 'Restore chat size' : 'Enlarge chat'} onClick={() => setExpanded((value) => !value)} style={{ background: 'transparent', border: 0, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    {expanded ? <FaCompress size={14} /> : <FaExpand size={14} />}
                                </button>
                                <button type="button" aria-label="Close chat" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 0, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <FaMinus size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="rit-chat-messages" style={{ flex: 1, minHeight: 0, padding: isMobile ? '12px' : '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {messages.map((msg, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: isMobile ? '98%' : '92%', width: msg.isBot && (msg.cards?.length || msg.table) ? '100%' : 'auto' }}
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
                                        {msg.isBot ? (
                                            <>
                                                {/* Offline Guide Banner */}
                                                {msg.isOfflineFallback && (
                                                    <div style={{
                                                        background: 'rgba(239, 68, 68, 0.15)',
                                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                                        color: '#f87171',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        marginBottom: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        ⚠️ OFFLINE STATIC GUIDE (Backend Unreachable)
                                                    </div>
                                                )}

                                                {/* Provenance Badge & Confidence */}
                                                {msg.provenance && (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                                        <span className={`copilot-badge copilot-badge-${String(msg.provenance).toLowerCase()}`}>
                                                            ● {msg.provenance} DATA
                                                        </span>
                                                        {typeof msg.confidence === 'number' && (
                                                            <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 600 }}>
                                                                {(msg.confidence * 100).toFixed(0)}% confidence
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <MessageContent text={msg.text} />

                                                {/* Stat Cards Grid */}
                                                {msg.cards && msg.cards.length > 0 && (
                                                    <div className="copilot-cards-grid">
                                                        {msg.cards.map((card, cIdx) => (
                                                            <div key={cIdx} className="copilot-stat-card">
                                                                <span className="copilot-stat-title">{card.title}</span>
                                                                <div className="copilot-stat-val">
                                                                    {card.value} {card.unit && <span className="copilot-stat-unit">{card.unit}</span>}
                                                                </div>
                                                                {card.change && (
                                                                    <span style={{ fontSize: '10px', color: card.tone === 'positive' ? '#22c55e' : card.tone === 'critical' ? '#ef4444' : '#64748b' }}>
                                                                        {card.change}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Comparison / Metric Table */}
                                                {msg.table && msg.table.headers && msg.table.headers.length > 0 && (
                                                    <div className="copilot-table-container">
                                                        <table className="copilot-table">
                                                            <thead>
                                                                <tr>
                                                                    {msg.table.headers.map((h, hIdx) => (
                                                                        <th key={hIdx}>{h}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(msg.table.rows || []).map((row, rIdx) => (
                                                                    <tr key={rIdx}>
                                                                        {row.map((cell, cellIdx) => (
                                                                            <td key={cellIdx}>{cell}</td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}

                                                {/* Reasoning & Provenance Note */}
                                                {msg.because && (
                                                    <div className="copilot-because">
                                                        <strong>Data Provenance: </strong>{msg.because}
                                                    </div>
                                                )}

                                                {/* Knowledge Base Citations */}
                                                {msg.citations && msg.citations.length > 0 && (
                                                    <div style={{ marginTop: '8px' }}>
                                                        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, marginBottom: '4px' }}>
                                                            Knowledge Base References
                                                        </div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                            {msg.citations.map((cite, citeIdx) => (
                                                                <span key={citeIdx} className="copilot-citation" title={cite.excerpt || cite.reference}>
                                                                    <FaBookOpen size={9} /> {cite.title} {cite.section ? `(${cite.section})` : ''}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Feedback Row */}
                                                <div className="copilot-feedback-row">
                                                    <span>Verified against campus telemetry?</span>
                                                    <button
                                                        type="button"
                                                        className={`copilot-feedback-btn ${msg.feedback === 'up' ? 'active-pos' : ''}`}
                                                        onClick={() => handleFeedback(i, 'up')}
                                                        aria-label="Accurate and verified"
                                                        title="Accurate and verified"
                                                    >
                                                        <FaThumbsUp size={11} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`copilot-feedback-btn ${msg.feedback === 'down' ? 'active-neg' : ''}`}
                                                        onClick={() => handleFeedback(i, 'down')}
                                                        aria-label="Inaccurate or unexpected"
                                                        title="Inaccurate or unexpected"
                                                    >
                                                        <FaThumbsDown size={11} />
                                                    </button>
                                                    {msg.timestamp && (
                                                        <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: '9px' }}>
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>

                                    {/* Action Navigation Buttons */}
                                    {msg.actions && msg.actions.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                            {msg.actions.map((act, actIdx) => (
                                                <motion.button 
                                                    key={actIdx}
                                                    type="button"
                                                    whileHover={{ scale: 1.02, y: -1 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        if (!act.path) return;
                                                        navigate(act.path);
                                                        if (isMobile) setIsOpen(false);
                                                    }}
                                                    className="copilot-action-btn"
                                                >
                                                    <FaBolt size={10} /> {act.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="rit-chat-bot" style={{ alignSelf: 'flex-start', padding: '16px 20px', borderRadius: '4px 18px 18px 18px' }}>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        {[0, 1, 2].map(j => (
                                            <motion.div
                                                key={j}
                                                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                                                transition={{ repeat: Infinity, duration: 0.8, delay: j * 0.15 }}
                                                style={{ width: 8, height: 8, background: '#94a3b8', borderRadius: '50%' }}
                                            />
                                        ))}
                                        <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>Querying digital twin context layer...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions Layer */}
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
                                    maxLength={1000}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Ask about classrooms, energy, crowd, ESG..."
                                    aria-label="Ask about classrooms, energy, crowd, ESG"
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
                                aria-label="Toggle voice input"
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
                                disabled={isTyping || !input.trim()}
                                style={{ 
                                    background: '#0B2C6B', color: '#fff', border: 'none', borderRadius: '14px', 
                                    width: isMobile ? '42px' : '48px', height: isMobile ? '42px' : '48px', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                                    boxShadow: '0 8px 20px rgba(11,44,107,0.3)',
                                    opacity: isTyping || !input.trim() ? 0.6 : 1
                                }}
                                aria-label="Send message"
                            >
                                <FaPaperPlane size={isMobile ? 16 : 18} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Launcher Button */}
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
                    aria-label="Open RIT Digital Twin Copilot"
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
