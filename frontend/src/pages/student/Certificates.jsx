import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import { useToast } from '../../hooks/ToastContext';
import { LuPlus, LuSearch, LuPencil, LuTrash2, LuEye, LuPrinter, LuX, LuCheck } from 'react-icons/lu';
import jsPDF from 'jspdf';
import { applyCollegePageLayout, COLLEGE_BRANDING } from '../../utils/collegePdfBranding';

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
        
        const certText = `This is to certify that Mr. AUSTIN JOSHUA M (Register Number: 2117240020044) is a bonafide student of this institution, currently studying in V Semester, B.E. Computer Science and Engineering during the academic year 2026-2027.`;
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
        <div style={{ padding: '20px 24px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #dee2e6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Card Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '500', color: '#333333' }}>
                        Apply Certificate
                    </h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                                    width: '180px'
                                }}
                            />
                            <LuSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                        </div>
                        <button
                            onClick={() => openApplyModal()}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#28a745',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '7px 16px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                        >
                            <LuPlus /> Apply Certificate
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto', padding: '16px 20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                                <th style={{ padding: '12px 10px', width: '60px' }}>S.No</th>
                                <th style={{ padding: '12px 10px', width: '120px' }}>Date</th>
                                <th style={{ padding: '12px 10px' }}>Certificate</th>
                                <th style={{ padding: '12px 10px' }}>Purpose</th>
                                <th style={{ padding: '12px 10px', width: '120px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px 10px' }}>Response</th>
                                <th style={{ padding: '12px 10px', width: '120px', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCertificates.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                                        No certificate applications found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCertificates.map((cert, idx) => (
                                    <tr key={cert.id} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                                        <td style={{ padding: '12px 10px', color: '#6c757d' }}>{idx + 1}</td>
                                        <td style={{ padding: '12px 10px', color: '#333333' }}>{cert.date}</td>
                                        <td style={{ padding: '12px 10px', fontWeight: '500', color: '#212529' }}>{cert.certificateName}</td>
                                        <td style={{ padding: '12px 10px', color: '#495057' }}>{cert.purpose}</td>
                                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 10px',
                                                borderRadius: '3px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                backgroundColor: cert.status === 'Approved' ? '#28a745' : cert.status === 'Rejected' ? '#dc3545' : '#ffc107',
                                                color: cert.status === 'Pending' ? '#212529' : '#ffffff'
                                            }}>
                                                {cert.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 10px', color: '#6c757d', fontSize: '0.8125rem' }}>
                                            {cert.response}
                                        </td>
                                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => triggerPreview(cert)}
                                                    title="Preview / Print"
                                                    style={{
                                                        backgroundColor: '#ffc107',
                                                        color: '#212529',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        padding: '5px 8px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8125rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <LuEye />
                                                </button>
                                                <button
                                                    onClick={() => openApplyModal(cert)}
                                                    title="Edit Application"
                                                    style={{
                                                        backgroundColor: '#17a2b8',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        padding: '5px 8px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8125rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <LuPencil />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cert.id)}
                                                    title="Delete Application"
                                                    style={{
                                                        backgroundColor: '#dc3545',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        padding: '5px 8px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8125rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center'
                                                    }}
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

            {/* Apply / Edit Modal */}
            {showApplyModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        width: '100%',
                        maxWidth: '560px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #dee2e6',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '500', color: '#333333' }}>
                                {editingId ? 'Edit Certificate Application' : 'Apply Certificate'}
                            </h3>
                            <button
                                onClick={() => setShowApplyModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6c757d' }}
                            >
                                <LuX />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                    Certificate Type <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <select
                                    value={certType}
                                    onChange={(e) => setCertType(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        border: '1px solid #ced4da',
                                        fontSize: '0.875rem'
                                    }}
                                    required
                                >
                                    <option value="BONAFIDE">Bonafide Certificate</option>
                                    <option value="TC">Transfer Certificate</option>
                                    <option value="COURSE_COMPLETION">Course Completion Certificate</option>
                                    <option value="MEDIUM_OF_INSTRUCTION">Medium of Instruction Certificate</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                    Date <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="date"
                                    value={certDate}
                                    onChange={(e) => setCertDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        border: '1px solid #ced4da',
                                        fontSize: '0.875rem'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                    Purpose / Reason <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Passport Application, Education Loan, Visa"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        border: '1px solid #ced4da',
                                        fontSize: '0.875rem'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                    Hosteler
                                </label>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="hosteler"
                                            value="No"
                                            checked={isHosteler === 'No'}
                                            onChange={() => setIsHosteler('No')}
                                        />
                                        No (Day Scholar)
                                    </label>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="hosteler"
                                            value="Yes"
                                            checked={isHosteler === 'Yes'}
                                            onChange={() => setIsHosteler('Yes')}
                                        />
                                        Yes (Hostel Resident)
                                    </label>
                                </div>
                            </div>

                            {isHosteler === 'Yes' && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#495057' }}>
                                        Hostel Room No <span style={{ color: '#dc3545' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Block-B Room 302"
                                        value={hostelRoomNo}
                                        onChange={(e) => setHostelRoomNo(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            border: '1px solid #ced4da',
                                            fontSize: '0.875rem'
                                        }}
                                        required
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid #dee2e6', paddingTop: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => triggerPreview({
                                        certificate: certType,
                                        certificateName: certType,
                                        date: certDate.split('-').reverse().join('-'),
                                        purpose
                                    })}
                                    style={{
                                        backgroundColor: '#ffc107',
                                        color: '#212529',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Preview
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowApplyModal(false)}
                                    style={{
                                        backgroundColor: '#6c757d',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: '#007bff',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 20px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Certificate Preview Modal */}
            {showPreviewModal && previewCert && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1060,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '6px',
                        width: '100%',
                        maxWidth: '720px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '14px 20px',
                            borderBottom: '1px solid #dee2e6',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#f8f9fa'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#333333' }}>
                                Certificate Preview
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    onClick={() => generatePdf(previewCert)}
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '6px 12px',
                                        fontSize: '0.8125rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <LuPrinter /> Download PDF
                                </button>
                                <button
                                    onClick={() => setShowPreviewModal(false)}
                                    style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6c757d' }}
                                >
                                    <LuX />
                                </button>
                            </div>
                        </div>

                        {/* Certificate Sheet Display */}
                        <div style={{ padding: '40px', backgroundColor: '#ffffff', border: '2px solid #000', margin: '20px', position: 'relative' }}>
                            <div style={{ textAlign: 'center', borderBottom: '2px solid #1a365d', paddingBottom: '16px', marginBottom: '24px' }}>
                                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', color: '#1a365d', letterSpacing: '0.5px' }}>
                                    RAJALAKSHMI INSTITUTE OF TECHNOLOGY
                                </h2>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#555', fontStyle: 'italic' }}>
                                    An Autonomous Institution | Affiliated to Anna University, Chennai
                                </p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                                    Kuthambakkam Post, Chembarambakkam, Chennai - 600 124
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '30px' }}>
                                <span><strong>Ref:</strong> RIT/BON/2026-27/{previewCert.id || '0044'}</span>
                                <span><strong>Date:</strong> {previewCert.date || new Date().toLocaleDateString('en-GB')}</span>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <span style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    textDecoration: 'underline',
                                    letterSpacing: '1px',
                                    color: '#212529'
                                }}>
                                    BONAFIDE CERTIFICATE
                                </span>
                            </div>

                            <p style={{ fontSize: '1rem', lineHeight: '1.8', textAlign: 'justify', textIndent: '40px', color: '#212529', marginBottom: '20px' }}>
                                This is to certify that <strong>Mr. AUSTIN JOSHUA M</strong> (Register Number: <strong>2117240020044</strong>) is a bonafide student of this institution, currently studying in <strong>V Semester</strong>, <strong>B.E. Computer Science and Engineering</strong> during the academic year <strong>2026-2027</strong>.
                            </p>

                            <p style={{ fontSize: '1rem', lineHeight: '1.8', textAlign: 'justify', textIndent: '40px', color: '#212529', marginBottom: '60px' }}>
                                This certificate is issued on the request of the student for the purpose of "<strong>{previewCert.purpose || 'Official Verification'}</strong>".
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'center' }}>
                                <div>
                                    <div style={{ width: '120px', height: '40px', borderBottom: '1px solid #333', margin: '0 auto 8px auto' }} />
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>PRINCIPAL</div>
                                    <div style={{ fontSize: '0.8rem', color: '#555' }}>Rajalakshmi Institute of Technology</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Certificates;
