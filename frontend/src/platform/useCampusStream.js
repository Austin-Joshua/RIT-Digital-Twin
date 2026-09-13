import { useCallback, useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../hooks/WebSocketContext';
import { useAuth } from '../hooks/AuthContext';
import { normalizeRole } from './navCatalog';
import twinService from '../services/twinService';

const OPERATIONAL = new Set(['ADMIN', 'HOD', 'FACULTY']);

export function useCampusStream(onState) {
    const { connected, subscribe } = useWebSocket();
    const { user } = useAuth();
    const enabled = OPERATIONAL.has(normalizeRole(user?.role));
    const onStateRef = useRef(onState);
    useEffect(() => {
        onStateRef.current = onState;
    }, [onState]);
    const [status, setStatus] = useState(enabled ? 'connecting' : 'restricted');
    const [revision, setRevision] = useState(0);

    const accept = useCallback((envelope) => {
        if (!envelope || typeof envelope !== 'object') return;
        onStateRef.current(envelope);
        setRevision(envelope.revision || Date.now());
    }, []);

    useEffect(() => {
        if (!enabled) {
            const frame = requestAnimationFrame(() => setStatus('restricted'));
            return () => cancelAnimationFrame(frame);
        }
        if (!connected) {
            const frame = requestAnimationFrame(() => setStatus('offline'));
            return () => cancelAnimationFrame(frame);
        }
        const subscription = subscribe('/topic/campus/state', accept);
        const frame = requestAnimationFrame(() => setStatus('connected'));
        return () => {
            cancelAnimationFrame(frame);
            subscription.unsubscribe();
        };
    }, [accept, connected, enabled, subscribe]);

    useEffect(() => {
        if (!enabled || connected) return undefined;
        const timer = setInterval(() => {
            twinService.getCampusState().then((response) => accept(response.data)).catch(() => {});
        }, 90000);
        return () => clearInterval(timer);
    }, [accept, connected, enabled]);

    return { status, revision, enabled };
}
