import React, { useState, useEffect, useRef } from 'react';
import twinService from '../../services/twinService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaBolt, FaLeaf, FaSolarPanel, FaChartLine } from 'react-icons/fa';
import { useWebSocket } from '../../hooks/WebSocketContext';

const EnergyPage = () => {
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        setLoading(true);
        try {
            const response = await twinService.getEnergyForecast('MONDAY');
            const data = response.data;
            if (data && data.length > 0) {
                const totalLoad = data.reduce((sum, item) => sum + item.value, 0);
                setOptimizationResult({
                    currentUsageAvg: totalLoad,
                    projectedUsage: totalLoad * 0.85,
                    savings: (totalLoad * 0.15).toFixed(1),
                    roiMonths: 18,
                    solarPotential: (totalLoad * 0.22).toFixed(1)
                });
            }
        } catch (error) {
            console.error("Energy simulation failed:", error);
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="stu-kpi-card blue cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5" onClick={() => alert('Real-Time Load: ' + liveMetrics.currentLoad + ' kW. High efficiency observed.')}>
                    <div className="kpi-main z-10">
                        <h3 className="kpi-value text-2xl md:text-3xl font-bold mb-1" style={{ fontSize: '' }}>{liveMetrics.currentLoad} <span className="text-xs md:text-sm">kW</span></h3>
                        <p className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Real-Time Load</p>
                    </div>
                    <FaBolt className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                </div>
                <div className="stu-kpi-card yellow cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5" onClick={() => alert('Peak Daily Load: 800 kW reached at 12:45 PM today.')}>
                    <div className="kpi-main z-10">
                        <h3 className="kpi-value text-2xl md:text-3xl font-bold mb-1" style={{ fontSize: '' }}>800 <span className="text-xs md:text-sm">kW</span></h3>
                        <p className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Peak Daily</p>
                    </div>
                    <FaChartLine className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                </div>
                <div className="stu-kpi-card green cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5" onClick={() => alert('Solar Output: ' + liveMetrics.solarYield + ' kW. Renewable energy contributing 22% of total load.')}>
                    <div className="kpi-main z-10">
                        <h3 className="kpi-value text-2xl md:text-3xl font-bold mb-1" style={{ fontSize: '' }}>{liveMetrics.solarYield} <span className="text-xs md:text-sm">kW</span></h3>
                        <p className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Solar Output</p>
                    </div>
                    <FaSolarPanel className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                </div>
                <div className="stu-kpi-card red cursor-pointer hover:scale-[1.05] transition-transform flex flex-col p-3 md:p-5" onClick={() => alert('Grid Import: ' + liveMetrics.gridImport + ' kW. Stable connection.')}>
                    <div className="kpi-main z-10">
                        <h3 className="kpi-value text-2xl md:text-3xl font-bold mb-1" style={{ fontSize: '' }}>{liveMetrics.gridImport} <span className="text-xs md:text-sm">kW</span></h3>
                        <p className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Grid Import</p>
                    </div>
                    <FaBolt className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                </div>
            </div>

            <div className="stu-info-row">
                {/* Usage Chart */}
                <div className="stu-info-card">
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaBolt color="var(--color-primary-navy)" />
                        <span style={{ color: 'var(--theme-text)' }}>Energy Consumption Pattern</span>
                        {connected && <span style={{ textShadow: 'none', background: 'var(--color-error)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', marginLeft: 'auto', animation: 'pulse 2s infinite' }}>LIVE</span>}
                    </div>
                    <div className="info-body">
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
                </div>

                {/* Optimization Simulation */}
                <div className="stu-info-card" style={{ borderTopColor: 'var(--color-accent-gold)' }}>
                    <div className="info-header">Energy Optimization Simulation</div>
                    <div className="info-body">
                        <p style={{ fontSize: '14px', color: 'var(--theme-text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
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
