import React, { useState } from 'react';
import { LuChevronRight, LuChevronDown } from 'react-icons/lu';
import { useAuth } from '../../hooks/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [openSections, setOpenSections] = useState({
        personal: false,
        academic: false,
        parent: false,
        educational: true, // expanded by default as in user's screenshot
        address: false,
        documents: false
    });

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Top Row: 2 Cards (Matches Screenshot Perfectly) */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Left Card: Student Avatar & Program */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    padding: '30px 20px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        backgroundColor: '#67b0f0',
                        overflow: 'hidden',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ffffff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <img
                            src="/assets/images/student-avatar.png"
                            alt="Austin Joshua M"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<span style="font-size: 2.2rem; font-weight: bold; color: white;">AJ</span>';
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: '600', color: '#212529', letterSpacing: '0.5px' }}>
                        AUSTIN JOSHUA M
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6c757d', lineHeight: '1.4' }}>
                        2024-2028/B.E. Computer Science and Engineering/2026-2027/5/A
                    </p>
                </div>

                {/* Right Card: Student Info */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    padding: '24px'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '500', color: '#007bff' }}>
                        Student Info
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px' }}>
                        <div style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '12px' }}>
                            <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#212529', marginBottom: '6px' }}>
                                Full Name
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#495057' }}>
                                AUSTIN JOSHUA M
                            </span>
                        </div>
                        <div style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '12px' }}>
                            <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#212529', marginBottom: '6px' }}>
                                Register Number
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#495057' }}>
                                2117240020044
                            </span>
                        </div>
                        <div style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '12px' }}>
                            <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#212529', marginBottom: '6px' }}>
                                Email
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#495057' }}>
                                austin.240044@cse.ritchennai.edu.in
                            </span>
                        </div>
                        <div style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '12px' }}>
                            <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#212529', marginBottom: '6px' }}>
                                Phone
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#495057' }}>
                                9344208046
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Accordion Sections (Matches Authentic IMS) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. Personal Details */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('personal')}
                        style={{
                            padding: '14px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1rem', fontWeight: '500', color: '#007bff' }}>Personal Details</span>
                        {openSections.personal ? <LuChevronDown color="#007bff" /> : <LuChevronRight color="#007bff" />}
                    </div>
                    {openSections.personal && (
                        <div style={{ padding: '20px', borderTop: '1px solid #dee2e6', backgroundColor: '#fafbfc' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.875rem' }}>
                                <div><span style={{ color: '#6c757d' }}>Date of Birth:</span> <strong>15-06-2006</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Gender:</span> <strong>Male</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Blood Group:</span> <strong>O+ve</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Nationality:</span> <strong>Indian</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Religion:</span> <strong>Christian</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Community:</span> <strong>BC</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Mother Tongue:</span> <strong>Tamil</strong></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Academic Details */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('academic')}
                        style={{
                            padding: '14px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1rem', fontWeight: '500', color: '#007bff' }}>Academic Details</span>
                        {openSections.academic ? <LuChevronDown color="#007bff" /> : <LuChevronRight color="#007bff" />}
                    </div>
                    {openSections.academic && (
                        <div style={{ padding: '20px', borderTop: '1px solid #dee2e6', backgroundColor: '#fafbfc' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.875rem' }}>
                                <div><span style={{ color: '#6c757d' }}>Batch:</span> <strong>2024 - 2028</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Degree:</span> <strong>B.E.</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Department:</span> <strong>Computer Science and Engineering</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Current Semester:</span> <strong>Semester V</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Section:</span> <strong>A</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Roll Number:</span> <strong>24CS044</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Hosteler / Day Scholar:</span> <strong>Day Scholar</strong></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Parent Details */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('parent')}
                        style={{
                            padding: '14px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1rem', fontWeight: '500', color: '#007bff' }}>Parent Details</span>
                        {openSections.parent ? <LuChevronDown color="#007bff" /> : <LuChevronRight color="#007bff" />}
                    </div>
                    {openSections.parent && (
                        <div style={{ padding: '20px', borderTop: '1px solid #dee2e6', backgroundColor: '#fafbfc' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', fontSize: '0.875rem' }}>
                                <div><span style={{ color: '#6c757d' }}>Father Name:</span> <strong>MARIA JUSTIN M</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Father Occupation:</span> <strong>Baker</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Mother Name:</span> <strong>JESHEELA DE MELLO G</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Mother Occupation:</span> <strong>Teacher</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Father Contact:</span> <strong>9840228046</strong></div>
                                <div><span style={{ color: '#6c757d' }}>Annual Income:</span> <strong>₹ 3,50,000.00</strong></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Educational Details (Matches User Screenshot 100%!) */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('educational')}
                        style={{
                            padding: '14px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1rem', fontWeight: '500', color: '#007bff' }}>Educational Details</span>
                        {openSections.educational ? <LuChevronDown color="#007bff" /> : <LuChevronRight color="#007bff" />}
                    </div>
                    {openSections.educational && (
                        <div style={{ padding: '16px 20px', borderTop: '1px solid #dee2e6', overflowX: 'auto' }}>
                            <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8125rem', border: '1px solid #dee2e6' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Education Type</th>
                                        <th style={{ padding: '10px 12px', borderRight: '1px solid #dee2e6' }}>Institute Name</th>
                                        <th style={{ padding: '10px 14px', borderRight: '1px solid #dee2e6', width: '220px' }}>Institute Location</th>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Board / University</th>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Register Number</th>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Total Marks</th>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Cutoff Mark</th>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Marks In Percentage / CGPA</th>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Medium</th>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Subject 1</th>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Mark 1</th>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Subject 2</th>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Mark 2</th>
                                        <th style={{ padding: '10px 8px', borderRight: '1px solid #dee2e6' }}>Subject 3</th>
                                        <th style={{ padding: '10px 8px' }}>Mark 3</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #dee2e6', backgroundColor: '#ffffff' }}>
                                        <td style={{ padding: '12px 8px', fontWeight: '500', borderRight: '1px solid #dee2e6' }}>SSLC</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>SRI R.M.JAIN VIDHYASHRAM</td>
                                        <td style={{ padding: '12px 8px', fontSize: '0.75rem', color: '#555', borderRight: '1px solid #dee2e6', lineHeight: '1.3' }}>
                                            4WJ6+Q6H, JN RD, HARIRAM NAGAR, V.M NAGAR, KAKKALUR, TAMIL NADU 602001
                                        </td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>CBSE</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>468/500</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#28a745', borderRight: '1px solid #dee2e6' }}>93.60%</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>ENGLISH</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>TAMIL</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>96/100</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>ENGLSIH</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>95/100</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>MATHEMATICS</td>
                                        <td style={{ padding: '12px 8px' }}>87/100</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #dee2e6', backgroundColor: '#fcfcfc' }}>
                                        <td style={{ padding: '12px 8px', fontWeight: '500', borderRight: '1px solid #dee2e6' }}>HSC</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>SRI R.M.JAIN VIDHYASHRAM</td>
                                        <td style={{ padding: '12px 8px', fontSize: '0.75rem', color: '#555', borderRight: '1px solid #dee2e6', lineHeight: '1.3' }}>
                                            4WJ6+Q6H, JN RD, HARIRAM NAGAR, V.M NAGAR, KAKKALUR, TAMIL NADU 602001
                                        </td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>CBSE</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>418/500</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#28a745', borderRight: '1px solid #dee2e6' }}>83.60%</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>ENGLISH</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>ENGLSIH</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>93/100</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>MATHEMATICS</td>
                                        <td style={{ padding: '12px 8px' }}>83/100</td>
                                    </tr>
                                    <tr style={{ backgroundColor: '#ffffff' }}>
                                        <td style={{ padding: '12px 8px', fontWeight: '500', borderRight: '1px solid #dee2e6' }}>DIPLOMA</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px', borderRight: '1px solid #dee2e6' }}>-</td>
                                        <td style={{ padding: '12px 8px' }}>-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 5. Address Details */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('address')}
                        style={{
                            padding: '14px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1rem', fontWeight: '500', color: '#007bff' }}>Address Details</span>
                        {openSections.address ? <LuChevronDown color="#007bff" /> : <LuChevronRight color="#007bff" />}
                    </div>
                    {openSections.address && (
                        <div style={{ padding: '20px', borderTop: '1px solid #dee2e6', backgroundColor: '#fafbfc' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.875rem' }}>
                                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                    <strong style={{ color: '#007bff', display: 'block', marginBottom: '8px' }}>Permanent Address:</strong>
                                    <p style={{ margin: 0, color: '#495057', lineHeight: '1.6' }}>
                                        NO.48 N.G.G.O COLONY, <br />
                                        TIRUVALLUR, <br />
                                        TAMIL NADU 602001
                                    </p>
                                </div>
                                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                    <strong style={{ color: '#007bff', display: 'block', marginBottom: '8px' }}>Communication Address:</strong>
                                    <p style={{ margin: 0, color: '#495057', lineHeight: '1.6' }}>
                                        NO.48 N.G.G.O COLONY, <br />
                                        TIRUVALLUR, <br />
                                        TAMIL NADU 602001
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 6. Document Details */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('documents')}
                        style={{
                            padding: '14px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1rem', fontWeight: '500', color: '#007bff' }}>Document Details</span>
                        {openSections.documents ? <LuChevronDown color="#007bff" /> : <LuChevronRight color="#007bff" />}
                    </div>
                    {openSections.documents && (
                        <div style={{ padding: '20px', borderTop: '1px solid #dee2e6', backgroundColor: '#fafbfc' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.875rem' }}>
                                <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                    <strong>SSLC Mark Sheet:</strong> <br />
                                    <span style={{ color: '#28a745', fontSize: '0.8125rem' }}>✓ Verified (Uploaded)</span>
                                </div>
                                <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                    <strong>HSC Mark Sheet:</strong> <br />
                                    <span style={{ color: '#28a745', fontSize: '0.8125rem' }}>✓ Verified (Uploaded)</span>
                                </div>
                                <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                    <strong>Community Certificate:</strong> <br />
                                    <span style={{ color: '#28a745', fontSize: '0.8125rem' }}>✓ Verified (Uploaded)</span>
                                </div>
                                <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                    <strong>Aadhar Card:</strong> <br />
                                    <span style={{ color: '#28a745', fontSize: '0.8125rem' }}>✓ Verified (Uploaded)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
