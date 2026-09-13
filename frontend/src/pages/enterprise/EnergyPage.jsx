import React, { useEffect, useState } from 'react';
import twinService from '../../services/twinService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { FaBolt, FaSolarPanel, FaChartLine } from 'react-icons/fa';
import { sourceOf, SOURCE } from '../../platform/sourceClass';
import StatusBadge from '../../platform/ui/StatusBadge';
import ConnectionStatus from '../../platform/ui/ConnectionStatus';
import { useCampusStream } from '../../platform/useCampusStream';

const EnergyPage = () => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);
    const [liveMetrics, setLiveMetrics] = useState({ currentLoad: null, source: null, because: 'No meter is connected.' });
    const applyState = (envelope) => {
        const energy = envelope?.energy;
        if (!energy) return;
        setLiveMetrics({
            currentLoad: energy.demandKw,
            source: sourceOf(energy, SOURCE.SIMULATED),
            because: energy.because,
        });
        if (energy.demandKw == null) return;
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        setChartData((prev) => [...prev.slice(-11), { name: timeStr, Usage: energy.demandKw }]);
    };
    const stream = useCampusStream(applyState);

    useEffect(() => {
        twinService.getCampusState().then((response) => applyState(response.data)).catch(() => {});
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="page-header">Campus Energy Optimization Report</h1>
            <ConnectionStatus status={stream.status} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="stu-kpi-card blue flex flex-col p-3 md:p-5">
                    <div className="kpi-main z-10">
                        <h3 className="kpi-value text-2xl md:text-3xl font-bold mb-1">{liveMetrics.currentLoad ?? '—'} <span className="text-xs md:text-sm">kW</span></h3>
                        <p className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Formula load</p>
                        <StatusBadge source={liveMetrics.source} />
                    </div>
                    <FaBolt className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                </div>
                <div className="stu-kpi-card yellow flex flex-col p-3 md:p-5">
                    <div className="kpi-main z-10">
                        <h3 className="kpi-value text-2xl md:text-3xl font-bold mb-1">—</h3>
                        <p className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Peak meter</p>
                        <p className="text-xs text-gray-500">No meter history is stored.</p>
                    </div>
                    <FaChartLine className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                </div>
                <div className="stu-kpi-card green flex flex-col p-3 md:p-5">
                    <div className="kpi-main z-10">
                        <h3 className="kpi-value text-2xl md:text-3xl font-bold mb-1">—</h3>
                        <p className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Solar</p>
                        <p className="text-xs text-gray-500">No solar feed is connected.</p>
                    </div>
                    <FaSolarPanel className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                </div>
                <div className="stu-kpi-card red flex flex-col p-3 md:p-5">
                    <div className="kpi-main z-10">
                        <h3 className="kpi-value text-2xl md:text-3xl font-bold mb-1">—</h3>
                        <p className="kpi-label text-[10px] md:text-sm font-semibold uppercase tracking-wider">Grid</p>
                        <p className="text-xs text-gray-500">No grid feed is connected.</p>
                    </div>
                    <FaBolt className="kpi-icon absolute top-3 right-3 text-2xl md:text-4xl opacity-20" />
                </div>
            </div>

            <div className="stu-info-row">
                {/* Usage Chart */}
                <div className="stu-info-card">
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaBolt color="var(--theme-brand-strong)" />
                        <span style={{ color: 'var(--theme-text)' }}>Formula load, not a meter</span>
                        {chartData.length > 0 && <StatusBadge source={liveMetrics.source} />}
                    </div>
                    <div className="info-body">
                        {chartData.length === 0 ? (
                            <p style={{ color: 'var(--theme-text-muted)', fontSize: 14 }}>No meter series. Formula points appear here only after a campus-state update includes a stored base load.</p>
                        ) : (
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
                        )}
                    </div>
                </div>

                {/* Optimization Simulation */}
                <div className="stu-info-card" style={{ borderTopColor: 'var(--color-accent-gold)' }}>
                    <div className="info-header">Energy Optimization Simulation</div>
                    <div className="info-body">
                        <p style={{ fontSize: '14px', color: 'var(--theme-text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                            HVAC changes belong in the simulation lab. This page does not invent savings or a solar yield.
                        </p>
                        <button type="button" onClick={() => navigate('/simulations')} className="btn-accent w-full flex items-center justify-center gap-2">
                            <FaChartLine /> Open simulation lab
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnergyPage;
