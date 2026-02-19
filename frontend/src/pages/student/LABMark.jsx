import React from 'react';
import { FaFlask } from 'react-icons/fa';

const LABMark = () => (
    <div className="stu-page">
        <div className="stu-page-header">
            <h2>LAB Mark</h2>
            <p>View your laboratory assessment marks</p>
        </div>
        <div className="stu-placeholder">
            <div className="placeholder-icon"><FaFlask /></div>
            <p>Lab marks will be available after evaluation.</p>
        </div>
    </div>
);

export default LABMark;
