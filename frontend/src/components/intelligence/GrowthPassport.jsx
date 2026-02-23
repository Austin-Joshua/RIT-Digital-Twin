import React, { useState, useEffect } from 'react';
import { academicAiApi } from '../../services/enterpriseApi';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { FaPassport, FaAward } from 'react-icons/fa';

const GrowthPassport = ({ studentId }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await academicAiApi.getGrowthPassport(studentId);
                setData(res.data);
            } catch (err) {
                console.error("Passport fetch failed", err);
            }
        };
        fetchData();
    }, [studentId]);

    if (!data) return <div>Loading Passport...</div>;

    const radarData = [
        { subject: 'Academic', A: data.academicStrength, fullMark: 100 },
        { subject: 'Practical', A: data.practicalSkills, fullMark: 100 },
        { subject: 'Attendance', A: data.attendanceConsistency, fullMark: 100 },
        { subject: 'Improvement', A: data.performanceImprovement, fullMark: 100 },
    ];

    return (
        <div className="stu-info-card" style={{ padding: '20px' }}>
            <div className="info-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', border: 'none' }}>
                <FaPassport style={{ color: '#teal' }} />
                Academic Growth Passport (360°)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '25px', marginTop: '20px' }}>
                <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <Radar name="Student" dataKey="A" stroke="#0D9488" fill="#0D9488" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="metric-box">
                            <div className="label">Placement Readiness</div>
                            <div className="value" style={{ color: '#0D9488' }}>{data.placementReadinessScore.toFixed(1)}%</div>
                        </div>
                        <div className="metric-box">
                            <div className="label">Skills Certified</div>
                            <div className="value">{data.skills.length}</div>
                        </div>
                        <div className="metric-box">
                            <div className="label">Projects</div>
                            <div className="value">{data.projectsCompleted}</div>
                        </div>
                        <div className="metric-box">
                            <div className="label">Internships</div>
                            <div className="value">{data.internshipsCompleted}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Technical Skills</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                            {data.skills.map(s => (
                                <span key={s} style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem' }}>{s}</span>
                            ))}
                            {data.skills.length === 0 && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No skills added</span>}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .metric-box {
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                    text-align: center;
                }
                .metric-box .label {
                    font-size: 0.75rem;
                    color: #64748b;
                    margin-bottom: 4px;
                }
                .metric-box .value {
                    font-size: 1.1rem;
                    font-weight: bold;
                    color: #1e293b;
                }
            `}</style>
        </div>
    );
};

export default GrowthPassport;
