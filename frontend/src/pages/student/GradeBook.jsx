import React from 'react';
import { FaBook } from 'react-icons/fa';

const GradeBook = () => (
    <div className="stu-page">
        <div className="stu-page-header">
            <h2>Grade Book</h2>
            <p>View your semester-wise grade summary</p>
        </div>
        <div className="stu-placeholder">
            <div className="placeholder-icon"><FaBook /></div>
            <p>Grade book data will appear after results are published.</p>
        </div>
    </div>
);

export default GradeBook;
