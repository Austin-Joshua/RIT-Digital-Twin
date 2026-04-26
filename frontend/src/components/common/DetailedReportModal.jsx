import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaInfoCircle, FaArrowRight } from 'react-icons/fa';
import jsPDF from 'jspdf';

const DetailedReportModal = ({ isOpen, onClose, title, value, label, icon, data, description }) => {
    if (!isOpen) return null;

    const weeklyTrend = [85, 82, 88, 84, 90];
    const resolvedDescription = description || `Based on the current ${(title || '').toLowerCase()} and previous 3-month trends, we predict a 4.2% improvement in the upcoming assessment cycle. Maintain current activity levels.`;

    const handleDownloadReport = () => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const generatedAt = new Date().toLocaleString();
        const reportTitle = `${title || 'Performance'} Detailed Insight Report`;
        const reportFileName = `${(title || 'report').toString().trim().replace(/\s+/g, '-').toLowerCase()}-insight-report-${Date.now()}.pdf`;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(reportTitle, 40, 50);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Generated on: ${generatedAt}`, 40, 70);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Current Status', 40, 110);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Metric: ${label || 'Value'}`, 40, 130);
        doc.text(`Current Value: ${value ?? 'N/A'}`, 40, 148);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Weekly Trend', 40, 185);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        weeklyTrend.forEach((v, i) => {
            doc.text(`Day ${i + 1}: ${v}%`, 40, 205 + (i * 18));
        });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Recommendation', 40, 315);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const wrappedRecommendation = doc.splitTextToSize(resolvedDescription, 515);
        doc.text(wrappedRecommendation, 40, 335);

        if (Array.isArray(data) && data.length > 0) {
            const dataStartY = 335 + (wrappedRecommendation.length * 14) + 20;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Supporting Data Snapshot', 40, dataStartY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const keys = Object.keys(data[0] || {});
            data.slice(0, 10).forEach((row, rowIndex) => {
                const line = keys.map((k) => `${k}: ${row?.[k] ?? '-'}`).join(' | ');
                const wrapped = doc.splitTextToSize(line, 515);
                doc.text(wrapped, 40, dataStartY + 20 + (rowIndex * 14));
            });
        }

        doc.save(reportFileName);
    };

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
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner" style={{ background: 'var(--theme-brand-strong)', color: 'var(--card-bg)' }}>
                                {icon}
                            </div>
                            <div>
                                <h2 className="text-xl font-black m-0" style={{ color: 'var(--theme-text)' }}>{title} Analysis</h2>
                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.9 }}>Detailed Insight Report</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-red-100 hover:text-red-500"
                            style={{ color: 'var(--theme-text)' }}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="p-6 rounded-2xl border" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                                <div className="text-sm font-bold mb-2 uppercase" style={{ color: 'var(--theme-text)' }}>Current Status</div>
                                <div className="text-5xl font-black mb-2" style={{ color: 'var(--theme-brand-strong)' }}>{value}</div>
                                <div className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{label}</div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--theme-text)' }}>Weekly Trend</h4>
                                {weeklyTrend.map((val, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="text-xs font-bold w-12" style={{ color: 'var(--theme-text)' }}>Day {i + 1}</div>
                                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(100, 116, 139, 0.35)' }}>
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

                        <div className="p-6 rounded-2xl border" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                            <h4 className="flex items-center gap-2 text-sm font-black mb-2 uppercase" style={{ color: 'var(--theme-brand-strong)' }}>
                                <FaInfoCircle /> {description ? 'Result' : 'Smart Recommendation'}
                            </h4>
                            <p className="text-sm" style={{ color: 'var(--theme-text)', fontWeight: 600, lineHeight: 1.7 }}>
                                {resolvedDescription}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t flex justify-end gap-3" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold transition-all text-sm"
                            style={{ color: 'var(--theme-text)', border: '1.5px solid var(--theme-border)', background: 'var(--card-bg)' }}
                        >
                            Close
                        </button>
                        <button
                            onClick={handleDownloadReport}
                            className="bg-primary-navy text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-500/20 text-sm"
                            style={{ backgroundColor: 'var(--theme-brand-strong)', color: 'var(--card-bg)' }}
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
