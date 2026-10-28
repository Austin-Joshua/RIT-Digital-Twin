import React, { useState } from 'react';
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
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Page Header (Matches Authentic IMS) */}
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: '500', color: '#333333' }}>
                {activeTab}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => setIsCompose(!isCompose)}
                        style={{
                            width: '100%',
                            backgroundColor: '#007bff',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '10px 16px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                    >
                        New message
                    </button>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <div
                            onClick={() => { setActiveTab('All Messages'); setIsCompose(false); }}
                            style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #dee2e6',
                                fontSize: '0.875rem',
                                color: activeTab === 'All Messages' && !isCompose ? '#007bff' : '#495057',
                                fontWeight: activeTab === 'All Messages' && !isCompose ? '600' : 'normal',
                                cursor: 'pointer',
                                backgroundColor: activeTab === 'All Messages' && !isCompose ? '#f8f9fa' : 'transparent'
                            }}
                        >
                            All Messages
                        </div>
                        <div
                            onClick={() => { setActiveTab('Inbox'); setIsCompose(false); }}
                            style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #dee2e6',
                                fontSize: '0.875rem',
                                color: activeTab === 'Inbox' && !isCompose ? '#007bff' : '#495057',
                                fontWeight: activeTab === 'Inbox' && !isCompose ? '600' : 'normal',
                                cursor: 'pointer',
                                backgroundColor: activeTab === 'Inbox' && !isCompose ? '#f8f9fa' : 'transparent'
                            }}
                        >
                            Inbox
                        </div>
                        <div
                            onClick={() => { setActiveTab('Outbox'); setIsCompose(false); }}
                            style={{
                                padding: '12px 16px',
                                fontSize: '0.875rem',
                                color: activeTab === 'Outbox' && !isCompose ? '#007bff' : '#495057',
                                fontWeight: activeTab === 'Outbox' && !isCompose ? '600' : 'normal',
                                cursor: 'pointer',
                                backgroundColor: activeTab === 'Outbox' && !isCompose ? '#f8f9fa' : 'transparent'
                            }}
                        >
                            Outbox
                        </div>
                    </div>
                </div>

                {/* Right Column: Message View / Compose Form */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', minHeight: '300px', padding: '20px' }}>
                    {isCompose ? (
                        /* Compose Form */
                        <div>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '500', color: '#333' }}>
                                Compose New Message
                            </h3>
                            <form onSubmit={handleSend}>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                        Recipient <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <select
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '0.875rem' }}
                                        required
                                    >
                                        <option value="Mentor - Dr. Madhan V.">Mentor - Dr. Madhan V. (HOD / CSE)</option>
                                        <option value="Class Advisor - Aravindh S.">Class Advisor - Aravindh S. (CS190)</option>
                                        <option value="Principal Office">Principal Office</option>
                                        <option value="Controller of Examinations">Controller of Examinations</option>
                                        <option value="Finance & Accounts Office">Finance & Accounts Office</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                        Subject <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter message subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '0.875rem' }}
                                        required
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                        Message Body <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <textarea
                                        rows="6"
                                        placeholder="Type your message here..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '0.875rem' }}
                                        required
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #dee2e6', paddingTop: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsCompose(false)}
                                        style={{ backgroundColor: '#6c757d', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '0.875rem', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        style={{ backgroundColor: '#28a745', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '8px 20px', fontSize: '0.875rem', fontWeight: '500', cursor: sending ? 'wait' : 'pointer' }}
                                    >
                                        {sending ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : displayedMessages.length === 0 ? (
                        /* Authentic Empty State matching screenshot */
                        <div style={{ color: '#6c757d', fontSize: '0.9375rem', padding: '12px 0' }}>
                            You have no messages.
                        </div>
                    ) : (
                        /* Messages List */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {displayedMessages.map(msg => (
                                <div key={msg.id} style={{ border: '1px solid #dee2e6', borderRadius: '4px', padding: '12px 16px', backgroundColor: '#fafbfc' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <strong style={{ fontSize: '0.9rem', color: '#007bff' }}>{msg.subject}</strong>
                                        <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>{msg.date}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: '#6c757d', marginBottom: '6px' }}>
                                        To: {msg.recipient}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#333' }}>
                                        {msg.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
