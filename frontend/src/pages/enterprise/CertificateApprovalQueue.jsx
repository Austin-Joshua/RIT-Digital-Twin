import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuFileSignature, LuCheckCircle, LuXCircle, LuShieldCheck, LuSearch, LuFilter } from 'react-icons/lu';

const REQUESTS = [
    { id: '101', student: 'Aakash S', type: 'Bonafide', date: '2026-03-05', attendance: 88, feeClear: true, risk: 'LOW' },
    { id: '102', student: 'Sneha R', type: 'Course Completion', date: '2026-03-06', attendance: 72, feeClear: true, risk: 'MEDIUM' },
    { id: '103', student: 'Vikram K', type: 'Fee Receipt', date: '2026-03-06', attendance: 95, feeClear: false, risk: 'HIGH' },
    { id: '104', student: 'Priya M', type: 'Transfer Cert', date: '2026-03-07', attendance: 92, feeClear: true, risk: 'LOW' },
];

const CertificateApprovalQueue = () => {
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState('');

    const toggleSelect = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--theme-text)', margin: 0 }}>Certificate Queue</h1>
                    <p style={{ color: 'var(--theme-text-muted)', margin: '4px 0 0' }}>Batch process document requests with automated compliance checks</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <AnimatePresence>
                        {selected.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#16a34a', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <LuShieldCheck /> Approve {selected.length} Selected
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1.5px solid var(--theme-border)', background: 'var(--card-bg)', color: 'var(--theme-text)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LuFileSignature color="var(--color-primary-navy)" /> Manual Override
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
                    <LuSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--theme-text-muted)' }} />
                    <input
                        placeholder="Search student or certificate..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', outline: 'none' }} />
                </div>
                <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--card-bg)', color: 'var(--theme-text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                    <LuFilter size={16} /> Filter
                </button>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(11,44,107,0.06)', textAlign: 'left' }}>
                                <th style={{ padding: '14px 20px', width: '40px' }}><input type="checkbox" /></th>
                                {['Student', 'Request Type', 'Applied On', 'Compliance (AI)', 'Risk', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-primary-navy)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {REQUESTS.map((req, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--theme-border)', transition: 'background 0.2s' }} className="hover:bg-muted">
                                    <td style={{ padding: '16px 20px' }}>
                                        <input type="checkbox" checked={selected.includes(req.id)} onChange={() => toggleSelect(req.id)} />
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--theme-text)' }}>{req.student}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>ID: {req.id}</div>
                                    </td>
                                    <td style={{ padding: '16px 20px', color: 'var(--theme-text)' }}>{req.type}</td>
                                    <td style={{ padding: '16px 20px', fontSize: '12px' }}>{req.date}</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', color: req.attendance >= 75 ? '#16a34a' : '#dc2626' }}>
                                                {req.attendance >= 75 ? <LuCheckCircle size={12} /> : <LuXCircle size={12} />} Att: {req.attendance}%
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', color: req.feeClear ? '#16a34a' : '#dc2626' }}>
                                                {req.feeClear ? <LuCheckCircle size={12} /> : <LuXCircle size={12} />} Fees Clear
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '30px', fontSize: '10px', fontWeight: '800',
                                            background: req.risk === 'LOW' ? 'rgba(22,163,74,0.12)' : (req.risk === 'MEDIUM' ? 'rgba(202,138,4,0.12)' : 'rgba(220,38,38,0.12)'),
                                            color: req.risk === 'LOW' ? '#16a34a' : (req.risk === 'MEDIUM' ? '#ca8a04' : '#dc2626')
                                        }}>{req.risk}</span>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <button style={{ color: 'var(--color-primary-navy)', background: 'transparent', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}>Details</button>
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

export default CertificateApprovalQueue;
