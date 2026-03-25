import React, { useState, useEffect } from 'react';
import { academicAiApi } from '../../../services/enterpriseApi';
import { FaLightbulb, FaCheckCircle } from 'react-icons/fa';

const CareerRecommendation = ({ studentId }) => {
    const [recommendation, setRecommendation] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await academicAiApi.getCareerRecommendation(studentId);
                setRecommendation(res.data);
            } catch (err) {
                console.error("Career fetch failed", err);
            }
        };
        fetchData();
    }, [studentId]);

    if (!recommendation) return <div>Loading Career Insights...</div>;

    return (
        <div className="stu-info-card" style={{ padding: '20px', borderTop: '4px solid #F59E0B' }}>
            <div className="info-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaLightbulb style={{ color: '#F59E0B' }} />
                    AI Career Recommendation
                </div>
                <div style={{ fontSize: '0.8rem', background: '#FEF3C7', color: '#92400E', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                    {recommendation.placementProbability.toFixed(1)}% Suitability
                </div>
            </div>

            <div style={{ marginTop: '15px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                    {recommendation.recommendedDomain}
                </div>

                <div style={{ marginTop: '15px', background: '#FFFBEB', padding: '15px', borderRadius: '8px', border: '1px solid #FEF3C7' }}>
                    <div style={{ color: '#92400E', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>Skill Gap Analysis</div>
                    <p style={{ color: '#B45309', fontSize: '0.85rem', margin: 0 }}>
                        {recommendation.skillGapAnalysis}
                    </p>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Recommended Certifications</div>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px' }}>
                        {recommendation.suggestedCertifications.split(',').map(cert => (
                            <li key={cert} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#1e293b', marginBottom: '6px' }}>
                                <FaCheckCircle style={{ color: '#10B981', fontSize: '0.75rem' }} />
                                {cert.trim()}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CareerRecommendation;
