import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/common/Skeleton';
import { FaChalkboardTeacher, FaCalendarCheck, FaTasks, FaBook, FaUserClock, FaExclamationTriangle, FaFileAlt, FaUsers, FaFlask, FaBus } from 'react-icons/fa';
import ClassRiskHeatmap from '../components/intelligence/ClassRiskHeatmap';

const FacultyDashboard = () => {
    const { user: _user } = useAuth();
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
            <div className="stu-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
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
                    <div className="kpi-more">View Register →</div>
                </div>
                <div className="stu-kpi-card red" onClick={() => navigate('/faculty/analytics')}>
                    <div className="kpi-main">
                        <div className="kpi-value">2</div>
                        <div className="kpi-label">At Risk Students</div>
                    </div>
                    <FaExclamationTriangle className="kpi-icon" />
                    <div className="kpi-more">View Analytics →</div>
                </div>
                <div className="stu-kpi-card purple" onClick={() => navigate('/faculty/assignments')}>
                    <div className="kpi-main">
                        <div className="kpi-value">3</div>
                        <div className="kpi-label">Assignments to Grade</div>
                    </div>
                    <FaFileAlt className="kpi-icon" />
                    <div className="kpi-more">More info →</div>
                </div>
                <div className="stu-kpi-card blue" onClick={() => navigate('/faculty/proctor')}>
                    <div className="kpi-main">
                        <div className="kpi-value">12</div>
                        <div className="kpi-label">Proctor Wards</div>
                    </div>
                    <FaUsers className="kpi-icon" />
                    <div className="kpi-more">More info →</div>
                </div>
                <div className="stu-kpi-card orange" onClick={() => navigate('/faculty/research')}>
                    <div className="kpi-main">
                        <div className="kpi-value">2</div>
                        <div className="kpi-label">New Publications</div>
                    </div>
                    <FaFlask className="kpi-icon" />
                    <div className="kpi-more">More info →</div>
                </div>
                <div className="stu-kpi-card blue-light" onClick={() => navigate('/transport')}>
                    <div className="kpi-main">
                        <div className="kpi-value">RIT</div>
                        <div className="kpi-label">Transport Routes</div>
                    </div>
                    <FaBus className="kpi-icon" />
                    <div className="kpi-more">View Directory →</div>
                </div>
            </div>

            {/* Info Cards Row */}
            <div className="stu-info-row">
                <div className="stu-info-card">
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaChalkboardTeacher color="var(--color-primary-navy)" />
                        <span style={{ color: 'var(--theme-text)' }}>My Assigned Subjects</span>
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

                <div className="stu-info-card" style={{ borderTopColor: 'var(--color-accent-gold)' }}>
                    <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaTasks color="var(--color-accent-gold)" />
                        <span style={{ color: 'var(--theme-text)' }}>Recent Tasks / Approvals</span>
                    </div>
                    <div className="info-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div
                                onClick={() => navigate('/faculty/leaves')}
                                style={{ padding: '12px', borderLeft: '4px solid var(--color-warning)', background: 'var(--theme-bg-muted)', fontSize: '13px', cursor: 'pointer', transition: '0.2s', color: 'var(--theme-text)', borderRadius: '0 8px 8px 0' }}
                                className="hover:opacity-80"
                            >
                                <strong style={{ color: 'var(--color-warning)' }}>3 New Leave requests</strong> pending review for CSE-A
                            </div>
                            <div
                                onClick={() => navigate('/faculty/leaves')}
                                style={{ padding: '12px', borderLeft: '4px solid var(--color-primary-navy)', background: 'var(--theme-bg-muted)', fontSize: '13px', cursor: 'pointer', transition: '0.2s', color: 'var(--theme-text)', borderRadius: '0 8px 8px 0' }}
                                className="hover:opacity-80"
                            >
                                <strong style={{ color: 'var(--color-primary-navy)' }}>1 OD request</strong> pending for Sports quota
                            </div>
                        </div>
                    </div>
                    <div className="info-footer">
                        <button
                            className="table-btn"
                            style={{ width: '100%', background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-700) 100%)', color: 'var(--color-primary-navy)', fontWeight: 'bold', border: 'none' }}
                            onClick={() => navigate('/faculty/leaves')}
                        >
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
