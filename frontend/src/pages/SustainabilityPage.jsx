import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const SustainabilityPage = () => {
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await api.post('/sustainability/calculate');
                setMetrics(response.data);
            } catch (error) {
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

    if (!metrics) return <div>Loading...</div>;

    const data = [
        { subject: 'Energy', A: metrics.energyScore, fullMark: 100 },
        { subject: 'Transport', A: metrics.transportScore, fullMark: 100 },
        { subject: 'Waste', A: metrics.wasteManagementScore, fullMark: 100 },
        { subject: 'Water', A: 80, fullMark: 100 },
        { subject: 'Green Cover', A: 65, fullMark: 100 },
        { subject: 'Carbon', A: 75, fullMark: 100 },
    ];

    return (
        <div className="space-y-6">
            <h1 className="page-header">Sustainability & ESG Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card flex flex-col items-center justify-center min-h-[400px]">
                    <h3 className="section-header">Composite Sustainability Index</h3>
                    <div className="relative w-56 h-56 flex items-center justify-center rounded-full border-[12px] border-teal-500 bg-teal-50">
                        <span className="text-5xl font-bold text-teal-800">{metrics.compositeIndex}</span>
                    </div>
                    <p className="mt-6 text-gray-500 font-medium bg-gray-100 px-4 py-2 rounded-full">Overall Campus Rating: A+</p>
                </div>

                <div className="card min-h-[400px]">
                    <h3 className="section-header">Metric Breakdown</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                <PolarGrid stroke="#E5E7EB" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#374151', fontSize: 13 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Campus" dataKey="A" stroke="#0B2C6B" fill="#0B2C6B" fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SustainabilityPage;
