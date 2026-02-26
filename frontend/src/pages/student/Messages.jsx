import React from 'react';

const Messages = () => {
    return (
        <div className="stu-report-page">
            <div style={{ fontSize: '14px', color: 'var(--text-primary, #333)', marginBottom: '15px' }}>All Messages</div>

            <div className="messages-layout" style={{ display: 'flex', gap: '20px' }}>
                {/* Message Sidebar */}
                <div className="messages-sidebar" style={{ width: '230px', flexShrink: 0 }}>
                    <button className="table-btn" style={{
                        width: '100%',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '10px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        borderRadius: '8px'
                    }}>
                        New Message
                    </button>

                    <div className="stu-info-card" style={{ padding: '0' }}>
                        <div style={{ padding: '12px 15px', color: '#007bff', fontWeight: 'bold', borderBottom: '1px solid var(--border-color, #f4f4f4)' }}>All Messages</div>
                        <div style={{ padding: '12px 15px', color: 'var(--text-primary, #333)', borderBottom: '1px solid var(--border-color, #f4f4f4)', cursor: 'pointer' }}>Inbox</div>
                        <div style={{ padding: '12px 15px', color: 'var(--text-primary, #333)', cursor: 'pointer' }}>Outbox</div>
                    </div>
                </div>

                {/* Message Content */}
                <div className="stu-info-card" style={{ flex: 1, padding: '15px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary, #777)', textAlign: 'center', padding: '40px 0' }}>You have no messages.</div>
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
