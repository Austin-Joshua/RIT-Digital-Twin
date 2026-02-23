import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { workflowApi } from '../../services/enterpriseApi';

const UploadMarks = () => {
    const [departmentId, setDepartmentId] = useState('');
    const [semester, setSemester] = useState('');
    const [facultyEmail, setFacultyEmail] = useState('');
    const [status, setStatus] = useState(null);

    const handleUpload = async () => {
        try {
            await workflowApi.uploadResults(departmentId, semester, facultyEmail);
            setStatus("Success! Marks pushed to Automated Approval Queue.");
        } catch (error) {
            setStatus("Failed to push marks onto queue.");
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Automated Result Workflow</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Upload semester metrics to trigger the multi-actor admin approval chain.</p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="number" placeholder="Department ID (e.g. 1)" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                    <input type="number" placeholder="Semester (e.g. 5)" value={semester} onChange={(e) => setSemester(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                    <input type="email" placeholder="Faculty Authenticated Email" value={facultyEmail} onChange={(e) => setFacultyEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                    <button onClick={handleUpload} style={{ padding: '12px', borderRadius: '8px', background: 'var(--color-primary-navy)', color: 'white', fontWeight: 'bold' }}>Push to Approval Queue</button>
                    {status && <div style={{ color: status.includes('Success') ? '#10B981' : '#EF4444' }}>{status}</div>}
                </div>
            </div>
        </motion.div>
    );
};

export default UploadMarks;
