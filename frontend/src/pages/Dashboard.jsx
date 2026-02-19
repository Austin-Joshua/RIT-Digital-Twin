import React from 'react';

const Dashboard = () => {
    // Quick Stats Data mimicking the screenshot
    const stats = [
        {
            title: 'CGPA',
            count: '0',
            bg: '#28a745', // Green
            icon: '📄'
        },
        {
            title: 'Arrears In Hand',
            count: '0',
            bg: '#ffc107', // Yellow
            icon: '📝'
        },
        {
            title: 'Average Attendance',
            count: '0',
            unit: '%',
            bg: '#17a2b8', // Teal
            icon: '📊'
        },
        {
            title: 'Taken Leave',
            count: '0',
            bg: '#dc3545', // Red
            icon: '📅'
        },
    ];

    return (
        <div className="dashboard-container">
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {stats.map((stat, index) => (
                    <div key={index} style={{
                        backgroundColor: stat.bg,
                        borderRadius: '4px',
                        color: 'white',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>
                                    {stat.count}
                                    {stat.unit && <span style={{ fontSize: '1.5rem', marginLeft: '5px' }}>{stat.unit}</span>}
                                </h3>
                                <p style={{ fontSize: '0.9rem', margin: '5px 0 0 0', opacity: '0.9' }}>{stat.title}</p>
                            </div>
                            <div style={{ fontSize: '3rem', opacity: '0.2' }}>
                                {stat.icon}
                            </div>
                        </div>
                        <div style={{
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            padding: '8px 20px',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            More info <span style={{ marginLeft: '5px' }}>➜</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Sections Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {/* Announcements */}
                <div style={{ background: 'white', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', fontSize: '1.1rem', fontWeight: '600', color: '#444' }}>
                        Announcements
                    </div>
                    <div style={{ padding: '20px', minHeight: '150px' }}>
                        <ul style={{ paddingLeft: '20px', color: '#666' }}>
                            <li>No Announcements</li>
                        </ul>
                        <div style={{ textAlign: 'right', marginTop: '20px', color: '#555', fontSize: '0.9rem', cursor: 'pointer' }}>
                            More..
                        </div>
                    </div>
                </div>

                {/* Events */}
                <div style={{ background: 'white', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', fontSize: '1.1rem', fontWeight: '600', color: '#444' }}>
                        Placement / Events Schedule
                    </div>
                    <div style={{ padding: '20px', minHeight: '150px' }}>
                        <ul style={{ paddingLeft: '20px', color: '#666' }}>
                            <li>No Events</li>
                        </ul>
                        <div style={{ textAlign: 'right', marginTop: '20px', color: '#555', fontSize: '0.9rem', cursor: 'pointer' }}>
                            More..
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Section */}
            <div style={{ background: 'white', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold' }}>February 2026</div>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#fadbd8' }}></div> Holiday
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#aed6f1' }}></div> No order Day
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#17a2b8' }}></div> Today
                        </div>
                    </div>
                </div>
                <div style={{ padding: '0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#d6eaf8', color: '#333' }}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <th key={day} style={{ padding: '15px', fontWeight: 'normal' }}>{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="7" style={{ padding: '40px', color: '#999' }}>Calendar Data Loading...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
