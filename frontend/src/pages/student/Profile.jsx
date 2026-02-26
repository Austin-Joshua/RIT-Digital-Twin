import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronRight, FaUser, FaInfoCircle, FaHome, FaGraduationCap, FaFileAlt, FaMapMarkerAlt, FaDownload } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';

const Profile = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [openSections, setOpenSections] = useState({
        personal: true,
        academic: false,
        parent: false,
        educational: false,
        address: false,
        documents: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const cardBg = isDarkMode ? '#1e293b' : '#fff';
    const borderColor = isDarkMode ? '#334155' : '#ddd';
    const textColor = isDarkMode ? '#f8fafc' : '#333';
    const subText = isDarkMode ? '#94a3b8' : '#666';
    const headerBg = isDarkMode ? '#0f172a' : '#f8f9fa';
    const accentColor = isDarkMode ? '#60a5fa' : '#0B2C6B';
    const rowBorder = isDarkMode ? '#334155' : '#f0f0f0';

    const SectionHeader = ({ id, title, icon }) => (
        <div
            onClick={() => toggleSection(id)}
            style={{
                background: cardBg,
                padding: '12px 20px',
                border: `1px solid ${borderColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '10px',
                borderRadius: '8px',
                transition: 'background 0.3s, border-color 0.3s'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: accentColor, fontWeight: 'bold' }}>
                {icon}
                <span>{title}</span>
            </div>
            {openSections[id] ? <FaChevronDown color={accentColor} /> : <FaChevronRight color={accentColor} />}
        </div>
    );

    const InfoRow = ({ label, value }) => (
        <div style={{ padding: '10px 0', borderBottom: `1px solid ${rowBorder}` }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: subText, marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '14px', color: textColor }}>{value || '-'}</div>
        </div>
    );

    const sectionBodyStyle = {
        overflow: 'hidden',
        background: cardBg,
        border: `1px solid ${borderColor}`,
        marginTop: '-11px',
        marginBottom: '10px',
        padding: '20px',
        borderRadius: '0 0 8px 8px',
        transition: 'background 0.3s, border-color 0.3s'
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {/* Top Cards */}
            <div className="profile-top-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Profile Photo Card */}
                <div style={{ background: cardBg, padding: '30px', border: `1px solid ${borderColor}`, borderRadius: '12px', textAlign: 'center', transition: 'background 0.3s' }}>
                    <div style={{ width: '100px', height: '100px', margin: '0 auto 15px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${accentColor}` }}>
                        <img
                            src={user?.profileImage || "/assets/images/placeholder_student.jpg"}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: textColor }}>{user?.firstName} {user?.lastName}</h3>
                    <p style={{ margin: '0', fontSize: '12px', color: subText }}>Batch / Course / Year / Semester / Section</p>
                </div>

                {/* Student Info Card */}
                <div style={{ background: cardBg, padding: '20px', border: `1px solid ${borderColor}`, borderRadius: '12px', transition: 'background 0.3s' }}>
                    <h4 style={{ color: accentColor, margin: '0 0 15px 0', borderBottom: `1px solid ${borderColor}`, paddingBottom: '10px' }}>Student Info</h4>
                    <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                        <InfoRow label="Full Name" value={`${user?.firstName} ${user?.lastName}`} />
                        <InfoRow label="Register Number" value="..." />
                        <InfoRow label="Email" value={user?.email || "..."} />
                        <InfoRow label="Phone" value="..." />
                    </div>
                </div>
            </div>

            {/* Accordion Sections */}

            {/* Personal Details */}
            <SectionHeader id="personal" title="Personal Details" icon={<FaUser />} />
            <AnimatePresence>
                {openSections.personal && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={sectionBodyStyle}
                    >
                        <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                            <InfoRow label="Full Name" value={`${user?.firstName} ${user?.lastName}`} />
                            <InfoRow label="Email" value={user?.email || "..."} />
                            <InfoRow label="Mobile" value="..." />
                            <InfoRow label="Aadhar Number" value="..." />
                            <InfoRow label="Date of Birth" value="..." />
                            <InfoRow label="Age" value="..." />
                            <InfoRow label="Gender" value="..." />
                            <InfoRow label="Blood Group" value="..." />
                            <InfoRow label="Mother Tongue" value="..." />
                            <InfoRow label="Religion" value="..." />
                            <InfoRow label="Community" value="..." />
                            <InfoRow label="State" value="..." />
                            <InfoRow label="Country" value="..." />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Academic Details */}
            <SectionHeader id="academic" title="Academic Details" icon={<FaInfoCircle />} />
            <AnimatePresence>
                {openSections.academic && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={sectionBodyStyle}
                    >
                        <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                            <InfoRow label="Register Number" value="..." />
                            <InfoRow label="Roll Number" value="..." />
                            <InfoRow label="EMIS Number" value="..." />
                            <InfoRow label="UMIS Number" value="..." />
                            <InfoRow label="Admitted Mode" value="..." />
                            <InfoRow label="First Graduate" value="..." />
                            <InfoRow label="GQ GOVT" value="..." />
                            <InfoRow label="Scholarship" value="..." />
                            <InfoRow label="Hosteler" value="..." />
                            <InfoRow label="Late Entry" value="..." />
                            <InfoRow label="Course" value="..." />
                            <InfoRow label="Batch" value="..." />
                            <InfoRow label="Academic Year" value="..." />
                            <InfoRow label="Semester" value="..." />
                            <InfoRow label="Section" value="..." />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Parent Details */}
            <SectionHeader id="parent" title="Parent Details" icon={<FaHome />} />
            <AnimatePresence>
                {openSections.parent && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={sectionBodyStyle}
                    >
                        <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                            <InfoRow label="Father Name" value="..." />
                            <InfoRow label="Mother Name" value="..." />
                            <InfoRow label="Father Mobile No" value="..." />
                            <InfoRow label="Mother Mobile No" value="..." />
                            <InfoRow label="Father's Occupation" value="..." />
                            <InfoRow label="Mother's Occupation" value="..." />
                            <InfoRow label="Father's Office Address" value="..." />
                            <InfoRow label="Mother's Office Address" value="..." />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Educational Details */}
            <SectionHeader id="educational" title="Educational Details" icon={<FaGraduationCap />} />
            <AnimatePresence>
                {openSections.educational && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={sectionBodyStyle}
                    >
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                <thead>
                                    <tr style={{ background: headerBg }}>
                                        {['Education Type', 'Institute Name', 'Institute Location', 'Board / University', 'Register Number', 'Total Marks', 'Cutoff Mark', 'Marks In %', 'Medium', 'Subject 1', 'Mark 1', 'Subject 2', 'Mark 2', 'Subject 3', 'Mark 3'].map(h => (
                                            <th key={h} style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'center', color: textColor }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ textAlign: 'center' }}>
                                        <td style={{ border: `1px solid ${borderColor}`, padding: '10px', color: subText }} colSpan="15">...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Address Details */}
            <SectionHeader id="address" title="Address Details" icon={<FaMapMarkerAlt />} />
            <AnimatePresence>
                {openSections.address && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={sectionBodyStyle}
                    >
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: headerBg }}>
                                    {['Address Type', 'Room No & Street', 'Area', 'District', 'Pincode', 'State', 'Country'].map(h => (
                                        <th key={h} style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'center', color: textColor }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ textAlign: 'center' }}>
                                    <td style={{ border: `1px solid ${borderColor}`, padding: '10px', color: subText }} colSpan="7">...</td>
                                </tr>
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Document Details */}
            <SectionHeader id="documents" title="Document Details" icon={<FaFileAlt />} />
            <AnimatePresence>
                {openSections.documents && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={sectionBodyStyle}
                    >
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: headerBg }}>
                                    <th style={{ border: `1px solid ${borderColor}`, padding: '10px', width: '70%', color: textColor }}>File Name</th>
                                    <th style={{ border: `1px solid ${borderColor}`, padding: '10px', color: textColor }}>File</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'center', color: subText }} colSpan="2">
                                        No files uploaded
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile responsive styles */}
            <style>{`
                @media (max-width: 768px) {
                    .profile-top-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .profile-info-grid {
                        grid-template-columns: 1fr !important;
                        gap: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;
