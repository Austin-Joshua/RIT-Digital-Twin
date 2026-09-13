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
    onStateRef.current = onState;
    const [status, setStatus] = useState(enabled ? 'connecting' : 'restricted');
    const [revision, setRevision] = useState(0);

    const accept = useCallback((envelope) => {
        if (!envelope || typeof envelope !== 'object') return;
        onStateRef.current(envelope);
        setRevision(envelope.revision || Date.now());
    }, []);

    useEffect(() => {
        if (!enabled) {
            setStatus('restricted');
            return undefined;
        }
        if (!connected) {
            setStatus('offline');
            return undefined;
        }
        const subscription = subscribe('/topic/campus/state', accept);
        setStatus('connected');
        return () => subscription.unsubscribe();
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
