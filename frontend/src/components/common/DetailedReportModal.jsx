import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChartBar, FaCalendarAlt, FaInfoCircle, FaArrowRight } from 'react-icons/fa';

const DetailedReportModal = ({ isOpen, onClose, title, value, label, icon, data }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}
                >
                    {/* Header */}
                    <div className="p-6 border-b flex justify-between items-center" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner" style={{ background: 'var(--color-primary-navy)', color: 'white' }}>
                                {icon}
                            </div>
                            <div>
                                <h2 className="text-xl font-black m-0" style={{ color: 'var(--theme-text)' }}>{title} Analysis</h2>
                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Detailed Insight Report</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-red-100 hover:text-red-500"
                            style={{ color: 'var(--theme-text-muted)' }}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="p-6 rounded-2xl border" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                                <div className="text-sm font-bold mb-2 uppercase" style={{ color: 'var(--theme-text-muted)' }}>Current Status</div>
                                <div className="text-5xl font-black mb-2" style={{ color: 'var(--color-primary-navy)' }}>{value}</div>
                                <div className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{label}</div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Weekly Trend</h4>
                                {[85, 82, 88, 84, 90].map((val, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="text-xs font-bold w-12" style={{ color: 'var(--theme-text-muted)' }}>Day {i + 1}</div>
                                        <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${val}%` }}
                                                transition={{ delay: 0.2 + (i * 0.1) }}
                                                className="h-full"
                                                style={{ background: 'var(--color-accent-gold)' }}
                                            ></motion.div>
                                        </div>
                                        <div className="text-xs font-black" style={{ color: 'var(--theme-text)' }}>{val}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-blue-50/50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                            <h4 className="flex items-center gap-2 text-sm font-black text-blue-700 dark:text-blue-400 mb-2 uppercase">
                                <FaInfoCircle /> Smart Recommendation
                            </h4>
                            <p className="text-sm" style={{ color: 'var(--theme-text)' }}>
                                Based on the current <b>{title.toLowerCase()}</b> and previous 3-month trends, we predict a 4.2% improvement in the upcoming assessment cycle. Maintain current activity levels.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t flex justify-end gap-3" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold transition-all text-sm"
                            style={{ color: 'var(--theme-text-muted)', border: '1.5px solid var(--theme-border)' }}
                        >
                            Close
                        </button>
                        <button
                            className="bg-primary-navy text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-500/20 text-sm"
                            style={{ backgroundColor: 'var(--color-primary-navy)' }}
                        >
                            Download Full Report <FaArrowRight />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DetailedReportModal;
