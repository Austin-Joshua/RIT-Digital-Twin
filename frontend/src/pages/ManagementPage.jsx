import React, { useState } from 'react';

const ManagementPage = () => {
    const [activeTab, setActiveTab] = useState('DEPARTMENTS');

    const departments = [
        { id: 1, name: 'Computer Science Engineering', code: 'CSE', head: 'Dr. Ramesh Kumar', rooms: 12, faculty: 45 },
        { id: 2, name: 'Electronics and Communication', code: 'ECE', head: 'Dr. Sunita Devi', rooms: 8, faculty: 38 },
        { id: 3, name: 'Mechanical Engineering', code: 'MECH', head: 'Dr. Vijay Singh', rooms: 10, faculty: 42 },
        { id: 4, name: 'Information Technology', code: 'IT', head: 'Dr. Anjali Gupta', rooms: 6, faculty: 30 },
    ];

    const _users = [
        { id: 1, username: 'admin', role: 'ADMIN', status: 'ACTIVE' },
        { id: 2, username: 'registrar', role: 'MANAGEMENT', status: 'ACTIVE' },
        { id: 3, username: 'faculty01', role: 'FACULTY', status: 'PENDING' },
    ];

    return (
        <div className="management-page">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>Institutional Governance</h1>
                <p style={{ color: '#64748b' }}>Manage departments, user roles, and system configuration</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #e2e8f0', marginBottom: '32px' }}>
                {['DEPARTMENTS', 'USER_ROLES', 'SYSTEM_AUDIT', 'CONFIG'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '12px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid #0B2C6B' : '2px solid transparent',
                            color: activeTab === tab ? '#0B2C6B' : '#64748b',
                            fontWeight: activeTab === tab ? '600' : '500',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {activeTab === 'DEPARTMENTS' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Department Name</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Code</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Head of Dept</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Classrooms</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map(dept => (
                                <tr key={dept.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#1e293b', fontWeight: '500' }}>{dept.name}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#64748b' }}>{dept.code}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#64748b' }}>{dept.head}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#64748b' }}>{dept.rooms}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <button style={{ color: '#0B2C6B', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'USER_ROLES' && (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                        User role management interface is currently under secure audit.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagementPage;
