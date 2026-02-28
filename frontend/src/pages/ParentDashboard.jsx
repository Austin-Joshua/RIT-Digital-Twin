import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { FaChild, FaCalendarAlt, FaExclamationTriangle, FaFileAlt, FaTimes } from 'react-icons/fa';

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

const ParentDashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDetail, setSelectedDetail] = useState(null);

    useEffect(() => {
        const fetchLinkedStudents = async () => {
            try {
                const res = await api.get('/api/parent/students');
                setStudents(res.data);
            } catch (err) {
                console.error("Failed to fetch students", err);
            }
            setLoading(false);
        };
        fetchLinkedStudents();
    }, []);

    const handleCardClick = (title, content, data = null) => {
        setSelectedDetail({ title, content, data });
    };

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {selectedDetail && (
                <DetailModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {students.map(student => (
                    <div key={student.id} style={{ background: 'white', padding: '24px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaChild size={24} color="#0B2C6B" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{student.user.firstName} {student.user.lastName}</h3>
                                <p style={{ color: '#64748b', margin: 0 }}>Roll No: {student.studentIdNumber} | CGPA: {student.currentCgpa}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div
                                style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                                onClick={() => handleCardClick(`${student.user.firstName}'s Attendance`, `Current attendance is 88%. This student has attended 44 out of 50 classes this semester.`)}
                                title="Click to view detailed attendance"
                            >
                                <FaCalendarAlt color="#10B981" /> <h4>Attendance</h4>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>88%</p>
                            </div>
                            <div
                                style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                                onClick={() => handleCardClick(`${student.user.firstName}'s Internal Marks`, `Current internal marks score: 42/50. Top performance in Mathematics and Physics.`)}
                                title="Click to view detailed marks"
                            >
                                <FaFileAlt color="#3b82f6" /> <h4>Internal Marks</h4>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>42 / 50</p>
                            </div>
                            <div
                                style={{ background: '#fff7ed', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #fed7aa', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
                                onClick={() => handleCardClick(`Risk Factor: ${student.user.firstName}`, `Student is currently at a LOW risk level. Attendance above 85% and academic performance is stable. No immediate intervention required.`)}
                                title="Click to view risk analysis"
                            >
                                <FaExclamationTriangle color="#f59e0b" /> <h4>Risk Level</h4>
                                <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>LOW</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParentDashboard;
