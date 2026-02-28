import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { FaFileAlt, FaCheck, FaTimes, FaCommentDots, FaDownload } from 'react-icons/fa';

const AssignmentGrading = () => {
    const { addToast } = useToast();
    const [assignments, setAssignments] = useState([
        { id: 101, student: 'Aakash S', reg: '211520104001', submittedAt: '2024-03-01 10:20 AM', status: 'pending', file: 'assign1_aakash.pdf', score: '' },
        { id: 102, student: 'Balaji K', reg: '211520104002', submittedAt: '2024-03-01 11:45 AM', status: 'graded', file: 'assign1_balaji.pdf', score: 9 },
        { id: 103, student: 'Chandini R', reg: '211520104003', submittedAt: '2024-03-01 02:15 PM', status: 'pending', file: 'assign1_chandini.pdf', score: '' },
    ]);

    const handleScoreChange = (id, val) => {
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, score: val } : a));
    };

    const handleGrade = (id) => {
        const item = assignments.find(a => a.id === id);
        if (!item.score) {
            addToast('Please enter a valid score before grading.', 'error');
            return;
        }
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: 'graded' } : a));
        addToast(`Graded ${item.student} successfully.`, 'success');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        <FaFileAlt className="text-gold-500" /> Assignment Assessment Portal
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Review student submissions, provide feedback, and assign grades</p>
                </div>
            </div>

            <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50">
                    <h3 className="font-bold text-navy-900 dark:text-white">CS8651 - Assignment 1 Submissions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-navy-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-navy-700">
                                <th className="p-4 font-bold">Student</th>
                                <th className="p-4 font-bold">Submitted Date</th>
                                <th className="p-4 font-bold">Document</th>
                                <th className="p-4 font-bold">Score (out of 10)</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {assignments.map(item => (
                                <tr key={item.id} className="border-b border-gray-50 dark:border-navy-800">
                                    <td className="p-4">
                                        <div className="font-bold text-navy-900 dark:text-white">{item.student}</div>
                                        <div className="text-xs text-gray-500 font-mono">{item.reg}</div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{item.submittedAt}</td>
                                    <td className="p-4">
                                        <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 transition-colors">
                                            <FaDownload /> {item.file}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="number"
                                            min="0" max="10"
                                            value={item.score}
                                            onChange={(e) => handleScoreChange(item.id, e.target.value)}
                                            disabled={item.status === 'graded'}
                                            className="w-20 px-3 py-1 border border-gray-200 dark:border-navy-600 rounded bg-white dark:bg-navy-900 text-gray-800 dark:text-white disabled:opacity-50"
                                        />
                                    </td>
                                    <td className="p-4">
                                        {item.status === 'pending' ? (
                                            <span className="text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase">Pending</span>
                                        ) : (
                                            <span className="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase flex w-fit items-center gap-1"><FaCheck /> Graded</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {item.status === 'pending' && (
                                            <button
                                                onClick={() => handleGrade(item.id)}
                                                className="bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 font-bold px-4 py-1.5 rounded-lg hover:bg-navy-800 hover:scale-105 transition-all text-sm"
                                            >
                                                Submit
                                            </button>
                                        )}
                                        {item.status === 'graded' && (
                                            <button className="text-gray-400 hover:text-blue-500 transition-colors" title="Add Feedback Comment">
                                                <FaCommentDots className="text-xl mx-auto" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AssignmentGrading;
