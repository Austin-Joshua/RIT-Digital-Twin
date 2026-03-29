import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { FaCloudUploadAlt, FaFileExcel, FaCheckCircle, FaExclamationTriangle, FaTrash, FaDownload } from 'react-icons/fa';
import api from '../../services/api';
import { useToast } from '../../hooks/ToastContext';

const UploadMarks = () => {
    const [file, setFile] = useState(null);
    const [marksData, setMarksData] = useState([]);
    const { addToast } = useToast();
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [subjectCode, setSubjectCode] = useState('');
    const [uploadMode, setUploadMode] = useState('ALL');

    const fileInputRef = useRef(null);

    const downloadTemplate = () => {
        const templateHeaders = ["StudentData", "SubjectCode", "CAT1", "CAT2", "CAT3", "Assignment", "SemesterGrade"];
        const templateData = [
            { StudentData: "211301001", SubjectCode: "CS3401", CAT1: 45, CAT2: 42, CAT3: 48, Assignment: 10, SemesterGrade: "O" },
            { StudentData: "211301002", SubjectCode: "CS3401", CAT1: 38, CAT2: 35, CAT3: 40, Assignment: 9, SemesterGrade: "A+" }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData, { header: templateHeaders });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Marks_Upload_Template.xlsx");
        addToast("Template downloaded. Please follow this format.", "info");
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFile(droppedFile);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) processFile(selectedFile);
    };

    const processFile = (file) => {
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(fileExt)) {
            addToast('Please upload a valid Excel or CSV file.', 'error');
            return;
        }

        setFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                if (jsonData.length === 0) {
                    addToast('The uploaded file is empty.', 'warning');
                    return;
                }

                const firstRow = jsonData[0];
                const hasStudentId = firstRow.hasOwnProperty('StudentData') || firstRow.hasOwnProperty('RegNo') || firstRow.hasOwnProperty('Email');
                if (!hasStudentId) {
                    addToast('Missing required column: "StudentData", "RegNo", or "Email"', 'error');
                    return;
                }

                setMarksData(jsonData);
                addToast(`${jsonData.length} records parsed successfully`, 'success');
            } catch (err) {
                addToast('Failed to parse file. Ensure it\'s a valid spreadsheet.', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const clearFile = () => {
        setFile(null);
        setMarksData([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (marksData.length === 0) {
            addToast("No data to upload.", "warning");
            return;
        }

        if (!subjectCode && !marksData[0].hasOwnProperty('SubjectCode')) {
            addToast("Subject Code is required (either in file or field).", "warning");
            return;
        }

        setUploading(true);
        const parseOptionalFloat = (val) => (val === '' || val === null || val === undefined) ? null : parseFloat(val);

        const payload = marksData.map(row => ({
            studentIdentifier: row.StudentData || row.RegNo || row.Email,
            subjectCode: row.SubjectCode || subjectCode,
            cat1: uploadMode === 'ALL' || uploadMode === 'CAT' ? parseOptionalFloat(row.CAT1) : null,
            cat2: uploadMode === 'ALL' || uploadMode === 'CAT' ? parseOptionalFloat(row.CAT2) : null,
            cat3: uploadMode === 'ALL' || uploadMode === 'CAT' ? parseOptionalFloat(row.CAT3) : null,
            assignment: uploadMode === 'ALL' || uploadMode === 'ASSIGNMENT' ? parseOptionalFloat(row.Assignment) : null,
            semesterGrade: row.SemesterGrade || null
        }));

        try {
            await api.post('/marks/bulk-upload', payload);
            addToast(`Successfully synced ${payload.length} records! CGPI updated.`, 'success');
            clearFile();
            setSubjectCode('');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to sync marks.', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '26px', color: 'var(--theme-text)', fontWeight: '800', marginBottom: '8px' }}>Batch Marks Processing</h1>
                    <p style={{ color: 'var(--theme-text-muted)', fontSize: '15px' }}>Upload spreadsheet records to securely auto-sync marks directly into the core academic database.</p>
                </div>
                <button
                    onClick={downloadTemplate}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--theme-bg-muted)', color: 'var(--color-primary-navy)', border: '1px solid var(--theme-border)', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                >
                    <FaDownload /> Download Template
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: marksData.length > 0 ? '400px 1fr' : '1fr', gap: '24px' }}>
                {/* Control Panel */}
                <div style={{ background: 'var(--card-bg)', padding: '28px', borderRadius: '16px', border: '1px solid var(--theme-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--theme-text-muted)', textTransform: 'uppercase' }}>Fallback Subject Code</label>
                        <input
                            type="text"
                            placeholder="e.g. CS3401"
                            value={subjectCode}
                            onChange={(e) => setSubjectCode(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--theme-text-muted)', textTransform: 'uppercase' }}>Upload Target Mode</label>
                        <select
                            value={uploadMode}
                            onChange={(e) => setUploadMode(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', outline: 'none' }}
                        >
                            <option value="ALL">Combined Marks (All Columns)</option>
                            <option value="CAT">CAT Exams Only</option>
                            <option value="ASSIGNMENT">Assignments Only</option>
                        </select>
                    </div>

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            border: `2px dashed ${isDragging ? 'var(--color-accent-gold)' : 'var(--theme-border)'}`,
                            backgroundColor: isDragging ? 'rgba(212, 175, 55, 0.05)' : 'var(--theme-bg-muted)',
                            borderRadius: '16px',
                            padding: '40px 20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls, .csv" style={{ display: 'none' }} />
                        <FaCloudUploadAlt style={{ fontSize: '40px', color: isDragging ? 'var(--color-accent-gold)' : 'var(--theme-text-muted)', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '16px', color: 'var(--theme-text)', marginBottom: '4px', fontWeight: '700' }}>
                            {file ? file.name : 'Drop Marks Spreadsheet'}
                        </h3>
                        <p style={{ color: 'var(--theme-text-muted)', fontSize: '12px' }}>
                            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports .xlsx, .xls, .csv'}
                        </p>
                    </div>

                    {file && (
                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                style={{ flex: 1, padding: '14px', borderRadius: '8px', background: 'var(--color-primary-navy)', color: 'white', fontWeight: '800', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', transition: '0.2s' }}
                            >
                                {uploading ? 'Processing Dataset...' : 'Sync to Academic DB'}
                            </button>
                            <button
                                onClick={clearFile}
                                disabled={uploading}
                                style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    )}
                </div>

                {/* Preview Table */}
                {marksData.length > 0 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'var(--card-bg)', padding: '28px', borderRadius: '16px', border: '1px solid var(--theme-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--theme-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaFileExcel color="#10B981" /> Extracted Preview
                            </h3>
                            <span style={{ padding: '6px 14px', background: 'var(--color-accent-gold)', color: 'var(--color-primary-navy)', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                                {marksData.length} records detected
                            </span>
                        </div>

                        <div style={{ overflowX: 'auto', flex: 1, borderRadius: '12px', border: '1px solid var(--theme-border)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text-muted)' }}>
                                        <th style={{ padding: '14px', textAlign: 'left' }}>Student Registration</th>
                                        <th style={{ padding: '14px', textAlign: 'center' }}>CAT-1</th>
                                        <th style={{ padding: '14px', textAlign: 'center' }}>CAT-2</th>
                                        <th style={{ padding: '14px', textAlign: 'center' }}>CAT-3</th>
                                        <th style={{ padding: '14px', textAlign: 'center' }}>Assign</th>
                                        <th style={{ padding: '14px', textAlign: 'center' }}>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marksData.slice(0, 10).map((row, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                            <td style={{ padding: '14px', fontWeight: '700', color: 'var(--theme-text)' }}>{row.StudentData || row.RegNo || row.Email || 'ERR'}</td>
                                            <td style={{ padding: '14px', textAlign: 'center' }}>{row.CAT1 ?? '-'}</td>
                                            <td style={{ padding: '14px', textAlign: 'center' }}>{row.CAT2 ?? '-'}</td>
                                            <td style={{ padding: '14px', textAlign: 'center' }}>{row.CAT3 ?? '-'}</td>
                                            <td style={{ padding: '14px', textAlign: 'center' }}>{row.Assignment ?? '-'}</td>
                                            <td style={{ padding: '14px', textAlign: 'center', fontWeight: '800', color: 'var(--color-primary-navy)' }}>{row.SemesterGrade || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {marksData.length > 10 && (
                                <div style={{ padding: '14px', textAlign: 'center', background: 'var(--theme-bg-muted)', fontSize: '12px', color: 'var(--theme-text-muted)', fontWeight: '600' }}>
                                    + {marksData.length - 10} additional records pending upload...
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default UploadMarks;
