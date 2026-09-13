import { useEffect, useState } from 'react';
import { workflowApi } from '../../services/enterpriseApi';

export default function CertificateApprovalQueue() {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [pendingId, setPendingId] = useState(null);

    const load = () => {
        setError('');
        workflowApi.listCertificateQueue()
            .then((response) => setRows(response.data || []))
            .catch(() => setError('Certificate requests could not be read.'));
    };

    useEffect(() => {
        load();
    }, []);

    const review = (id, status) => {
        setPendingId(id);
        workflowApi.reviewCertificate(id, status)
            .then((response) => {
                setRows((current) => current.map((row) => (row.id === id ? response.data : row)));
            })
            .catch(() => setError('That certificate decision was not stored.'))
            .finally(() => setPendingId(null));
    };

    return (
        <section className="space-y-4" style={{ padding: 'clamp(12px, 3vw, 24px)', maxWidth: 880 }}>
            <h1 className="page-header">Certificates</h1>
            <p style={{ color: 'var(--theme-text-muted)', lineHeight: 1.5 }}>
                Review stored student requests. Approval does not generate a PDF.
            </p>
            {error ? <p>{error}</p> : null}
            {rows.length === 0 && !error ? <p>No certificate requests are stored.</p> : null}
            {rows.length > 0 ? (
                <table className="stu-data-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Student record</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Type</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Review</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => {
                            const open = row.status === 'REQUESTED' || row.status === 'PENDING';
                            return (
                                <tr key={row.id}>
                                    <td style={{ padding: '8px' }}>{row.studentId}</td>
                                    <td style={{ padding: '8px' }}>{row.certificateType}</td>
                                    <td style={{ padding: '8px' }}>{row.status}</td>
                                    <td style={{ padding: '8px' }}>
                                        {open ? (
                                            <>
                                                <button type="button" disabled={pendingId === row.id} onClick={() => review(row.id, 'APPROVED')}>Approve</button>
                                                {' '}
                                                <button type="button" disabled={pendingId === row.id} onClick={() => review(row.id, 'REJECTED')}>Reject</button>
                                            </>
                                        ) : (
                                            <span>Reviewed. No PDF is stored.</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : null}
        </section>
    );
}
