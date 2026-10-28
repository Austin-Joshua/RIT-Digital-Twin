import React, { useState } from 'react';
import { LuFileText, LuEye, LuArrowLeft, LuCopy, LuFileSpreadsheet, LuPrinter, LuDownload, LuSearch, LuX } from 'react-icons/lu';

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
            'STUDENT REP 5 (2117240020005)',
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
            <div className="ims-page-container">
                <div className="ims-header-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div className="ims-header-icon-box">
                            <LuFileText />
                        </div>
                        <div>
                            <h1 className="ims-header-title">Summary Of Meeting</h1>
                            <p className="ims-header-subtitle">{selectedMom.course} | Sem {selectedMom.sem} - Sec {selectedMom.section} | Date: {selectedMom.date}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedMom(null)}
                        className="ims-candy-btn ims-candy-neutral"
                    >
                        <LuArrowLeft /> Back to Minutes List
                    </button>
                </div>

                <div className="ims-card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Attendees Section */}
                    <div>
                        <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                            Members Present
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <strong style={{ color: '#0B2C6B', display: 'block', marginBottom: '10px', fontSize: '0.9rem' }}>Faculty Members:</strong>
                                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
                                    {selectedMom.faculties.map((f, i) => <li key={i}>{f}</li>)}
                                </ul>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <strong style={{ color: '#0B2C6B', display: 'block', marginBottom: '10px', fontSize: '0.9rem' }}>Student Representatives:</strong>
                                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
                                    {selectedMom.students.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Syllabus Coverage Table */}
                    <div>
                        <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                            Syllabus Completion & Portions Covered
                        </h3>
                        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.86rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                                        <th style={{ padding: '12px 14px', width: '50px', textAlign: 'center', fontWeight: '700' }}>S.No</th>
                                        <th style={{ padding: '12px 14px', fontWeight: '700' }}>Course Title & Code</th>
                                        <th style={{ padding: '12px 14px', fontWeight: '700' }}>Faculty Handling</th>
                                        <th style={{ padding: '12px 14px', textAlign: 'center', width: '150px', fontWeight: '700' }}>Syllabus Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedMom.syllabus.map((row, idx) => (
                                        <tr key={row.sno} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                            <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>{row.sno}</td>
                                            <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0B2C6B' }}>{row.subject}</td>
                                            <td style={{ padding: '12px 14px', color: '#334155' }}>{row.faculty}</td>
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                <span className="ims-candy-badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                                                    {row.completion}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Discussions & Resolutions */}
                    <div>
                        <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                            Discussions & Key Action Items
                        </h3>
                        <div style={{ background: '#f8fafc', padding: '18px 24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: '#334155', lineHeight: '1.7' }}>
                                {selectedMom.pointsDiscussed.map((pt, i) => <li key={i}>{pt}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ims-page-container">
            {/* Header Banner following TransportDirectory & Simulator hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuFileText />
                    </div>
                    <div>
                        <h1 className="ims-header-title">Minutes Of Meet (MOM)</h1>
                        <p className="ims-header-subtitle">Official records, syllabus completion status, and feedback resolutions</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(11,44,107,0.25)' }}>
                        Class : B.E. CSE / 5 / A
                    </span>
                </div>
            </div>

            {/* Main Elevated Card with Curvy Corners */}
            <div className="ims-card-elevated">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
                        Committee Records
                    </h3>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="ims-candy-search"
                            style={{ paddingLeft: '36px', width: '220px' }}
                        />
                        <LuSearch style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                </div>

                {/* Table with Curvy Outer Box */}
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.86rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '50px', fontWeight: '700' }}>S.No</th>
                                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Batch</th>
                                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Academic Year</th>
                                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Course</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '60px', fontWeight: '700' }}>Sem</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '60px', fontWeight: '700' }}>Sec</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '120px', fontWeight: '700' }}>Meeting Date</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '120px', fontWeight: '700' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMoms.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                        No committee minutes found.
                                    </td>
                                </tr>
                            ) : (
                                filteredMoms.map((mom, idx) => (
                                    <tr key={mom.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                                        <td style={{ padding: '12px 14px', color: '#334155' }}>{mom.batch}</td>
                                        <td style={{ padding: '12px 14px', color: '#334155' }}>{mom.ay}</td>
                                        <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0B2C6B' }}>{mom.course}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#0B2C6B' }}>{mom.sem}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#0B2C6B' }}>{mom.section}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#334155' }}>{mom.date}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => setSelectedMom(mom)}
                                                className="ims-candy-btn ims-candy-teal ims-candy-sm"
                                            >
                                                <LuEye /> View MOM
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommitteeMinutes;
