import { Link } from 'react-router-dom';

export default function MaintenanceModule() {
    return (
        <section className="space-y-4" style={{ padding: 'clamp(12px, 3vw, 24px)', maxWidth: 720 }}>
            <p className="campus-os-kicker">Operations · Maintenance</p>
            <h1 className="page-header">Maintenance</h1>
            <p style={{ color: 'var(--theme-text-muted)', lineHeight: 1.5 }}>
                Asset health is not scored here, and no maintenance cost is submitted from this page.
                Stored inventory is the resource list. An alert is raised only when an asset status text says it needs work.
            </p>
            <p>
                <Link to="/management/inventory">Open resources</Link>
                {' · '}
                <Link to="/?step=alerts">Open alerts</Link>
            </p>
        </section>
    );
}
