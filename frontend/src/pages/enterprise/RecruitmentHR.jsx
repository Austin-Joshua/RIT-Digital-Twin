import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { FaUserPlus, FaUsers, FaBriefcase, FaFileInvoice, FaCheck, FaTimes, FaFilter } from 'react-icons/fa';

const RecruitmentHR = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('recruitment'); // recruitment, payroll

    const applicants = [
        { id: 201, name: 'Dr. Sarah Jenifer', role: 'Asst. Professor (CSE)', status: 'Interview Scheduled', experience: '5 Yrs', date: 'Mar 15, 2024', aiScore: 94 },
        { id: 202, name: 'Mr. Rajesh Kumar', role: 'Lab Assistant (ECE)', status: 'Screening', experience: '2 Yrs', date: 'Mar 12, 2024', aiScore: 78 },
        { id: 203, name: 'Dr. John Doe', role: 'Professor (Mech)', status: 'Offer Extended', experience: '12 Yrs', date: 'Feb 28, 2024', aiScore: 89 },
    ];

    const payroll = [
        { id: 'EMP1045', name: 'Prof. Anitha M', dept: 'CSE', basic: 75000, hra: 15000, ded: 5000, net: 85000, status: 'Processed' },
        { id: 'EMP1082', name: 'Dr. Karthik S', dept: 'ECE', basic: 90000, hra: 18000, ded: 7000, net: 101000, status: 'Pending' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        <FaUserPlus className="text-gold-500" /> Human Resources & Recruitment
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage hiring pipelines, faculty onboarding, and payroll processing</p>
                </div>
            </div>

            <div className="stu-kpi-row">
                <div className="stu-kpi-card blue cursor-pointer hover:scale-[1.02] transition-transform">
                    <div className="kpi-main">
                        <div className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">Open Positions</div>
                        <div className="text-4xl font-black mb-1 text-white">12</div>
                        <div className="text-sm text-blue-100">Across All Departments</div>
                    </div>
                    <div className="kpi-icon"><FaBriefcase /></div>
                </div>

                <div className="stu-kpi-card amber cursor-pointer hover:scale-[1.02] transition-transform">
                    <div className="kpi-main">
                        <div className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-2">Active Candidates</div>
                        <div className="text-4xl font-black mb-1" style={{ color: 'var(--ims-bg-light)' }}>48</div>
                        <div className="text-sm text-amber-900">In Interview Pipeline</div>
                    </div>
                    <div className="kpi-icon"><FaUsers /></div>
                </div>

                <div className="stu-kpi-card green cursor-pointer hover:scale-[1.02] transition-transform">
                    <div className="kpi-main">
                        <div className="text-sm font-bold text-green-200 uppercase tracking-wider mb-2">Offers Accepted</div>
                        <div className="text-4xl font-black mb-1 text-white">5</div>
                        <div className="text-sm text-green-100">This Quarter</div>
                    </div>
                    <div className="kpi-icon"><FaCheck /></div>
                </div>

                <div className="stu-kpi-card purple cursor-pointer hover:scale-[1.02] transition-transform">
                    <div className="kpi-main">
                        <div className="text-sm font-bold text-purple-200 uppercase tracking-wider mb-2">Payroll Status</div>
                        <div className="text-4xl font-black mb-1 text-white">68%</div>
                        <div className="text-sm text-purple-100">Processing Pending</div>
                    </div>
                    <div className="kpi-icon"><FaFileInvoice /></div>
                </div>
            </div>

            <div className="bg-white dark:bg-navy-900 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50">
                    <button
                        onClick={() => setActiveTab('recruitment')}
                        className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'recruitment' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-[#123C8C]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-900/50'}`}
                    >
                        <FaBriefcase /> Applicant Tracking
                    </button>
                    <button
                        onClick={() => setActiveTab('payroll')}
                        className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'payroll' ? 'text-navy-900 dark:text-gold-500 border-b-2 border-navy-900 dark:border-gold-500 bg-white dark:bg-[#123C8C]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-900/50'}`}
                    >
                        <FaFileInvoice /> Faculty Payroll
                    </button>
                </div>

                <div className="p-0">
                    {activeTab === 'recruitment' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white dark:bg-navy-900 text-gray-500 dark:text-gray-200 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-navy-700">
                                        <th className="p-4 font-bold">Candidate Name</th>
                                        <th className="p-4 font-bold">Applied Role</th>
                                        <th className="p-4 font-bold">Experience</th>
                                        <th className="p-4 font-bold">AI Matching Score</th>
                                        <th className="p-4 font-bold">Stage Tracker</th>
                                        <th className="p-4 font-bold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {applicants.map(app => (
                                        <tr key={app.id} className="border-b border-gray-50 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-900/30">
                                            <td className="p-4">
                                                <div className="font-bold text-navy-900 dark:text-white">{app.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-300 mt-0.5 font-medium">Applied: {app.date}</div>
                                            </td>
                                            <td className="p-4 font-bold text-navy-800 dark:text-gold-500">{app.role}</td>
                                            <td className="p-4 font-medium text-gray-700 dark:text-gray-200">{app.experience}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden w-20">
                                                        <div className="h-full bg-green-500" style={{ width: `${app.aiScore}%` }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-green-600">{app.aiScore}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-black ${app.status.includes('Offer') ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : app.status.includes('Interview') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-black text-sm transition-colors">View Profile</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'payroll' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white dark:bg-navy-900 text-gray-500 dark:text-gray-200 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-navy-700">
                                        <th className="p-4 font-bold">Employee Name</th>
                                        <th className="p-4 font-bold">Department</th>
                                        <th className="p-4 font-bold">Gross Earnings</th>
                                        <th className="p-4 font-bold">Deductions</th>
                                        <th className="p-4 font-bold">Net Pay</th>
                                        <th className="p-4 font-bold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {payroll.map(p => (
                                        <tr key={p.id} className="border-b border-gray-50 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-900/30">
                                            <td className="p-4">
                                                <div className="font-bold text-navy-900 dark:text-white">{p.name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5 dark:text-gray-300">{p.id}</div>
                                            </td>
                                            <td className="p-4 font-bold text-gray-600 dark:text-gray-200">{p.dept}</td>
                                            <td className="p-4 text-navy-900 dark:text-white">₹{(p.basic + p.hra).toLocaleString()}</td>
                                            <td className="p-4 text-red-500">₹{p.ded.toLocaleString()}</td>
                                            <td className="p-4 font-black text-green-600 dark:text-green-400 text-base">₹{p.net.toLocaleString()}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${p.status === 'Processed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-400'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
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

export default RecruitmentHR;
