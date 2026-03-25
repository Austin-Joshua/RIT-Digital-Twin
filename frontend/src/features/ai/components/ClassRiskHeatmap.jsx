import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ClassRiskHeatmap = () => {
    // In a real scenario, this would fetch all students for the faculty's classes
    // Here we'll mock a 10x5 grid of students
    const [students, setStudents] = useState([]);

    useEffect(() => {
        // Mocking students with random risk levels for the heatmap
        const mockStudents = Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            name: `Student ${i + 1}`,
            risk: Math.random() > 0.8 ? 'HIGH' : (Math.random() > 0.6 ? 'MEDIUM' : 'LOW')
        }));
        setStudents(mockStudents);
    }, []);

    const getColor = (risk) => {
        if (risk === 'HIGH') return '#EF4444';
        if (risk === 'MEDIUM') return '#F59E0B';
        return '#10B981';
    };

    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginTop: '24px' }}>
            <h3 style={{ marginTop: 0, color: '#0B2C6B' }}>Class Academic Risk Heatmap</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Visual overview of student performance risk across your assigned sections.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '8px' }}>
                {students.map(s => (
                    <motion.div
                        key={s.id}
                        whileHover={{ scale: 1.2, zIndex: 10 }}
                        style={{
                            height: '40px',
                            background: getColor(s.risk),
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.65rem',
                            fontWeight: 'bold'
                        }}
                        title={`${s.name}: ${s.risk} RISK`}
                    >
                        {s.id}
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#10B981', borderRadius: '2px' }}></div> Low Risk
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#F59E0B', borderRadius: '2px' }}></div> Medium Risk
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#EF4444', borderRadius: '2px' }}></div> High Risk
                </div>
            </div>
        </div>
    );
};

export default ClassRiskHeatmap;
