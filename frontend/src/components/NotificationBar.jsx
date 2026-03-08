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
                    cursor: 'pointer', color: 'var(--ims-icon-color)',
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
                            position: 'absolute', top: '45px', right: '-10px', width: '320px',
                            background: 'var(--card-bg)', borderRadius: '16px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            border: '1px solid var(--theme-border)', zIndex: 9999, overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            padding: '16px 20px',
                            background: '#0B2C6B',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: 'bold' }}>Notifications</span>
                            <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px' }}>
                                {notifications.length} New
                            </span>
                        </div>
                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--theme-text-muted)', fontSize: '14px' }}>
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((notif, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '16px', borderBottom: '1px solid var(--theme-border)',
                                            color: 'var(--theme-text)', cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            background: 'var(--card-bg)'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--theme-bg-muted)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card-bg)'; }}
                                        onClick={() => dismissNotif(idx)}
                                    >
                                        <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: 'var(--theme-text)' }}>{notif.title}</strong>
                                        <span style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>{notif.message}</span>
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
