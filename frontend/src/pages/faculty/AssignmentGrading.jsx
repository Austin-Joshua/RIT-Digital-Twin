import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/ToastContext';
import { FaFileAlt, FaCheck, FaTimes, FaCommentDots, FaDownload } from 'react-icons/fa';
import api from '../../services/api';

const AssignmentGrading = () => {
    const { addToast } = useToast();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({});
    const [submittingId, setSubmittingId] = useState(null);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/assignments/faculty');
            const list = Array.isArray(res.data) ? res.data : [];
            setAssignments(list);
            const initialScores = {};
            list.forEach(item => {
                if (item.score != null) initialScores[item.id] = item.score;
            });
            setScores(initialScores);
        } catch {
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleScoreChange = (id, val) => {
        setScores(prev => ({ ...prev, [id]: val }));
    };

    const handleGrade = async (id) => {
        const score = scores[id];
        if (score === undefined || score === '' || isNaN(score) || score < 0 || score > 10) {
            addToast('Please enter a valid score between 0 and 10.', 'error');
            return;
        }

        try {
            setSubmittingId(id);
            await api.post(`/assignments/submissions/${id}/grade`, {
                score: Number(score),
                feedback: 'Evaluated by Faculty',
            });
            addToast('Grade persisted to database successfully!', 'success');
            await fetchSubmissions();
        } catch {
            addToast('Grading submission failed. Please try again.', 'error');
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-accent-gold)' }}>
                        <FaFileAlt /> Assignment Assessment Portal
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--theme-text-muted)' }}>Review student submissions, provide feedback, and assign grades</p>
                </div>
            </div>

            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                <div className="p-4 border-b" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                    <h3 className="font-bold" style={{ color: 'var(--theme-text)' }}>Department Course Submissions</h3>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-sm text-[var(--theme-text-muted)]">
                            Loading submissions from authoritative backend...
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="p-8 text-center text-sm text-[var(--theme-text-muted)]">
                            No student assignments submitted yet for your courses.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs uppercase tracking-wider border-b" style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text-muted)', borderColor: 'var(--theme-border)' }}>
                                    <th className="p-4 font-bold">Student</th>
                                    <th className="p-4 font-bold">Course / Title</th>
                                    <th className="p-4 font-bold">Document</th>
                                    <th className="p-4 font-bold">Score (out of 10)</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {assignments.map(item => {
                                    const isGraded = item.status === 'GRADED';
                                    return (
                                        <tr key={item.id} className="border-b transition-colors" style={{ borderColor: 'var(--theme-border)' }}>
                                            <td className="p-4">
                                                <div className="font-bold" style={{ color: 'var(--theme-text)' }}>{item.studentName || 'Student'}</div>
                                                <div className="text-xs font-mono" style={{ color: 'var(--theme-text-muted)' }}>{item.studentRegNumber || '—'}</div>
                                            </td>
                                            <td className="p-4" style={{ color: 'var(--theme-text-muted)' }}>
                                                <div className="font-semibold text-[var(--theme-text)]">{item.assignment?.courseCode || 'Course'}</div>
                                                <div className="text-xs">{item.assignment?.title || 'Assignment'}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="flex items-center gap-2 font-mono text-xs" style={{ color: 'var(--color-primary-600)' }}>
                                                    <FaDownload /> {item.fileUrl ? item.fileUrl.split('/').pop() : 'submission.pdf'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    min="0" max="10"
                                                    value={scores[item.id] !== undefined ? scores[item.id] : ''}
                                                    onChange={(e) => handleScoreChange(item.id, e.target.value)}
                                                    disabled={isGraded}
                                                    className="w-20 px-3 py-1 border rounded disabled:opacity-50"
                                                    style={{
                                                        background: 'var(--theme-bg-muted)',
                                                        color: 'var(--theme-text)',
                                                        borderColor: 'var(--theme-border)'
                                                    }}
                                                />
                                            </td>
                                            <td className="p-4">
                                                {isGraded ? (
                                                    <span className="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase flex w-fit items-center gap-1">
                                                        <FaCheck /> Graded
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {!isGraded && (
                                                    <button
                                                        onClick={() => handleGrade(item.id)}
                                                        disabled={submittingId === item.id}
                                                        className="font-bold px-4 py-1.5 rounded-lg hover:scale-105 transition-all text-sm disabled:opacity-50"
                                                        style={{ background: 'var(--color-primary-navy)', color: 'white' }}
                                                    >
                                                        {submittingId === item.id ? 'Saving...' : 'Submit'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentGrading;
