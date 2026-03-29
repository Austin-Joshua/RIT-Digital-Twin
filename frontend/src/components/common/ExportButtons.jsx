import React from 'react';
import { FaFilePdf, FaFileExcel, FaPrint, FaCopy } from 'react-icons/fa';
import { useToast } from '../../hooks/ToastContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExportButtons = ({ filename = "ExportData", data = [], headers = [] }) => {
    const { addToast } = useToast();

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
            const tableRows = data.map(row =>
                headers.length > 0
                    ? headers.map(h => row[h] || row[h.toLowerCase()] || '')
                    : Object.values(row)
            );

            doc.autoTable({
                head: [tableHeaders],
                body: tableRows,
                startY: 20,
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillStyle: '#0B2C6B', textColor: 255 }
            });

            doc.save(`${filename}.pdf`);
            addToast(`${filename}.pdf downloaded successfully`, 'success');
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
                tableHeaders.join(','),
                ...data.map(row =>
                    (headers.length > 0 ? headers : Object.keys(row))
                        .map(h => {
                            const val = row[h] || '';
                            return `"${String(val).replace(/"/g, '""')}"`;
                        }).join(',')
                )
            ];

            const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addToast(`${filename}.csv downloaded successfully`, 'success');
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
                    .map(h => row[h] || '').join('\t')
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
