import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Skeleton from '../../components/common/Skeleton';

const ALIGN_TIMES = ['09:00:00', '10:00:00', '11:00:00', '13:00:00', '14:00:00', '15:00:00'];
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const Timetable = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const res = await api.get('/academic/student/timetable');
                setTimetable(res.data || []);
            } catch (err) {
                console.error("Timetable Fetch Error:", err);
                // Fallback to empty if not assigned yet
                setTimetable([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, []);

    const getSlot = (day, timePrefix) => {
        return timetable.find(t => t.dayOfWeek === day && t.startTime.startsWith(timePrefix));
    };

    if (loading) return <div style={{ padding: '24px' }}><Skeleton height="400px" /></div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', color: 'var(--theme-text)' }}>My Weekly Time Table</h2>

            <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: 'var(--shadow-soft)', WebkitOverflowScrolling: 'touch', border: '1px solid var(--theme-border)' }}>
                <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '700px', background: 'var(--card-bg)' }}>
                    <thead style={{ background: 'var(--color-primary-navy)', color: 'var(--color-text-light)' }}>
                        <tr>
                            <th style={{ padding: '16px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Day / Time</th>
                            {ALIGN_TIMES.map(t => (
                                <th key={t} style={{ padding: '16px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                                    {t.substring(0, 5)} - {parseInt(t.substring(0, 2)) + 1}:00
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {DAYS.map((day, rowIndex) => (
                            <tr key={day} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                <td style={{ padding: '16px', fontWeight: 'bold', borderRight: '1px solid var(--theme-border)', color: 'var(--theme-text)', background: 'var(--theme-bg-muted)' }}>
                                    {day}
                                </td>
                                {ALIGN_TIMES.map(time => {
                                    const slot = getSlot(day, time.substring(0, 5));
                                    return (
                                        <td key={time} style={{ padding: '12px', borderRight: '1px solid var(--theme-border)', height: '70px', verticalAlign: 'middle', background: 'var(--card-bg)' }}>
                                            {slot ? (
                                                <div style={{ background: 'var(--theme-bg-muted)', padding: '10px', borderRadius: '8px', color: 'var(--theme-text)', fontSize: '0.85rem', border: '1px solid var(--theme-border)', boxShadow: 'var(--shadow-soft)' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{slot.subject?.subjectName || slot.subject?.subjectCode || 'Class'}</div>
                                                    <div style={{ opacity: 0.8 }}>{slot.faculty?.user?.firstName}</div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '4px' }}>Section: {slot.section}</div>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--theme-text-muted)', opacity: 0.3 }}>--</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Timetable;
