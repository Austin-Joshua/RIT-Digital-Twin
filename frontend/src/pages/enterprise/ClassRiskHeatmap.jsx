import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { LuInfo, LuTriangleAlert, LuZap, LuTrendingDown } from 'react-icons/lu';

const DATA = [
    {
        name: 'At Risk (High)',
        children: [
            { name: 'Attendance < 65%', size: 12 },
            { name: 'Internal Marks < 40%', size: 8 },
            { name: 'Missing Assignments', size: 15 },
        ],
    },
    {
        name: 'Stable (Medium)',
        children: [
            { name: 'Consistency issues', size: 25 },
            { name: 'Borderline Marks', size: 30 },
        ],
    },
    {
        name: 'Excel (Low)',
        children: [
            { name: 'Top Performers', size: 45 },
            { name: '100% Attendance', size: 35 },
        ],
    },
];

const COLORS = ['#dc2626', '#ca8a04', '#16a34a'];

const ClassRiskHeatmap = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--theme-text)', margin: 0 }}>Class Risk AI Heatmap</h1>
                    <p style={{ color: 'var(--theme-text-muted)', margin: '4px 0 0' }}>Predictive performance clusters across the current batch</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card-bg)', padding: '6px 12px', borderRadius: '12px', border: '1.5px solid var(--theme-border)' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--theme-text-muted)', textTransform: 'uppercase' }}>AI Analysis</span>
                        <div style={{ width: '32px', height: '18px', background: '#16a34a', borderRadius: '10px', position: 'relative', cursor: 'pointer' }}>
                            <div style={{ position: 'absolute', right: '2px', top: '2px', width: '14px', height: '14px', background: 'white', borderRadius: '50%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                {/* Heatmap/Treemap */}
                <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--theme-border)', borderRadius: '16px', padding: '24px', minHeight: '400px' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '700', color: 'var(--theme-text)' }}>Student Performance Distribution</span>
                        <LuInfo color="var(--theme-text-muted)" />
                    </div>
                    <div style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={DATA}
                                dataKey="size"
                                stroke="#fff"
                                fill="var(--color-primary-navy)"
                            >
                                <Tooltip />
                            </Treemap>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Insights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: 'var(--color-primary-navy)', color: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 8px 20px rgba(11,44,107,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <LuZap color="var(--color-accent-gold)" /> <span style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '12px' }}>AI Intervention Plan</span>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                            Based on clustering, <b>15 students</b> in 'CSE-A' are at high risk of internal failure.
                            AI suggests scheduling a remedial session for <b>Data Structures</b> before 15th March.
                        </p>
                        <button style={{ marginTop: '16px', width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--color-accent-gold)', color: 'var(--color-primary-navy)', fontWeight: '800', cursor: 'pointer' }}>Generate Schedule</button>
                    </div>

                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)', padding: '20px', borderRadius: '16px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--theme-text)', marginBottom: '16px' }}>Risk Factors identified</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: 'Attendance Drop', val: '22%', icon: <LuTrendingDown color="#dc2626" /> },
                                { label: 'Assignment Delay', val: '15%', icon: <LuTriangleAlert color="#ca8a04" /> }
                            ].map(f => (
                                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--theme-text-muted)' }}>
                                        {f.icon} {f.label}
                                    </div>
                                    <span style={{ fontWeight: '800', color: 'var(--theme-text)' }}>{f.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ClassRiskHeatmap;
