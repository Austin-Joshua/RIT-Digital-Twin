import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};

/**
 * Get WebSocket URL based on environment
 * Supports both local development and Vercel deployment
 */
const getWebSocketURL = () => {
    if (import.meta.env.VITE_WEBSOCKET_URL) {
        return import.meta.env.VITE_WEBSOCKET_URL;
    }
    const base = import.meta.env.VITE_BACKEND_URL;
    if (base) {
        return base.replace(/\/$/, '') + '/ws';
    }
    // When on Vercel, use production backend so WebSocket connects
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        return 'https://roguish-christee-cnemial.ngrok-free.dev/ws';
    }
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const baseUrl = (apiUrl || '').replace(/\/api\/?$/, '') || 'http://localhost:8080';
    return `${baseUrl}/ws`;
};

export const WebSocketProvider = ({ children }) => {
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const wsUrl = getWebSocketURL();
        
        console.log(`[WebSocket] Connecting to: ${wsUrl}`);

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            // Enable better debugging in development
            debug: (msg) => {
                if (import.meta.env.DEV) {
                    console.log(`[WebSocket Debug] ${msg}`);
                }
            }
        });

        client.onConnect = (frame) => {
            console.log('[WebSocket] Connected:', frame);
            setConnected(true);
        };

        client.onStompError = (frame) => {
            console.error('[WebSocket] Error:', frame.headers['message']);
            console.error('[WebSocket] Details:', frame.body);
            setConnected(false);
        };

        client.onWebSocketClose = () => {
            console.warn('[WebSocket] Connection closed');
            setConnected(false);
        };

        client.onWebSocketError = (event) => {
            console.error('[WebSocket] WebSocket error:', event);
            setConnected(false);
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
                setConnected(false);
            }
        };
    }, []);

    const publish = (destination, message) => {
        if (stompClient && connected) {
            stompClient.publish({
                destination,
                body: JSON.stringify(message),
            });
        } else {
            console.warn('[WebSocket] Cannot publish - not connected');
        }
    };

    const subscribe = (destination, callback) => {
        if (stompClient && connected) {
            return stompClient.subscribe(destination, (message) => {
                callback(JSON.parse(message.body));
            });
        } else {
            console.warn('[WebSocket] Cannot subscribe - not connected');
            return null;
        }
    };

    return (
        <WebSocketContext.Provider value={{ stompClient, connected, publish, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
};
