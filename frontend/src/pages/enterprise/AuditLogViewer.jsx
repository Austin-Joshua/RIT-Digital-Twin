import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { auditApi } from '../../services/enterpriseApi';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await auditApi.getAuditLogs(page, 20);
                setLogs(res.data.content);
                setTotalPages(res.data.totalPages);
            } catch (error) {
                console.error("Failed to fetch audit logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [page]);

    return (
        <div className="ims-page-container">
            {/* Header Banner */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <span style={{ fontSize: '20px' }}>📋</span>
                    </div>
                    <div>
                        <h1 className="ims-header-title">System Audit Logs</h1>
                        <p className="ims-header-subtitle">AOP-driven immutable record of all institutional database mutations</p>
                    </div>
                </div>
                <span className="ims-candy-badge" style={{ background: 'rgba(11,44,107,0.08)', color: 'var(--theme-brand-strong)' }}>
                    Enterprise Audit Active
                </span>
            </div>

            <div className="ims-card-elevated" style={{ overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--theme-brand-strong)' }}>Loading secure logs...</div>
                ) : (
                    <>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-light)' }}>
                                    <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Timestamp</th>
                                    <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Action</th>
                                    <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Affected Entity</th>
                                    <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Entity ID</th>
                                    <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>User Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                                        <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                        <td style={{ padding: '12px', color: log.action.includes('delete') ? '#EF4444' : '#3B82F6', fontWeight: '500' }}>{log.action.toUpperCase()}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.entityName}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{log.entityId || '-'}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.userEmail}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No audit logs found.</td></tr>
                                )}
                            </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                            <button
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-primary)', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                            >
                                Previous
                            </button>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Page {page + 1} of {Math.max(1, totalPages)}</span>
                            <button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-primary)', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogViewer;
