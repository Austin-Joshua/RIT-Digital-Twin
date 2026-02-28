import React from 'react';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const ExportButtons = ({ filename = "ExportData" }) => {
    const { addToast } = useToast();

    const handlePdf = () => {
        addToast(`Preparing PDF export for ${filename}...`, 'info');
        // Simulated export logic
        setTimeout(() => addToast(`${filename}.pdf successfully downloaded`, 'success'), 1500);
    };

    const handleExcel = () => {
        addToast(`Preparing Excel export for ${filename}...`, 'info');
        // Simulated export logic
        setTimeout(() => addToast(`${filename}.xlsx successfully downloaded`, 'success'), 1500);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handlePdf}
                className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
                aria-label="Export to PDF"
                title="Download as PDF"
            >
                <FaFilePdf /> PDF
            </button>
            <button
                onClick={handleExcel}
                className="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/40 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none"
                aria-label="Export to Excel"
                title="Download as Excel Data"
            >
                <FaFileExcel /> Excel
            </button>
        </div>
    );
};

export default ExportButtons;
