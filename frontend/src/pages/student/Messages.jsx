import React, { useState } from 'react';
import { FaInbox, FaPaperPlane, FaEdit, FaPlus, FaSearch, FaUserCircle, FaEnvelopeOpenText, FaTimes } from 'react-icons/fa';
import { useToast } from '../../hooks/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = () => {
    const { addToast } = useToast();
    const [activeFolder, setActiveFolder] = useState('Inbox');
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMessage, setNewMessage] = useState({ to: '', subject: '', content: '' });

    const folders = [
        { name: 'Inbox', icon: <FaInbox /> },
        { name: 'Outbox', icon: <FaPaperPlane /> },
        { name: 'Drafts', icon: <FaEdit /> },
    ];

    const mockMessages = {
        Inbox: [
            { id: 1, sender: 'Dr. Sarah Wilson', subject: 'Assignment Feedback', preview: 'Great work on the Digital Twin project. Please...', time: '10:30 AM', unread: true },
            { id: 2, sender: 'Academic Office', subject: 'Holiday Notice', preview: 'The college will remain closed on Friday for...', time: 'Yesterday', unread: false },
        ],
        Outbox: [
            { id: 3, receiver: 'Prof. Michael Brown', subject: 'Query regarding Lab 4', preview: 'I am having trouble with the circuit simulation...', time: 'Mon, 2:15 PM', status: 'Sent' },
        ],
        Drafts: [
            { id: 4, receiver: 'HOD - CSE', subject: 'Symposium Proposal', preview: 'Drafting the proposal for the upcoming AI...', time: '2 days ago' },
        ],
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.to || !newMessage.subject) {
            addToast('Please fill in all required fields', 'error');
            return;
        }
        addToast('Message sent successfully!', 'success');
        setIsComposeOpen(false);
        setNewMessage({ to: '', subject: '', content: '' });
    };

    return (
        <div className="stu-report-page space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div style={{ fontSize: '14px', color: 'var(--theme-text-muted)', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Communication Hub
            </div>

            <div className="messages-layout" style={{ display: 'flex', gap: '24px' }}>
                {/* Sidebar Navigation */}
                <div className="messages-sidebar" style={{ width: '280px', flexShrink: 0 }}>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsComposeOpen(true)}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '14px',
                            marginBottom: '20px',
                            boxShadow: '0 8px 20px rgba(11, 44, 107, 0.2)'
                        }}
                    >
                        <FaPlus /> New Message
                    </motion.button>

                    <div className="stu-info-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="info-header" style={{ padding: '15px 20px', background: 'var(--theme-bg-muted)', borderBottom: '1px solid var(--theme-border)' }}>
                            <span className="text-xs uppercase font-black tracking-widest opacity-60">Folders</span>
                        </div>
                        <div className="folder-list">
                            {folders.map((folder) => (
                                <div
                                    key={folder.name}
                                    onClick={() => setActiveFolder(folder.name)}
                                    style={{
                                        padding: '15px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        background: activeFolder === folder.name ? 'rgba(11, 44, 107, 0.08)' : 'transparent',
                                        borderLeft: activeFolder === folder.name ? '4px solid var(--color-primary-navy)' : '4px solid transparent',
                                        color: activeFolder === folder.name ? 'var(--color-primary-navy)' : 'var(--theme-text)'
                                    }}
                                    className="hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                    <span style={{ fontSize: '18px' }}>{folder.icon}</span>
                                    <span style={{ fontWeight: activeFolder === folder.name ? '800' : '500', fontSize: '14px' }}>{folder.name}</span>
                                    {folder.name === 'Inbox' && <span className="ml-auto bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">2</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-4">
                    <div className="stu-info-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '600px' }}>
                        {/* Search & Toolbar */}
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--theme-border)', display: 'flex', gap: '15px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--theme-text-muted)' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search messages..." 
                                    className="input-field" 
                                    style={{ paddingLeft: '45px' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Message List */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {mockMessages[activeFolder]?.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-white/5">
                                    {mockMessages[activeFolder].map((msg) => (
                                        <div 
                                            key={msg.id} 
                                            style={{ 
                                                padding: '20px', 
                                                cursor: 'pointer', 
                                                display: 'flex', 
                                                gap: '15px',
                                                background: msg.unread ? 'rgba(11, 44, 107, 0.02)' : 'transparent'
                                            }}
                                            className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <FaUserCircle style={{ fontSize: '40px', color: 'var(--theme-border)' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: '800', color: 'var(--theme-text)', fontSize: '14px' }}>{msg.sender || msg.receiver}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>{msg.time}</span>
                                                </div>
                                                <div style={{ fontWeight: msg.unread ? '700' : '500', color: 'var(--theme-text)', marginBottom: '2px', fontSize: '13px' }}>{msg.subject}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.preview}</div>
                                            </div>
                                            {msg.unread && <div style={{ width: '8px', height: '8px', background: 'var(--color-primary-navy)', borderRadius: '50%', marginTop: '5px' }} />}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-text-muted)', gap: '15px' }}>
                                    <FaEnvelopeOpenText style={{ fontSize: '60px', opacity: 0.3 }} />
                                    <div style={{ fontWeight: 'bold' }}>No messages in {activeFolder}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Compose Message Modal */}
            <AnimatePresence>
                {isComposeOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="stu-info-card" 
                            style={{ width: '600px', maxWidth: '90%', padding: '0', overflow: 'hidden' }}
                        >
                            <div className="info-header" style={{ padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-primary-navy)', color: 'white', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                                <span className="font-bold">New Message</span>
                                <FaTimes style={{ cursor: 'pointer' }} onClick={() => setIsComposeOpen(false)} />
                            </div>
                            <form onSubmit={handleSend} style={{ padding: '25px', spaceY: '15px' }}>
                                <div className="space-y-4">
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', opacity: 0.6 }}>Recipient</label>
                                        <input 
                                            type="text" 
                                            placeholder="Student ID or Faculty Name" 
                                            className="input-field" 
                                            value={newMessage.to}
                                            onChange={(e) => setNewMessage({...newMessage, to: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', opacity: 0.6 }}>Subject</label>
                                        <input 
                                            type="text" 
                                            placeholder="Topic of discussion" 
                                            className="input-field" 
                                            value={newMessage.subject}
                                            onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', opacity: 0.6 }}>Message</label>
                                        <textarea 
                                            rows="5" 
                                            placeholder="Write your message here..." 
                                            className="input-field"
                                            style={{ resize: 'none' }}
                                            value={newMessage.content}
                                            onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                                        ></textarea>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', paddingTop: '10px' }}>
                                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>Send Message</button>
                                        <button type="button" onClick={() => setIsComposeOpen(false)} className="table-btn" style={{ flex: 1 }}>Discard</button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @media (max-width: 1024px) {
                    .messages-layout {
                        flex-direction: column !important;
                    }
                    .messages-sidebar {
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Messages;
