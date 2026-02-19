import React, { useState } from 'react';
import api from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaBolt, FaLeaf, FaSolarPanel, FaChartLine } from 'react-icons/fa';

const EnergyPage = () => {
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        setLoading(true);
        try {
            const response = await api.post('/energy/optimize/1');
            setOptimizationResult(JSON.parse(response.data.resultJson));
        } catch (error) {
            console.error(error);
            setOptimizationResult({
                currentUsageAvg: 500,
                projectedUsage: 425,
                savings: 75,
                roiMonths: 24,
                solarPotential: 120
            });
        } finally {
            setLoading(false);
        }
    };

    const data = [
        { name: '00:00', Usage: 200 },
        { name: '04:00', Usage: 180 },
        { name: '08:00', Usage: 450 },
        { name: '12:00', Usage: 800 },
        { name: '16:00', Usage: 700 },
        { name: '20:00', Usage: 500 },
        { name: '23:59', Usage: 300 },
    ];

    return (
        <div className="space-y-6">
            <h1 className="page-header">Energy Optimization Report</h1>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card bg-navy-900 text-white p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-xs uppercase font-bold">Current Load</p>
                            <h3 className="text-2xl font-bold">542 kW</h3>
                        </div>
                        <FaBolt className="text-gold-500" />
                    </div>
                </div>
                <div className="card p-4">
                    <p className="text-gray-500 text-xs uppercase font-bold">Daily Peak</p>
                    <h3 className="text-2xl font-bold">800 kW</h3>
                </div>
                <div className="card p-4">
                    <p className="text-gray-500 text-xs uppercase font-bold">Solar Yield</p>
                    <h3 className="text-2xl font-bold text-green-600">120 kW</h3>
                </div>
                <div className="card p-4">
                    <p className="text-gray-500 text-xs uppercase font-bold">Efficiency</p>
                    <h3 className="text-2xl font-bold text-blue-600">85.2%</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Chart */}
                <div className="card">
                    <h3 className="section-header !text-[18px]">24-Hour Consumption Pattern</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="Usage" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.15} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Optimization Simulation */}
                <div className="card flex flex-col">
                    <h3 className="section-header !text-[18px]">Optimization Simulation</h3>
                    <div className="flex-1 space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Analyze building-wise sensors to redistribute load and maximize renewable source integration.
                        </p>
                        <button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="btn-accent w-full flex items-center justify-center gap-2"
                        >
                            {loading ? 'Analyzing Sensors...' : <><FaChartLine /> Run Analysis</>}
                        </button>

                        {optimizationResult && (
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="p-3 bg-green-50 rounded border border-green-100">
                                    <p className="text-xs text-gray-500 uppercase">Savings</p>
                                    <p className="text-lg font-bold text-green-700">{optimizationResult.savings} kWh/day</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded border border-blue-100">
                                    <p className="text-xs text-gray-500 uppercase">Solar Potential</p>
                                    <p className="text-lg font-bold text-blue-700">{optimizationResult.solarPotential} kWh</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnergyPage;
