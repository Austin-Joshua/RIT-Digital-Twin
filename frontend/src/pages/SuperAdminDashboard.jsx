import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FaGlobe, FaCity, FaPlus, FaCheckCircle, FaLaptopCode, FaCogs } from 'react-icons/fa';

const SuperAdminDashboard = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const res = await api.get('/api/admin/tenants');
                setTenants(res.data);
            } catch (err) {
                console.error("Failed to fetch tenants", err);
            }
            setLoading(false);
        };
        fetchTenants();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header / Breadcrumb Mirror from Student */}
            <div className="stu-welcome">
                <h2>RIT Campus Administration</h2>
                <div className="breadcrumb-bar">
                    <span className="breadcrumb-item">Administration</span>
                    <span className="breadcrumb-item" style={{ margin: '0 8px' }}>/</span>
                    <span className="breadcrumb-item active">Campus Manager</span>
                </div>
            </div>

            {/* Content Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {tenants.map(tenant => (
                    <div key={tenant.id} className="stu-info-card" style={{ borderTopColor: '#0B2C6B', padding: '20px' }}>
                        <div className="info-header" style={{ padding: '0 0 10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f4f4f4', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0B2C6B', fontWeight: 'bold' }}>
                                <FaCity />
                                <span>{tenant.name}</span>
                            </div>
                            <span style={{ fontSize: '11px', background: tenant.active ? '#00a65a' : '#dd4b39', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>
                                {tenant.active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>

                        <div className="info-body" style={{ padding: '0' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
                                <strong>Campus Code:</strong> {tenant.code}
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
                                <strong>Subdomain:</strong> {tenant.subdomain ? `${tenant.subdomain}.ritchennai.edu.in` : 'N/A'}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '15px' }}>
                                <FaCheckCircle color={tenant.active ? '#00a65a' : '#dd4b39'} />
                                <span style={{ fontSize: '12px', fontWeight: '500' }}>System Status: {tenant.active ? 'Operational' : 'Under Maintenance'}</span>
                            </div>
                        </div>

                        <div className="info-footer" style={{ marginTop: '20px', padding: '10px 0 0 0', borderTop: '1px solid #f4f4f4', textAlign: 'right' }}>
                            <button className="table-btn primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <FaCogs /> Manage Campus
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Campus Card */}
                <div
                    className="stu-info-card"
                    style={{
                        borderStyle: 'dashed',
                        borderWidth: '2px',
                        borderColor: '#cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        minHeight: '200px',
                        background: 'rgba(203, 213, 225, 0.05)'
                    }}
                >
                    <FaPlus size={30} color="#64748b" style={{ marginBottom: '10px' }} />
                    <h4 style={{ color: '#64748b', margin: 0 }}>Register New Campus</h4>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
