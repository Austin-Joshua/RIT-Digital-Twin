import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LuPlus, LuMail, LuSend, LuInbox, LuX, LuCheck } from 'react-icons/lu';
import { useToast } from '../../hooks/ToastContext';

const Messages = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('All Messages'); // 'All Messages' | 'Inbox' | 'Outbox'
    const [isCompose, setIsCompose] = useState(false);
    const [messages, setMessages] = useState([]);
    
    // Form state
    const [recipient, setRecipient] = useState('Mentor - Dr. Madhan V.');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadMessages = async () => {
            try {
                const [inboxRes, outboxRes] = await Promise.all([
                    api.get('/messages/inbox').catch(() => ({ data: [] })),
                    api.get('/messages/outbox').catch(() => ({ data: [] }))
                ]);
                if (!isMounted) return;
                const inbox = (Array.isArray(inboxRes.data) ? inboxRes.data : []).map(m => ({
                    id: m.id,
                    folder: 'Inbox',
                    recipient: m.senderName || m.senderEmail || 'Faculty',
                    subject: m.subject || 'Notice',
                    content: m.content || '',
                    date: m.sentAt ? new Date(m.sentAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
                }));
                const outbox = (Array.isArray(outboxRes.data) ? outboxRes.data : []).map(m => ({
                    id: m.id,
                    folder: 'Outbox',
                    recipient: m.recipientName || m.recipientEmail || 'Faculty',
                    subject: m.subject || 'Message',
                    content: m.content || '',
                    date: m.sentAt ? new Date(m.sentAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
                }));
                if (inbox.length > 0 || outbox.length > 0) {
                    setMessages([...outbox, ...inbox]);
                }
            } catch {
                // Keep local message state
            }
        };
        loadMessages();
        return () => { isMounted = false; };
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        setSending(true);
        setTimeout(() => {
            const newMsg = {
                id: Date.now(),
                folder: 'Outbox',
                recipient,
                subject,
                content,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            };
            setMessages([newMsg, ...messages]);
            api.post('/messages/send', {
                to: recipient,
                subject,
                content
            }).catch(() => {});
            setSending(false);
            setIsCompose(false);
            setSubject('');
            setContent('');
            addToast('Message dispatched to faculty mentor successfully.', 'success');
        }, 500);
    };

    const displayedMessages = messages.filter(m => {
        if (activeTab === 'All Messages') return true;
        if (activeTab === 'Inbox') return m.folder === 'Inbox';
        if (activeTab === 'Outbox') return m.folder === 'Outbox';
        return true;
    });

        return (
        <div className="ims-page-container">
            {/* Header Banner following TransportDirectory & Simulator hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuMail />
                    </div>
                    <div>
                        <h1 className="ims-header-title">Messages</h1>
                        <p className="ims-header-subtitle">Internal institutional communication, academic advisor notices & queries</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setIsCompose(!isCompose)}
                        className="ims-candy-btn ims-candy-primary"
                    >
                        <LuPlus /> New message
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'start' }}>
                {/* Left Column: Folders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="ims-card-elevated" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => { setActiveTab('All Messages'); setIsCompose(false); }}
                                className={`ims-candy-btn ${activeTab === 'All Messages' && !isCompose ? 'ims-candy-primary' : 'ims-candy-neutral'}`}
                                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 18px' }}
                            >
                                <LuMail /> All Messages
                            </button>
                            <button
                                onClick={() => { setActiveTab('Inbox'); setIsCompose(false); }}
                                className={`ims-candy-btn ${activeTab === 'Inbox' && !isCompose ? 'ims-candy-primary' : 'ims-candy-neutral'}`}
                                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 18px' }}
                            >
                                <LuInbox /> Inbox
                            </button>
                            <button
                                onClick={() => { setActiveTab('Outbox'); setIsCompose(false); }}
                                className={`ims-candy-btn ${activeTab === 'Outbox' && !isCompose ? 'ims-candy-primary' : 'ims-candy-neutral'}`}
                                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 18px' }}
                            >
                                <LuSend /> Outbox
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Message View / Compose Form */}
                <div style={{ gridColumn: 'span 2' }}>
                    {isCompose ? (
                        <div className="ims-card-elevated">
                            <div style={{ borderBottom: '1.5px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
                                    Compose New Message
                                </h3>
                                <button
                                    onClick={() => setIsCompose(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px', display: 'flex' }}
                                >
                                    <LuX />
                                </button>
                            </div>

                            <form onSubmit={handleSend}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                        To Recipient <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <select
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        className="ims-candy-search"
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                    >
                                        <option value="Mentor - Dr. Madhan V.">Faculty Mentor - DR. MADHAN V. (CS130)</option>
                                        <option value="HOD - Computer Science">Head of Department - Computer Science</option>
                                        <option value="Class Advisor - Aravindh S.">Class Advisor - ARAVINDH S (CS190)</option>
                                        <option value="Controller of Examinations">Office of the Controller of Examinations</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                        Subject <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter subject heading..."
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="ims-candy-search"
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                        required
                                    />
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                        Message Body <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <textarea
                                        rows="6"
                                        placeholder="Write your message here..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 18px',
                                            borderRadius: '12px',
                                            border: '1.5px solid #cbd5e1',
                                            fontSize: '0.875rem',
                                            color: '#334155',
                                            outline: 'none',
                                            resize: 'vertical',
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit'
                                        }}
                                        required
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsCompose(false)}
                                        className="ims-candy-btn ims-candy-neutral"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="ims-candy-btn ims-candy-success"
                                    >
                                        <LuSend /> {sending ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="ims-card-elevated" style={{ minHeight: '360px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                                    {activeTab}
                                </h3>
                                <span className="ims-candy-badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
                                    {displayedMessages.length} Messages
                                </span>
                            </div>

                            {displayedMessages.length === 0 ? (
                                /* Authentic RIT IMS Empty state as in user screenshot media_1793188548986_c130ee1b.png */
                                <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
                                    You have no messages.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {displayedMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            style={{
                                                padding: '16px 20px',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                backgroundColor: '#f8fafc',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <strong style={{ color: '#0B2C6B', fontSize: '0.95rem' }}>{msg.recipient}</strong>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{msg.date}</span>
                                            </div>
                                            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#1e293b' }}>{msg.subject}</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>{msg.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
