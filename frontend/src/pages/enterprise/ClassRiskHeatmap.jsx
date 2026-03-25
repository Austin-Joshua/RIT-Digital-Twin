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
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--theme-text)', margin: 0 }}>Academic Performance Analytics</h1>
                    <p style={{ color: 'var(--theme-text-muted)', margin: '4px 0 0' }}>Performance clusters across the current batch</p>
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

                {/* Analysis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
