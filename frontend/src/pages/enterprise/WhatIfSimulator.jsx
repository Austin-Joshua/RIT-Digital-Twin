import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, Tooltip } from 'recharts';
import { LuCalculator, LuTrendingUp, LuRefreshCw, LuPlus, LuTrash2 } from 'react-icons/lu';
import { academicAiApi } from '../../services/enterpriseApi';
import { useAuth } from '../../context/AuthContext';

const GRADE_OPTIONS = [
    { label: 'O  (Outstanding) — 10', value: 10 },
    { label: 'A+ (Excellent) — 9', value: 9 },
    { label: 'A  (Very Good) — 8', value: 8 },
    { label: 'B+ (Good) — 7', value: 7 },
    { label: 'B  (Average) — 6', value: 6 },
    { label: 'C  (Satisfactory) — 5', value: 5 },
    { label: 'U  (Fail) — 0', value: 0 },
];

const gradeBadge = (gpa) => {
    if (gpa >= 9) return { label: 'Outstanding', color: '#16a34a' };
    if (gpa >= 8) return { label: 'Excellent', color: '#3c8dbc' };
    if (gpa >= 7) return { label: 'Good', color: '#ca8a04' };
    if (gpa >= 6) return { label: 'Average', color: '#f97316' };
    return { label: 'At Risk', color: '#dc2626' };
};

const DEFAULT_SUBJECTS = [
    { name: 'Database Management Systems', credits: 4, grade: 9 },
    { name: 'Operating Systems', credits: 4, grade: 8 },
    { name: 'Computer Networks', credits: 3, grade: 9 },
];

const inputStyle = {
    padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--theme-border)',
    background: 'var(--card-bg)', color: 'var(--theme-text)', fontSize: '14px',
    outline: 'none', width: '100%', boxSizing: 'border-box',
};

const WhatIfSimulator = () => {
    const { user } = useAuth();
    const [completedCredits, setCompletedCredits] = useState(80);
    const [currentCGPA, setCurrentCGPA] = useState(8.20);
    const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
    const [projected, setProjected] = useState(null);
    const [simulating, setSimulating] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const calcLocal = () => {
        const semCredits = subjects.reduce((s, x) => s + Number(x.credits), 0);
        if (semCredits === 0) return currentCGPA;
        const semGPA = subjects.reduce((s, x) => s + Number(x.credits) * Number(x.grade), 0) / semCredits;
        const total = completedCredits + semCredits;
        return ((currentCGPA * completedCredits) + (semGPA * semCredits)) / total;
    };

    const handleSimulate = async () => {
        setSimulating(true);
        try {
            const studentId = user?.id || 1;
            const gradeMap = subjects.reduce((acc, s, i) => { acc[i + 1] = Number(s.grade); return acc; }, {});
            const res = await academicAiApi.simulateCGPA(studentId, completedCredits, gradeMap);
            setProjected(typeof res.data === 'number' ? res.data : calcLocal());
        } catch {
            setProjected(calcLocal());
        } finally {
            setSimulating(false);
        }
    };

    const updateSubject = (idx, field, val) => {
        setSubjects(s => s.map((x, i) => i === idx ? { ...x, [field]: val } : x));
        setProjected(null);
    };

    const addSubject = () => {
        setSubjects(s => [...s, { name: '', credits: 3, grade: 8 }]);
    };

    const removeSubject = (idx) => {
        setSubjects(s => s.filter((_, i) => i !== idx));
        setProjected(null);
    };

    const badge = projected ? gradeBadge(projected) : null;
    const chartData = projected ? [{ name: 'CGPA', value: projected, fill: badge.color }] : [];

    return (
        <div style={{ padding: '24px', maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--color-primary-navy)', borderRadius: '10px', padding: '10px', color: 'white', fontSize: '20px', display: 'flex' }}>
                    <LuCalculator />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--theme-text)' }}>CGPA Simulator</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-text-muted)' }}>Project your CGPA by entering upcoming semester grades</p>
                </div>
            </div>

            <div style={{
                display: isMobile ? 'flex' : 'grid',
                flexDirection: isMobile ? 'column' : 'row',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
                gap: '24px'
            }}>

                {/* Left: Input Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Base Inputs */}
                    <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '14px', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 18px', fontSize: '15px', fontWeight: '700', color: 'var(--theme-text)' }}>Current Academic Standing</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--theme-text-muted)' }}>Credits Completed</label>
                                <input type="number" min="0" max="200" value={completedCredits}
                                    onChange={e => { setCompletedCredits(Number(e.target.value)); setProjected(null); }}
                                    style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--theme-text-muted)' }}>Current CGPA</label>
                                <input type="number" min="0" max="10" step="0.01" value={currentCGPA}
                                    onChange={e => { setCurrentCGPA(Number(e.target.value)); setProjected(null); }}
                                    style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Subject Rows */}
                    <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '14px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--theme-text)' }}>Upcoming Subjects</h3>
                            <button onClick={addSubject} style={{
                                background: 'rgba(11,44,107,0.1)', border: 'none', borderRadius: '8px',
                                padding: '7px 14px', cursor: 'pointer', color: 'var(--color-primary-navy)', fontWeight: '700',
                                fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                                <LuPlus /> Add Subject
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {subjects.map((sub, idx) => (
                                <div key={idx} style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 90px 160px 36px',
                                    gap: '12px', alignItems: 'end',
                                    padding: '16px', background: 'rgba(11,44,107,0.04)',
                                    borderRadius: '12px', border: '1px solid var(--theme-border)',
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--theme-text-muted)', textTransform: 'uppercase' }}>Subject Name</label>
                                        <input value={sub.name} placeholder="e.g. Data Structures" onChange={e => updateSubject(idx, 'name', e.target.value)} style={inputStyle} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--theme-text-muted)', textTransform: 'uppercase' }}>Credits</label>
                                        <input type="number" min="1" max="6" value={sub.credits} onChange={e => updateSubject(idx, 'credits', e.target.value)} style={inputStyle} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--theme-text-muted)', textTransform: 'uppercase' }}>Target Grade</label>
                                        <select value={sub.grade} onChange={e => updateSubject(idx, 'grade', e.target.value)} style={inputStyle}>
                                            {GRADE_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                        </select>
                                    </div>
                                    <button onClick={() => removeSubject(idx)} disabled={subjects.length === 1}
                                        style={{
                                            background: 'rgba(220,38,38,0.08)', border: 'none', borderRadius: '8px', padding: '10px',
                                            cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            opacity: subjects.length === 1 ? 0.3 : 1,
                                            position: isMobile ? 'absolute' : 'static',
                                            top: isMobile ? '10px' : 'auto',
                                            right: isMobile ? '10px' : 'auto'
                                        }}>
                                        <LuTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button onClick={handleSimulate} disabled={simulating} style={{
                            marginTop: '20px', width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                            background: simulating ? '#ccc' : 'var(--color-primary-navy)', color: 'white',
                            fontWeight: '700', fontSize: '15px', cursor: simulating ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
                        }}>
                            {simulating ? <><LuRefreshCw style={{ animation: 'spin 1s linear infinite' }} /> Calculating...</> : <><LuTrendingUp /> Simulate Projected CGPA</>}
                        </button>
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </div>
                </div>

                {/* Right: Result Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                        background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '14px',
                        padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                        minHeight: isMobile ? 'auto' : '320px', justifyContent: 'center', position: isMobile ? 'static' : 'sticky', top: '80px'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--theme-text)', alignSelf: 'flex-start' }}>Projection Result</h3>

                        <AnimatePresence mode="wait">
                            {projected ? (
                                <motion.div key="result" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', textAlign: 'center' }}>
                                    <div style={{ height: '200px', position: 'relative' }}>
                                        <ResponsiveContainer>
                                            <RadialBarChart cx="50%" cy="65%" innerRadius="70%" outerRadius="90%" barSize={14} data={chartData} startAngle={180} endAngle={0}>
                                                <PolarAngleAxis type="number" domain={[0, 10]} angleAxisId={0} tick={false} />
                                                <RadialBar dataKey="value" cornerRadius={8} />
                                                <Tooltip formatter={v => v.toFixed(2)} />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2.8rem', fontWeight: '900', color: badge.color, lineHeight: 1 }}>{projected.toFixed(2)}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)', marginTop: '4px' }}>Projected CGPA</div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '16px', display: 'inline-block', background: badge.color, color: 'white', padding: '5px 18px', borderRadius: '30px', fontWeight: '700', fontSize: '13px' }}>
                                        {badge.label}
                                    </div>

                                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center' }}>
                                        <div style={{ background: 'rgba(11,44,107,0.06)', borderRadius: '10px', padding: '12px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--theme-text)' }}>{currentCGPA.toFixed(2)}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', fontWeight: '600' }}>CURRENT</div>
                                        </div>
                                        <div style={{ background: 'rgba(11,44,107,0.06)', borderRadius: '10px', padding: '12px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: '800', color: (projected - currentCGPA) >= 0 ? '#16a34a' : '#dc2626' }}>
                                                {(projected - currentCGPA) >= 0 ? '+' : ''}{(projected - currentCGPA).toFixed(2)}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', fontWeight: '600' }}>CHANGE</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', color: 'var(--theme-text-muted)', padding: '20px' }}>
                                    <LuCalculator style={{ fontSize: '48px', opacity: 0.3, marginBottom: '12px' }} />
                                    <p style={{ fontSize: '14px' }}>Enter your semester details and click <strong>Simulate</strong> to see your projected CGPA.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatIfSimulator;
