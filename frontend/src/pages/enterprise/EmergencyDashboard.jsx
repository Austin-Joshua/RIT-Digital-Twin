import { Link } from 'react-router-dom';

export default function EmergencyDashboard() {
    return (
        <section className="space-y-4" style={{ padding: 'clamp(12px, 3vw, 24px)', maxWidth: 720 }}>
            <p className="campus-os-kicker">Operations · Safety</p>
            <h1 className="page-header">Safety</h1>
            <p style={{ color: 'var(--theme-text-muted)', lineHeight: 1.5 }}>
                No incident model is connected, so no evacuation index, response time, or building risk score is shown.
                Open alerts stay on the campus command surface, and they are raised only from stored conditions.
            </p>
            <p>
                <Link to="/?step=alerts">Open alerts</Link>
            </p>
        </section>
    );
}
