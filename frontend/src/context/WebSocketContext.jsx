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

export const WebSocketProvider = ({ children }) => {
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        const wsUrl = baseUrl.replace('/api', '') + '/ws';

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('STOMP Connected: ' + frame);
            setConnected(true);
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.onWebSocketClose = () => {
            setConnected(false);
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, []);

    const subscribe = (destination, callback) => {
        if (!stompClient || !connected) return null;
        return stompClient.subscribe(destination, (message) => {
            callback(JSON.parse(message.body));
        });
    };

    const publish = (destination, body) => {
        if (!stompClient || !connected) return;
        stompClient.publish({
            destination: destination,
            body: JSON.stringify(body)
        });
    };

    return (
        <WebSocketContext.Provider value={{ subscribe, publish, connected }}>
            {children}
        </WebSocketContext.Provider>
    );
};
