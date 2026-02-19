import React from 'react';
import { FaMoneyCheckAlt } from 'react-icons/fa';

const AcademicFee = () => (
    <div className="stu-page">
        <div className="stu-page-header">
            <h2>Academic Fee</h2>
            <p>View fee details and payment history</p>
        </div>
        <div className="stu-placeholder">
            <div className="placeholder-icon"><FaMoneyCheckAlt /></div>
            <p>Fee details and payment options will be displayed here.</p>
        </div>
    </div>
);

export default AcademicFee;
