import React from 'react';

const AcademicFee = () => {
    return (
        <div className="stu-report-page">
            <div style={{ textAlign: 'center', marginBottom: '15px', color: '#333', fontSize: '13px' }}>Academic Fee</div>

            <div className="stu-info-card" style={{ padding: '0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', padding: '15px' }}>
                    <button className="table-btn" style={{ background: '#28a745', color: 'white', border: 'none' }}>Pay Fee</button>
                    <button className="table-btn" style={{ background: '#ffc107', color: 'black', border: 'none' }}>Payment History</button>
                    <button className="table-btn" style={{ background: '#dc3545', color: 'white', border: 'none' }}>Consolidated Receipt</button>
                </div>
            </div>

            <div className="stu-info-card" style={{ marginBottom: '20px' }}>
                <div style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f4f4f4', fontSize: '14px' }}>Student Details</div>
                <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fcfcfc', border: '1px solid #eee' }}>
                        <span style={{ fontWeight: 'bold' }}>Course</span>
                        <span>: B.E. CSE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fcfcfc', border: '1px solid #eee' }}>
                        <span style={{ fontWeight: 'bold' }}>Admitted Mode</span>
                        <span>: MANAGEMENT QUOTA</span>
                    </div>
                </div>
            </div>

            <div className="stu-info-card">
                <div style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f4f4f4', fontSize: '14px' }}>Fee Details</div>
                <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', border: '1px solid #eee', margin: '15px' }}>
                    {[
                        { label: 'Current AY', value: '2025-2026' },
                        { label: 'Opening Balance', value: '0' },
                        { label: 'Tuition Fee', value: '87000' },
                        { label: 'Hostel Fee', value: '0' },
                        { label: 'Other Fee', value: '138000' },
                        { label: 'AU / Library Fee', value: '2925' },
                        { label: 'Fine & Breakage', value: '0' },
                        { label: 'Total Fee', value: '227925' },
                        { label: 'Paid Amount', value: '227925' },
                        { label: 'Reversal Amount', value: '0' },
                        { label: 'Balance Amount', value: '0' },
                        { label: 'Wallet Balance', value: '0' },
                        { label: 'Last Updated On', value: '2025-11-07' },
                    ].map((item, idx) => (
                        <div key={idx} style={{ padding: '10px', border: '0.1px solid #f4f4f4', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.label}</span>
                            <span style={{ fontSize: '13px' }}>: {item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '30px', color: '#777', fontSize: '12px' }}>
                © All rights reserved.
                <span style={{ float: 'right' }}><img src="https://picsum.photos/seed/rit/16/16" alt="RIT-IMS" /> RIT-IMS</span>
            </div>
        </div>
    );
};

export default AcademicFee;
