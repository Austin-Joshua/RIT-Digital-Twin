import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        api.get('/dashboard/summary')
            .then(res => setSummary(res.data))
            .catch(err => console.error(err));
    }, []);

    const data = [
        { name: 'Mon', Energy: 4000, Transport: 2400 },
        { name: 'Tue', Energy: 3000, Transport: 1398 },
        { name: 'Wed', Energy: 2000, Transport: 9800 },
        { name: 'Thu', Energy: 2780, Transport: 3908 },
        { name: 'Fri', Energy: 1890, Transport: 4800 },
    ];

    return (
        <div>
            <h2>Campus Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div className="rit-card">
                    <h3>Sustainability Score</h3>
                    <div style={{ fontSize: '2em', fontWeight: 'bold', color: 'var(--rit-navy)' }}>
                        {summary?.sustainabilityScore || 85.5}/100
                    </div>
                </div>
                <div className="rit-card">
                    <h3>Active Alerts</h3>
                    <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#D32F2F' }}>
                        {summary?.activeAlerts || 2}
                    </div>
                </div>
                <div className="rit-card">
                    <h3>System Status</h3>
                    <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#2E7D32' }}>
                        {summary?.systemStatus || 'ONLINE'}
                    </div>
                </div>
            </div>

            <div className="rit-card">
                <h3>Consumption Trends</h3>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Energy" stroke="var(--rit-navy)" />
                            <Line type="monotone" dataKey="Transport" stroke="var(--rit-gold)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
