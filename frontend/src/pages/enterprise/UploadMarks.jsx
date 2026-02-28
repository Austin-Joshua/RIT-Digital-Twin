import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { FaCloudUploadAlt, FaFileExcel, FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import api from '../../services/api';

const UploadMarks = () => {
    const [file, setFile] = useState(null);
    const [marksData, setMarksData] = useState([]);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    // For manual entry or overriding defaults
    const [subjectCode, setSubjectCode] = useState('');
    const [uploadMode, setUploadMode] = useState('ALL');

    const fileInputRef = useRef(null);

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
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (file) => {
        setError('');
        setSuccess(false);
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!['xlsx', 'xls', 'csv'].includes(fileExt)) {
            setError('Please upload a valid Excel or CSV file.');
            return;
        }

        setFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                if (jsonData.length === 0) {
                    setError('The uploaded file is empty.');
                    return;
                }

                // Client-side validation to ensure required columns exist
                const firstRow = jsonData[0];
                // Check for RegNo or StudentData
                const hasStudentId = firstRow.hasOwnProperty('StudentData') || firstRow.hasOwnProperty('RegNo') || firstRow.hasOwnProperty('Email');
                if (!hasStudentId) {
                    setError('Missing required column: "StudentData", "RegNo", or "Email"');
                    return;
                }

                setMarksData(jsonData);
            } catch (err) {
                console.error("Excel Parsing Error:", err);
                setError('Failed to parse the file. Ensure it is a valid spreadsheet.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const clearFile = () => {
        setFile(null);
        setMarksData([]);
        setError('');
        setSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (!marksData || marksData.length === 0) {
            setError("No data to upload.");
            return;
        }

        if (!subjectCode && !marksData[0].hasOwnProperty('SubjectCode')) {
            setError("Please provide a Subject Code either in the spreadsheet or the input field above.");
            return;
        }

        setUploading(true);
        setError('');

        // Normalize payload to conform to expected backend constraints
        const parseOptionalFloat = (val) => {
            if (val === undefined || val === null || val === '') return null;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        };

        const payload = marksData.map(row => {
            const base = {
                studentIdentifier: row.StudentData || row.RegNo || row.Email,
                subjectCode: row.SubjectCode || subjectCode,
                semesterGrade: row.SemesterGrade || null
            };

            if (uploadMode === 'ALL' || uploadMode === 'CAT') {
                base.cat1 = parseOptionalFloat(row.CAT1);
                base.cat2 = parseOptionalFloat(row.CAT2);
                base.cat3 = parseOptionalFloat(row.CAT3);
            }
            if (uploadMode === 'ALL' || uploadMode === 'ASSIGNMENT') {
                base.assignment = parseOptionalFloat(row.Assignment);
            }

            return base;
        });

        try {
            // Send bulk upload dataset to backend
            await api.post('/marks/bulk-upload', payload);
            setSuccess(true);
            setMarksData([]);
            setFile(null);
            setSubjectCode('');
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.response?.data?.message || 'Failed to sync marks. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '8px' }}>Batch Marks Processing</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Upload a spreadsheet (.xlsx, .csv) to securely auto-sync combined marks, CAT grades, or Assignments directly into the academic database.</p>
            </div>

            {error && (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #EF4444', color: '#EF4444', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaExclamationTriangle /> <span>{error}</span>
                </div>
            )}

            {success && (
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10B981', color: '#10B981', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaCheckCircle /> <span>Successfully pushed {success} marks to the core academic database! CGPA triggers fired.</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: marksData.length > 0 ? '1fr 2fr' : '1fr', gap: '24px' }}>
                {/* Upload Zone */}
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>Fallback Subject Code</label>
                            <input
                                type="text"
                                placeholder="e.g. CS3401 (If missing in Excel)"
                                value={subjectCode}
                                onChange={(e) => setSubjectCode(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>Upload Target Mode</label>
                            <select
                                value={uploadMode}
                                onChange={(e) => setUploadMode(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-primary)' }}
                            >
                                <option value="ALL">Combined Marks (All Columns)</option>
                                <option value="CAT">CAT Exams Only</option>
                                <option value="ASSIGNMENT">Assignments Only</option>
                            </select>
                        </div>
                    </div>

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            border: `2px dashed ${isDragging ? '#007bff' : 'var(--border-color)'}`,
                            backgroundColor: isDragging ? 'rgba(0, 123, 255, 0.05)' : 'var(--bg-light)',
                            borderRadius: '16px',
                            padding: '40px 20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx, .xls, .csv"
                            style={{ display: 'none' }}
                        />
                        <FaCloudUploadAlt style={{ fontSize: '3rem', color: isDragging ? '#007bff' : '#9ca3af', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {file ? file.name : 'Drag & Drop Excel File'}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {file ? `${(file.size / 1024).toFixed(2)} KB` : 'or click to browse from device'}
                        </p>
                    </div>

                    {file && (
                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--color-primary-navy)', color: 'white', fontWeight: 'bold', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
                            >
                                {uploading ? 'Processing & Syncing...' : 'Upload & Compute'}
                            </button>
                            <button
                                onClick={clearFile}
                                disabled={uploading}
                                style={{ padding: '12px 16px', borderRadius: '8px', background: '#EF4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    )}
                </div>

                {/* Data Preview Zone */}
                {marksData.length > 0 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaFileExcel color="#10B981" /> Data Extracted Preview
                            </h3>
                            <span style={{ padding: '4px 12px', background: 'var(--bg-light)', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' }}>
                                {marksData.length} records
                            </span>
                        </div>

                        <div style={{ overflowX: 'auto', flex: 1, border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-light)', color: 'var(--text-secondary)' }}>
                                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Student / RegNo</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>CAT-1</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>CAT-2</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>CAT-3</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Assign</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Sem. Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marksData.slice(0, 5).map((row, idx) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: '500' }}>{row.StudentData || row.RegNo || row.Email || 'MISSING'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{row.CAT1 || '-'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{row.CAT2 || '-'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{row.CAT3 || '-'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{row.Assignment || '-'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>{row.SemesterGrade || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {marksData.length > 5 && (
                                <div style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-light)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    + {marksData.length - 5} more rows detected...
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
