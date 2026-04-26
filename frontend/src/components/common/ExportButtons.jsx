import React from 'react';
import { FaFilePdf, FaFileExcel, FaPrint, FaCopy } from 'react-icons/fa';
import { useToast } from '../../hooks/ToastContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExportButtons = ({ filename = "ExportData", data = [], headers = [] }) => {
    const { addToast } = useToast();
    const safeFilename = `${String(filename || 'ExportData').replace(/[\\/:*?"<>|]+/g, '_')}-${Date.now()}`;

    const handlePdf = () => {
        if (!data || data.length === 0) {
            addToast("No data available to export", "warning");
            return;
        }

        try {
            addToast(`Generating PDF for ${filename}...`, 'info');
            const doc = new jsPDF();
            doc.text(`${filename.replace(/_/g, ' ')}`, 14, 15);

            const tableHeaders = headers.length > 0 ? headers : Object.keys(data[0]);
            const tableRows = data.map(row => {
                if (headers.length === 0) return Object.values(row);
                
                return headers.map(h => {
                    // Try exact match, then normalized match (lowercase, no spaces)
                    const normalizedHeader = h.toLowerCase().replace(/\s+/g, '');
                    const rowKey = Object.keys(row).find(k => 
                        k === h || k.toLowerCase() === h.toLowerCase() || k.toLowerCase() === normalizedHeader
                    );
                    return rowKey ? row[rowKey] : '';
                });
            });

            doc.autoTable({
                head: [tableHeaders],
                body: tableRows,
                startY: 20,
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillStyle: '#0B2C6B', textColor: 255 }
            });

            doc.save(`${safeFilename}.pdf`);
            addToast(`${safeFilename}.pdf downloaded successfully`, 'success');
        } catch (error) {
            console.error("PDF Export Error:", error);
            addToast("Failed to generate PDF", "error");
        }
    };

    const handleExcel = () => {
        if (!data || data.length === 0) {
            addToast("No data available to export", "warning");
            return;
        }

        try {
            addToast(`Generating CSV for ${filename}...`, 'info');
            const tableHeaders = headers.length > 0 ? headers : Object.keys(data[0]);
            const csvRows = [
                tableHeaders.map(h => `"${h}"`).join(','),
                ...data.map(row =>
                    (headers.length > 0 ? headers : Object.keys(row))
                        .map(h => {
                            const normalizedHeader = h.toLowerCase().replace(/\s+/g, '');
                            const rowKey = Object.keys(row).find(k => 
                                k === h || k.toLowerCase() === h.toLowerCase() || k.toLowerCase() === normalizedHeader
                            );
                            const val = rowKey ? row[rowKey] : '';
                            return `"${String(val).replace(/"/g, '""')}"`;
                        }).join(',')
                )
            ];

            const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${safeFilename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addToast(`${safeFilename}.csv downloaded successfully`, 'success');
        } catch (error) {
            console.error("CSV Export Error:", error);
            addToast("Failed to generate CSV", "error");
        }
    };

    const handleCopy = () => {
        if (!data || data.length === 0) {
            addToast("No data available to copy", "warning");
            return;
        }

        try {
            const tableHeaders = headers.length > 0 ? headers : Object.keys(data[0]);
            const rows = data.map(row =>
                (headers.length > 0 ? headers : Object.keys(row))
                    .map(h => {
                        const normalizedHeader = h.toLowerCase().replace(/\s+/g, '');
                        const rowKey = Object.keys(row).find(k =>
                            k === h || k.toLowerCase() === h.toLowerCase() || k.toLowerCase() === normalizedHeader
                        );
                        return rowKey ? row[rowKey] : '';
                    }).join('\t')
            );
            const textToCopy = [tableHeaders.join('\t'), ...rows].join('\n');
            navigator.clipboard.writeText(textToCopy);
            addToast("Data copied to clipboard", 'success');
        } catch (err) {
            addToast("Failed to copy data", 'error');
        }
    };

    const handlePrint = () => {
        window.print();
        addToast("Print dialog opened", 'info');
    };

    const btnStyle = {
        background: 'var(--theme-bg-muted)',
        color: 'var(--theme-text)',
        border: '1px solid var(--theme-border)',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease'
    };

    return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={handleCopy} style={btnStyle} title="Copy to Clipboard">
                <FaCopy /> Copy
            </button>
            <button onClick={handleExcel} style={btnStyle} title="Download CSV">
                <FaFileExcel /> CSV
            </button>
            <button onClick={handlePdf} style={btnStyle} title="Download PDF">
                <FaFilePdf /> PDF
            </button>
            <button onClick={handlePrint} style={btnStyle} title="Print Page">
                <FaPrint /> Print
            </button>
        </div>
    );
};

export default ExportButtons;
