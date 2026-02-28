import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { FaGlobe, FaCity, FaPlus, FaCheckCircle, FaLaptopCode, FaCogs, FaTimes } from 'react-icons/fa';

const DetailModal = ({ detail, onClose }) => {
    if (!detail) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    style={{
                        background: 'var(--theme-card-bg, #fff)',
                        color: 'var(--theme-text, #333)',
                        padding: '32px',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{detail.title}</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <FaTimes size={20} color="var(--theme-text-muted, #64748b)" />
                        </button>
                    </div>
                    <div style={{ lineHeight: '1.6', color: 'var(--theme-text-muted, #666)' }}>
                        <p>{detail.content}</p>
                        {detail.data && (
                            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--theme-bg, #f8fafc)', borderRadius: '8px' }}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                    {JSON.stringify(detail.data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const SuperAdminDashboard = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDetail, setSelectedDetail] = useState(null);

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

    const handleAction = (title, content, data = null) => {
        setSelectedDetail({ title, content, data });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {selectedDetail && (
                <DetailModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} />
            )}
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
                    <div
                        key={tenant.id}
                        className="stu-info-card"
                        style={{ borderTopColor: '#0B2C6B', padding: '20px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } }}
                        onClick={() => handleAction(`Navigating: ${tenant.name}`, `We are opening the management portal connection for ${tenant.name} (${tenant.code}). Please wait loading resources...`)}
                        title={`Manage ${tenant.name}`}
                    >
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
                            <button
                                className="table-btn primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                onClick={(e) => { e.stopPropagation(); handleAction(`Settings: ${tenant.name}`, `Accessing quick database and global settings for ${tenant.name}.`) }}
                            >
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
                    onClick={() => handleAction('Register New Campus', 'Opening the onboarding pipeline for a new tenant registration.')}
                >
                    <FaPlus size={30} color="#64748b" style={{ marginBottom: '10px' }} />
                    <h4 style={{ color: '#64748b', margin: 0 }}>Register New Campus</h4>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
