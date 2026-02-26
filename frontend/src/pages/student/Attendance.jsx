import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '../../context/ToastContext';

const AttendanceReport = () => {
    const [search, setSearch] = useState('');
    const { addToast } = useToast();
    const [selectedRows, setSelectedRows] = useState([]);

    const attendanceRecords = []; // Hardcoded mock data removed

    const handleSelectAll = () => {
        if (attendanceRecords.length === 0) return;
        setSelectedRows(attendanceRecords.map(r => r.slNo));
    };

    const handleDeselectAll = () => {
        setSelectedRows([]);
    };

    const handlePlaceholder = (action) => {
        addToast(`${action} functionality coming soon!`, 'info');
    };

    const exportToCSV = () => {
        if (attendanceRecords.length === 0) {
            alert("No data available to export");
            return;
        }
        const headers = ["Sl/No", "Subject Code", "Subject Name", "Faculty Name", "Attended", "Total", "Percentage"];
        const rows = attendanceRecords.map(r => [r.slNo, r.code, r.name, r.faculty, r.attended, r.total, r.percent]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "attendance_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (attendanceRecords.length === 0) {
            alert("No data available to export");
            return;
        }
        const doc = new jsPDF();
        doc.text("Attendance Report", 14, 15);
        const columns = ["Sl/No", "Code", "Subject", "Faculty", "Attended", "Total", "%"];
        const rows = attendanceRecords.map(r => [r.slNo, r.code, r.name, r.faculty, r.attended, r.total, r.percent]);
        doc.autoTable({ head: [columns], body: rows, startY: 20 });
        doc.save("attendance_report.pdf");
    };

    return (
        <div className="stu-report-page">
            <div className="stu-report-header">
                <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>Attendance Report</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
                    <span>Academic Year : <b>2025-2026</b></span>
                    <span>Semester : <b>IV</b></span>
                </div>
            </div>

            <div className="stu-info-card" style={{ padding: '15px' }}>
                <div className="stu-table-controls">
                    <div>
                        Show &nbsp;
                        <select className="table-btn">
                            <option>10</option>
                            <option>25</option>
                        </select>
                        &nbsp; entries
                    </div>
                    <div>
                        <div className="stu-table-actions" style={{ display: 'inline-flex', marginRight: '20px' }}>
                            <button className="table-btn primary" onClick={handleSelectAll}>Select all</button>
                            <button className="table-btn" onClick={handleDeselectAll}>Deselect all</button>
                            <button className="table-btn" onClick={() => handlePlaceholder('Copy')}>Copy</button>
                            <button className="table-btn" onClick={exportToCSV}>CSV</button>
                            <button className="table-btn" onClick={() => handlePlaceholder('Excel')}>Excel</button>
                            <button className="table-btn" onClick={exportToPDF}>PDF</button>
                            <button className="table-btn" onClick={() => window.print()}>Print</button>
                            <button className="table-btn" onClick={() => handlePlaceholder('Columns')}>Columns</button>
                        </div>
                        Search: &nbsp;
                        <input
                            type="text"
                            className="table-btn"
                            style={{ width: '150px' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <table className="stu-data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '30px' }}><input type="checkbox" /></th>
                            <th style={{ textAlign: 'center' }}>Sl/No &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Subject Code &nbsp;↕</th>
                            <th>Subject Name &nbsp;↕</th>
                            <th>Faculty Name &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>No Of Periods Attended &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Total No Of Periods &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Attendance Percentage &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceRecords.length > 0 ? (
                            attendanceRecords.map((rec) => (
                                <tr key={rec.slNo}>
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(rec.slNo)}
                                            onChange={() => {
                                                if (selectedRows.includes(rec.slNo)) {
                                                    setSelectedRows(selectedRows.filter(id => id !== rec.slNo));
                                                } else {
                                                    setSelectedRows([...selectedRows, rec.slNo]);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{rec.slNo}</td>
                                    <td style={{ textAlign: 'center' }}>{rec.code}</td>
                                    <td>{rec.name}</td>
                                    <td>{rec.faculty}</td>
                                    <td style={{ textAlign: 'center' }}>{rec.attended}</td>
                                    <td style={{ textAlign: 'center' }}>{rec.total}</td>
                                    <td style={{ textAlign: 'center', backgroundColor: rec.percent <= 70 ? '#f39c12' : 'transparent', color: rec.percent <= 70 ? 'white' : 'inherit' }}>
                                        {rec.percent}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn-view">view</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '15px', color: '#777', background: '#f9f9f9', fontSize: '13px' }}>
                                    No data available in table
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#777' }}>
                    <span>Showing 0 to 0 of 0 entries</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button className="table-btn" disabled>Previous</button>
                        <button className="table-btn" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReport;
