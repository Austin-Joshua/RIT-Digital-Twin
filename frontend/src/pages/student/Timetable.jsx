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
                // Adjust to the existing student timetable endpoint if available
                const res = await api.get('/academic/student/timetable').catch(() => ({ data: [] }));
                setTimetable(res.data || []);
            } catch (err) {
                console.error(err);
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
            <h2 style={{ marginBottom: '24px', color: 'var(--color-primary-navy)' }}>My Weekly Time Table</h2>

            <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: 'var(--shadow-soft)', WebkitOverflowScrolling: 'touch' }}>
                <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '700px', background: 'var(--card-bg)' }}>
                    <thead style={{ background: 'var(--color-primary-navy)', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '16px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Day / Time</th>
                            {ALIGN_TIMES.map(t => (
                                <th key={t} style={{ padding: '16px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                                    {t.substring(0, 5)} - {parseInt(t.substring(0, 2)) + 1}:00
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {DAYS.map((day, rowIndex) => (
                            <tr key={day} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                <td style={{ padding: '16px', fontWeight: 'bold', borderRight: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}>
                                    {day}
                                </td>
                                {ALIGN_TIMES.map(time => {
                                    const slot = getSlot(day, time.substring(0, 5));
                                    return (
                                        <td key={time} style={{ padding: '12px', borderRight: '1px solid var(--theme-border)', height: '70px', verticalAlign: 'middle' }}>
                                            {slot ? (
                                                <div style={{ background: 'var(--color-bg-light)', padding: '8px', borderRadius: '8px', color: 'var(--color-primary-navy)', fontSize: '0.85rem', border: '1px solid var(--color-primary-navy)' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{slot.subject?.subjectName || slot.subject?.subjectCode || 'Class'}</div>
                                                    <div>{slot.faculty?.user?.firstName}</div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>Section: {slot.section}</div>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#cbd5e1' }}>--</span>
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
