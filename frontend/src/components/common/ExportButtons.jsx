import React from 'react';
import { FaFilePdf, FaFileExcel, FaPrint, FaCopy } from 'react-icons/fa';
import { useToast } from '../../hooks/ToastContext';
const ExportButtons = ({ filename = "ExportData", data = [], headers = [] }) => {
    const { addToast } = useToast();
    const safeFilename = () => `${String(filename || 'ExportData').replace(/[\\/:*?"<>|]+/g, '_')}-${Date.now()}`;

    const handlePdf = async () => {
        if (!data || data.length === 0) {
            addToast("No data available to export", "warning");
            return;
        }

        try {
            addToast(`Generating PDF for ${filename}...`, 'info');
            const [{ default: jsPDF }, { applyCollegePageLayout }] = await Promise.all([
                import('jspdf'),
                import('../../utils/collegePdfBranding'),
                import('jspdf-autotable')
            ]);
            const doc = new jsPDF({ unit: 'pt', format: 'letter' });

            const tableHeaders = headers.length > 0 ? headers : Object.keys(data[0]);
            const tableRows = data.map(row => {
                if (headers.length === 0) return Object.values(row);
                
                return headers.map(h => {
                    const normalizedHeader = h.toLowerCase().replace(/\s+/g, '');
                    const rowKey = Object.keys(row).find(k => 
                        k === h || k.toLowerCase() === h.toLowerCase() || k.toLowerCase() === normalizedHeader
                    );
                    return rowKey ? row[rowKey] : '';
                });
            });

            const docTitle = String(filename || 'Export Data').replace(/[_-]+/g, ' ');

            doc.autoTable({
                head: [tableHeaders],
                body: tableRows,
                startY: 92,
                margin: { top: 92, bottom: 48, left: 36, right: 36 },
                theme: 'grid',
                styles: { fontSize: 8, font: 'helvetica', cellPadding: 4 },
                headStyles: { fillColor: [11, 44, 107], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 250, 252] }
            });

            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                applyCollegePageLayout(doc, {
                    title: docTitle,
                    documentSubtitle: `Official Record • Total Entries: ${data.length}`,
                    pageNumber: i,
                    totalPages
                });
            }

            const downloadName = safeFilename();
            doc.save(`${downloadName}.pdf`);
            addToast(`${downloadName}.pdf downloaded successfully`, 'success');
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
            const downloadName = safeFilename();
            link.setAttribute("download", `${downloadName}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addToast(`${downloadName}.csv downloaded successfully`, 'success');
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
        } catch {
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
