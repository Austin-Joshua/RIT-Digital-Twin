import React, { useState, useEffect } from 'react';
import { FaFlask, FaPlus, FaExternalLinkAlt, FaBookOpen, FaQuoteRight, FaCalendarAlt } from 'react-icons/fa';
import DetailModal from '../../components/common/DetailModal';
import Card from '../../components/common/Card';
import AddPublicationModal from '../../components/common/AddPublicationModal';

const ResearchTracker = () => {
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const defaultPapers = [
        { id: 1, title: 'Optimizing Container Orchestration using Deep Reinforcement Learning', type: 'Journal', publisher: 'IEEE Access', date: 'Feb 2024', status: 'Published', citations: 12, abstract: 'This paper proposes a novel deep reinforcement learning approach to optimize container orchestration in cloud environments, significantly reducing latency and improving resource utilization.', authors: 'Dr. Faculty Name, Dr. Co-Author', doi: '10.1109/ACCESS.2024.1234567' },
        { id: 2, title: 'Serverless Computing Cold Start Mitigation', type: 'Conference', publisher: 'ACM CloudComp', date: 'Pending', status: 'Under Review', citations: 0, abstract: 'We evaluate several strategies for mitigating cold starts in serverless computing, including pre-warming techniques and predictive scaling models, demonstrating a 40% reduction in average invocation delay.', authors: 'Dr. Faculty Name, Student Submitter', doi: 'N/A' },
    ];

    const [allPapers, setAllPapers] = useState(defaultPapers);

    useEffect(() => {
        const loadPapers = () => {
            const stored = localStorage.getItem('connectivity_publications');
            if (stored) {
                setAllPapers(JSON.parse(stored));
            } else {
                localStorage.setItem('connectivity_publications', JSON.stringify(defaultPapers));
            }
        };
        loadPapers();
        window.addEventListener('storage', loadPapers);
        return () => window.removeEventListener('storage', loadPapers);
    }, []);

    const handleSavePublication = (newPub) => {
        const updatedPapers = [newPub, ...allPapers];
        setAllPapers(updatedPapers);
        localStorage.setItem('connectivity_publications', JSON.stringify(updatedPapers));
        window.dispatchEvent(new Event('storage')); // trigger sync across components
    };

    const totalCitations = allPapers.reduce((sum, p) => sum + (Number(p.citations) || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6 overflow-hidden">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                        <FaFlask style={{ color: 'var(--color-accent-gold)' }} /> Research & Publication Tracker
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--theme-text-muted)' }}>Log journal publications, patents, and grants for appraisal metrics.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 hover:opacity-90 active:scale-95"
                    style={{ background: 'var(--color-primary-navy)', color: 'white', textShadow: 'none', boxShadow: '0 4px 12px rgba(11,44,107,0.3)', border: 'none' }}
                >
                    <FaPlus /> Add Publication
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
                <div className="p-3 md:p-5 rounded-xl border shadow-sm flex flex-col justify-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                    <div className="text-[10px] md:text-sm uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>Total Publications</div>
                    <div className="text-2xl md:text-3xl font-black" style={{ color: 'var(--theme-text)' }}>{allPapers.length}</div>
                </div>
                <div className="p-3 md:p-5 rounded-xl border shadow-sm flex flex-col justify-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                    <div className="text-[10px] md:text-sm uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>Total Citations</div>
                    <div className="text-2xl md:text-3xl font-black" style={{ color: 'var(--theme-brand-strong)' }}>{totalCitations}</div>
                </div>
                <div className="p-3 md:p-5 rounded-xl border shadow-sm flex flex-col justify-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                    <div className="text-[10px] md:text-sm uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>h-index</div>
                    <div className="text-2xl md:text-3xl font-black" style={{ color: 'var(--color-success)' }}>6</div>
                </div>
                <div className="p-3 md:p-5 rounded-xl shadow-sm text-white flex flex-col justify-center items-center text-center" style={{ background: 'linear-gradient(135deg, var(--color-accent-gold), #b45309)' }}>
                    <div className="font-bold text-xs md:text-base">Next Appraisal</div>
                    <div className="opacity-80 text-[10px] md:text-sm mt-1">Target: 2 Scopus Papers</div>
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3 className="font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Recent Submissions</h3>

                {/* Desktop View (Table-like grid) */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 font-bold border-b rounded-t-xl" style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', borderBottomColor: 'var(--theme-border)' }}>
                    <div className="col-span-5">Paper Title</div>
                    <div className="col-span-3">Type / Venue</div>
                    <div className="col-span-2 text-center">Date</div>
                    <div className="col-span-2 text-center">Status</div>
                </div>

                <div className="flex flex-col gap-4 md:gap-0">
                    {allPapers.map((p) => (
                        <Card
                            key={p.id}
                            className="md:grid md:grid-cols-12 md:gap-4 md:items-center py-4 px-4 md:px-4 md:border-t-0 md:border-x-0 md:rounded-none md:shadow-none cursor-pointer hover:bg-black/5 transition-colors"
                            style={{ borderBottomColor: 'var(--theme-border)', borderBottomStyle: 'solid', borderBottomWidth: '1px' }}
                            onClick={() => setSelectedPaper(p)}
                        >
                            {/* Paper Title */}
                            <div className="col-span-5 mb-2 md:mb-0">
                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 block mb-1">Paper Title</span>
                                <div className="font-bold flex items-start gap-2 max-w-full" style={{ color: 'var(--theme-text)' }}>
                                    <FaBookOpen className="mt-1 flex-shrink-0 text-[var(--theme-brand-strong)]" />
                                    <span style={{ wordBreak: 'break-word', whiteSpace: 'normal', display: 'block' }}>{p.title}</span>
                                </div>
                            </div>

                            {/* Type / Venue */}
                            <div className="col-span-3 mb-2 md:mb-0">
                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 block mb-1">Type / Venue</span>
                                <div className="font-semibold" style={{ color: 'var(--theme-text)' }}>{p.type}</div>
                                <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{p.publisher}</div>
                            </div>

                            {/* Date */}
                            <div className="col-span-2 mb-2 md:mb-0 text-left md:text-center">
                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 block mb-1">Date</span>
                                <div style={{ color: 'var(--theme-text-muted)' }}>{p.date}</div>
                            </div>

                            {/* Status */}
                            <div className="col-span-2 mb-2 md:mb-0 flex pr-2 justify-start md:justify-center">
                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 block mb-1 mr-2 self-center">Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex-shrink-0 ${p.status === 'Published' ? 'bg-[var(--color-success-100)] text-[var(--color-success)]' : 'bg-[var(--color-warning-100)] text-[var(--color-warning)]'}`}>
                                    {p.status}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <DetailModal
                isOpen={!!selectedPaper}
                onClose={() => setSelectedPaper(null)}
                title={<div className="flex items-center gap-2"><FaBookOpen /> Publication Details</div>}
            >
                {selectedPaper && (
                    <div className="space-y-6">
                        <div className="p-5 rounded-xl shadow-sm border" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                            <h3 className="text-xl font-bold mb-2 pr-8" style={{ color: 'var(--theme-text)' }}>{selectedPaper.title}</h3>
                            <div className="flex flex-wrap gap-2 text-sm font-medium mb-4" style={{ color: 'var(--theme-text-muted)' }}>
                                <span className="px-2 py-1 rounded" style={{ background: 'var(--theme-bg-muted)' }}>{selectedPaper.type}</span>
                                <span className="px-2 py-1 rounded" style={{ background: 'var(--theme-bg-muted)' }}>{selectedPaper.publisher}</span>
                            </div>

                            <h4 className="font-bold mb-1" style={{ color: 'var(--theme-text)' }}>Authors</h4>
                            <p className="mb-4" style={{ color: 'var(--theme-text-muted)' }}>{selectedPaper.authors}</p>

                            <h4 className="font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}><FaQuoteRight size={12} className="text-gray-400" /> Abstract</h4>
                            <p className="italic text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                                "{selectedPaper.abstract}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-bg-muted)' }}>
                                <p className="text-xs uppercase font-bold text-gray-500 mb-1">Status</p>
                                <span className={`font-bold ${selectedPaper.status === 'Published' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                                    {selectedPaper.status}
                                </span>
                            </div>
                            <div className="p-4 rounded-xl border flex flex-col justify-center" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-bg-muted)' }}>
                                <p className="text-xs uppercase font-bold text-gray-500 mb-1">Citations</p>
                                <p className="font-bold text-xl" style={{ color: 'var(--theme-brand-strong)' }}>{selectedPaper.citations}</p>
                            </div>
                            <div className="p-4 rounded-xl border flex flex-col justify-center" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-bg-muted)' }}>
                                <p className="text-xs uppercase font-bold text-gray-500 mb-1"><FaCalendarAlt className="inline mr-1" /> Date</p>
                                <p className="font-bold" style={{ color: 'var(--theme-text)' }}>{selectedPaper.date}</p>
                            </div>
                            <div className="p-4 rounded-xl border flex flex-col justify-center" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-bg-muted)' }}>
                                <p className="text-xs uppercase font-bold text-gray-500 mb-1">DOI / Link</p>
                                {selectedPaper.doi && selectedPaper.doi !== 'N/A' ? (
                                    <a href={`https://doi.org/${selectedPaper.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold text-sm truncate block" title={selectedPaper.doi}>
                                        {selectedPaper.doi} <FaExternalLinkAlt className="inline text-[10px]" />
                                    </a>
                                ) : (
                                    <span className="font-bold text-gray-400">N/A</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DetailModal>

            <AddPublicationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSavePublication}
            />
        </div>
    );
};

export default ResearchTracker;
