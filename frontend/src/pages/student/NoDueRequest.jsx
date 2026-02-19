import React from 'react';

const NoDueRequest = () => {
    const subjects = [
        { id: 1, code: 'CS23411', name: 'Database Management Systems', faculty: 'Prof. PANDIARAJAN T.', status: 'Not Requested', remarks: '-' },
        { id: 2, code: 'CS23413', name: 'Theory of Computation', faculty: 'Prof. ANGALAPARAMESWARI ANBAZHAGAN', status: 'Not Requested', remarks: '-' },
        { id: 3, code: 'CS23414', name: 'Software Development Practices', faculty: 'Prof. VINITHA R', status: 'Not Requested', remarks: '-' },
        { id: 4, code: 'CS23431', name: 'Design and Analysis of Algorithms', faculty: 'Prof. MURUGAN P', status: 'Not Requested', remarks: '-' },
        { id: 5, code: 'AL23432', name: 'Machine Learning Techniques', faculty: 'Prof. ARAVINDH S', status: 'Not Requested', remarks: '-' },
        { id: 6, code: 'CS23IC2', name: 'Visualization Tools', faculty: 'Prof. ARAVINDH S', status: 'Not Requested', remarks: '-' },
        { id: 7, code: 'CS23415', name: 'Operating Systems', faculty: 'Prof. Not Assigned', status: 'Not Requested', remarks: '-' },
    ];

    return (
        <div className="stu-report-page">
            <div className="stu-breadcrumb" style={{ marginBottom: '20px' }}>No Due Request</div>

            <div className="stu-info-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '20px' }}>Subjects</h4>

                <table className="stu-data-table" style={{ border: '1px solid #f4f4f4' }}>
                    <thead style={{ background: '#f9f9f9' }}>
                        <tr>
                            <th style={{ textAlign: 'center', width: '60px' }}>S.No</th>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Faculty Name</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                            <th style={{ textAlign: 'center' }}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((s, idx) => (
                            <tr key={s.id}>
                                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                <td>{s.code}</td>
                                <td>{s.name}</td>
                                <td>{s.faculty}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <button style={{
                                        background: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        padding: '4px 10px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        display: 'inline-block'
                                    }}>
                                        Not Requested
                                    </button>
                                </td>
                                <td style={{ textAlign: 'center' }}>{s.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h4 style={{ fontSize: '18px', fontWeight: '500', margin: '30px 0 20px' }}>Labs / Project Work</h4>
                {/* Similar table could go here if data exists */}
            </div>
        </div>
    );
};

export default NoDueRequest;
