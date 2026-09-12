function RingStat({ label, value, center, sub, percent, color }) {
    const safe = Math.max(0, Math.min(100, Number(percent) || 0));
    const paid = typeof center === 'string' && center.includes('Paid');
    return (
        <article className="ims-stat-card">
            <div className="ims-ring" style={{ '--ring': color, '--pct': `${safe}%` }}>
                <span className={paid ? 'is-paid' : undefined}>{paid ? <>100%<br />Paid</> : center}</span>
            </div>
            <div className="ims-stat-info">
                <div className="ims-stat-label">{label}</div>
                <div className="ims-stat-value">{value}</div>
                {sub ? <div className="ims-stat-sub">{sub}</div> : null}
            </div>
        </article>
    );
}

export default RingStat;
