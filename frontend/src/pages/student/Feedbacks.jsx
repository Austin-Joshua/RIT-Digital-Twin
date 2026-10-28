import React, { useState } from 'react';
import { LuMessageSquare, LuStar, LuCircleCheck, LuX } from 'react-icons/lu';
import { useToast } from '../../hooks/ToastContext';

const Feedbacks = () => {
    const { addToast } = useToast();
    const [showCourseFeedbackModal, setShowCourseFeedbackModal] = useState(false);
    const [rating, setRating] = useState({
        q1: 5,
        q2: 5,
        q3: 4,
        q4: 5,
        remarks: ''
    });

    const handleSubmitFeedback = (e) => {
        e.preventDefault();
        setShowCourseFeedbackModal(false);
        addToast('Feedback submitted successfully. Thank you for your response!', 'success');
    };

        return (
        <div className="ims-page-container">
            {/* Header Banner following TransportDirectory & Simulator hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuMessageSquare />
                    </div>
                    <div>
                        <h1 className="ims-header-title">Student Feedbacks</h1>
                        <p className="ims-header-subtitle">Course exit surveys, faculty feedback forms, and training appraisals</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setShowCourseFeedbackModal(true)}
                        className="ims-candy-btn ims-candy-primary"
                    >
                        Open Sample Form
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Course FeedBack Forms Card */}
                <div className="ims-card-elevated">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                            Course FeedBack Forms
                        </h3>
                    </div>
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
                        There are no feedback forms available.
                    </div>
                </div>

                {/* Training FeedBack Forms Card */}
                <div className="ims-card-elevated">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                            Training FeedBack Forms
                        </h3>
                    </div>
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
                        There are no feedback forms available.
                    </div>
                </div>
            </div>

            {/* Course Feedback Modal with Curvy Candy Styling */}
            {showCourseFeedbackModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '580px',
                        maxHeight: '90vh',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            padding: '18px 24px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f8fafc'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
                                    Course Feedback: Computer Networks
                                </h3>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                    Faculty: ARAVINDH S (CS190)
                                </span>
                            </div>
                            <button
                                onClick={() => setShowCourseFeedbackModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px', display: 'flex' }}
                            >
                                <LuX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitFeedback} style={{ padding: '24px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                                        1. The instructor covers syllabus topics thoroughly and clearly:
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {[1, 2, 3, 4, 5].map((val) => (
                                            <button
                                                type="button"
                                                key={val}
                                                onClick={() => setRating({ ...rating, q1: val })}
                                                className={`ims-candy-btn ${rating.q1 === val ? 'ims-candy-primary' : 'ims-candy-neutral'} ims-candy-sm`}
                                            >
                                                {val} {val === 5 ? '★ (Excellent)' : '★'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                                        2. Clarity of explanations and practical demonstrations:
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {[1, 2, 3, 4, 5].map((val) => (
                                            <button
                                                type="button"
                                                key={val}
                                                onClick={() => setRating({ ...rating, q2: val })}
                                                className={`ims-candy-btn ${rating.q2 === val ? 'ims-candy-primary' : 'ims-candy-neutral'} ims-candy-sm`}
                                            >
                                                {val} {val === 5 ? '★ (Excellent)' : '★'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                                        3. Course materials, notes, and question banks provided:
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {[1, 2, 3, 4, 5].map((val) => (
                                            <button
                                                type="button"
                                                key={val}
                                                onClick={() => setRating({ ...rating, q3: val })}
                                                className={`ims-candy-btn ${rating.q3 === val ? 'ims-candy-primary' : 'ims-candy-neutral'} ims-candy-sm`}
                                            >
                                                {val} {val === 5 ? '★ (Excellent)' : '★'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                                        Additional Suggestions / Comments (Optional):
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="Enter any constructive feedback..."
                                        value={rating.remarks}
                                        onChange={(e) => setRating({ ...rating, remarks: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1.5px solid #cbd5e1',
                                            fontSize: '0.875rem',
                                            color: '#334155',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '18px', marginTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCourseFeedbackModal(false)}
                                    className="ims-candy-btn ims-candy-neutral"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ims-candy-btn ims-candy-success"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Feedbacks;
