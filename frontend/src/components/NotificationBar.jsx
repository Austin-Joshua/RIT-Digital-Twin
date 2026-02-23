import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell } from 'react-icons/fa';

const NotificationBar = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('/ws-notifications'),
            onConnect: () => {
                client.subscribe('/topic/global', (message) => {
                    const notif = JSON.parse(message.body);
                    setNotifications(prev => [notif, ...prev]);
                });

                client.subscribe(`/user/${user.userId}/topic/notifications`, (message) => {
                    const notif = JSON.parse(message.body);
                    setNotifications(prev => [notif, ...prev]);
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

    const dismissNotif = (idx) => {
        setNotifications(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none', border: 'none', fontSize: '20px',
                    cursor: 'pointer', color: 'rgba(255,255,255,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                }}
                title="Notifications"
            >
                <FaBell />
                {notifications.length > 0 && (
                    <span style={{
                        position: 'absolute', top: '-8px', right: '-8px',
                        background: '#ef4444', color: 'white', fontSize: '10px',
                        fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px'
                    }}>
                        {notifications.length}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute', top: '40px', right: '-10px', width: '300px',
                            background: 'var(--glass-bg, #ffffff)', backdropFilter: 'blur(10px)',
                            borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            border: '1px solid rgba(0,0,0,0.05)', zIndex: 9999,
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: '#f8fafc', fontWeight: 'bold', color: '#1e293b' }}>
                            Notifications
                        </div>
                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((notif, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)',
                                            color: '#333', cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            background: '#ffffff'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                        onClick={() => dismissNotif(idx)}
                                    >
                                        <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#0f172a' }}>{notif.title}</strong>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>{notif.message}</span>
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
