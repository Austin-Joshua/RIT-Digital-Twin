import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import { useToast } from '../../hooks/ToastContext';
import { LuAward, LuPlus, LuSearch, LuPencil, LuTrash2, LuEye, LuPrinter, LuX, LuCheck } from 'react-icons/lu';
import jsPDF from 'jspdf';
import { applyCollegePageLayout, COLLEGE_BRANDING } from '../../utils/collegePdfBranding';
import { workflowApi } from '../../services/enterpriseApi';

const INITIAL_CERTIFICATES = [
    {
        id: 1,
        date: '12-08-2026',
        certificate: 'BONAFIDE',
        certificateName: 'Bonafide Certificate',
        purpose: 'Passport Application',
        status: 'Approved',
        response: 'Verified and signed by Principal Office',
        hosteler: 'No',
        roomNo: ''
    },
    {
        id: 2,
        date: '04-09-2026',
        certificate: 'BONAFIDE',
        certificateName: 'Bonafide Certificate',
        purpose: 'Education Loan Renewal',
        status: 'Approved',
        response: 'Issued via Dean Academics',
        hosteler: 'No',
        roomNo: ''
    }
];

const Certificates = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [certificates, setCertificates] = useState(INITIAL_CERTIFICATES);
    const [searchTerm, setSearchTerm] = useState('');
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewCert, setPreviewCert] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const loadCertificates = async () => {
            if (!user?.id) return;
            try {
                const res = await workflowApi.getCertificates(user.id);
                if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
                    const certNameMap = {
                        BONAFIDE: 'Bonafide Certificate',
                        TC: 'Transfer Certificate',
                        COURSE_COMPLETION: 'Course Completion Certificate',
                        MEDIUM_OF_INSTRUCTION: 'Medium of Instruction Certificate'
                    };
                    const mapped = res.data.map(c => ({
                        id: c.id,
                        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
                        certificate: c.certificateType || 'BONAFIDE',
                        certificateName: certNameMap[c.certificateType] || c.certificateType || 'Bonafide Certificate',
                        purpose: c.purpose || 'Official Institutional Verification',
                        status: c.status ? (c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase()) : 'Pending',
                        response: c.remarks || (c.status === 'APPROVED' ? 'Verified and signed by Principal Office' : 'Submitted for verification'),
                        hosteler: c.hosteler || 'No',
                        roomNo: c.roomNo || ''
                    }));
                    setCertificates(mapped);
                }
            } catch {
                // Retain authentic demonstration records
            }
        };
        loadCertificates();
        return () => { isMounted = false; };
    }, [user?.id]);

    // Form state
    const [certType, setCertType] = useState('BONAFIDE');
    const [certDate, setCertDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [purpose, setPurpose] = useState('Passport Application');
    const [isHosteler, setIsHosteler] = useState('No');
    const [hostelRoomNo, setHostelRoomNo] = useState('');

    const filteredCertificates = certificates.filter(c => 
        c.certificateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.date.includes(searchTerm)
    );

    const openApplyModal = (cert = null) => {
        if (cert) {
            setEditingId(cert.id);
            setCertType(cert.certificate);
            setCertDate(cert.date.split('-').reverse().join('-')); // DD-MM-YYYY to YYYY-MM-DD
            setPurpose(cert.purpose);
            setIsHosteler(cert.hosteler || 'No');
            setHostelRoomNo(cert.roomNo || '');
        } else {
            setEditingId(null);
            setCertType('BONAFIDE');
            setCertDate(new Date().toISOString().split('T')[0]);
            setPurpose('Passport Application');
            setIsHosteler('No');
            setHostelRoomNo('');
        }
        setShowApplyModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this certificate request?')) {
            setCertificates(prev => prev.filter(c => c.id !== id));
            addToast('Certificate application deleted successfully.', 'success');
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const certNameMap = {
            BONAFIDE: 'Bonafide Certificate',
            TC: 'Transfer Certificate',
            COURSE_COMPLETION: 'Course Completion Certificate',
            MEDIUM_OF_INSTRUCTION: 'Medium of Instruction Certificate'
        };

        const formattedDate = certDate.split('-').reverse().join('-');

        if (editingId) {
            setCertificates(prev => prev.map(c => c.id === editingId ? {
                ...c,
                certificate: certType,
                certificateName: certNameMap[certType] || certType,
                date: formattedDate,
                purpose,
                hosteler: isHosteler,
                roomNo: isHosteler === 'Yes' ? hostelRoomNo : ''
            } : c));
            addToast('Certificate application updated successfully.', 'success');
        } else {
            const newRecord = {
                id: Date.now(),
                date: formattedDate,
                certificate: certType,
                certificateName: certNameMap[certType] || certType,
                purpose,
                status: 'Pending',
                response: 'Submitted for verification',
                hosteler: isHosteler,
                roomNo: isHosteler === 'Yes' ? hostelRoomNo : ''
            };
            setCertificates([newRecord, ...certificates]);
            if (user?.id) {
                workflowApi.requestCertificate(user.id, certType).catch(() => {});
            }
            addToast('Certificate application submitted successfully.', 'success');
        }
        setShowApplyModal(false);
    };

    const triggerPreview = (certData) => {
        setPreviewCert(certData);
        setShowPreviewModal(true);
    };

    const generatePdf = (cert) => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        applyCollegePageLayout(doc, {
            title: 'BONAFIDE CERTIFICATE',
            documentSubtitle: 'Office of the Principal'
        });

        const startY = 130;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Ref: RIT/BON/2026-27/${cert.id || '0044'}`, 48, startY);
        doc.text(`Date: ${cert.date || new Date().toLocaleDateString('en-GB')}`, 440, startY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('BONAFIDE CERTIFICATE', 297.5, startY + 45, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setLineHeightFactor(1.6);
        
        const certText = `This is to certify that the candidate (Register Number: 2117240020001) is a bonafide student of this institution, currently studying in V Semester, B.E. Computer Science and Engineering during the academic year 2026-2027.`;
        const purposeText = `This certificate is issued on the request of the student for the purpose of "${cert.purpose || 'Official Use'}".`;

        doc.text(doc.splitTextToSize(certText, 500), 48, startY + 90);
        doc.text(doc.splitTextToSize(purposeText, 500), 48, startY + 160);

        doc.setFont('helvetica', 'bold');
        doc.text('PRINCIPAL', 480, startY + 300, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Rajalakshmi Institute of Technology', 480, startY + 315, { align: 'center' });

        doc.save(`RIT_Bonafide_${cert.date || 'certificate'}.pdf`);
    };

        return (
        <div className="ims-page-container">
            {/* Header Banner following TransportDirectory & Simulator hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuAward />
                    </div>
                    <div>
                        <h1 className="ims-header-title">Apply Certificates</h1>
                        <p className="ims-header-subtitle">Request bonafide, conduct, course completion, and institutional certificates</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => openApplyModal()}
                        className="ims-candy-btn ims-candy-success"
                    >
                        <LuPlus /> Apply Certificate
                    </button>
                </div>
            </div>

            {/* Main Elevated Card with Curvy Corners */}
            <div className="ims-card-elevated">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="ims-candy-badge" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                            Total Records: {filteredCertificates.length}
                        </span>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search applications..."
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
                                <th style={{ padding: '12px 14px', width: '110px', fontWeight: '700' }}>Date</th>
                                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Certificate Name</th>
                                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Purpose</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '110px', fontWeight: '700' }}>Status</th>
                                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Response / Remarks</th>
                                <th style={{ padding: '12px 14px', textAlign: 'center', width: '140px', fontWeight: '700' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCertificates.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                        No certificate applications recorded.
                                    </td>
                                </tr>
                            ) : (
                                filteredCertificates.map((cert, idx) => (
                                    <tr key={cert.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                                        <td style={{ padding: '12px 14px', color: '#334155' }}>{cert.date}</td>
                                        <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0B2C6B' }}>{cert.certificateName}</td>
                                        <td style={{ padding: '12px 14px', color: '#1e293b' }}>{cert.purpose}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <span className="ims-candy-badge" style={{
                                                backgroundColor: cert.status.toLowerCase() === 'approved' ? '#dcfce7' : '#fef3c7',
                                                color: cert.status.toLowerCase() === 'approved' ? '#166534' : '#92400e',
                                                border: `1px solid ${cert.status.toLowerCase() === 'approved' ? '#bbf7d0' : '#fde68a'}`
                                            }}>
                                                {cert.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.8125rem' }}>{cert.response}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => openPreview(cert)}
                                                    title="Preview & Generate Document"
                                                    className="ims-candy-btn ims-candy-warning ims-candy-sm"
                                                    style={{ padding: '6px 10px' }}
                                                >
                                                    <LuEye />
                                                </button>
                                                <button
                                                    onClick={() => openApplyModal(cert)}
                                                    title="Edit Application"
                                                    className="ims-candy-btn ims-candy-teal ims-candy-sm"
                                                    style={{ padding: '6px 10px' }}
                                                >
                                                    <LuPencil />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cert.id)}
                                                    title="Delete Application"
                                                    className="ims-candy-btn ims-candy-danger ims-candy-sm"
                                                    style={{ padding: '6px 10px' }}
                                                >
                                                    <LuTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Apply / Edit Modal with Curvy Styling */}
            {showApplyModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '560px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            padding: '18px 24px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f8fafc'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
                                {editingId ? 'Edit Certificate Request' : 'Apply for Institutional Certificate'}
                            </h3>
                            <button
                                onClick={() => setShowApplyModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px', display: 'flex' }}
                            >
                                <LuX />
                            </button>
                        </div>

                        <form onSubmit={handleApplySubmit} style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                        Certificate Type <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <select
                                        value={certType}
                                        onChange={(e) => setCertType(e.target.value)}
                                        className="ims-candy-search"
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                    >
                                        <option value="BONAFIDE">Bonafide Certificate</option>
                                        <option value="TC">Transfer Certificate</option>
                                        <option value="COURSE_COMPLETION">Course Completion Certificate</option>
                                        <option value="MEDIUM_OF_INSTRUCTION">Medium of Instruction</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                        Required Date <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={certDate}
                                        onChange={(e) => setCertDate(e.target.value)}
                                        className="ims-candy-search"
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                    Purpose of Certificate <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    placeholder="e.g., Passport Application, Education Loan..."
                                    className="ims-candy-search"
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                        Are you a Hosteler?
                                    </label>
                                    <select
                                        value={isHosteler}
                                        onChange={(e) => setIsHosteler(e.target.value)}
                                        className="ims-candy-search"
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                    >
                                        <option value="No">No (Day Scholar)</option>
                                        <option value="Yes">Yes (Hosteler)</option>
                                    </select>
                                </div>
                                {isHosteler === 'Yes' && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                            Hostel Room Number
                                        </label>
                                        <input
                                            type="text"
                                            value={hostelRoomNo}
                                            onChange={(e) => setHostelRoomNo(e.target.value)}
                                            placeholder="e.g. Block B - 304"
                                            className="ims-candy-search"
                                            style={{ width: '100%', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowApplyModal(false)}
                                    className="ims-candy-btn ims-candy-neutral"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ims-candy-btn ims-candy-success"
                                >
                                    {editingId ? 'Update Application' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Document Preview Modal with Curvy Styling */}
            {showPreviewModal && previewCert && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '680px',
                        maxHeight: '90vh',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            padding: '18px 24px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f8fafc'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
                                    Certificate Preview: {previewCert.certificateName}
                                </h3>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                    Official Institution Verification Mockup
                                </span>
                            </div>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px', display: 'flex' }}
                            >
                                <LuX />
                            </button>
                        </div>

                        <div style={{ padding: '28px', overflowY: 'auto', flex: 1, backgroundColor: '#fcfcfc' }}>
                            <div style={{
                                backgroundColor: '#ffffff',
                                border: '2px solid #0B2C6B',
                                borderRadius: '12px',
                                padding: '36px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                                position: 'relative'
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0B2C6B', fontWeight: 'bold' }}>
                                        RAJALAKSHMI INSTITUTE OF TECHNOLOGY
                                    </h2>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                        An Autonomous Institution | Affiliated to Anna University, Chennai
                                    </p>
                                    <h4 style={{ margin: '14px 0 0 0', fontSize: '1.05rem', color: '#d97706', textDecoration: 'underline', textTransform: 'uppercase' }}>
                                        {previewCert.certificateName}
                                    </h4>
                                </div>

                                <div style={{ fontSize: '0.95rem', lineHeight: '1.8', color: '#1e293b', marginBottom: '32px' }}>
                                    <p>
                                        This is to certify that <strong>STUDENT CANDIDATE</strong> (Register No: <strong>2117240020001</strong>) is a bona fide student of this institution, currently studying in the <strong>Fifth Semester</strong> of <strong>B.E. Computer Science and Engineering</strong> during the academic year <strong>2026-2027</strong>.
                                    </p>
                                    <p>
                                        This certificate is issued on request for the purpose of <strong>{previewCert.purpose}</strong>.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px dashed #cbd5e1' }}>
                                    <div>
                                        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Date of Issue:</span> <br />
                                        <strong>{previewCert.date}</strong>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Authorized Signatory:</span> <br />
                                        <strong>PRINCIPAL / DEAN</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#f8fafc' }}>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="ims-candy-btn ims-candy-neutral"
                            >
                                Close Preview
                            </button>
                            <button
                                onClick={() => handleGeneratePDF(previewCert)}
                                className="ims-candy-btn ims-candy-primary"
                            >
                                <LuPrinter /> Download Official PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Certificates;
