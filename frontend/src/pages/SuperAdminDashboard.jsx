import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FaGlobe, FaCity, FaPlus, FaCheckCircle } from 'react-icons/fa';

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
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#0B2C6B', color: 'white', padding: '32px', borderRadius: '16px' }}>
                <h1><FaGlobe /> Multi-Campus Management</h1>
                <p>Super Admin Overview - Tenant Level Separation</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {tenants.map(tenant => (
                    <div key={tenant.id} style={{ background: 'white', padding: '24px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '6px solid #D4AF37' }}>
                        <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><FaCity /> {tenant.name}</h3>
                        <p style={{ color: '#64748b' }}>Code: {tenant.code}</p>
                        <p style={{ color: '#64748b' }}>Domain: {tenant.subdomain || 'N/A'}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                            <span style={{ color: tenant.active ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                                <FaCheckCircle /> {tenant.active ? 'Operational' : 'Maintenance'}
                            </span>
                            <button style={{ padding: '6px 12px', background: '#0B2C6B', color: 'white', borderRadius: '6px', border: 'none' }}>Manage</button>
                        </div>
                    </div>
                ))}

                <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', padding: '24px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <h4 style={{ color: '#64748b' }}><FaPlus /> Add New Campus</h4>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
