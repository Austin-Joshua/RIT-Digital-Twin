import React from 'react';

const AssignmentMark = () => (
    <div className="stu-report-page">
        <div className="stu-info-card" style={{ marginTop: '20px' }}>
            <div style={{
                padding: '15px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                borderBottom: '1px solid #f4f4f4',
                color: '#333'
            }}>
                Assignment Marks
            </div>
            <div style={{ padding: '30px', textAlign: 'center', fontSize: '14px', color: '#333' }}>
                NO Exam Result Available
            </div>
        </div>
    </div>
);

export default AssignmentMark;
