import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMicrochip, FaRobot, FaNetworkWired, FaChartBar, FaShieldAlt, FaSync } from 'react-icons/fa';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const SmartAlgorithms = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await api.get('/analytics/predictions');
            setStatus(res.data);
        } catch (err) {
            console.error('Failed to fetch algorithm status', err);
            setStatus({
                available: false,
                nextSemesterDemand: null,
                predictedEnergyGrowth: null,
                clusterMultiplicationIndex: null,
                algorithmStatus: 'No prediction available'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const algorithmStats = [
        { name: 'Cluster Multiplication', status: 'NOT MEASURED', load: 'Not measured', icon: <FaNetworkWired />, color: 'blue' },
        { name: 'Energy Optimization', status: 'NOT MEASURED', load: 'Not measured', icon: <FaSync />, color: 'green' },
        { name: 'Predictive Analytics', status: 'NOT MEASURED', load: 'Not measured', icon: <FaRobot />, color: 'purple' },
        { name: 'Security Defense', status: 'NOT MEASURED', load: 'Not measured', icon: <FaShieldAlt />, color: 'red' },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-black italic tracking-tight" style={{ color: 'var(--theme-brand-strong)' }}>
                    Intelligence & Smart Algorithms
                </h1>
                <p className="text-gray-500 mt-2">Centralized monitoring of RIT Smart Campus Digital Twin engines</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {algorithmStats.map((algo, idx) => (
                    <motion.div 
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="stu-info-card"
                        style={{ borderTop: `4px solid var(--color-${algo.color}-500)` }}
                    >
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg bg-${algo.color}-50 text-${algo.color}-600`}>
                                    {algo.icon}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-${algo.color}-100 text-${algo.color}-700`}>
                                    {algo.status}
                                </span>
                            </div>
                            <h3 className="font-bold text-[var(--theme-text)]">{algo.name}</h3>
                            <div className="mt-2 text-2xl font-black text-[var(--theme-text)]">
                                {algo.load}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2" title="Simulation Engine Metrics">
                    <div className="p-4 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span>Optimization Convergence</span>
                                <span>Not measured</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span>Data Fidelity Index</span>
                                <span>Not measured</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span>Neural Processing Load</span>
                                <span>Not measured</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Latest Predictions">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Synchronizing with AI Service...</div>
                    ) : (
                        <div className="p-4 space-y-4">
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                <label className="text-[10px] uppercase font-bold text-gray-400">Demand Projection</label>
                                <p className="font-medium text-gray-700 dark:text-gray-300 mt-1">{status?.nextSemesterDemand || 'No prediction available'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                <label className="text-[10px] uppercase font-bold text-gray-400">Mobility Intensity</label>
                                <p className="font-medium text-gray-700 dark:text-gray-300 mt-1">{status?.clusterMultiplicationIndex || 'No prediction available'}</p>
                            </div>
                            <button 
                                onClick={fetchStatus}
                                className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-500 transition-all font-bold text-sm"
                            >
                                Force Baseline Sync
                            </button>
                        </div>
                    )}
                </Card>
            </div>

            <div className="stu-info-card" style={{ borderTop: '4px solid var(--color-accent-gold)' }}>
                <div className="info-header flex items-center gap-2">
                    <FaMicrochip /> System Core Audit
                </div>
                <div className="p-6">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-gray-400 uppercase text-[10px] tracking-widest font-black">
                                <th className="pb-4">Module</th>
                                <th className="pb-4">Architecture</th>
                                <th className="pb-4">Version</th>
                                <th className="pb-4">Health</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 dark:text-gray-400 font-medium">
                            <tr className="border-t border-gray-50 dark:border-gray-900">
                                <td className="py-4">Transport Simulation</td>
                                <td className="py-4">Graph-Heuristic</td>
                                <td className="py-4">v4.2.1-Alpha</td>
                                <td className="py-4"><span>Not connected</span></td>
                            </tr>
                            <tr className="border-t border-gray-50 dark:border-gray-900">
                                <td className="py-4">Energy Optimization</td>
                                <td className="py-4">Not connected</td>
                                <td className="py-4">—</td>
                                <td className="py-4"><span>Not connected</span></td>
                            </tr>
                            <tr className="border-t border-gray-50 dark:border-gray-900">
                                <td className="py-4">Security Defense</td>
                                <td className="py-4">Not connected</td>
                                <td className="py-4">—</td>
                                <td className="py-4"><span>Not connected</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SmartAlgorithms;
