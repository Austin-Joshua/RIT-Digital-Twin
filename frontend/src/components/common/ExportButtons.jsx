import React from 'react';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
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

            // If headers aren't explicitly provided, try to infer from first row keys
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

    return (
        <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
            <button
                onClick={handlePdf}
                className="export-btn pdf"
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '6px', border: '1px solid #fee2e2',
                    background: '#fef2f2', color: '#dc2626', fontSize: '13px',
                    fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'
                }}
                title="Download as PDF"
            >
                <FaFilePdf /> PDF
            </button>
            <button
                onClick={handleExcel}
                className="export-btn csv"
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '6px', border: '1px solid #dcfce7',
                    background: '#f0fdf4', color: '#16a34a', fontSize: '13px',
                    fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'
                }}
                title="Download as CSV"
            >
                <FaFileExcel /> CSV
            </button>
        </div>
    );
};

export default ExportButtons;
