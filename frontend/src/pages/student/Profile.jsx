import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronRight, FaUser, FaInfoCircle, FaHome, FaGraduationCap, FaFileAlt, FaMapMarkerAlt, FaDownload } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
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

    const SectionHeader = ({ id, title, icon }) => (
        <div
            onClick={() => toggleSection(id)}
            style={{
                background: '#fff',
                padding: '12px 20px',
                border: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '10px',
                borderRadius: '4px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0B2C6B', fontWeight: 'bold' }}>
                {icon}
                <span>{title}</span>
            </div>
            {openSections[id] ? <FaChevronDown color="#0B2C6B" /> : <FaChevronRight color="#0B2C6B" />}
        </div>
    );

    const InfoRow = ({ label, value }) => (
        <div style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '14px', color: '#555' }}>{value || '-'}</div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {/* Top Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Profile Photo Card */}
                <div style={{ background: '#fff', padding: '30px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ width: '120px', height: '120px', margin: '0 auto 20px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #0B2C6B' }}>
                        <img
                            src={user?.profileImage || "/assets/images/placeholder_student.jpg"}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>{user?.firstName} {user?.lastName}</h3>
                    <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Batch / Course / Year / Semester / Section</p>
                </div>

                {/* Student Info Card */}
                <div style={{ background: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <h4 style={{ color: '#0B2C6B', margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Student Info</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
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
                        style={{ overflow: 'hidden', background: '#fff', border: '1px solid #ddd', marginTop: '-11px', marginBottom: '10px', padding: '20px' }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                            <InfoRow label="Full Name" value={`${user?.firstName} ${user?.lastName}`} />
                            <InfoRow label="Email" value={user?.email || "..."} />
                            <InfoRow label="Mobile" value="..." />
                            <InfoRow label="Aadhar Number" value="..." />
                            <InfoRow label="Date of Birth" value="..." />
                            <InfoRow label="Age" value="..." />
                            <InfoRow label="GENDER" value="..." />
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
                        style={{ overflow: 'hidden', background: '#fff', border: '1px solid #ddd', marginTop: '-11px', marginBottom: '10px', padding: '20px' }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
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
                        style={{ overflow: 'hidden', background: '#fff', border: '1px solid #ddd', marginTop: '-11px', marginBottom: '10px', padding: '20px' }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
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
                        style={{ overflow: 'hidden', background: '#fff', border: '1px solid #ddd', marginTop: '-11px', marginBottom: '10px', padding: '20px' }}
                    >
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa' }}>
                                        {['Education Type', 'Institute Name', 'Institute Location', 'Board / University', 'Register Number', 'Total Marks', 'Cutoff Mark', 'Marks In %', 'Medium', 'Subject 1', 'Mark 1', 'Subject 2', 'Mark 2', 'Subject 3', 'Mark 3'].map(h => (
                                            <th key={h} style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ textAlign: 'center' }}>
                                        <td style={{ border: '1px solid #ddd', padding: '10px' }} colSpan="15">...</td>
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
                        style={{ overflow: 'hidden', background: '#fff', border: '1px solid #ddd', marginTop: '-11px', marginBottom: '10px', padding: '20px' }}
                    >
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    {['Address Type', 'Room No & Street', 'Area', 'District', 'Pincode', 'State', 'Country'].map(h => (
                                        <th key={h} style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ textAlign: 'center' }}>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }} colSpan="7">...</td>
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
                        style={{ overflow: 'hidden', background: '#fff', border: '1px solid #ddd', marginTop: '-11px', marginBottom: '10px', padding: '20px' }}
                    >
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={{ border: '1px solid #ddd', padding: '10px', width: '70%' }}>File Name</th>
                                    <th style={{ border: '1px solid #ddd', padding: '10px' }}>File</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', color: '#999' }} colSpan="2">
                                        No files uploaded
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
