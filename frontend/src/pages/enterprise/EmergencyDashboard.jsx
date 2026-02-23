import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaFire, FaUsers, FaExclamationCircle, FaChartLine } from 'react-icons/fa';
import Card from '../../components/common/Card';

const EmergencyDashboard = () => {
    const [riskScores, setRiskScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [simulationResult, setSimulationResult] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/campus/safety/risk-scores');
            setRiskScores(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Risk score fetch failed", error);
        }
    };

    const runSimulation = async (buildingId, type) => {
        try {
            const response = await api.post(`/campus/safety/simulate-emergency?buildingId=${buildingId}&type=${type}`);
            setSimulationResult(response.data);
        } catch (error) {
            console.error("Simulation failed", error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="page-header flex items-center gap-3">
                <FaShieldAlt className="text-red-600" />
                Emergency Simulation & Risk Analytics
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card title="Evacuation Index" value="9.2/10" icon={<FaChartLine />} trend="+0.4" trendType="up" />
                <Card title="Risk Buildings" value={riskScores.filter(r => r.aggregatedRiskScore > 7).length} icon={<FaExclamationCircle />} color="red" />
                <Card title="Active Simulations" value="2" icon={<FaFire />} color="orange" />
                <Card title="Avg Response" value="4.2m" icon={<FaUsers />} color="teal" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="section-header">Building-wise Risk Ranking</h3>
                    <div className="space-y-4">
                        {riskScores.map((score, idx) => (
                            <div key={idx} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => runSimulation(score.building.buildingId, 'FIRE')}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{score.building.buildingName}</h4>
                                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                            <span>Structure: {(score.structuralRisk * 10).toFixed(1)}</span>
                                            <span>Occupancy: {(score.occupancyRisk * 10).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${score.aggregatedRiskScore > 7 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                        {score.aggregatedRiskScore.toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card bg-slate-900 text-white border-none">
                    <h3 className="section-header text-white flex items-center gap-2">
                        <FaFire className="text-orange-500" />
                        Live Simulation Engine
                    </h3>
                    {simulationResult ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/10 rounded-xl">
                                    <p className="text-gray-400 text-xs uppercase font-bold">Scenario</p>
                                    <p className="text-lg font-bold">{simulationResult.scenarioName}</p>
                                </div>
                                <div className="p-4 bg-white/10 rounded-xl">
                                    <p className="text-gray-400 text-xs uppercase font-bold">Risk Level</p>
                                    <p className="text-lg font-bold text-orange-400">{simulationResult.severity}</p>
                                </div>
                            </div>
                            <div className="p-6 bg-red-500/20 border border-red-500/50 rounded-2xl text-center">
                                <p className="text-sm font-bold uppercase tracking-widest text-red-400">Est. Evacuation Time</p>
                                <h2 className="text-5xl font-black mt-2">{simulationResult.estimatedEvacuationTimeMinutes.toFixed(1)}m</h2>
                                <p className="text-xs mt-3 text-red-300 italic">"Congestion likely at Block B main stairs"</p>
                            </div>
                            <button onClick={() => setSimulationResult(null)} className="w-full py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-bold">
                                Clear Simulation
                            </button>
                        </motion.div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-10">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <FaShieldAlt className="text-gray-400 text-2xl" />
                            </div>
                            <p className="text-gray-400 font-medium">Select a building to trigger a safety simulation</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmergencyDashboard;
