import React from 'react';

const ChangePassword = () => {
    return (
        <div className="stu-report-page">
            <div className="stu-info-card" style={{ maxWidth: '500px', margin: '20px 0' }}>
                <div style={{ padding: '12px 15px', borderBottom: '1px solid #f4f4f4', fontSize: '14px', color: '#333' }}>
                    Change password
                </div>
                <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                            New Password <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="password"
                            className="table-btn"
                            style={{ width: '100%', height: '34px', background: '#fff' }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                            Repeat New Password <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="password"
                            className="table-btn"
                            style={{ width: '100%', height: '34px', background: '#fff' }}
                        />
                    </div>
                    <button className="table-btn" style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px' }}>
                        Save
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '30px', color: '#777', fontSize: '12px' }}>
                © All rights reserved.
                <span style={{ float: 'right' }}><img src="/assets/images/rit-icon.png" alt="RIT-IMS" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> RIT-IMS</span>
            </div>
        </div>
    );
};

export default ChangePassword;
