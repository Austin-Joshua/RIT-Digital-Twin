import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/common/Skeleton';
import { FaChalkboardTeacher, FaCalendarCheck, FaTasks, FaBook, FaUserClock, FaExclamationTriangle } from 'react-icons/fa';
import ClassRiskHeatmap from '../components/intelligence/ClassRiskHeatmap';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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

    if (loading) return (
        <div style={{ padding: '24px' }}>
            <Skeleton height="200px" />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header / Breadcrumb Mirror from Student */}
            {/* Dashboard header removed as per user request */}

            {/* KPI Cards Placeholder - Matching Student Style */}
            <div className="stu-kpi-row">
                <div className="stu-kpi-card green" onClick={() => navigate('/faculty/academics')}>
                    <div className="kpi-main">
                        <div className="kpi-value">{subjects.length}</div>
                        <div className="kpi-label">Courses</div>
                    </div>
                    <FaBook className="kpi-icon" />
                    <div className="kpi-more">More info →</div>
                </div>
                <div className="stu-kpi-card teal" onClick={() => navigate('/faculty/leaves')}>
                    <div className="kpi-main">
                        <div className="kpi-value">4</div>
                        <div className="kpi-label">Pending Requests</div>
                    </div>
                    <FaCalendarCheck className="kpi-icon" />
                    <div className="kpi-more">More info →</div>
                </div>
                <div className="stu-kpi-card yellow" onClick={() => navigate('/faculty/attendance')}>
                    <div className="kpi-main">
                        <div className="kpi-value">92%</div>
                        <div className="kpi-label">Avg Attendance</div>
                    </div>
                    <FaUserClock className="kpi-icon" />
                    <div className="kpi-more">More info →</div>
                </div>
                <div className="stu-kpi-card red" onClick={() => navigate('/faculty/analytics')}>
                    <div className="kpi-main">
                        <div className="kpi-value">2</div>
                        <div className="kpi-label">At Risk Students</div>
                    </div>
                    <FaExclamationTriangle className="kpi-icon" />
                    <div className="kpi-more">More info →</div>
                </div>
            </div>

            {/* Info Cards Row */}
            <div className="stu-info-row">
                <div className="stu-info-card">
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaChalkboardTeacher color="#0B2C6B" />
                        <span>My Assigned Subjects</span>
                    </div>
                    <div className="info-body">
                        <table className="stu-data-table">
                            <thead>
                                <tr>
                                    <th>Subject Code</th>
                                    <th>Subject Name</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.length > 0 ? subjects.map(s => (
                                    <tr key={s.subjectId}>
                                        <td>{s.subjectCode}</td>
                                        <td>{s.subjectName}</td>
                                        <td><span className="percent-cell good">Active</span></td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', color: '#999' }}>No subjects assigned.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="stu-info-card" style={{ borderTopColor: '#f39c12' }}>
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaTasks color="#f39c12" />
                        <span>Recent Tasks / Approvals</span>
                    </div>
                    <div className="info-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ padding: '8px', borderLeft: '3px solid #f39c12', background: '#fffef0', fontSize: '13px' }}>
                                <strong>3 New Leave requests</strong> pending review for CSE-A
                            </div>
                            <div style={{ padding: '8px', borderLeft: '3px solid #00c0ef', background: '#f0fbff', fontSize: '13px' }}>
                                <strong>1 OD request</strong> pending for Sports quota
                            </div>
                        </div>
                    </div>
                    <div className="info-footer">
                        <button className="table-btn primary" style={{ width: '100%', background: '#f39c12', borderColor: '#f39c12' }}>
                            Review All Approvals
                        </button>
                    </div>
                </div>
            </div>

            <div className="stu-info-card" style={{ borderTopColor: '#00a65a' }}>
                <div className="info-header">
                    Class Performance Heatmap (Analytics)
                </div>
                <div className="info-body">
                    <ClassRiskHeatmap />
                </div>
            </div>
        </div>
    );
};
export default FacultyDashboard;
