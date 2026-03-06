import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

const NoDueRequest = () => {
    const { addToast } = useToast();
    const [subjects, setSubjects] = useState([
        { id: 1, code: 'CS8651', name: 'Internet Programming', faculty: 'Dr. Sarah Smith', status: 'Not Requested', remarks: '' },
        { id: 2, code: 'CS8691', name: 'Artificial Intelligence', faculty: 'Prof. James Wilson', status: 'Not Requested', remarks: '' },
        { id: 3, code: 'IT8076', name: 'Software Testing', faculty: 'Dr. Emily Brown', status: 'Not Requested', remarks: '' },
    ]);

    React.useEffect(() => {
        const syncRequests = () => {
            const stored = localStorage.getItem('connectivity_nodue_requests');
            if (stored) {
                const requests = JSON.parse(stored);
                setSubjects(prev => prev.map(s => {
                    const match = requests.find(r => r.code === s.code);
                    return match ? { ...s, status: match.status, remarks: match.remarks } : s;
                }));
            }
        };
        syncRequests();
        window.addEventListener('storage', syncRequests);
        return () => window.removeEventListener('storage', syncRequests);
    }, []);

    const handleRequest = (id) => {
        const newSubjects = subjects.map(s =>
            s.id === id ? { ...s, status: 'Pending' } : s
        );
        setSubjects(newSubjects);

        // Persist all requests to localStorage
        const allRequests = JSON.parse(localStorage.getItem('connectivity_nodue_requests') || '[]');
        const updatedRequest = newSubjects.find(s => s.id === id);

        const existingIdx = allRequests.findIndex(r => r.code === updatedRequest.code);
        if (existingIdx > -1) {
            allRequests[existingIdx] = { ...updatedRequest, studentName: 'Aakash S', reg: '211520104001', type: 'No Due Request' };
        } else {
            allRequests.push({ ...updatedRequest, studentName: 'Aakash S', reg: '211520104001', type: 'No Due Request' });
        }

        localStorage.setItem('connectivity_nodue_requests', JSON.stringify(allRequests));
        addToast(`No Due request submitted for ${updatedRequest.code}`, 'success');
    };

    return (
        <div className="stu-report-page">
            <div style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--theme-text-muted)' }}>
                Home / <span style={{ color: 'var(--color-accent-gold)' }}>No Due Request</span>
            </div>

            <div className="stu-info-card" style={{ padding: '24px', background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px', boxShadow: 'var(--shadow-soft)' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: 'var(--theme-text)', borderLeft: '4px solid var(--color-accent-gold)', paddingLeft: '12px' }}>Department Clearances</h4>

                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--theme-border)' }}>
                    <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
                        <thead style={{ background: 'var(--theme-bg-muted)' }}>
                            <tr>
                                <th style={{ textAlign: 'center', width: '60px', padding: '12px', color: 'var(--theme-text)' }}>S.No</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text)' }}>Subject Code</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text)' }}>Subject Name</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--theme-text)' }}>Faculty</th>
                                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--theme-text)' }}>Status</th>
                                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--theme-text)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((s, idx) => (
                                <tr key={s.id} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                    <td style={{ textAlign: 'center', padding: '12px', color: 'var(--theme-text)' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px', color: 'var(--theme-text)', fontWeight: 'bold' }}>{s.code}</td>
                                    <td style={{ padding: '12px', color: 'var(--theme-text)' }}>{s.name}</td>
                                    <td style={{ padding: '12px', color: 'var(--theme-text-muted)' }}>{s.faculty}</td>
                                    <td style={{ textAlign: 'center', padding: '12px' }}>
                                        <span className={`status-badge ${s.status.toLowerCase().replace(' ', '-')}`} style={{
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                                            background: s.status === 'Approved' ? 'rgba(22, 163, 74, 0.1)' : s.status === 'Pending' ? 'rgba(217, 119, 6, 0.1)' : 'var(--theme-bg-muted)',
                                            color: s.status === 'Approved' ? 'var(--color-success)' : s.status === 'Pending' ? 'var(--color-warning)' : 'var(--theme-text-muted)'
                                        }}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '12px' }}>
                                        {s.status === 'Not Requested' ? (
                                            <button
                                                onClick={() => handleRequest(s.id)}
                                                style={{ background: 'var(--color-primary-navy)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                Request
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>Acknowledged</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '30px 0 20px', color: 'var(--theme-text)', borderLeft: '4px solid var(--color-accent-gold)', paddingLeft: '12px' }}>Labs / Project Work</h4>
                <div style={{ padding: '20px', textAlign: 'center', background: 'var(--theme-bg-muted)', borderRadius: '8px', border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)', fontSize: '14px' }}>
                    No lab or project records found for current semester.
                </div>
            </div>
        </div>
    );
};

export default NoDueRequest;
