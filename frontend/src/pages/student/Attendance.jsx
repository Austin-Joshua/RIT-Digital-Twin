import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import ExportButtons from '../../components/common/ExportButtons';
import { useToast } from '../../context/ToastContext';

const AttendanceReport = () => {
    const [search, setSearch] = useState('');
    const { addToast } = useToast();
    const [selectedRows, setSelectedRows] = useState([]);

    const attendanceRecords = [
        { slNo: 1, code: 'CS3401', name: 'Algorithms and Data Structures', faculty: 'Dr. Sarah Smith', attended: 42, total: 45, percent: 93.3 },
        { slNo: 2, code: 'CS3402', name: 'Operating Systems', faculty: 'Prof. James Wilson', attended: 38, total: 45, percent: 84.4 },
        { slNo: 3, code: 'CS3403', name: 'Computer Networks', faculty: 'Dr. Emily Brown', attended: 30, total: 45, percent: 66.7 },
        { slNo: 4, code: 'CS3404', name: 'Database Management', faculty: 'Prof. Michael Johnson', attended: 44, total: 45, percent: 97.8 },
        { slNo: 5, code: 'GE3401', name: 'Professional Ethics', faculty: 'Dr. Robert Davis', attended: 45, total: 45, percent: 100.0 }
    ];

    const handleSelectAll = () => {
        if (attendanceRecords.length === 0) return;
        setSelectedRows(attendanceRecords.map(r => r.slNo));
    };

    const handleDeselectAll = () => {
        setSelectedRows([]);
    };

    const filteredRecords = attendanceRecords.filter(rec =>
        rec.name.toLowerCase().includes(search.toLowerCase()) ||
        rec.code.toLowerCase().includes(search.toLowerCase()) ||
        rec.faculty.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="stu-report-page">
            <div className="stu-report-header" style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '22px', fontWeight: '800', color: 'var(--theme-text)', borderLeft: '4px solid var(--color-accent-gold)', paddingLeft: '16px' }}>Attendance Performance Report</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--theme-text-muted)' }}>
                    <span>Academic Year : <b style={{ color: 'var(--theme-text)' }}>2025-2026</b></span>
                    <span>Semester : <b style={{ color: 'var(--theme-text)' }}>IV</b></span>
                </div>
            </div>

            <div className="stu-info-card" style={{ padding: '24px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--theme-border)' }}>
                <div className="stu-table-controls" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div className="stu-table-actions" style={{ display: 'flex', gap: '8px' }}>
                            <button className="table-btn primary" onClick={handleSelectAll} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: 'var(--color-primary-navy)', color: 'white', border: 'none', fontWeight: '600' }}>Select all</button>
                            <button className="table-btn" onClick={handleDeselectAll} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)', fontWeight: '600' }}>Deselect</button>
                        </div>
                        <ExportButtons
                            filename="attendance_report_2025"
                            data={attendanceRecords}
                            headers={["Subject Code", "Subject Name", "Faculty", "Attended", "Total", "Percentage"]}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--theme-text-muted)' }}>Search:</span>
                        <input
                            type="text"
                            placeholder="Filter records..."
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', width: '220px', outline: 'none' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--theme-border)' }}>
                    <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--theme-bg-muted)' }}>
                                <th style={{ padding: '16px', textAlignment: 'left' }}><input type="checkbox" onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()} /></th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Subject Code</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Subject Name</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Faculty Name</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Attended</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Total</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>%</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((rec) => (
                                    <tr key={rec.slNo} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
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
                                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-primary-navy)' }}>{rec.code}</td>
                                        <td style={{ padding: '16px', color: 'var(--theme-text)' }}>{rec.name}</td>
                                        <td style={{ padding: '16px', color: 'var(--theme-text-muted)', fontSize: '13px' }}>{rec.faculty}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>{rec.attended}</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>{rec.total}</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                                background: rec.percent < 75 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: rec.percent < 75 ? '#EF4444' : '#10B981',
                                                border: `1px solid ${rec.percent < 75 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                                            }}>
                                                {rec.percent}%
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <button className="btn-view" style={{ borderRadius: '6px', padding: '6px 12px', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)', cursor: 'pointer' }}>
                                                <FaEye /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', opacity: 0.7, fontSize: '14px', color: 'var(--theme-text-muted)' }}>
                                        No matching records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: 'var(--theme-text-muted)' }}>
                    <span>Showing <b>{filteredRecords.length}</b> of <b>{attendanceRecords.length}</b> subjects</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="table-btn" disabled style={{ padding: '6px 12px', borderRadius: '6px', opacity: 0.5 }}>Previous</button>
                        <button className="table-btn" disabled style={{ padding: '6px 12px', borderRadius: '6px', opacity: 0.5 }}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReport;
