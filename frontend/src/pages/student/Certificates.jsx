import React, { useState } from 'react';

const Certificates = () => {
    const [search, setSearch] = useState('');

    return (
        <div className="stu-report-page">
            <div style={{ padding: '0 0 15px 0' }}>
                <button className="table-btn" style={{ background: '#00a65a', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold' }}>
                    Apply Certificate
                </button>
            </div>

            <div className="stu-info-card" style={{ padding: '15px' }}>
                <div className="info-header" style={{ border: 'none', fontSize: '15px', color: '#333' }}>
                    Certificate Application List
                </div>

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
                        Search: &nbsp;
                        <input
                            type="text"
                            className="table-btn"
                            style={{ width: '200px' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <table className="stu-data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}></th>
                            <th style={{ textAlign: 'center' }}>S.No &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Date &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Certificate &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Purpose &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Status &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Response &nbsp;↕</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#777', background: '#f9f9f9' }}>
                                No data available in table
                            </td>
                        </tr>
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

export default Certificates;
