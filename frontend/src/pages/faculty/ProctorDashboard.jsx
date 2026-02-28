import React from 'react';
import { FaUsers, FaExclamationTriangle, FaComments, FaCheckCircle } from 'react-icons/fa';

const ProctorDashboard = () => {
    const wards = [
        { reg: '211520104015', name: 'Manikandan V', cgpa: 6.2, attendance: 68, risk: 'high', issues: ['Low Attendance', '2 Arrears'] },
        { reg: '211520104016', name: 'Naveen Kumar M', cgpa: 8.4, attendance: 92, risk: 'low', issues: [] },
        { reg: '211520104017', name: 'Oviya S', cgpa: 7.1, attendance: 76, risk: 'medium', issues: ['Declining Math Score'] },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        <FaUsers className="text-gold-500" /> Proctor & Mentorship Ward
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track the psychological, academic, and disciplinary well-being of assigned students.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {wards.map((ward, i) => (
                    <div key={i} className={`p-6 rounded-xl border ${ward.risk === 'high' ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30' : ward.risk === 'medium' ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30' : 'border-gray-100 bg-white dark:bg-navy-800 dark:border-navy-700'} shadow-sm relative overflow-hidden`}>
                        {ward.risk === 'high' && <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>}

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-navy-900 dark:text-white">{ward.name}</h3>
                                <p className="font-mono text-sm text-gray-500">{ward.reg}</p>
                            </div>
                            {ward.risk === 'high' ? (
                                <FaExclamationTriangle className="text-red-500 text-2xl" />
                            ) : ward.risk === 'medium' ? (
                                <FaExclamationTriangle className="text-amber-500 text-2xl" />
                            ) : (
                                <FaCheckCircle className="text-green-500 text-2xl" />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white/50 dark:bg-navy-900/50 p-2 rounded">
                                <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">CGPA</div>
                                <div className={`text-lg font-black ${ward.cgpa < 7 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{ward.cgpa}</div>
                            </div>
                            <div className="bg-white/50 dark:bg-navy-900/50 p-2 rounded">
                                <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Attendance</div>
                                <div className={`text-lg font-black ${ward.attendance < 75 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{ward.attendance}%</div>
                            </div>
                        </div>

                        {ward.issues.length > 0 && (
                            <div className="mb-4">
                                <div className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Flagged Issues</div>
                                <ul className="space-y-1">
                                    {ward.issues.map((issue, idx) => (
                                        <li key={idx} className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-navy-700 flex gap-2">
                            <button className="flex-1 bg-navy-900 text-white dark:bg-navy-700 py-2 rounded-lg font-bold text-sm hover:bg-navy-800 transition-colors flex justify-center items-center gap-2">
                                <FaComments /> Log Meeting
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProctorDashboard;
