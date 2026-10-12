function RingStat({ label, value, center, sub, percent, color, isCounter }) {
    const safe = Math.max(0, Math.min(100, Number(percent) || 0));
    const paid = typeof center === 'string' && center.includes('Paid');
    const isZeroCounter = isCounter || (label === 'ARREARS' || label === 'Arrears');

    return (
        <article className="ims-stat-card">
            {isZeroCounter ? (
                <div className="ims-counter-box" style={{ width: '84px', height: '84px', display: 'grid', placeItems: 'center', fontSize: '1.4rem', fontWeight: '700', color: '#111827' }}>
                    <span>{center ?? '0'}</span>
                </div>
            ) : (
                <div className="ims-ring" style={{ '--ring': color, '--pct': `${safe}%` }}>
                    <span className={paid ? 'is-paid' : undefined}>{paid ? <>100%<br />Paid</> : center}</span>
                </div>
            )}
            <div className="ims-stat-info">
                <div className="ims-stat-label">{label}</div>
                <div className="ims-stat-value">{value}</div>
                {sub ? <div className="ims-stat-sub">{sub}</div> : null}
            </div>
        </article>
    );
}

export default RingStat;
