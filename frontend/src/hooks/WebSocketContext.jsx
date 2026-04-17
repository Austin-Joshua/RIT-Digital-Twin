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
 * Get WebSocket URL from env (Vercel → Environment Variables) or derive from API URL.
 */
const getWebSocketURL = () => {
    const base = import.meta.env.VITE_BACKEND_URL;
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const fallbackBase = (base && typeof base === 'string' && base.trim())
        ? base.trim()
        : ((apiUrl || '').replace(/\/api\/?$/, '') || 'http://localhost:8080');

    const normalizeWsCandidate = (candidate) => {
        if (!candidate || typeof candidate !== 'string' || !candidate.trim()) return null;
        let raw = candidate.trim();
        if (!/^https?:\/\//i.test(raw) && !/^wss?:\/\//i.test(raw)) {
            raw = `https://${raw}`;
        }
        let parsed;
        try {
            parsed = new URL(raw);
        } catch {
            return null;
        }

        if (!['http:', 'https:', 'ws:', 'wss:'].includes(parsed.protocol)) {
            return null;
        }

        if (parsed.protocol === 'http:') parsed.protocol = 'ws:';
        if (parsed.protocol === 'https:') parsed.protocol = 'wss:';
        parsed.pathname = parsed.pathname.replace(/\/+$/, '');
        if (!parsed.pathname.endsWith('/ws')) {
            parsed.pathname = `${parsed.pathname}/ws`.replace(/\/{2,}/g, '/');
        }
        return parsed.toString().replace(/\/$/, '');
    };

    const wsEnv = import.meta.env.VITE_WEBSOCKET_URL;
    const envUrl = normalizeWsCandidate(wsEnv);
    if (envUrl) return envUrl;
    return normalizeWsCandidate(fallbackBase) || 'ws://localhost:8080/ws';
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
