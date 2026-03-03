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
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                        <FaFlask style={{ color: 'var(--color-accent-gold)' }} /> Research & Publication Tracker
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--theme-text-muted)' }}>Log journal publications, patents, and grants for appraisal metrics.</p>
                </div>
                <button
                    className="font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                    style={{ background: 'var(--color-primary-navy)', color: 'white' }}
                >
                    <FaPlus /> Add Publication
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="p-5 rounded-xl border shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                    <div className="text-sm uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>Total Publications</div>
                    <div className="text-3xl font-black" style={{ color: 'var(--theme-text)' }}>14</div>
                </div>
                <div className="p-5 rounded-xl border shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                    <div className="text-sm uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>Total Citations</div>
                    <div className="text-3xl font-black" style={{ color: 'var(--color-primary-navy)' }}>128</div>
                </div>
                <div className="p-5 rounded-xl border shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                    <div className="text-sm uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>h-index</div>
                    <div className="text-3xl font-black" style={{ color: 'var(--color-success)' }}>6</div>
                </div>
                <div className="p-5 rounded-xl shadow-sm text-white flex flex-col justify-center items-center text-center" style={{ background: 'linear-gradient(135deg, var(--color-accent-gold), #b45309)' }}>
                    <div className="font-bold">Next Appraisal</div>
                    <div className="opacity-80 text-sm">Target: 2 Scopus Indexed Papers</div>
                </div>
            </div>

            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                <div className="p-4 border-b" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                    <h3 className="font-bold" style={{ color: 'var(--theme-text)' }}>Recent Submissions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase tracking-wider border-b" style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text-muted)', borderColor: 'var(--theme-border)' }}>
                                <th className="p-4 font-bold">Paper Title</th>
                                <th className="p-4 font-bold">Type / Venue</th>
                                <th className="p-4 font-bold text-center">Date</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {papers.map(p => (
                                <tr key={p.id} className="border-b transition-colors" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                                    <td className="p-4 font-bold max-w-md truncate" style={{ color: 'var(--theme-text)' }}>{p.title}</td>
                                    <td className="p-4">
                                        <div className="font-semibold" style={{ color: 'var(--theme-text)' }}>{p.type}</div>
                                        <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{p.publisher}</div>
                                    </td>
                                    <td className="p-4 text-center" style={{ color: 'var(--theme-text-muted)' }}>{p.date}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${p.status === 'Published' ? 'bg-[var(--color-success-100)] text-[var(--color-success)]' : 'bg-[var(--color-warning-100)] text-[var(--color-warning)]'}`}>
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
