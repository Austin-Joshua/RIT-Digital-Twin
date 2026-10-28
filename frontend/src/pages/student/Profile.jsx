import React, { useState } from 'react';
import { LuUser, LuChevronRight, LuChevronDown } from 'react-icons/lu';
import { useAuth } from '../../hooks/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [openSections, setOpenSections] = useState({
        personal: true,
        academic: true,
        parent: false,
        educational: true,
        address: false,
        documents: false
    });

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const resolvedFullName = [user?.firstName, user?.lastName]
        .filter(part => Boolean(part && String(part).trim()))
        .join(' ')
        .trim() || 'STUDENT CANDIDATE';
    
    const registerNo = user?.username || '2117240020001';
    const studentEmail = user?.email || 'student.cse@ritchennai.edu.in';
    const studentPhone = '+91 98401 XXXXX';
    const initials = resolvedFullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';

    const renderDetailField = (label, value) => (
        <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                {label}
            </span>
            <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>
                {value || '-'}
            </span>
        </div>
    );

    return (
        <div className="ims-page-container">
            {/* Header Banner - Unified visual hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuUser />
                    </div>
                    <div>
                        <h1 className="ims-header-title">Student Profile</h1>
                        <p className="ims-header-subtitle">Personal, academic, educational, and institutional records</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(11,44,107,0.25)' }}>
                        Class : B.E. CSE / 5 / A
                    </span>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(22,163,74,0.25)' }}>
                        Enrolled
                    </span>
                </div>
            </div>

            {/* Top Row: 2 Elevated Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {/* Left Card: Student Avatar & Program */}
                <div className="ims-card-elevated" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 24px' }}>
                    <div style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0B2C6B 100%)',
                        overflow: 'hidden',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid #ffffff',
                        boxShadow: '0 4px 14px rgba(11,44,107,0.25)'
                    }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff' }}>
                            {initials}
                        </span>
                    </div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', letterSpacing: '0.2px' }}>
                        {resolvedFullName.toUpperCase()}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b', lineHeight: '1.5' }}>
                        2024-2028/B.E. Computer Science and Engineering/2026-2027/5/A
                    </p>
                </div>

                {/* Right Card: Student Info */}
                <div className="ims-card-elevated" style={{ padding: '24px 28px' }}>
                    <h3 style={{ margin: '0 0 18px 0', fontSize: '1.15rem', fontWeight: '700', color: '#0284c7' }}>
                        Student Info
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px 28px' }}>
                        {renderDetailField('Full Name', resolvedFullName.toUpperCase())}
                        {renderDetailField('Register Number', registerNo)}
                        {renderDetailField('Email', studentEmail)}
                        {renderDetailField('Phone', studentPhone)}
                    </div>
                </div>
            </div>

            {/* Accordion Sections with Curvy Corners */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. Personal Details */}
                <div className="ims-card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('personal')}
                        style={{
                            padding: '16px 24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0284c7' }}>Personal Details</span>
                        {openSections.personal ? <LuChevronDown color="#0284c7" size={20} /> : <LuChevronRight color="#0284c7" size={20} />}
                    </div>
                    {openSections.personal && (
                        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 32px' }}>
                                <div>
                                    {renderDetailField('Full Name', resolvedFullName.toUpperCase())}
                                    {renderDetailField('Mobile', studentPhone)}
                                    {renderDetailField('Date of Birth', '2006-03-01')}
                                    {renderDetailField('GENDER', 'MALE')}
                                    {renderDetailField('Mother Tongue', 'TAMIL')}
                                    {renderDetailField('Community', 'MBC')}
                                    {renderDetailField('Country', 'INDIAN')}
                                </div>
                                <div>
                                    {renderDetailField('Email', studentEmail)}
                                    {renderDetailField('Aadhar Number', 'XXXX-XXXX-2378')}
                                    {renderDetailField('Age', '19')}
                                    {renderDetailField('Blood Group', 'A+ve')}
                                    {renderDetailField('Religion', 'CHRISTIAN')}
                                    {renderDetailField('State', 'TAMIL NADU')}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Academic Details */}
                <div className="ims-card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('academic')}
                        style={{
                            padding: '16px 24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0284c7' }}>Academic Details</span>
                        {openSections.academic ? <LuChevronDown color="#0284c7" size={20} /> : <LuChevronRight color="#0284c7" size={20} />}
                    </div>
                    {openSections.academic && (
                        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 32px' }}>
                                <div>
                                    {renderDetailField('Register Number', registerNo)}
                                    {renderDetailField('EMIS Number', '2019796943')}
                                    {renderDetailField('Admitted Mode', 'MANAGEMENT QUOTA')}
                                    {renderDetailField('GQ GOVT', 'No')}
                                </div>
                                <div>
                                    {renderDetailField('Roll Number', '24CS044')}
                                    {renderDetailField('UMIS Number', '2403211710421044')}
                                    {renderDetailField('First Graduate', 'No')}
                                    {renderDetailField('Scholarship', 'No')}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Parent Details */}
                <div className="ims-card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('parent')}
                        style={{
                            padding: '16px 24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0284c7' }}>Parent Details</span>
                        {openSections.parent ? <LuChevronDown color="#0284c7" size={20} /> : <LuChevronRight color="#0284c7" size={20} />}
                    </div>
                    {openSections.parent && (
                        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 32px' }}>
                                <div>
                                    {renderDetailField('Father Name', 'MUTHUKUMAR R')}
                                    {renderDetailField('Father Mobile', '+91 98402 XXXXX')}
                                    {renderDetailField('Father Occupation', 'Business Executive')}
                                    {renderDetailField('Annual Income', '₹ 6,50,000')}
                                </div>
                                <div>
                                    {renderDetailField('Mother Name', 'LAKSHMI M')}
                                    {renderDetailField('Mother Mobile', '+91 98403 XXXXX')}
                                    {renderDetailField('Mother Occupation', 'Academician / Teacher')}
                                    {renderDetailField('Guardian Name', '-')}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Educational Details */}
                <div className="ims-card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('educational')}
                        style={{
                            padding: '16px 24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0284c7' }}>Educational Details</span>
                        {openSections.educational ? <LuChevronDown color="#0284c7" size={20} /> : <LuChevronRight color="#0284c7" size={20} />}
                    </div>
                    {openSections.educational && (
                        <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <table style={{ width: '100%', minWidth: '1550px', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'center', fontSize: '0.82rem' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Education Type</th>
                                            <th style={{ padding: '10px 12px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Institute Name</th>
                                            <th style={{ padding: '10px 14px', borderRight: '1px solid #e2e8f0', width: '220px', fontWeight: '700' }}>Institute Location</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Board / University</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Register Number</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Total Marks</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Cutoff Mark</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Marks In Percentage / CGPA</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Medium</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Subject 1</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Mark 1</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Subject 2</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Mark 2</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Subject 3</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Mark 3</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Subject 4</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Mark 4</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Subject 5</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Mark 5</th>
                                            <th style={{ padding: '10px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '700' }}>Subject 6</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '700' }}>Mark 6</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: '600', color: '#0B2C6B', borderRight: '1px solid #e2e8f0' }}>SSLC</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>SRI R.M.JAIN VIDHYASHRAM</td>
                                            <td style={{ padding: '12px 8px', fontSize: '0.75rem', color: '#555', borderRight: '1px solid #e2e8f0', lineHeight: '1.3' }}>
                                                4WJ6+Q6H, JN RD, HARIRAM NAGAR, V.M NAGAR, KAKKALUR, TAMIL NADU 602001
                                            </td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>CBSE</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>468/500</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>
                                                <span className="ims-candy-badge" style={{ background: '#dcfce7', color: '#166534' }}>93.60%</span>
                                            </td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>ENGLISH</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>TAMIL</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>96/100</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>ENGLISH</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>95/100</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>MATHEMATICS</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>87/100</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>SCIENCE</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>95/100</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>SOCIAL SCIENCE</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>95/100</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px' }}>-</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: '600', color: '#0B2C6B', borderRight: '1px solid #e2e8f0' }}>HSC</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>SRI R.M.JAIN VIDHYASHRAM</td>
                                            <td style={{ padding: '12px 8px', fontSize: '0.75rem', color: '#555', borderRight: '1px solid #e2e8f0', lineHeight: '1.3' }}>
                                                4WJ6+Q6H, JN RD, HARIRAM NAGAR, V.M NAGAR, KAKKALUR, TAMIL NADU 602001
                                            </td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>CBSE</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>418/500</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>
                                                <span className="ims-candy-badge" style={{ background: '#dcfce7', color: '#166534' }}>83.60%</span>
                                            </td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>ENGLISH</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>ENGLISH</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>93/100</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>MATHEMATICS</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>83/100</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>PHYSICS</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>74/100</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>CHEMISTRY</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>81/100</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>COMPUTER SCIENCE</td>
                                            <td style={{ padding: '12px 8px' }}>87/100</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#ffffff' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: '600', color: '#0B2C6B', borderRight: '1px solid #e2e8f0' }}>DIPLOMA</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0' }}>-</td>
                                            <td style={{ padding: '12px 8px' }}>-</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* 5. Address Details */}
                <div className="ims-card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('address')}
                        style={{
                            padding: '16px 24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0284c7' }}>Address Details</span>
                        {openSections.address ? <LuChevronDown color="#0284c7" size={20} /> : <LuChevronRight color="#0284c7" size={20} />}
                    </div>
                    {openSections.address && (
                        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <strong style={{ color: '#0B2C6B', display: 'block', marginBottom: '8px' }}>Permanent Address:</strong>
                                    <p style={{ margin: 0, color: '#334155', lineHeight: '1.6', fontSize: '0.9rem' }}>
                                        NO. 25, ANNA NAGAR WEST, <br />
                                        CHENNAI, <br />
                                        TAMIL NADU 600040
                                    </p>
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <strong style={{ color: '#0B2C6B', display: 'block', marginBottom: '8px' }}>Communication Address:</strong>
                                    <p style={{ margin: 0, color: '#334155', lineHeight: '1.6', fontSize: '0.9rem' }}>
                                        NO. 25, ANNA NAGAR WEST, <br />
                                        CHENNAI, <br />
                                        TAMIL NADU 600040
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 6. Document Details */}
                <div className="ims-card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleSection('documents')}
                        style={{
                            padding: '16px 24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0284c7' }}>Document Details</span>
                        {openSections.documents ? <LuChevronDown color="#0284c7" size={20} /> : <LuChevronRight color="#0284c7" size={20} />}
                    </div>
                    {openSections.documents && (
                        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.875rem' }}>
                                <div style={{ backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#334155', fontWeight: '600' }}>Student Photo</span>
                                    <span className="ims-candy-badge" style={{ background: '#dcfce7', color: '#166534' }}>Uploaded</span>
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#334155', fontWeight: '600' }}>Student Signature</span>
                                    <span className="ims-candy-badge" style={{ background: '#dcfce7', color: '#166534' }}>Uploaded</span>
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#334155', fontWeight: '600' }}>HSC Marksheet</span>
                                    <span className="ims-candy-badge" style={{ background: '#dcfce7', color: '#166534' }}>Verified</span>
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#334155', fontWeight: '600' }}>SSLC Marksheet</span>
                                    <span className="ims-candy-badge" style={{ background: '#dcfce7', color: '#166534' }}>Verified</span>
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#334155', fontWeight: '600' }}>Community Certificate</span>
                                    <span className="ims-candy-badge" style={{ background: '#dcfce7', color: '#166534' }}>Verified</span>
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#334155', fontWeight: '600' }}>Aadhaar Card</span>
                                    <span className="ims-candy-badge" style={{ background: '#dcfce7', color: '#166534' }}>Verified</span>
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
