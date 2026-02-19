import React from 'react';
import { FaBookOpen } from 'react-icons/fa';

const SubjectRegistration = () => (
    <div className="stu-page">
        <div className="stu-page-header">
            <h2>My Subject Registration</h2>
            <p>Register for elective and core subjects</p>
        </div>
        <div className="stu-placeholder">
            <div className="placeholder-icon"><FaBookOpen /></div>
            <p>Subject registration is currently closed. Check back during the registration window.</p>
        </div>
    </div>
);

export default SubjectRegistration;
