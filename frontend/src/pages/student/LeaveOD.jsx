import React from 'react';
import { FaFileAlt } from 'react-icons/fa';

const LeaveOD = () => (
    <div className="stu-page">
        <div className="stu-page-header">
            <h2>Apply Leave / OD</h2>
            <p>Submit leave or on-duty applications</p>
        </div>
        <div className="stu-placeholder">
            <div className="placeholder-icon"><FaFileAlt /></div>
            <p>No pending leave or OD applications. Use the form below to apply.</p>
        </div>
    </div>
);

export default LeaveOD;
