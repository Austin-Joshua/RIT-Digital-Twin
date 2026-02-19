import React from 'react';
import { FaClock } from 'react-icons/fa';

const Timetable = () => (
    <div className="stu-page">
        <div className="stu-page-header">
            <h2>My Time Table</h2>
            <p>View your weekly class schedule</p>
        </div>
        <div className="stu-placeholder">
            <div className="placeholder-icon"><FaClock /></div>
            <p>Your timetable will appear here once the semester begins.</p>
        </div>
    </div>
);

export default Timetable;
