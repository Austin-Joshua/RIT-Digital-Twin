import React, { useState } from 'react';
import api from '../services/api';

const TransportManager = () => {
    const [result, setResult] = useState(null);

    const analyze = async () => {
        try {
            const res = await api.post('/simulation/transport-optimization');
            setResult(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Transport Fleet Optimization</h2>
            <div className="rit-card">
                <p>Analyze bus routes for fuel efficiency and student coverage.</p>
                <button className="rit-primary-btn" onClick={analyze}>Analyze Routes</button>
            </div>

            {result && (
                <div className="rit-card">
                    <h3>Analysis Report</h3>
                    <div style={{ display: 'flex', gap: '40px', margin: '20px 0' }}>
                        <div>
                            <strong>Total Routes:</strong> {result.totalRoutes}
                        </div>
                        <div>
                            <strong>Efficient:</strong> <span style={{ color: 'green' }}>{result.efficientRoutes}</span>
                        </div>
                        <div>
                            <strong>Needs Review:</strong> <span style={{ color: 'red' }}>{result.inefficientRoutes}</span>
                        </div>
                    </div>
                    <h4>Optimization Suggestions:</h4>
                    <ul>
                        {result.suggestedMerges.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TransportManager;
