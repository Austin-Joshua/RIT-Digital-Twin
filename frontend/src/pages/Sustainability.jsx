import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const Sustainability = () => {
    const data = [
        { name: 'Solar', value: 400 },
        { name: 'Grid', value: 300 },
        { name: 'Biogas', value: 100 },
    ];
    const COLORS = ['#D4AF37', '#0B3C5D', '#0088FE'];

    return (
        <div>
            <h2>Sustainability Dashboard</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div className="rit-card" style={{ flex: 1 }}>
                    <h3>Energy Mix</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="rit-card" style={{ flex: 1 }}>
                    <h3>Key Metrics</h3>
                    <p><strong>Carbon Footprint:</strong> 120 tons (Reduced by 10% YoY)</p>
                    <p><strong>Water Recycled:</strong> 50,000 Liters</p>
                    <p><strong>Green Cover:</strong> 35% of Campus</p>
                </div>
            </div>
        </div>
    );
};

export default Sustainability;
