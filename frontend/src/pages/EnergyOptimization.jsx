import React, { useState } from 'react';
import api from '../services/api';

const EnergyOptimization = () => {
    const [result, setResult] = useState(null);

    const handleOptimize = async () => {
        try {
            const res = await api.post('/simulation/energy-optimization');
            setResult(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Energy Efficiency Module</h2>
            <div className="rit-card">
                <button className="rit-accent-btn" onClick={handleOptimize}>Run Optimization Algorithm</button>
            </div>

            {result && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div className="rit-card">
                        <h3>Potential Savings</h3>
                        <div style={{ fontSize: '3em', color: 'var(--rit-gold)', fontWeight: 'bold' }}>
                            {result.savingsPercentage}
                        </div>
                        <p>Optimized from {result.currentDailyConsumption} kWh to {result.optimizedConsumption} kWh</p>
                    </div>
                    <div className="rit-card">
                        <h3>Recommendations</h3>
                        <ul>
                            {result.recommendations.map((rec, idx) => (
                                <li key={idx} style={{ marginBottom: '10px' }}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnergyOptimization;
