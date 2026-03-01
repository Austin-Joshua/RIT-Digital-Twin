import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { FaLeaf, FaGlobeAmericas, FaRecycle, FaWater, FaBolt } from 'react-icons/fa';

const SustainabilityPage = () => {
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await api.get('/sustainability/history');
                const latest = response.data[response.data.length - 1];
                setMetrics(latest || {
                    energyScore: 85,
                    transportScore: 70,
                    wasteManagementScore: 90,
                    compositeIndex: 81.6,
                    carbonFootprintEstimate: 1050,
                    sdgAlignment: "SDG 7, 11, 13"
                });
            } catch (_error) {
                setMetrics({
                    energyScore: 85,
                    transportScore: 70,
                    wasteManagementScore: 90,
                    compositeIndex: 81.6
                });
            }
        };
        fetchMetrics();
    }, []);

    if (!metrics) return <div className="p-10 text-center">Loading ESG Metrics...</div>;

    const radarData = [
        { subject: 'Energy', A: metrics.energyScore, fullMark: 100 },
        { subject: 'Transport', A: metrics.transportScore, fullMark: 100 },
        { subject: 'Waste', A: metrics.wasteManagementScore, fullMark: 100 },
        { subject: 'Water', A: 80, fullMark: 100 },
        { subject: 'Green Cover', A: 65, fullMark: 100 },
        { subject: 'Carbon', A: 75, fullMark: 100 },
    ];

    const categoryStats = [
        { category: 'Waste Management', score: metrics.wasteManagementScore, trend: '+5%', status: 'Excellent' },
        { category: 'Energy Efficiency', score: metrics.energyScore, trend: '+2%', status: 'Good' },
        { category: 'Water Conservation', score: 80, trend: '-1%', status: 'Stable' },
        { category: 'Carbon Footprint', score: 75, trend: '+8%', status: 'Improving' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="page-header">Sustainability & ESG Detailed Report</h1>

            {/* Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card flex flex-col items-center justify-center p-6 border-t-4 border-teal-500">
                    <p className="text-gray-500 text-sm font-bold uppercase mb-2">Composite Index</p>
                    <div className="w-32 h-32 flex items-center justify-center rounded-full border-8 border-teal-500 text-3xl font-bold text-teal-900 bg-teal-50">
                        {metrics.compositeIndex}
                    </div>
                    <p className="mt-4 text-teal-700 font-bold uppercase tracking-wider text-sm">Rating: A+</p>
                </div>

                <div className="card lg:col-span-2">
                    <h3 className="section-header">Metric Breakdown (ESG Radar)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#E5E7EB" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#374151', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Campus" dataKey="A" stroke="#0D9488" fill="#0D9488" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-teal-50 border-teal-100">
                    <h3 className="section-header text-teal-800">Carbon Footprint Analysis</h3>
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white rounded-2xl shadow-sm">
                            <FaGlobeAmericas className="text-4xl text-teal-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase">Estimated CO₂ Offset Required</p>
                            <h2 className="text-3xl font-black text-teal-900">{metrics.carbonFootprintEstimate?.toFixed(1)} <span className="text-sm font-normal text-gray-500">kg CO₂ / month</span></h2>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-white/50 rounded-xl text-xs text-teal-700 italic font-medium">
                            &quot;Your current energy optimization saves approximately 240kg of CO₂ per month compared to national averages.&quot;
                    </div>
                </div>

                <div className="card bg-blue-50 border-blue-100">
                    <h3 className="section-header text-blue-800">UN SDG Alignment</h3>
                    <div className="flex flex-wrap gap-2">
                        {metrics.sdgAlignment?.split(',').map(sdg => (
                            <span key={sdg} className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-black shadow-sm">
                                {sdg.trim()}
                            </span>
                        ))}
                    </div>
                    <p className="mt-4 text-[10px] text-blue-600 font-bold leading-relaxed">
                        Rajalakshmi Institute of Technology contributes significantly to SDG 13 (Climate Action) and SDG 7 (Clean Energy) through optimized resource allocation.
                    </p>
                </div>
            </div>

            {/* Category Details Table */}
            <div className="card">
                <h3 className="section-header">Pillar-wise Sustainability Status</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sustainability Pillar</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Score (0-100)</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">MoM Trend</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categoryStats.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        {item.category.includes('Waste') && <FaRecycle className="text-green-600" />}
                                        {item.category.includes('Energy') && <FaBolt className="text-yellow-600" />}
                                        {item.category.includes('Water') && <FaWater className="text-blue-600" />}
                                        {item.category.includes('Carbon') && <FaGlobeAmericas className="text-teal-600" />}
                                        <span className="text-sm font-semibold text-gray-700">{item.category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px] mx-auto">
                                            <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${item.score}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold mt-1 inline-block">{item.score}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm">
                                        <span className={item.trend.startsWith('+') ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                            {item.trend}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs font-bold">
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SustainabilityPage;
