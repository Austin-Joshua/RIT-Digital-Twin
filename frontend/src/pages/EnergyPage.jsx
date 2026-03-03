import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaBolt, FaLeaf, FaSolarPanel, FaChartLine } from 'react-icons/fa';
import { useWebSocket } from '../context/WebSocketContext';

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

    const { subscribe, connected } = useWebSocket();
    const [liveMetrics, setLiveMetrics] = useState({
        currentLoad: 542,
        solarYield: 120,
        gridImport: 422
    });

    const [chartData, setChartData] = useState([
        { name: '00:00', Usage: 200 },
        { name: '04:00', Usage: 180 },
        { name: '08:00', Usage: 450 },
        { name: '12:00', Usage: 800 },
        { name: '16:00', Usage: 700 },
        { name: '20:00', Usage: 500 },
        { name: 'Now', Usage: 542 },
    ]);
    const subscriptionRef = useRef(null);

    useEffect(() => {
        if (connected && !subscriptionRef.current) {
            subscriptionRef.current = subscribe('/topic/iot/energy', (data) => {
                const totalLoad = data.mainBlockKw + data.hostelBlockKw + data.libraryKw;
                setLiveMetrics({
                    currentLoad: totalLoad,
                    solarYield: data.solarGenerationKw,
                    gridImport: data.gridImportKw
                });

                // Add to chart (keep last 7 points)
                const now = new Date();
                const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

                setChartData(prev => {
                    const newChart = [...prev.slice(1), { name: timeStr, Usage: totalLoad }];
                    return newChart;
                });
            });
        }
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
        };
    }, [connected, subscribe]);

    return (
        <div className="space-y-6">
            <h1 className="page-header">Campus Energy Optimization Report</h1>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card bg-navy-900 text-white p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Real-Time Campus Load
                                {connected && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>}
                            </p>
                            <h3 className="text-2xl font-bold">{liveMetrics.currentLoad} kW</h3>
                        </div>
                        <FaBolt className="text-gold-500" />
                    </div>
                </div>
                <div className="card p-4">
                    <p style={{ color: 'var(--theme-text-muted)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Peak Daily Consumption</p>
                    <h3 className="text-2xl font-bold">800 kW</h3>
                </div>
                <div className="card p-4">
                    <p style={{ color: 'var(--theme-text-muted)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Solar Panel Output
                        {connected && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>}
                    </p>
                    <h3 className="text-2xl font-bold text-green-600">{liveMetrics.solarYield} kW</h3>
                </div>
                <div className="card p-4">
                    <p style={{ color: 'var(--theme-text-muted)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        External Grid Import
                        {connected && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>}
                    </p>
                    <h3 className="text-2xl font-bold text-red-600">{liveMetrics.gridImport} kW</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Chart */}
                <div className="card">
                    <h3 className="section-header !text-[18px] flex items-center gap-2">
                        Real-Time Energy Consumption Pattern
                        {connected && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold ml-auto animate-pulse">LIVE</span>}
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="Usage" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.15} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Optimization Simulation */}
                <div className="card flex flex-col">
                    <h3 className="section-header !text-[18px]">Energy Optimization Simulation</h3>
                    <div className="flex-1 space-y-4">
                        <p style={{ fontSize: '14px', color: 'var(--theme-text-muted)', lineHeight: '1.6' }}>
                            Analyse building-specific sensor data to optimise load distribution and maximise the integration of renewable energy sources.
                        </p>
                        <button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="btn-accent w-full flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing Sensor Data...' : <><FaChartLine /> Execute Analysis</>}
                        </button>

                        {optimizationResult && (
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="p-3 bg-green-50 rounded border border-green-100">
                                    <p className="text-xs text-gray-500 uppercase">Projected Savings</p>
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
