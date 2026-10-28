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
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Course FeedBack Forms Card */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: '#333333' }}>
                            Course FeedBack Forms
                        </h3>
                        <button
                            onClick={() => setShowCourseFeedbackModal(true)}
                            style={{
                                backgroundColor: '#007bff',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '3px',
                                padding: '5px 12px',
                                fontSize: '0.8125rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Open Sample Form
                        </button>
                    </div>
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6c757d', fontSize: '0.9375rem' }}>
                        There are no feedback forms available.
                    </div>
                </div>

                {/* Training FeedBack Forms Card */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #dee2e6' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: '#333333' }}>
                            Training FeedBack Forms
                        </h3>
                    </div>
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6c757d', fontSize: '0.9375rem' }}>
                        There are no feedback forms available.
                    </div>
                </div>
            </div>

            {/* Course Feedback Modal */}
            {showCourseFeedbackModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #dee2e6',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '500', color: '#333333' }}>
                                Student Course Evaluation Feedback
                            </h3>
                            <button
                                onClick={() => setShowCourseFeedbackModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6c757d' }}
                            >
                                <LuX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitFeedback} style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '16px', backgroundColor: '#e8f4fd', padding: '12px', borderRadius: '4px', fontSize: '0.875rem', color: '#004085' }}>
                                <strong>Course:</strong> CS23511 - Computer Networks (Semester V) <br />
                                <strong>Faculty:</strong> ARAVINDH S (CS190)
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                    1. Punctuality and syllabus completion coverage (1-5 Scale)
                                </label>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <label key={num} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="q1"
                                                checked={rating.q1 === num}
                                                onChange={() => setRating({ ...rating, q1: num })}
                                            />
                                            {num}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                    2. Clarity in subject explanation and practical laboratory demonstrations
                                </label>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <label key={num} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="q2"
                                                checked={rating.q2 === num}
                                                onChange={() => setRating({ ...rating, q2: num })}
                                            />
                                            {num}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                    3. Continuous evaluation transparency and feedback on assessments
                                </label>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <label key={num} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="q3"
                                                checked={rating.q3 === num}
                                                onChange={() => setRating({ ...rating, q3: num })}
                                            />
                                            {num}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                    Suggestions / Additional Remarks
                                </label>
                                <textarea
                                    value={rating.remarks}
                                    onChange={(e) => setRating({ ...rating, remarks: e.target.value })}
                                    rows="3"
                                    placeholder="Enter your constructive feedback here..."
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        border: '1px solid #ced4da',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #dee2e6', paddingTop: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCourseFeedbackModal(false)}
                                    style={{
                                        backgroundColor: '#6c757d',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: '#007bff',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 20px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
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
