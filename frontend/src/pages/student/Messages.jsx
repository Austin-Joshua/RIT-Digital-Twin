import React from 'react';

const Messages = () => {
    return (
        <div className="stu-report-page">
            <div style={{ fontSize: '14px', color: '#333', marginBottom: '15px' }}>All Messages</div>

            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Message Sidebar */}
                <div style={{ width: '230px', flexShrink: 0 }}>
                    <button className="table-btn" style={{
                        width: '100%',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '10px',
                        fontWeight: 'bold',
                        marginBottom: '15px'
                    }}>
                        New message
                    </button>

                    <div className="stu-info-card" style={{ padding: '0' }}>
                        <div style={{ padding: '12px 15px', color: '#007bff', fontWeight: 'bold', borderBottom: '1px solid #f4f4f4' }}>All Messages</div>
                        <div style={{ padding: '12px 15px', color: '#333', borderBottom: '1px solid #f4f4f4', cursor: 'pointer' }}>Inbox</div>
                        <div style={{ padding: '12px 15px', color: '#333', cursor: 'pointer' }}>Outbox</div>
                    </div>
                </div>

                {/* Message Content */}
                <div className="stu-info-card" style={{ flex: 1, padding: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#333' }}>You have no messages.</div>
                </div>
            </div>

            <div style={{ marginTop: '30px', color: '#777', fontSize: '12px' }}>
                © All rights reserved.
                <span style={{ float: 'right' }}><img src="https://picsum.photos/seed/rit/16/16" alt="RIT-IMS" /> RIT-IMS</span>
            </div>
        </div>
    );
};

export default Messages;
