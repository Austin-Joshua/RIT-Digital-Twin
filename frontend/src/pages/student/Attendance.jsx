import React from 'react';
import { FaCalendarCheck } from 'react-icons/fa';

const Attendance = () => (
    <div className="stu-page">
        <div className="stu-page-header">
            <h2>Attendance</h2>
            <p>View your subject-wise attendance report</p>
        </div>
        <div className="stu-placeholder">
            <div className="placeholder-icon"><FaCalendarCheck /></div>
            <p>Attendance data will be available once classes are in session.</p>
        </div>
    </div>
);

export default Attendance;
