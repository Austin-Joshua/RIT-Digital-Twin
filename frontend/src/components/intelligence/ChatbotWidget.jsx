import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus } from 'react-icons/fa';
import api from '../../services/api';

const ChatbotWidget = ({ studentId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your AI Academic Assistant. How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { text: input, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const res = await api.post(`/api/ai/chatbot/query?studentId=${studentId}`, { query: input });
            const botMsg = { text: res.data.response, isBot: true };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", isBot: true }]);
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
                            width: '350px',
                            height: '450px',
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            marginBottom: '16px',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        {/* Header */}
                        <div style={{ background: '#0B2C6B', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaRobot /> <span>Academic AI</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
                                <FaMinus onClick={() => setIsOpen(false)} />
                                <FaTimes onClick={() => setIsOpen(false)} />
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{
                                    alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
                                    background: msg.isBot ? '#f1f5f9' : '#0B2C6B',
                                    color: msg.isBot ? '#1e293b' : 'white',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    maxWidth: '80%',
                                    fontSize: '0.9rem'
                                }}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me something..."
                                style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', outline: 'none' }}
                            />
                            <button onClick={handleSend} style={{ background: '#0B2C6B', color: 'white', border: 'none', borderRadius: '8px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <FaPaperPlane />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#0B2C6B',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? <FaTimes size={24} /> : <FaRobot size={28} />}
            </motion.button>
        </div>
    );
};

export default ChatbotWidget;
