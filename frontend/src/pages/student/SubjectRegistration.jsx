import { LuBookOpen } from 'react-icons/lu';
import React, { useState, useEffect } from 'react';
import { FaBookOpen, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { workflowApi } from '../../services/enterpriseApi';
import { useAuth } from '../../hooks/AuthContext';
import dynamicCache from '../../utils/dynamicCache';

const SubjectRegistration = () => {
    const { user } = useAuth();
    const studentId = user?.id || 1;
    const cacheKey = `student_registrations_${studentId}`;
    const cachedRegs = dynamicCache.get(cacheKey);

    const [registrations, setRegistrations] = useState(cachedRegs || []);
    const [loading, setLoading] = useState(!cachedRegs);
    const [message, setMessage] = useState(null);

    // Mock subjects for the UI showcase
    const availableElectives = [
        { id: 101, name: 'Advanced Machine Learning', code: 'CS701', capacity: 60, enrolled: 58 },
        { id: 102, name: 'Cloud Native Computing', code: 'CS702', capacity: 60, enrolled: 60 },
        { id: 103, name: 'Quantum Cryptography', code: 'CS703', capacity: 40, enrolled: 12 },
    ];

    useEffect(() => {
        let isMounted = true;

        dynamicCache.fetchSWR(
            cacheKey,
            async () => {
                const res = await workflowApi.getRegistrations(studentId);
                return res.data || [];
            },
            {
                onData: (data) => {
                    if (isMounted) {
                        setRegistrations(data);
                        setLoading(false);
                    }
                }
            }
        ).catch((err) => {
            console.error(err);
            if (isMounted) setLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, [studentId, cacheKey]);

    const handleRegister = async (subjectId) => {
        try {
            const res = await workflowApi.registerSubject(studentId, subjectId);
            const updated = [...registrations, res.data];
            setRegistrations(updated);
            dynamicCache.set(cacheKey, updated);
            setMessage({ type: 'success', text: 'Successfully registered for subject!' });
        } catch {
            setMessage({ type: 'error', text: 'Registration could not be completed. The subject may be at capacity or you may already be enrolled.' });
        }
    };

    const isRegistered = (subId) => registrations.some(r => r.subject?.id === subId);

        return (
        <div className="ims-page-container">
            {/* Header Banner following TransportDirectory & Simulator hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuBookOpen />
                    </div>
                    <div>
                        <h1 className="ims-header-title">My Subject Registration</h1>
                        <p className="ims-header-subtitle">Open elective course registration with real-time seat capacity enforcement</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(11,44,107,0.25)' }}>
                        Regulation 2021 Autonomous
                    </span>
                    <span className="ims-candy-badge" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>
                        Enrolled: {registrations.length} Electives
                    </span>
                </div>
            </div>

            {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '14px 20px', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b', borderRadius: '12px', border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, fontSize: '0.875rem' }}>
                    {message.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />} {message.text}
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {availableElectives.map(subject => {
                    const isFull = subject.enrolled >= subject.capacity;
                    const registered = isRegistered(subject.id);
                    const percentFull = (subject.enrolled / subject.capacity) * 100;

                    return (
                        <div key={subject.id} className="ims-card-elevated" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{subject.name}</h3>
                                    <div style={{ color: '#0B2C6B', fontWeight: '600', fontSize: '0.85rem', marginTop: '4px' }}>{subject.code}</div>
                                </div>
                                <FaBookOpen style={{ color: '#0B2C6B', fontSize: '1.5rem', opacity: 0.2 }} />
                            </div>

                            <div style={{ marginBottom: '20px', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: '#64748b' }}>
                                    <span style={{ fontWeight: '600' }}>Enrollment Capacity</span>
                                    <span style={{ fontWeight: 'bold', color: isFull ? '#dc2626' : '#1e293b' }}>{subject.enrolled} / {subject.capacity}</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentFull}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        style={{ height: '100%', background: isFull ? '#dc2626' : percentFull > 80 ? '#f59e0b' : '#16a34a', borderRadius: '9999px' }}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={isFull || registered || loading}
                                onClick={() => handleRegister(subject.id)}
                                className={`ims-candy-btn ${registered ? 'ims-candy-success' : isFull ? 'ims-candy-neutral' : 'ims-candy-primary'}`}
                                style={{ width: '100%' }}
                            >
                                {registered ? 'Registered ✓' : isFull ? 'Capacity Full' : 'Register Now'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubjectRegistration;
