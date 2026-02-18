import React, { useState } from 'react';
import api from '../services/api';

const ClassroomAllocation = () => {
    const [studentCount, setStudentCount] = useState(60);
    const [result, setResult] = useState(null);

    const handleSimulate = async () => {
        try {
            const res = await api.post(`/simulation/classroom-allocation?studentCount=${studentCount}`);
            setResult(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Smart Classroom Allocation</h2>
            <div className="rit-card">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                    <label>Expected Student Count:</label>
                    <input
                        type="number"
                        value={studentCount}
                        onChange={(e) => setStudentCount(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button className="rit-primary-btn" onClick={handleSimulate}>Run Allocation Engine</button>
                </div>

                {result && (
                    <div>
                        <h4>Simulation Results</h4>
                        <p>Status: <span style={{ color: 'green', fontWeight: 'bold' }}>{result.status}</span></p>
                        <p>Suitable Classrooms Found: {result.suitableClassrooms}</p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Name</th>
                                    <th style={{ padding: '10px' }}>Capacity</th>
                                    <th style={{ padding: '10px' }}>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.allocatedClassrooms.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{c.name}</td>
                                        <td style={{ padding: '10px' }}>{c.capacity}</td>
                                        <td style={{ padding: '10px' }}>{c.isSmartClass ? 'Smart Class' : 'Standard'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassroomAllocation;
