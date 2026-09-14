import React, { useState } from 'react';
import { FaFileAlt, FaUpload, FaCheckCircle, FaClock, FaDownload, FaAward } from 'react-icons/fa';
import { useAuth } from '../../hooks/AuthContext';
import { useToast } from '../../hooks/ToastContext';

const SUBJECTS = [
    { code: 'CS3401', name: 'Algorithms & Data Structures', faculty: 'Dr. Maheswari R', assign1: 9, assign2: 9, deadline: '2026-09-20', status: 'Submitted', file: 'CS3401_Assignment1_Austin.pdf' },
    { code: 'CS3402', name: 'Operating Systems', faculty: 'Dr. Sundar R', assign1: 8, assign2: 9, deadline: '2026-09-25', status: 'Submitted', file: 'CS3402_OS_Kernel_Submission.pdf' },
    { code: 'CS3403', name: 'Computer Networks', faculty: 'Prof. N. Pragadish', assign1: 10, assign2: 8, deadline: '2026-09-18', status: 'Pending', file: null },
    { code: 'CS3404', name: 'Database Management Systems', faculty: 'Dr. R. Raghu', assign1: 9, assign2: 10, deadline: '2026-09-22', status: 'Submitted', file: 'DBMS_ER_Model_Assignment.pdf' },
    { code: 'GE3401', name: 'Professional Ethics & Human Values', faculty: 'Dr. S. Gopi', assign1: 10, assign2: 9, deadline: '2026-09-28', status: 'Pending', file: null },
];

const AssignmentMark = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [assignmentsList, setAssignmentsList] = useState(SUBJECTS);
    const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' or 'marks'

    const handleFileUpload = (code) => {
        setAssignmentsList(prev => prev.map(item => {
            if (item.code === code) {
                return { ...item, status: 'Submitted', file: `${code}_Assignment_Submission.pdf` };
            }
            return item;
        }));
        addToast(`Assignment submitted successfully for ${code}!`, 'success');
    };

    return (
        <div className="stu-dashboard space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3 text-[var(--theme-text)]">
                        <FaFileAlt className="text-[#0B2C6B] dark:text-gold-500" /> Academic Assignments & Marks
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        View course assignments, submit solutions, and track assignment evaluation marks for Register No: <strong>{user?.username || '2117240020044'}</strong>.
                    </p>
                </div>
            </div>

            {/* Sub-navigation Tabs */}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {assignmentsList.map((item) => {
                                    const isSubmitted = item.status === 'Submitted';
                                    return (
                                        <div key={item.code} className="border border-gray-100 dark:border-navy-700 rounded-xl p-5 bg-gray-50/40 dark:bg-navy-900/40 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                                                    {item.code}
                                                </span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${isSubmitted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                    {isSubmitted ? <FaCheckCircle /> : <FaClock />} {item.status}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-navy-900 dark:text-white text-base mb-1">{item.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Faculty: <strong>{item.faculty}</strong></p>
                                            
                                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-navy-700 pt-3">
                                                <span>Due Date: <strong>{item.deadline}</strong></span>
                                                {isSubmitted ? (
                                                    <span className="text-xs text-blue-600 dark:text-gold-500 flex items-center gap-1 font-semibold">
                                                        <FaDownload /> {item.file}
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleFileUpload(item.code)}
                                                        className="table-btn primary"
                                                        style={{ padding: '4px 10px', fontSize: '11px' }}
                                                    >
                                                        <FaUpload /> Submit Assignment
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'marks' && (
                        <div className="overflow-x-auto">
                            <table className="stu-data-table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Subject Code</th>
                                        <th>Subject Name</th>
                                        <th>Faculty Name</th>
                                        <th>Assignment 1 (10 M)</th>
                                        <th>Assignment 2 (10 M)</th>
                                        <th>Total Score (50 M Scale)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignmentsList.map((item) => (
                                        <tr key={item.code}>
                                            <td><strong>{item.code}</strong></td>
                                            <td>{item.name}</td>
                                            <td>{item.faculty}</td>
                                            <td className="font-bold text-blue-600 dark:text-blue-400">{item.assign1} / 10</td>
                                            <td className="font-bold text-blue-600 dark:text-blue-400">{item.assign2} / 10</td>
                                            <td className="font-black text-navy-900 dark:text-gold-500">{(item.assign1 + item.assign2) * 2.5} / 50</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentMark;
