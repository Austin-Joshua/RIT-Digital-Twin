import React, { useState, useEffect } from 'react';
import { FaBullhorn, FaTimes, FaCircle } from 'react-icons/fa';
import './SystemBroadcastBar.css';

const SystemBroadcastBar = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [broadcast, setBroadcast] = useState(null);

    useEffect(() => {
        // Sync broadcast from localStorage (Admin can update this)
        const checkBroadcast = () => {
            const data = localStorage.getItem('rit_global_broadcast');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.active && !sessionStorage.getItem(`read_broadcast_${parsed.id}`)) {
                    setBroadcast(parsed);
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            }
        };

        checkBroadcast();
        window.addEventListener('storage', checkBroadcast);
        return () => window.removeEventListener('storage', checkBroadcast);
    }, []);

    const handleDismiss = () => {
        if (broadcast) {
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
