import React, { useEffect } from 'react';
import { useWebSocket } from '../hooks/WebSocketContext';
import { useToast } from '../hooks/ToastContext';

const BroadcastListener = () => {
    const { subscribe } = useWebSocket();
    const { addToast } = useToast();

    useEffect(() => {
        const subscription = subscribe('/topic/broadcasts', (packet) => {
            console.log("Received live broadcast: ", packet);
            // Display real-time toast
            addToast(packet.title + " - " + packet.message, 'info');
        });

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [subscribe, addToast]);

    return null; // pure headless background listener
};

export default BroadcastListener;
