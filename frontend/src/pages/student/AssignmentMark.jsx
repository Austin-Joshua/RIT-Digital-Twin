import React from 'react';
import { FaClipboardList } from 'react-icons/fa';

const AssignmentMark = () => (
    <div className="stu-page">
        <div className="stu-page-header">
            <h2>Assignment Mark</h2>
            <p>Track your assignment grades</p>
        </div>
        <div className="stu-placeholder">
            <div className="placeholder-icon"><FaClipboardList /></div>
            <p>Assignment marks will be displayed once submitted and graded.</p>
        </div>
    </div>
);

export default AssignmentMark;
