import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { academicAiApi } from '../../services/enterpriseApi';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const WhatIfSimulator = () => {
    const { user } = useAuth();
    const [currentCredits, setCurrentCredits] = useState(80);
    const [targetGrades, setTargetGrades] = useState({ 1: 9, 2: 8, 3: 10 }); // Mock Subject ID to Grade points mapping
    const [projected, setProjected] = useState(null);

    const handleSimulate = async () => {
        try {
            // Mocking subjectId 1 for now since we haven't loaded subjects into state
            const studentId = user?.id || 1; // Retrieve genuine student ID assuming tied to auth context
            const res = await academicAiApi.simulateCGPA(studentId, currentCredits, { 1: targetGrades[1], 2: targetGrades[2] });
            setProjected(res.data);
        } catch (error) {
            console.error("Simulation failed", error);
            // Fallback mock simulation for UI testing
            setProjected(8.75);
        }
    };

    const mockData = [
        { name: 'Current Progress', value: 8.2, color: 'var(--color-primary-navy)' },
        { name: 'Projected Gap', value: projected ? Math.max(0, projected - 8.2) : 0, color: 'var(--color-accent-gold)' }
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>What-If CGPA Simulator</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Dynamically calculate your projected graduation footprint based on target grades.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '24px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Set Target Objectives</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Current Completed Credits</label>
                            <input type="number" value={currentCredits} onChange={(e) => setCurrentCredits(parseInt(e.target.value))} style={{ width: '100%', padding: '12px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Database Management Systems (Subject 1) Target Grade</label>
                            <select value={targetGrades[1]} onChange={(e) => setTargetGrades({ ...targetGrades, 1: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                                <option value="10">O (10)</option><option value="9">A+ (9)</option><option value="8">A (8)</option><option value="7">B+ (7)</option><option value="6">B (6)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Operating Systems (Subject 2) Target Grade</label>
                            <select value={targetGrades[2]} onChange={(e) => setTargetGrades({ ...targetGrades, 2: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                                <option value="10">O (10)</option><option value="9">A+ (9)</option><option value="8">A (8)</option><option value="7">B+ (7)</option><option value="6">B (6)</option>
                            </select>
                        </div>

                        <button onClick={handleSimulate} style={{ padding: '14px', borderRadius: '8px', border: 'none', background: 'var(--color-primary-navy)', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                            Run AI Simulation Engine
                        </button>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-primary)', alignSelf: 'flex-start' }}>Result Timeline</h3>

                    {projected ? (
                        <AnimatePresence>
                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', height: '250px', position: 'relative' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={mockData} innerRadius={60} outerRadius={90} dataKey="value" startAngle={180} endAngle={0} >
                                            {mockData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-accent-gold)' }}>{projected.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Projected CGPA</div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div style={{ color: 'var(--text-secondary)', opacity: 0.6, fontSize: '0.9rem' }}>Awaiting grading parameters to render timeline visualization.</div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default WhatIfSimulator;
