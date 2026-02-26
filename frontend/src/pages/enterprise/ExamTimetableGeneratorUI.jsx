import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { academicAiApi } from '../../services/enterpriseApi';
import { useToast } from '../../context/ToastContext';

const ExamTimetableGeneratorUI = () => {
    const [startDate, setStartDate] = useState('');
    const [generating, setGenerating] = useState(false);
    const [timetable, setTimetable] = useState(null);
    const { addToast } = useToast();

    const handleGenerate = async () => {
        if (!startDate) {
            addToast('Please select a start date first.', 'warning');
            return;
        }
        setGenerating(true);
        try {
            const res = await academicAiApi.generateExamTimetable(startDate);
            setTimetable(res.data);
            addToast('Exam timetable generated successfully!', 'success');
        } catch (error) {
            console.error("Failed to generate timetable", error);
            addToast('Failed to generate timetable. Please try again.', 'error');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>AI Exam Timetable Generator</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Automated constraint resolution to schedule exams without faculty or room clashes.</p>
            </div>

            <div className="exam-gen-controls" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Target Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-primary)' }}
                    />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating || !startDate}
                    style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--color-primary-navy)', color: 'white', fontWeight: 'bold', cursor: generating ? 'wait' : 'pointer', boxShadow: '0 4px 12px rgba(11,44,107,0.3)' }}
                >
                    {generating ? 'Running Algorithms...' : 'Generate New Timetable'}
                </button>
            </div>

            {timetable && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Generated Schedule</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Date</th>
                                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Time</th>
                                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Subject</th>
                                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Room</th>
                                <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Invigilator</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timetable.map((slot) => (
                                <tr key={slot.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{slot.examDate}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{slot.startTime} - {slot.endTime}</td>
                                    <td style={{ padding: '12px', color: 'var(--color-primary-navy)', fontWeight: 'bold' }}>{slot.subject?.subjectName}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{slot.room?.roomNumber}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{slot.invigilator?.user?.firstName} {slot.invigilator?.user?.lastName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ExamTimetableGeneratorUI;
