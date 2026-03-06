import React from 'react';

const Messages = () => {
    return (
        <div className="stu-report-page">
            <div style={{ fontSize: '14px', color: 'var(--theme-text-muted)', marginBottom: '15px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>All Messages</div>

            <div className="messages-layout" style={{ display: 'flex', gap: '20px' }}>
                {/* Message Sidebar */}
                <div className="messages-sidebar" style={{ width: '250px', flexShrink: 0 }}>
                    <button className="table-btn" style={{
                        width: '100%',
                        background: 'var(--color-primary-navy)',
                        color: 'white',
                        border: 'none',
                        padding: '12px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(11, 44, 107, 0.2)',
                        cursor: 'pointer'
                    }}>
                        + New Message
                    </button>

                    <div className="stu-info-card" style={{ padding: '0', background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '15px', color: 'var(--theme-text)', fontWeight: 'bold', borderBottom: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)' }}>Message Folders</div>
                        <div style={{ padding: '12px 15px', color: 'var(--color-accent-gold)', borderBottom: '1px solid var(--theme-border)', background: 'rgba(212, 175, 55, 0.05)', cursor: 'pointer', fontWeight: '600' }}>Inbox</div>
                        <div style={{ padding: '12px 15px', color: 'var(--theme-text)', borderBottom: '1px solid var(--theme-border)', cursor: 'pointer', transition: '0.2s' }}>Outbox</div>
                        <div style={{ padding: '12px 15px', color: 'var(--theme-text)', cursor: 'pointer', transition: '0.2s' }}>Drafts</div>
                    </div>
                </div>

                {/* Message Content */}
                <div className="stu-info-card" style={{ flex: 1, padding: '24px', background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', color: 'var(--theme-text)', fontWeight: 'bold', marginBottom: '8px' }}>No messages selected</div>
                        <div style={{ fontSize: '14px', color: 'var(--theme-text-muted)' }}>Choose a conversation from the sidebar or start a new one.</div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
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
