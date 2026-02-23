import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FaChild, FaCalendarAlt, FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';

const ParentDashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

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
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                                <FaCalendarAlt color="#10B981" /> <h4>Attendance</h4>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>88%</p>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                                <FaFileAlt color="#3b82f6" /> <h4>Internal Marks</h4>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>42 / 50</p>
                            </div>
                            <div style={{ background: '#fff7ed', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #fed7aa' }}>
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
