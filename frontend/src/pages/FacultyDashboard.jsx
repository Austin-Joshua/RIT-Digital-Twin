import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/common/Skeleton';
import { FaChalkboardTeacher, FaCalendarCheck, FaTasks } from 'react-icons/fa';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacultyData = async () => {
            try {
                const subRes = await api.get('/academic/faculty/subjects');
                setSubjects(subRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFacultyData();
    }, []);

    if (loading) return <div style={{ padding: '24px' }}><Skeleton height="200px" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '14px', borderLeft: '5px solid #D4AF37' }}>
                <h2>Welcome, {user?.username}</h2>
                <p>Faculty Operations Dashboard</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3><FaChalkboardTeacher /> My Subjects</h3>
                    <ul>
                        {subjects.length > 0 ? subjects.map(s => <li key={s.subjectId}>{s.subjectName} ({s.subjectCode})</li>) : <li>No subjects assigned.</li>}
                    </ul>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3><FaTasks /> Tasks</h3>
                    <p>3 New Leave requests pending</p>
                    <p>1 OD request pending</p>
                    <button style={{ padding: '8px 16px', background: '#0B2C6B', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '12px' }}>Review Now</button>
                </div>
            </div>
        </div>
    );
};
export default FacultyDashboard;
