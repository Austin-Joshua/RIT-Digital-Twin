import './foundation.css';

const COPY = {
    connected: 'Campus link open. Updates arrive when the timetable window or a stored simulation changes.',
    connecting: 'Opening the campus link.',
    offline: 'Campus link down. Showing the last record. A slow refresh continues.',
    restricted: 'Live campus state is not included for this role.',
};

export default function ConnectionStatus({ status = 'connecting' }) {
    return (
        <p className={`campus-link campus-link-${status}`} role="status">
            {COPY[status] || COPY.offline}
        </p>
    );
}
