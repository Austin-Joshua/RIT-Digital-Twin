import React from 'react';
import { FaCertificate } from 'react-icons/fa';

const Certificates = () => (
    <div className="stu-page">
        <div className="stu-page-header">
            <h2>Apply Certificates</h2>
            <p>Request bonafide, transfer, or other certificates</p>
        </div>
        <div className="stu-placeholder">
            <div className="placeholder-icon"><FaCertificate /></div>
            <p>Select a certificate type and submit your application.</p>
        </div>
    </div>
);

export default Certificates;
