import React, { useState } from 'react';
import api from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
            <h1 className="page-header">Energy Consumption & Optimization</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="section-header !text-[18px]">Real-time Usage (kWh)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                                <Area type="monotone" dataKey="Usage" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.2} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card flex flex-col justify-center">
                    <h3 className="section-header !text-[18px]">Optimization Simulation</h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">Run AI-driven analysis to identify potential savings through load balancing and solar integration.</p>
                    <button
                        onClick={handleSimulate}
                        disabled={loading}
                        className="btn-accent w-full"
                    >
                        {loading ? 'Calculating...' : 'Run Optimization Analysis'}
                    </button>
                </div>
            </div>

            {optimizationResult && (
                <div className="card border-t-4 border-t-gold-500">
                    <h3 className="section-header !mb-6">Simulation Results</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-gray-50 rounded border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Current Avg Usage</p>
                            <p className="text-xl font-bold text-navy-900">{optimizationResult.currentUsageAvg} kWh</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded border border-green-100">
                            <p className="text-sm text-gray-500 mb-1">Projected Usage</p>
                            <p className="text-xl font-bold text-green-700">{optimizationResult.projectedUsage} kWh</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded border border-blue-100">
                            <p className="text-sm text-gray-500 mb-1">Solar Potential</p>
                            <p className="text-xl font-bold text-blue-700">{optimizationResult.solarPotential} kWh</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded border border-yellow-100">
                            <p className="text-sm text-gray-500 mb-1">ROI Period</p>
                            <p className="text-xl font-bold text-yellow-700">{optimizationResult.roiMonths} Months</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnergyPage;
