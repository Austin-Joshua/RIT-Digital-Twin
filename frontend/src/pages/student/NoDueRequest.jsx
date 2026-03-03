import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

const NoDueRequest = () => {
    const { addToast } = useToast();
    const subjects = []; // Hardcoded mock data removed

    return (
        <div className="stu-report-page">
            <div className="stu-breadcrumb" style={{ marginBottom: '20px' }}>No Due Request</div>

            <div className="stu-info-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '20px', color: 'var(--color-primary-navy)' }}>Subjects</h4>

                <table className="stu-data-table" style={{ border: '1px solid var(--theme-border)', background: 'var(--card-bg)' }}>
                    <thead style={{ background: 'var(--theme-bg-muted)' }}>
                        <tr>
                            <th style={{ textAlign: 'center', width: '60px' }}>S.No</th>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Faculty Name</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                            <th style={{ textAlign: 'center' }}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.length > 0 ? (
                            subjects.map((s, idx) => (
                                <tr key={s.id}>
                                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                    <td>{s.code}</td>
                                    <td>{s.name}</td>
                                    <td>{s.faculty}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button style={{
                                            background: 'var(--theme-bg-muted, #6c757d)',
                                            color: 'var(--theme-text, white)',
                                            border: '1px solid var(--theme-border)',
                                            borderRadius: '3px',
                                            padding: '4px 10px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            display: 'inline-block'
                                        }}>
                                            Not Requested
                                        </button>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{s.remarks}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '15px', opacity: 0.7, fontSize: '13px' }}>
                                    No data available in table
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <h4 style={{ fontSize: '18px', fontWeight: '500', margin: '30px 0 20px', color: 'var(--color-primary-navy)' }}>Labs / Project Work</h4>
                {/* Similar table could go here if data exists */}
            </div>
        </div>
    );
};

export default NoDueRequest;
