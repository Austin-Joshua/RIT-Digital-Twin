import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronRight, FaUser, FaInfoCircle, FaHome, FaGraduationCap, FaFileAlt, FaMapMarkerAlt, FaDownload } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../context/ToastContext';
import { useRef } from 'react';
import api from '../../services/api';

const Profile = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const { addToast } = useToast();
    const fileInputRef = useRef(null);

    const [openSections, setOpenSections] = useState({
        personal: true,
        academic: false,
        parent: false,
        educational: false,
        address: false,
        documents: false
    });
    const [profileData, setProfileData] = useState(null);

    React.useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get('/student/dashboard-summary');
                setProfileData(res.data?.profile || null);
            } catch {
                setProfileData(null);
            }
        };
        fetchSummary();
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            addToast('Avatar uploaded processing...', 'info');
            // Mock API delay
            setTimeout(() => addToast('Profile picture updated successfully!', 'success'), 1500);
        }
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const cardBg = 'var(--card-bg)';
    const borderColor = 'var(--theme-border)';
    const textColor = 'var(--theme-text)';
    const subText = 'var(--theme-text-muted)';
    const headerBg = 'var(--theme-bg-muted, var(--color-bg-light))';
    const accentColor = 'var(--color-primary-navy)';
    const rowBorder = 'var(--theme-border)';

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
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{ width: '100px', height: '100px', margin: '0 auto 15px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${accentColor}`, cursor: 'pointer', position: 'relative' }}
                        className="group"
                        title="Click to update avatar"
                    >
                        <img
                            src={user?.profileImage || "/assets/images/placeholder_student.jpg"}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Update
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: textColor }}>{profileData?.name || `${user?.firstName} ${user?.lastName}`}</h3>
                    <p style={{ margin: '0', fontSize: '12px', color: subText }}>
                        {profileData?.batch || 'Batch'} / {profileData?.department || 'Course'} / {profileData?.section || 'Section'}
                    </p>
                </div>

                {/* Student Info Card */}
                <div style={{ background: cardBg, padding: '20px', border: `1px solid ${borderColor}`, borderRadius: '12px', transition: 'background 0.3s', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ color: accentColor, margin: '0 0 15px 0', borderBottom: `1px solid ${borderColor}`, paddingBottom: '10px' }}>Student Info</h4>
                    <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px', flex: 1 }}>
                        <InfoRow label="Full Name" value={`${user?.firstName} ${user?.lastName}`} />
                        <InfoRow label="Register Number" value={profileData?.registerNo || user?.username || "..."} />
                        <InfoRow label="Institutional Email" value={profileData?.email || user?.email || "..."} />
                        <InfoRow label="Academic Status" value={profileData?.status || "Active"} />
                    </div>

                    {/* Account Security / Integration */}
                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--theme-bg-muted)', borderRadius: '10px', border: '1px solid var(--theme-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--theme-text)' }}>Social Authentication</div>
                                <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>Link your @department.ritchennai.edu.in account</div>
                            </div>
                            <button
                                onClick={() => addToast('Redirecting to Google SSO...', 'info')}
                                style={{ padding: '8px 16px', borderRadius: '6px', background: 'white', color: '#444', border: '1px solid #ddd', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: '14px' }} />
                                Link Google
                            </button>
                        </div>
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
                            <InfoRow label="Register Number" value={profileData?.registerNo || "..."} />
                            <InfoRow label="Roll Number" value="..." />
                            <InfoRow label="EMIS Number" value="..." />
                            <InfoRow label="UMIS Number" value="..." />
                            <InfoRow label="Admitted Mode" value="..." />
                            <InfoRow label="First Graduate" value="..." />
                            <InfoRow label="GQ GOVT" value="..." />
                            <InfoRow label="Scholarship" value="..." />
                            <InfoRow label="Hosteler" value={profileData?.scholarType || "..."} />
                            <InfoRow label="Late Entry" value="..." />
                            <InfoRow label="Course" value={profileData?.department || "..."} />
                            <InfoRow label="Batch" value={profileData?.batch || "..."} />
                            <InfoRow label="Academic Year" value="..." />
                            <InfoRow label="Semester" value="..." />
                            <InfoRow label="Section" value={profileData?.section || "..."} />
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
