import React, { useState, useEffect } from 'react';
import ExportButtons from '../../components/common/ExportButtons';
import { useToast } from '../../hooks/ToastContext';
import { useAuth } from '../../hooks/AuthContext';
import { getSemesterResults } from '../../utils/MockDataGenerator';
import api from '../../services/api';

const GradeBook = () => {
    const [semester, setSemester] = useState('');
    const [showData, setShowData] = useState(false);
    const { addToast } = useToast();
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchGradebook = async () => {
            if (!semester) {
                setGrades([]);
                return;
            }

            try {
                setLoading(true);
                // Attempt to fetch from API
                const params = { semester: Number(semester) };
                const res = await api.get('/student/gradebook', { params }).catch(() => ({ data: [] }));
                
                let rows = Array.isArray(res.data) && res.data.length > 0 ? res.data : [];
                
                if (rows.length > 0) {
                    setGrades(rows.map((g) => ({
                        year: g.semester <= 2 ? '2024-25' : '2025-26',
                        sem: toRoman(g.semester),
                        code: g.subjectCode,
                        title: g.subjectName,
                        grade: g.gradeLetter,
                        result: g.gradeLetter === 'RA' ? 'RA' : 'PASS',
                        monthYear: g.semester % 2 === 1 ? 'DEC 2024' : 'MAY 2025'
                    })));
                } else if ([1, 2, 3].includes(Number(semester))) {
                    // Fallback to Curriculum Generator for requested semesters
                    const mockResults = getSemesterResults(user?.email || 'guest@ritchennai.edu.in', Number(semester));
                    setGrades(mockResults);
                } else {
                    setGrades([]);
                }
            } catch (err) {
                setGrades([]);
            } finally {
                setLoading(false);
            }
        };

        if (showData) {
            fetchGradebook();
        }
    }, [semester, showData, user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (semester) {
            setShowData(true);
            addToast(`Loading results for Semester ${semester}`, 'info');
        } else {
            addToast("Please select a semester", 'warning');
        }
    };

    const filteredGrades = semester
        ? grades.filter(g => g.sem === (semester === '1' ? 'I' : semester === '2' ? 'II' : semester === '3' ? 'III' : semester))
        : grades;

    return (
        <div className="stu-report-page">
            <div className="stu-info-card" style={{ padding: '24px', marginBottom: '24px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--theme-border)' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', borderBottom: '2px solid var(--color-accent-gold)', paddingBottom: '12px', marginBottom: '24px', color: 'var(--theme-text)', display: 'inline-block' }}>
                    Student Grade Book
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', maxWidth: '600px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: 'var(--theme-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Academic Semester <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>
                        <select
                            className="table-btn"
                            style={{
                                width: '100%',
                                height: '40px',
                                padding: '0 12px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--theme-border)',
                                background: 'var(--theme-bg-muted)',
                                color: 'var(--theme-text)',
                                outline: 'none',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        >
                            <option value="" style={{ background: 'var(--card-bg)', color: 'var(--theme-text)' }}>-- Choose Semester --</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <option key={num} value={num} style={{ background: 'var(--card-bg)', color: 'var(--theme-text)' }}>{num}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="table-btn" style={{ background: 'var(--color-primary-navy)', color: 'white', border: 'none', height: '40px', padding: '0 32px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(11, 44, 107, 0.2)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        View Records
                    </button>
                </form>
            </div>

            {showData && (
                <div className="stu-info-card" style={{ padding: '24px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--theme-border)' }}>
                    <div className="stu-table-controls" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <ExportButtons
                                filename={`GradeBook_Sem_${semester}`}
                                data={filteredGrades}
                                headers={["Year", "Sem", "Code", "Title", "Grade", "Result", "Exam Date"]}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Filter records..."
                                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)', width: '220px', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--theme-border)' }}>
                        <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--theme-bg-muted)' }}>
                                    <th style={{ width: '40px', padding: '16px' }}><input type="checkbox" /></th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Academic Year</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Sem</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Subject Code</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Subject Title</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Grade</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Result</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Exam Session</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading gradebook...</td></tr>
                                ) : filteredGrades.length > 0 ? (
                                    filteredGrades.map((g, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                            <td style={{ textAlign: 'center', padding: '16px' }}><input type="checkbox" /></td>
                                            <td style={{ textAlign: 'center', padding: '16px' }}>{g.year}</td>
                                            <td style={{ textAlign: 'center', padding: '16px' }}>{g.sem}</td>
                                            <td style={{ textAlign: 'center', padding: '16px', fontWeight: 'bold', color: 'var(--theme-text)' }}>{g.code}</td>
                                            <td style={{ padding: '16px' }}>{g.title}</td>
                                            <td style={{ textAlign: 'center', padding: '16px' }}>
                                                <span style={{ fontWeight: '800', color: g.grade === 'O' ? '#10B981' : 'inherit' }}>{g.grade}</span>
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '16px' }}>
                                                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: g.result === 'PASS' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: g.result === 'PASS' ? '#10B981' : '#EF4444' }}>
                                                    {g.result}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', color: 'var(--theme-text-muted)' }}>{g.monthYear}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', opacity: 0.7, fontSize: '14px', color: 'var(--theme-text-muted)' }}>
                                            No grade records found for the selected semester
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: 'var(--theme-text-muted)' }}>
                        <span>Showing <b>{filteredGrades.length}</b> records</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="table-btn" disabled style={{ padding: '6px 12px', borderRadius: '6px', opacity: 0.5 }}>Previous</button>
                            <button className="table-btn" disabled style={{ padding: '6px 12px', borderRadius: '6px', opacity: 0.5 }}>Next</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="stu-info-card" style={{ padding: '24px', borderRadius: '12px', background: 'var(--theme-bg-muted)', border: '1px solid var(--theme-border)', marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--theme-text)', textTransform: 'uppercase', letterSpacing: '1px' }}>Grade Legends</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                    <div><b>O / A+ / A</b> – Successful Completion</div>
                    <div><b>RA</b> – Reappearance Required</div>
                    <div><b>RA*</b> - Absent for End Exam</div>
                    <div><b>W / WD</b> – Withdrawal</div>
                    <div><b>SA</b> – Shortage of Attendance</div>
                    <div><b>WH</b> – Results Withheld</div>
                </div>
            </div>
        </div>
    );
};

const toRoman = (n) => {
    const map = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    return map[n] || String(n);
};

export default GradeBook;
