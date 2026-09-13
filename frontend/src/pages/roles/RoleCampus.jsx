import { useEffect, useState } from 'react';
import twinService from '../../services/twinService';
import { useCampusStream } from '../../platform/useCampusStream';
import CampusOS from '../admin/CampusOS';

export default function RoleCampus({ mapPath, simulationPath = null, decisionPath }) {
    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pulse, setPulse] = useState(false);

    const applyState = (envelope) => {
        if (!envelope?.command) return;
        setSnapshot({
            ...envelope.command,
            events: envelope.events,
            stream: envelope.stream,
            streamBecause: envelope.streamBecause,
            simulatedSources: envelope.simulatedSources,
        });
        setLoading(false);
        setError('');
        setPulse(true);
        window.setTimeout(() => setPulse(false), 700);
    };
    const stream = useCampusStream(applyState);

    const loadCommand = () => {
        setLoading(true);
        setError('');
        twinService.getCampusState()
            .then((response) => {
                if (!response.data?.command) {
                    setError('Campus records could not be read. No estimated picture is substituted.');
                    return;
                }
                applyState(response.data);
            })
            .catch(() => setError('Campus records could not be read. No estimated picture is substituted.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadCommand();
    }, []);

    return (
        <CampusOS
            snapshot={snapshot}
            loading={loading}
            error={error}
            onRefresh={loadCommand}
            linkStatus={stream.status}
            pulse={pulse}
            title="Campus state"
            mapPath={mapPath}
            simulationPath={simulationPath}
            decisionPath={decisionPath}
            showDemo={false}
            showAdminTools={false}
        />
    );
}
