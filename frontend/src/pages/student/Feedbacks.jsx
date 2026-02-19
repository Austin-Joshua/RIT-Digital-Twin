import React from 'react';
import { FaCommentDots } from 'react-icons/fa';

const Feedbacks = () => (
    <div className="stu-page">
        <div className="stu-page-header">
            <h2>Feedbacks</h2>
            <p>Submit course and faculty feedback</p>
        </div>
        <div className="stu-placeholder">
            <div className="placeholder-icon"><FaCommentDots /></div>
            <p>Feedback forms will be available during the feedback window.</p>
        </div>
    </div>
);

export default Feedbacks;
