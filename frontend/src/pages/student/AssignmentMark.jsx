import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaUpload, FaCheckCircle, FaClock, FaDownload, FaAward } from 'react-icons/fa';
import { useAuth } from '../../hooks/AuthContext';
import { useToast } from '../../hooks/ToastContext';
import api from '../../services/api';

const AssignmentMark = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [assignmentsList, setAssignmentsList] = useState([]);
    const [marksList, setMarksList] = useState([]);
    const [activeTab, setActiveTab] = useState('assignments');
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState(null);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/assignments/student');
            const data = Array.isArray(res.data) ? res.data : [];
            setAssignmentsList(data);
        } catch {
            setAssignmentsList([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMarks = async () => {
        try {
            const res = await api.get('/erp/student/internal-marks');
            setMarksList(Array.isArray(res.data) ? res.data : []);
        } catch {
            setMarksList([]);
        }
    };

    useEffect(() => {
        fetchAssignments();
        fetchMarks();
    }, [user]);

    const handleFileUpload = async (assignmentId, courseCode) => {
        try {
            setSubmittingId(assignmentId);
            const fileName = `${courseCode}_Assignment_${user?.username || 'Submission'}.pdf`;
            await api.post(`/assignments/${assignmentId}/submit`, {
                fileUrl: `/uploads/assignments/${fileName}`,
                remarks: 'Submitted via RIT Digital Twin Portal',
            });
            addToast(`Assignment successfully submitted for ${courseCode}!`, 'success');
            await fetchAssignments();
        } catch {
            addToast('Submission failed. Please check network connection and try again.', 'error');
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <div className="stu-dashboard space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3 text-[var(--theme-text)]">
                        <FaFileAlt className="text-[#0B2C6B] dark:text-gold-500" /> Academic Assignments & Marks
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        View course assignments, submit solutions, and track evaluation records for: <strong>{user?.username || 'Student'}</strong>.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50">
                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'assignments' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-navy-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'}`}
                    >
                        <FaFileAlt /> Course Assignments & Submissions
                    </button>
                    <button
                        onClick={() => setActiveTab('marks')}
                        className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'marks' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-navy-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'}`}
                    >
                        <FaAward /> Internal Assignment Marks Breakdown
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'assignments' && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="p-8 text-center text-sm text-[var(--theme-text-muted)]">
                                    Loading course assignments from backend database...
                                </div>
                            ) : assignmentsList.length === 0 ? (
                                <div className="p-8 bg-gray-50 dark:bg-navy-900/40 rounded-xl text-center border border-gray-100 dark:border-navy-700">
                                    <h3 className="font-bold text-sm text-navy-900 dark:text-white mb-1">No Active Assignments</h3>
                                    <p className="text-xs text-gray-500">Your course instructors have not posted any pending assignments at this time.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {assignmentsList.map((item) => {
                                        const isSubmitted = item.status === 'Submitted' || item.status === 'SUBMITTED' || item.status === 'GRADED';
                                        return (
                                            <div key={item.id} className="border border-gray-100 dark:border-navy-700 rounded-xl p-5 bg-gray-50/40 dark:bg-navy-900/40 hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                                                        {item.courseCode}
                                                    </span>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${isSubmitted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                        {isSubmitted ? <FaCheckCircle /> : <FaClock />} {isSubmitted ? 'Submitted' : 'Pending'}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-navy-900 dark:text-white text-base mb-1">{item.title}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.description}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Faculty in charge: <strong>{item.facultyName}</strong></p>
                                                
                                                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-navy-700 pt-3">
                                                    <span>Due: <strong>{item.deadline}</strong></span>
                                                    {isSubmitted ? (
                                                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-semibold">
                                                            <FaCheckCircle /> Submission Recorded
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={submittingId === item.id}
                                                            onClick={() => handleFileUpload(item.id, item.courseCode)}
                                                            className="table-btn primary"
                                                            style={{ padding: '4px 10px', fontSize: '11px' }}
                                                        >
                                                            <FaUpload /> {submittingId === item.id ? 'Submitting...' : 'Submit Assignment'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'marks' && (
                        <div className="overflow-x-auto">
                            {marksList.length === 0 ? (
                                <div className="p-8 bg-gray-50 dark:bg-navy-900/40 rounded-xl text-center border border-gray-100 dark:border-navy-700">
                                    <h3 className="font-bold text-sm text-navy-900 dark:text-white mb-1">No Assignment Marks Recorded</h3>
                                    <p className="text-xs text-gray-500">Evaluation marks will appear here once assignments are graded by faculty.</p>
                                </div>
                            ) : (
                                <table className="stu-data-table" style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th>Subject Code</th>
                                            <th>Subject Name</th>
                                            <th>Assignment Mark</th>
                                            <th>Total Weightage</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {marksList.map((item) => (
                                            <tr key={item.studentSubjectId || item.subjectCode}>
                                                <td><strong>{item.subjectCode}</strong></td>
                                                <td>{item.subjectName}</td>
                                                <td className="font-bold text-blue-600 dark:text-blue-400">
                                                    {item.assignmentMarks != null ? `${item.assignmentMarks} / 10` : '—'}
                                                </td>
                                                <td className="font-black text-navy-900 dark:text-gold-500">
                                                    {item.totalInternal != null ? `${item.totalInternal} / 50` : '—'}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${item.assignmentMarks != null ? 'approved' : 'pending'}`}>
                                                        {item.assignmentMarks != null ? 'Evaluated' : 'Awaiting Grading'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentMark;
