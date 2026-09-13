import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getSockJsEndpoint } from '../utils/websocketUrls';
import { useAuth } from './AuthContext';

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
const getWebSocketURL = () => getSockJsEndpoint('/ws');

export const WebSocketProvider = ({ children }) => {
    const { token } = useAuth();
    const clientRef = useRef(null);
    const pendingRef = useRef(new Map());
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token) {
            clientRef.current?.deactivate();
            clientRef.current = null;
            setConnected(false);
            return undefined;
        }

        const wsUrl = getWebSocketURL();
        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: { Authorization: `Bearer ${token}` },
            debug: (msg) => {
                if (import.meta.env.DEV) {
                    console.log(`[WebSocket Debug] ${msg}`);
                }
            }
        });

        client.onConnect = () => {
            setConnected(true);
            pendingRef.current.forEach((entry) => entry.attach());
        };
        client.onStompError = () => {
            pendingRef.current.forEach((entry) => { entry.subscription = null; });
            setConnected(false);
        };
        client.onWebSocketClose = () => {
            pendingRef.current.forEach((entry) => { entry.subscription = null; });
            setConnected(false);
        };
        client.onWebSocketError = () => setConnected(false);

        client.activate();
        clientRef.current = client;

        return () => {
            pendingRef.current.forEach((entry) => entry.subscription?.unsubscribe());
            pendingRef.current.forEach((entry) => { entry.subscription = null; });
            client.deactivate();
            clientRef.current = null;
            setConnected(false);
        };
    }, [token]);

    const publish = useCallback((destination, message) => {
        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.publish({
                destination,
                body: JSON.stringify(message),
            });
        }
    }, []);

    const subscribe = useCallback((destination, callback) => {
        const entry = { destination, callback, subscription: null, attach: () => {} };
        entry.attach = () => {
            if (!clientRef.current?.connected || entry.subscription) return;
            entry.subscription = clientRef.current.subscribe(destination, (message) => {
                try {
                    callback(JSON.parse(message.body));
                } catch {
                    // Ignore a malformed frame instead of breaking the socket.
                }
            });
        };
        pendingRef.current.set(entry, entry);
        entry.attach();
        return {
            unsubscribe() {
                entry.subscription?.unsubscribe();
                entry.subscription = null;
                pendingRef.current.delete(entry);
            }
        };
    }, []);

    const value = React.useMemo(() => ({ connected, publish, subscribe }), [connected, publish, subscribe]);

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
