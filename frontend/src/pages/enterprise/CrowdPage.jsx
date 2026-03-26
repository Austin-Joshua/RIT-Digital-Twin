import React, { useState } from 'react';
import twinService from '../../services/twinService';

const CrowdPage = () => {
    const [buildingId, setBuildingId] = useState('1');
    const [occupancy, setOccupancy] = useState(500);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        setLoading(true);
        try {
            const response = await twinService.getCrowdDensity('MONDAY', '09:00');
            const data = response.data;
            if (data && data.length > 0) {
                const avgDensity = data.reduce((sum, item) => sum + item.value, 0) / data.length;
                setResult({
                    congestionLevel: avgDensity > 0.8 ? 'CRITICAL' : avgDensity > 0.5 ? 'HIGH' : 'STABLE',
                    estimatedEvacuationTimeMin: Math.round(avgDensity * 20) + 5,
                    readinessScore: Math.round((1 - avgDensity) * 100)
                });
            }
        } catch (_error) {
            console.error("Crowd simulation failed:", _error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="page-header">Crowd Flow & Emergency Simulation</h1>

            <div className="card max-w-3xl">
                <h3 className="section-header">Evacuation Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1 text-sm">Building Block</label>
                        <select
                            className="input-field"
                            value={buildingId}
                            onChange={(e) => setBuildingId(e.target.value)}
                        >
                            <option value="1">Main Block</option>
                            <option value="2">Science Block</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1 text-sm">Current Occupancy (People)</label>
                        <input
                            type="number"
                            className="input-field"
                            value={occupancy}
                            onChange={(e) => setOccupancy(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    onClick={handleSimulate}
                    className="w-full bg-red-600 text-white rounded-md px-4 py-2.5 hover:bg-red-700 font-medium transition-colors"
                >
                    Run Evacuation Simulation
                </button>
            </div>

            {result && (
                <div className={`card border-l-8 ${result.congestionLevel === 'CRITICAL' ? 'border-l-red-600' : 'border-l-green-600'}`}>
                    <h3 className="section-header !mb-3">Simulation Outcome</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Congestion Level</p>
                            <p className={`text-xl font-bold ${result.congestionLevel === 'CRITICAL' || result.congestionLevel === 'HIGH' ? 'text-red-600' : 'text-green-600'}`}>{result.congestionLevel}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Est. Evacuation Time</p>
                            <p className="text-xl font-bold text-navy-900">{result.estimatedEvacuationTimeMin} minutes</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Readiness Score</p>
                            <p className="text-xl font-bold text-navy-900">{result.readinessScore}/100</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrowdPage;
