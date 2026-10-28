import React, { useState } from 'react';
import { LuEye, LuArrowLeft, LuCopy, LuFileSpreadsheet, LuPrinter, LuDownload, LuSearch, LuX } from 'react-icons/lu';

const COMMITTEE_MINUTES_DATA = [
    {
        id: 1,
        batch: '2024-2028',
        ay: '2026-2027',
        course: 'B.E. CSE',
        sem: '5',
        section: 'A',
        date: '28-09-2026',
        faculties: [
            'SARAVANAN M. (PH15)',
            'ARAVINDH S (CS190)',
            'VINITHA R (CS204)',
            'HARSHANA B (CS218)',
            'CHARUMATHY M (CS250)'
        ],
        students: [
            'AAKASH B K (2117240020001)',
            'AKSHARA P (2117240020016)',
            'AKSHAYA M (2117240020019)',
            'ANISHA PATHAK (2117240020026)',
            'AUSTIN JOSHUA M (2117240020044)',
            'CHRIS ALAN (2117240020054)',
            'CHRISTOPHER J (2117240020056)'
        ],
        syllabus: [
            { sno: 1, subject: 'Health Care Analytics (AD23V14)', faculty: 'ANJANA DEVI V. (CS82)', completion: '100 %' },
            { sno: 2, subject: 'Deep Learning Techniques (AD23531)', faculty: 'VINITHA R (CS204)', completion: '100 %' },
            { sno: 3, subject: 'Data Exploration and Visualization (AD23532)', faculty: 'CHARUMATHY M (CS250)', completion: '100 %' },
            { sno: 4, subject: 'Data Warehousing and Data Mining (AD23V13)', faculty: 'SOWMYA S (CS203)', completion: '100 %' },
            { sno: 5, subject: 'Compiler Design (CS23512)', faculty: 'DR. MADHAN V. (CS130)', completion: '100 %' },
            { sno: 6, subject: 'Computer Networks (CS23511)', faculty: 'ARAVINDH S (CS190)', completion: '97.78 %' },
            { sno: 7, subject: 'Disaster Risk Reduction and Management (MX23511)', faculty: 'DR. S. SURESH (GE01)', completion: '100 %' },
            { sno: 8, subject: 'AZURE for Data Analytics (CS23IC3)', faculty: 'SARAVANAN M. (PH15)', completion: '100 %' }
        ],
        pointsDiscussed: [
            'Portions coverage for CAT-2 reviewed and found satisfactory across all core theory subjects.',
            'Students requested additional tutorial practice sessions for Compiler Design parser problems.',
            'Faculty advisor advised students with attendance below 75% to attend remedial compensations immediately.'
        ]
    }
];

const CommitteeMinutes = () => {
    const [selectedMom, setSelectedMom] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMoms = COMMITTEE_MINUTES_DATA.filter(m =>
        m.batch.includes(searchTerm) ||
        m.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.date.includes(searchTerm)
    );

    if (selectedMom) {
        return (
            <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '24px' }}>
                    {/* Header with Back button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dee2e6', paddingBottom: '16px', marginBottom: '24px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '500', color: '#212529' }}>
                            Summary Of Meeting
                        </h2>
                        <button
                            onClick={() => setSelectedMom(null)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#6c757d',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 14px',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }}
                        >
                            <LuArrowLeft /> Back to List
                        </button>
                    </div>

                    {/* Members Present Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
                        {/* Faculties */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#212529' }}>
                                    Members Present (Faculties) <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button style={{ backgroundColor: '#17a2b8', color: '#ffffff', border: 'none', borderRadius: '3px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>Select all</button>
                                    <button style={{ backgroundColor: '#17a2b8', color: '#ffffff', border: 'none', borderRadius: '3px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>Deselect all</button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', border: '1px solid #ced4da', borderRadius: '4px', padding: '12px', minHeight: '90px', backgroundColor: '#fdfdfd' }}>
                                {selectedMom.faculties.map((f, i) => (
                                    <span key={i} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        backgroundColor: '#007bff',
                                        color: '#ffffff',
                                        borderRadius: '3px',
                                        padding: '4px 8px',
                                        fontSize: '0.8125rem'
                                    }}>
                                        <LuX style={{ cursor: 'pointer' }} /> {f}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Students */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#212529' }}>
                                    Members Present (Students) <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button style={{ backgroundColor: '#17a2b8', color: '#ffffff', border: 'none', borderRadius: '3px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>Select all</button>
                                    <button style={{ backgroundColor: '#17a2b8', color: '#ffffff', border: 'none', borderRadius: '3px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>Deselect all</button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', border: '1px solid #ced4da', borderRadius: '4px', padding: '12px', minHeight: '90px', backgroundColor: '#fdfdfd' }}>
                                {selectedMom.students.map((s, i) => (
                                    <span key={i} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        backgroundColor: '#007bff',
                                        color: '#ffffff',
                                        borderRadius: '3px',
                                        padding: '4px 8px',
                                        fontSize: '0.8125rem'
                                    }}>
                                        <LuX style={{ cursor: 'pointer' }} /> {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Syllabus Completion Status */}
                    <div style={{ marginTop: '24px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#212529', marginBottom: '14px' }}>
                            Syllabus Completion Status
                        </h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem', border: '1px solid #dee2e6' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                    <th style={{ padding: '10px', width: '60px', textAlign: 'center' }}>S.No</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Subject Name</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Faculty Name</th>
                                    <th style={{ padding: '10px', textAlign: 'center', width: '180px' }}>Completion Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedMom.syllabus.map((row, idx) => (
                                    <tr key={row.sno} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                                        <td style={{ padding: '10px', textAlign: 'center', color: '#6c757d' }}>{row.sno}</td>
                                        <td style={{ padding: '10px', textAlign: 'center', color: '#212529' }}>{row.subject}</td>
                                        <td style={{ padding: '10px', textAlign: 'center', color: '#495057' }}>{row.faculty}</td>
                                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#28a745' }}>{row.completion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Points Discussed */}
                    <div style={{ marginTop: '28px', backgroundColor: '#f8f9fa', padding: '16px 20px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: '600', color: '#333' }}>
                            Points Discussed & Corrective Actions
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: '#495057', lineHeight: '1.6' }}>
                            {selectedMom.pointsDiscussed.map((pt, i) => (
                                <li key={i} style={{ marginBottom: '6px' }}>{pt}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '500', color: '#333333' }}>
                        Minutes Of Meet (Class Committee)
                    </h2>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '6px 12px 6px 30px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                width: '200px'
                            }}
                        />
                        <LuSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto', padding: '16px 20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                <th style={{ width: '35px', padding: '12px 10px', textAlign: 'center' }}><input type="checkbox" /></th>
                                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Batch</th>
                                <th style={{ padding: '12px 10px', textAlign: 'center' }}>AY</th>
                                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Course</th>
                                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Semester</th>
                                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Section</th>
                                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Date</th>
                                <th style={{ padding: '12px 10px', textAlign: 'center', width: '120px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMoms.map((row) => (
                                <tr key={row.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}><input type="checkbox" /></td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.batch}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.ay}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.course}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.sem}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.section}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>{row.date}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => setSelectedMom(row)}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                backgroundColor: '#17a2b8',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '3px',
                                                padding: '5px 10px',
                                                fontSize: '0.8125rem',
                                                fontWeight: '500',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <LuEye /> View MOM
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommitteeMinutes;
