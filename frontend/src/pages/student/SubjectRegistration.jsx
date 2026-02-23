import React, { useState, useEffect } from 'react';
import { FaBookOpen, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { workflowApi } from '../../services/enterpriseApi';
import { useAuth } from '../../context/AuthContext';

const SubjectRegistration = () => {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    // Mock subjects for the UI showcase
    const availableElectives = [
        { id: 101, name: 'Advanced Machine Learning', code: 'CS701', capacity: 60, enrolled: 58 },
        { id: 102, name: 'Cloud Native Computing', code: 'CS702', capacity: 60, enrolled: 60 },
        { id: 103, name: 'Quantum Cryptography', code: 'CS703', capacity: 40, enrolled: 12 },
    ];

    useEffect(() => {
        const fetchRegs = async () => {
            try {
                // Fake student ID of 1 for structural wiring
                const studentId = user?.id || 1;
                const res = await workflowApi.getRegistrations(studentId);
                setRegistrations(res.data || []);
            } catch (err) {
                console.error(err);
                setRegistrations([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRegs();
    }, [user]);

    const handleRegister = async (subjectId) => {
        try {
            const studentId = user?.id || 1;
            const res = await workflowApi.registerSubject(studentId, subjectId);
            setRegistrations([...registrations, res.data]);
            setMessage({ type: 'success', text: 'Successfully registered for subject!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Registration failed. Subject may be full or already registered.' });
        }
    };

    const isRegistered = (subId) => registrations.some(r => r.subject?.id === subId);

    return (
        <div className="stu-page" style={{ padding: '24px' }}>
            <div className="stu-page-header" style={{ marginBottom: '24px' }}>
                <h2>Elective Subject Registration Portal</h2>
                <p>Register for open electives. Real-time capacity enforced.</p>
            </div>

            {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px', background: message.type === 'success' ? '#DEF7EC' : '#FDE8E8', color: message.type === 'success' ? '#03543F' : '#9B1C1C', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {message.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />} {message.text}
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {availableElectives.map(subject => {
                    const isFull = subject.enrolled >= subject.capacity;
                    const registered = isRegistered(subject.id);
                    const percentFull = (subject.enrolled / subject.capacity) * 100;

                    return (
                        <motion.div key={subject.id} whileHover={{ y: -4 }} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{subject.name}</h3>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{subject.code}</div>
                                </div>
                                <FaBookOpen style={{ color: 'var(--color-primary-navy)', fontSize: '1.5rem', opacity: 0.2 }} />
                            </div>

                            <div style={{ marginBottom: '20px', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                    <span>Capacity</span>
                                    <span style={{ fontWeight: 'bold', color: isFull ? '#EF4444' : 'var(--text-primary)' }}>{subject.enrolled} / {subject.capacity}</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentFull}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        style={{ height: '100%', background: isFull ? '#EF4444' : percentFull > 80 ? '#F59E0B' : '#10B981' }}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={isFull || registered || loading}
                                onClick={() => handleRegister(subject.id)}
                                style={{
                                    padding: '12px', width: '100%', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: (isFull || registered) ? 'not-allowed' : 'pointer',
                                    background: registered ? '#DEF7EC' : isFull ? '#F1F5F9' : 'var(--color-primary-navy)',
                                    color: registered ? '#03543F' : isFull ? '#94A3B8' : 'white'
                                }}
                            >
                                {registered ? 'Registered ✓' : isFull ? 'Capacity Full' : 'Register Now'}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubjectRegistration;
