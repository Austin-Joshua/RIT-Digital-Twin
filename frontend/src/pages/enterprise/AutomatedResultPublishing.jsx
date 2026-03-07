import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LuCheckCircle, LuTriangleAlert, LuSend, LuActivity, LuTrendingUp } from 'react-icons/lu';

const DEPARTMENTS = [
    { name: 'Computer Science', progress: 100, status: 'READY', anomalies: 0 },
    { name: 'Information Technology', progress: 85, status: 'PENDING', anomalies: 2 },
    { name: 'Electronics Engineering', progress: 40, status: 'IN_PROGRESS', anomalies: 5 },
    { name: 'Mechanical Engineering', progress: 95, status: 'VERIFYING', anomalies: 1 },
];

const AutomatedResultPublishing = () => {
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);

    const handleVerify = () => {
        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            setVerified(true);
        }, 2000);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--theme-text)', margin: 0 }}>Result Publication Portal</h1>
                    <p style={{ color: 'var(--theme-text-muted)', margin: '4px 0 0' }}>Monitor faculty uploads and trigger global AI verification</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleVerify}
                        disabled={verifying}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: '1.5px solid var(--theme-border)', background: 'var(--card-bg)', color: 'var(--theme-text)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {verifying ? 'AI Scanning...' : <><LuActivity color="#3c8dbc" /> Run AI Audit</>}
                    </button>
                    <button
                        disabled={!verified}
                        style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: verified ? 'var(--color-primary-navy)' : '#ccc', color: 'white', fontWeight: '800', cursor: verified ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LuSend /> Publish Globally
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[
                    { label: 'Overall Progress', val: '82%', sub: '3/4 Depts Uploaded', icon: <LuTrendingUp color="#3c8dbc" /> },
                    { label: 'AI Anomaly Check', val: verified ? 'CLEAN' : 'PENDING', sub: verified ? '0 Critical Errors' : 'Requires Audit', icon: <LuCheckCircle color={verified ? '#16a34a' : '#ccc'} /> },
                    { label: 'Pending Signature', val: 'Principal', sub: 'Final sign-off required', icon: <LuTriangleAlert color="#ca8a04" /> }
                ].map(s => (
                    <div key={s.label} style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '24px' }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--theme-text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--theme-text)' }}>{s.val}</div>
                            <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>{s.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Department List */}
            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--theme-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LuActivity color="var(--color-primary-navy)" />
                    <span style={{ fontWeight: '700', color: 'var(--theme-text)' }}>Departmental Upload Status</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(11,44,107,0.05)', textAlign: 'left' }}>
                                {['Department', 'Progress', 'Status', 'AI Anomalies', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-primary-navy)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DEPARTMENTS.map((dept, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                    <td style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--theme-text)' }}>{dept.name}</td>
                                    <td style={{ padding: '16px 20px', width: '200px' }}>
                                        <div style={{ width: '100%', height: '8px', background: 'var(--theme-bg-muted)', borderRadius: '10px', overflow: 'hidden' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${dept.progress}%` }} style={{ height: '100%', background: dept.progress === 100 ? '#16a34a' : '#3c8dbc' }} />
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '30px', fontSize: '10px', fontWeight: '800',
                                            background: dept.status === 'READY' ? 'rgba(22,163,74,0.1)' : 'rgba(202,138,4,0.1)',
                                            color: dept.status === 'READY' ? '#16a34a' : '#ca8a04'
                                        }}>{dept.status}</span>
                                    </td>
                                    <td style={{ padding: '16px 20px', color: dept.anomalies > 0 ? '#dc2626' : 'var(--theme-text)', fontWeight: '700' }}>
                                        {dept.anomalies > 0 ? <><LuTriangleAlert size={12} /> {dept.anomalies} Issues</> : 'No Anomaly'}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <button style={{ background: 'transparent', border: 'none', color: '#3c8dbc', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Review Data</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AutomatedResultPublishing;
