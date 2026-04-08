import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronRight, FaUser, FaInfoCircle, FaHome, FaGraduationCap, FaFileAlt, FaMapMarkerAlt, FaDownload } from 'react-icons/fa';
import { useAuth } from '../../hooks/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/ToastContext';
import { useRef } from 'react';
import api from '../../services/api';

const Profile = () => {
    const { user, googleLogin } = useAuth();
    const { isDarkMode } = useTheme();
    const { addToast } = useToast();
    const fileInputRef = useRef(null);
    const [isLinking, setIsLinking] = useState(false);

    const [openSections, setOpenSections] = useState({
        personal: true,
        academic: false,
        parent: false,
        educational: false,
        address: false,
        documents: false
    });
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({
        mobile: '98401XXXXX',
        phone: '044-271XXXX',
        address: 'No. 12, RIT Staff Quarters, Chennai',
        bloodGroup: 'B+'
    });

    React.useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get('/student/dashboard-summary');
                const data = res.data?.profile || null;
                setProfileData(data);
                if (data) {
                    setEditableData({
                        mobile: data.mobile || '98401XXXXX',
                        phone: data.phone || '044-271XXXX',
                        address: data.address || 'No. 12, RIT Staff Quarters, Chennai',
                        bloodGroup: data.bloodGroup || 'B+'
                    });
                }
            } catch {
                setProfileData(null);
            }
        };
        fetchSummary();
    }, []);

    const handleSaveProfile = async () => {
        try {
            // Simulated update
            addToast('Profile details updated successfully!', 'success');
            setIsEditing(false);
        } catch (err) {
            addToast('Failed to update profile.', 'error');
        }
    };

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

    const InfoRow = ({ label, value, field, type = "text" }) => {
        const isFieldEditable = ['mobile', 'phone', 'address', 'bloodGroup'].includes(field);
        
        return (
            <div style={{ padding: '10px 0', borderBottom: `1px solid ${rowBorder}` }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: subText, marginBottom: '4px' }}>{label}</div>
                {isEditing && isFieldEditable ? (
                    <input 
                        type={type}
                        value={editableData[field] || ''}
                        onChange={(e) => setEditableData(prev => ({ ...prev, [field]: e.target.value }))}
                        style={{ 
                            width: '100%', 
                            padding: '6px 10px', 
                            borderRadius: '4px', 
                            border: '1px solid var(--theme-border)',
                            background: 'var(--theme-bg-muted)',
                            color: 'var(--theme-text)',
                            fontSize: '14px'
                        }}
                    />
                ) : (
                    <div style={{ fontSize: '14px', color: textColor }}>{value || '-'}</div>
                )}
            </div>
        );
    };

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
                        <InfoRow label="Full Name" value={profileData?.name || `${user?.firstName} ${user?.lastName}`} />
                        <InfoRow label="Register Number" value={profileData?.registerNo || user?.username || "..."} />
                        <InfoRow label="Institutional Email" value={profileData?.email || user?.email || "..."} />
                        <InfoRow label="Academic Status" value={profileData?.status || "Active"} />
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '15px', display: 'flex', gap: '10px' }}>
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: accentColor, color: 'white', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                            >
                                Edit Profile Details
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--theme-bg-muted)', color: textColor, fontWeight: 'bold', cursor: 'pointer', border: `1px solid ${borderColor}` }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveProfile}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--color-success)', color: 'white', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                                >
                                    Save Changes
                                </button>
                            </>
                        )}
                    </div>

                    {/* Account Security / Integration */}
                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--theme-bg-muted)', borderRadius: '10px', border: '1px solid var(--theme-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--theme-text)' }}>Social Authentication</div>
                                <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>Link your @department.ritchennai.edu.in account</div>
                            </div>
                            <button
                                onClick={async () => {
                                    setIsLinking(true);
                                    const res = await googleLogin();
                                    if (res.success) addToast('Google account linked successfully!', 'success');
                                    else addToast(res.message, 'error');
                                    setIsLinking(false);
                                }}
                                disabled={isLinking}
                                style={{ padding: '8px 16px', borderRadius: '6px', background: 'white', color: '#444', border: '1px solid #ddd', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: isLinking ? 0.7 : 1 }}
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: '14px' }} />
                                {isLinking ? 'Linking...' : 'Link Google'}
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
                            <InfoRow label="Full Name" value={profileData?.name || `${user?.firstName} ${user?.lastName}`} />
                            <InfoRow label="Email" value={user?.email || "..."} />
                            <InfoRow label="Mobile" value={editableData.mobile} field="mobile" />
                            <InfoRow label="Aadhar Number" value={profileData?.aadharNo || "33XX XXXX XXXX"} />
                            <InfoRow label="Date of Birth" value={profileData?.dob || "15/06/2006"} />
                            <InfoRow label="Age" value="18" />
                            <InfoRow label="Gender" value={profileData?.gender || "Male"} />
                            <InfoRow label="Blood Group" value={editableData.bloodGroup} field="bloodGroup" />
                            <InfoRow label="Mother Tongue" value="Tamil" />
                            <InfoRow label="Religion" value="Hindu" />
                            <InfoRow label="Community" value="BC" />
                            <InfoRow label="State" value="Tamil Nadu" />
                            <InfoRow label="Country" value="India" />
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
                            <InfoRow label="Roll Number" value={profileData?.rollNo || "2024CSE101"} />
                            <InfoRow label="EMIS Number" value="33020XXX" />
                            <InfoRow label="UMIS Number" value="117240XXX" />
                            <InfoRow label="Admitted Mode" value="Counseling" />
                            <InfoRow label="First Graduate" value="No" />
                            <InfoRow label="GQ GOVT" value="Yes" />
                            <InfoRow label="Scholarship" value="Post-Matric" />
                            <InfoRow label="Hosteler" value={profileData?.scholarType || "Day Scholar"} />
                            <InfoRow label="Late Entry" value="No" />
                            <InfoRow label="Course" value={profileData?.department || "B.E. Computer Science and Engineering"} />
                            <InfoRow label="Batch" value={profileData?.batch || "2024-2028"} />
                            <InfoRow label="Academic Year" value="2024-2025" />
                            <InfoRow label="Semester" value="1" />
                            <InfoRow label="Section" value={profileData?.section || "A"} />
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
