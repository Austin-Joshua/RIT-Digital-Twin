import { Link } from 'react-router-dom';

const EventsClubs = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold">Campus Events</h1>
        <p style={{ color: 'var(--theme-text-muted)', maxWidth: '40rem' }}>
            No event calendar is stored for this login. Club membership uses the stored club directory, not a sample list.
        </p>
        <p><Link to="/student/clubs">Open clubs</Link></p>
    </div>
);

export default EventsClubs;
