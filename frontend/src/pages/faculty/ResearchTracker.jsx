import React from 'react';
import { FaFlask, FaPlus, FaExternalLinkAlt } from 'react-icons/fa';

const ResearchTracker = () => {
    const papers = [
        { id: 1, title: 'Optimizing Container Orchestration using Deep Reinforcement Learning', type: 'Journal', publisher: 'IEEE Access', date: 'Feb 2024', status: 'Published', citations: 12 },
        { id: 2, title: 'Serverless Computing Cold Start Mitigation', type: 'Conference', publisher: 'ACM CloudComp', date: 'Pending', status: 'Under Review', citations: 0 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        <FaFlask className="text-gold-500" /> Research & Publication Tracker
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Log journal publications, patents, and grants for appraisal metrics.</p>
                </div>
                <button className="bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 font-bold px-4 py-2 rounded-xl hover:bg-navy-800 hover:shadow-lg transition-all flex items-center gap-2">
                    <FaPlus /> Add Publication
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white dark:bg-navy-800 p-5 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm">
                    <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Total Publications</div>
                    <div className="text-3xl font-black text-navy-900 dark:text-white">14</div>
                </div>
                <div className="bg-white dark:bg-navy-800 p-5 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm">
                    <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Total Citations</div>
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400">128</div>
                </div>
                <div className="bg-white dark:bg-navy-800 p-5 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm">
                    <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">h-index</div>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">6</div>
                </div>
                <div className="bg-gradient-to-br from-gold-400 to-amber-600 p-5 rounded-xl shadow-sm text-white flex flex-col justify-center items-center text-center">
                    <div className="font-bold">Next Appraisal</div>
                    <div className="opacity-80 text-sm">Target: 2 Scopus Indexed Papers</div>
                </div>
            </div>

            <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50">
                    <h3 className="font-bold text-navy-900 dark:text-white">Recent Submissions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-navy-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-navy-700">
                                <th className="p-4 font-bold">Paper Title</th>
                                <th className="p-4 font-bold">Type / Venue</th>
                                <th className="p-4 font-bold text-center">Date</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {papers.map(p => (
                                <tr key={p.id} className="border-b border-gray-50 dark:border-navy-800 hover:bg-gray-50 dark:hover:bg-navy-900/50">
                                    <td className="p-4 font-bold text-navy-900 dark:text-white max-w-md truncate">{p.title}</td>
                                    <td className="p-4">
                                        <div className="font-semibold">{p.type}</div>
                                        <div className="text-xs text-gray-500">{p.publisher}</div>
                                    </td>
                                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">{p.date}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${p.status === 'Published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="text-blue-600 hover:text-blue-800 transition-colors">
                                            <FaExternalLinkAlt />
                                        </button>
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

export default ResearchTracker;
