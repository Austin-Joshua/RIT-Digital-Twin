import React from 'react';
import { FaPenFancy } from 'react-icons/fa';

const CATMark = () => (
    <div className="stu-page">
        <div className="stu-page-header">
            <h2>CAT Mark</h2>
            <p>View your Continuous Assessment Test marks</p>
        </div>
        <div className="stu-placeholder">
            <div className="placeholder-icon"><FaPenFancy /></div>
            <p>CAT marks will be published after grading is complete.</p>
        </div>
    </div>
);

export default CATMark;
