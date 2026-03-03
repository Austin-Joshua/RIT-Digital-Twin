import React from 'react';

const CommitteeSchedule = () => {
    const data = [
        { name: 'Class Committee Meeting - I', batch: '2024-2028', ay: '2025-2026', course: 'B.E. CSE', sem: '3', section: 'A', date: '2025-08-29' }
    ];

    return (
        <div className="stu-report-page">
            <div className="stu-info-card" style={{ padding: '15px' }}>
                <div className="stu-table-controls">
                    <div>
                        Show &nbsp;
                        <select className="table-btn">
                            <option>10</option>
                        </select>
                        &nbsp; entries &nbsp;
                        <button className="table-btn" style={{ background: 'var(--color-primary-navy)', color: 'white', border: 'none' }}>Select all</button>
                        <button className="table-btn" style={{ background: 'var(--color-primary-navy)', color: 'white', border: 'none', marginLeft: '5px' }}>Deselect all</button>
                        <button className="table-btn" style={{ marginLeft: '5px' }}>Copy</button>
                        <button className="table-btn">CSV</button>
                        <button className="table-btn">Excel</button>
                        <button className="table-btn">PDF</button>
                        <button className="table-btn">Print</button>
                        <button className="table-btn">Columns</button>
                    </div>
                </div>

                <table className="stu-data-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center' }}>Meeting Name &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Batch &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>AY &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Course &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Semester &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Section &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Date &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={idx}>
                                <td style={{ textAlign: 'center' }}>{row.name}</td>
                                <td style={{ textAlign: 'center' }}>{row.batch}</td>
                                <td style={{ textAlign: 'center' }}>{row.ay}</td>
                                <td style={{ textAlign: 'center' }}>{row.course}</td>
                                <td style={{ textAlign: 'center' }}>{row.sem}</td>
                                <td style={{ textAlign: 'center' }}>{row.section}</td>
                                <td style={{ textAlign: 'center' }}>{row.date}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <button className="btn-view">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: '15px', opacity: 0.7, fontSize: '13px' }}>
                    Showing 1 to 1 of 1 entries
                    <div style={{ float: 'right' }}>
                        <button className="table-btn" disabled>Previous</button>
                        <span className="table-btn active" style={{ background: 'var(--color-primary-navy)', color: 'white' }}>1</span>
                        <button className="table-btn" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommitteeSchedule;
