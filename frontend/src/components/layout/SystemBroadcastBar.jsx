import React, { useState, useEffect } from 'react';
import { FaBullhorn, FaTimes, FaCircle } from 'react-icons/fa';
import { useWebSocket } from '../../hooks/WebSocketContext';
import api from '../../services/api';
import './SystemBroadcastBar.css';

const SystemBroadcastBar = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [broadcast, setBroadcast] = useState(null);
    const { subscribe } = useWebSocket();

    useEffect(() => {
        let isMounted = true;
        api.get('/broadcasts/active')
            .then((res) => {
                if (!isMounted) return;
                const list = Array.isArray(res.data) ? res.data : [];
                const activeBroadcast = list.find((b) => b.active && !sessionStorage.getItem(`read_broadcast_${b.id}`));
                if (activeBroadcast) {
                    setBroadcast(activeBroadcast);
                    setIsVisible(true);
                }
            })
            .catch(() => {
                // Fail closed on network failure or unauthorized access
            });

        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        const sub = subscribe('/topic/broadcasts', (data) => {
            if (data && data.title && !sessionStorage.getItem(`read_broadcast_${data.id}`)) {
                setBroadcast(data);
                setIsVisible(true);
            }
        });

        return () => {
            sub?.unsubscribe();
        };
    }, [subscribe]);

    const handleDismiss = () => {
        if (broadcast?.id) {
            sessionStorage.setItem(`read_broadcast_${broadcast.id}`, 'true');
        }
        setIsVisible(false);
    };

    if (!isVisible || !broadcast) return null;

    return (
        <div className={`system-broadcast-bar ${broadcast.priority || 'info'}`}>
            <div className="broadcast-content">
                <FaBullhorn className="broadcast-icon pulse" />
                <span className="broadcast-text">
                    <strong>{broadcast.title}:</strong> {broadcast.message}
                </span>
                {broadcast.isLive && (
                    <div className="live-indicator">
                        <FaCircle className="live-dot" />
                        LIVE
                    </div>
                )}
            </div>
            <button className="broadcast-close" onClick={handleDismiss} title="Dismiss">
                <FaTimes />
            </button>
        </div>
    );
};

export default SystemBroadcastBar;
