import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuUserPlus, LuUserMinus, LuZap, LuClock, LuBell, LuPlus } from 'react-icons/lu';

const ABSENT_FACULTY = [
    { name: 'Dr. Ramesh K', dept: 'CS', periods: ['P1', 'P4'], reason: 'Medical' },
    { name: 'Prof. Anitha S', dept: 'IT', periods: ['P2'], reason: 'External OD' },
];

const SUBSTITUTES = [
    { name: 'Prof. Senthil', load: 12, expertise: 'Data Structures', match: 95 },
    { name: 'Dr. Mary J', load: 15, expertise: 'Operating Systems', match: 88 },
    { name: 'Mr. Vignesh', load: 10, expertise: 'Programming', match: 82 },
];

const SubstitutionOverridePanel = () => {
    const [notifying, setNotifying] = useState(false);

    const handleNotify = () => {
        setNotifying(true);
        setTimeout(() => setNotifying(false), 2000);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--theme-text)', margin: 0 }}>Faculty Substitution Panel</h1>
                    <p style={{ color: 'var(--theme-text-muted)', margin: '4px 0 0' }}>AI-driven clash detection and substitution matching</p>
                </div>
                <button style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--color-primary-navy)', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(11,44,107,0.3)' }}>
                    <LuPlus /> Mark Bulk Absence
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1.2fr) 1fr', gap: '24px' }}>
                {/* Absent Faculty List */}
                <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--theme-border)', fontWeight: '800', color: 'var(--theme-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LuUserMinus color="#dc2626" /> Today's Absent Faculty
                    </div>
                    <div style={{ padding: '12px' }}>
                        {ABSENT_FACULTY.map((f, i) => (
                            <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '800', color: 'var(--theme-text)' }}>{f.name} ({f.dept})</span>
                                    <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(220,38,38,0.1)', color: '#dc2626', padding: '2px 8px', borderRadius: '4px' }}>{f.reason}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {f.periods.map(p => (
                                        <div key={p} style={{ fontSize: '10px', background: 'var(--card-bg)', border: '1px solid var(--theme-border)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', color: 'var(--theme-text-muted)' }}>
                                            <LuClock size={10} /> Period {p}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Suggestions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '16px', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--theme-border)', fontWeight: '800', color: 'var(--theme-text)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--theme-bg-muted)' }}>
                            <LuZap color="var(--color-accent-gold)" /> AI Top Matches for P1 (CS)
                        </div>
                        <div style={{ padding: '12px' }}>
                            {SUBSTITUTES.map((sub, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', border: '1px solid var(--theme-border)', marginBottom: '8px', background: i === 0 ? 'rgba(22,163,74,0.03)' : 'transparent' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--theme-text)' }}>{sub.name}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--theme-text-muted)' }}>Load: {sub.load} hrs/wk | {sub.expertise}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#16a34a' }}>{sub.match}% Match</div>
                                        <button onClick={handleNotify} style={{ marginTop: '4px', background: 'transparent', border: 'none', color: 'var(--theme-brand-strong)', fontWeight: '800', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <LuUserPlus size={14} /> {notifying ? 'Sending...' : 'Assign'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleNotify}
                        style={{ padding: '16px', borderRadius: '16px', border: 'none', background: '#3c8dbc', color: 'white', fontWeight: '800', fontSize: '13px', boxShadow: '0 8px 16px rgba(60,141,188,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <LuBell /> {notifying ? 'Processing...' : 'Notify All Substitutes via WhatsApp'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default SubstitutionOverridePanel;
