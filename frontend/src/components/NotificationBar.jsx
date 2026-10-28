import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell } from 'react-icons/fa';
import { getSockJsEndpoint } from '../utils/websocketUrls';

const DEFAULT_NOTIFICATIONS = [
    { title: 'Class Committee MOM Has Been Generated', link: '/student/committee/minutes' },
    { title: 'Class Committee Schedule Has Been Modified', link: '/student/committee/schedule' },
    { title: 'Class Committee MOM Has Been Generated', link: '/student/committee/minutes' },
    { title: 'Class Committee MOM Has Been Generated', link: '/student/committee/minutes' },
    { title: 'Class Committee Has Been Scheduled', link: '/student/committee/schedule' },
];

const NotificationBar = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(getSockJsEndpoint('/ws-notifications')),
            onConnect: () => {
                client.subscribe('/topic/global', (message) => {
                    try {
                        const notif = JSON.parse(message.body);
                        setNotifications(prev => [notif, ...prev]);
                    } catch (_) {}
                });

                client.subscribe(`/user/${user.userId}/topic/notifications`, (message) => {
                    try {
                        const notif = JSON.parse(message.body);
                        setNotifications(prev => [notif, ...prev]);
                    } catch (_) {}
                });
            }
        });

        client.activate();
        return () => client.deactivate();
    }, [user]);

    // Handle clicks outside dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                className="stu-topbar-icon-btn"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none', border: 'none', fontSize: '18px',
                    cursor: 'pointer', color: '#6c757d',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', width: '36px', height: '36px', borderRadius: '4px'
                }}
                title="Notifications"
            >
                <FaBell style={{ fontSize: '18px' }} />
                {notifications.length > 0 && (
                    <span style={{
                        position: 'absolute', top: '4px', right: '4px',
                        width: '7px', height: '7px',
                        background: '#007bff', borderRadius: '50%'
                    }} />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98, y: 4 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute', top: '40px', right: '-10px', width: '280px',
                            background: '#ffffff', borderRadius: '16px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                            border: '1px solid #e2e8f0', zIndex: 9999, overflow: 'hidden'
                        }}
                    >
                        <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '16px', textAlign: 'center', color: '#6c757d', fontSize: '13px' }}>
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((notif, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
                                            cursor: 'pointer', transition: 'background 0.15s',
                                            background: '#ffffff'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                                        onClick={() => {
                                            if (notif.link) window.location.href = notif.link;
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div style={{ fontSize: '12.5px', color: '#007bff', lineHeight: 1.4, fontWeight: 500 }}>
                                            {notif.title || notif.message}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBar;
