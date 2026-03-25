import React, { useState } from 'react';
import { academicAiApi } from '../../services/enterpriseApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaCalculator, FaChartLine } from 'react-icons/fa';

const CgpaSimulator = ({ studentId, currentCgpa }) => {
    const [expectedGrades, setExpectedGrades] = useState({});
    const [simulation, setSimulation] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        setLoading(true);
        try {
            const data = {
                studentId,
                currentCompletedCredits: 60, // Mock current credits
                expectedGrades: expectedGrades
            };
            const res = await academicAiApi.simulateCGPA(data);
            setSimulation(res.data);
        } catch (err) {
            console.error("Simulation failed", err);
        }
        setLoading(false);
    };

    const chartData = simulation ? [
        { name: 'Current', cgpa: simulation.currentCgpa },
        { name: 'Projected', cgpa: simulation.projectedCgpa }
    ] : [
        { name: 'Current', cgpa: currentCgpa },
        { name: 'Projected', cgpa: currentCgpa }
    ];

    return (
        <div className="stu-info-card" style={{ padding: '20px' }}>
            <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', border: 'none' }}>
                <FaCalculator style={{ color: '#0B2C6B' }} />
                What-if CGPA Simulator
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                <div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>Enter expected grade points (0-10) for your current subjects:</p>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                            type="number"
                            placeholder="Grade (e.g. 9)"
                            className="ims-input"
                            onChange={(e) => setExpectedGrades({ 1: parseInt(e.target.value) || 0 })} // Simplified for MVP
                        />
                        <button
                            className="ims-button primary"
                            onClick={handleSimulate}
                            disabled={loading}
                        >
                            {loading ? '...' : 'Simulate'}
                        </button>
                    </div>

                    {simulation && (
                        <div style={{ marginTop: '15px', padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Projected SGPA</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0B2C6B' }}>{simulation.projectedSgpa.toFixed(2)}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>Projected CGPA</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: simulation.trend === 'IMPROVING' ? '#10B981' : '#0B2C6B' }}>
                                {simulation.projectedCgpa.toFixed(2)}
                                <span style={{ fontSize: '0.75rem', marginLeft: '5px' }}>({simulation.trend})</span>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Area type="monotone" dataKey="cgpa" stroke="#0B2C6B" fill="#0B2C6B" fillOpacity={0.1} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default CgpaSimulator;
