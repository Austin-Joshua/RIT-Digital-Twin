import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import Skeleton from '../../components/common/Skeleton';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const FacultyTimetable = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const response = await api.get('/academic/faculty/timetable');
                if (mounted) setSlots(response.data || []);
            } catch (error) {
                console.error('Faculty timetable fetch failed', error);
                if (mounted) setSlots([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const periodStarts = useMemo(() => {
        const unique = [...new Set((slots || []).map(slot => slot.startTime))];
        return unique.sort();
    }, [slots]);

    const getSlot = (day, startTime) => slots.find(slot => slot.dayOfWeek === day && slot.startTime === startTime);

    if (loading) return <div style={{ padding: '24px' }}><Skeleton height="380px" /></div>;

    if (!slots.length) {
        return (
            <div style={{ padding: '24px' }}>
                <h2 style={{ color: 'var(--theme-text)', marginBottom: '8px' }}>My Timetable</h2>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px', padding: '18px', color: 'var(--theme-text-muted)' }}>
                    No timetable has been generated yet for your assigned classes.
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--theme-text)' }}>My Timetable</h2>
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--theme-border)' }}>
                <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'center', background: 'var(--card-bg)' }}>
                    <thead style={{ background: 'var(--color-primary-navy)', color: '#fff' }}>
                        <tr>
                            <th style={{ padding: '14px' }}>Day / Period</th>
                            {periodStarts.map(start => (
                                <th key={start} style={{ padding: '14px' }}>{start.slice(0, 5)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {DAYS.map(day => (
                            <tr key={day} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                <td style={{ padding: '14px', background: 'var(--theme-bg-muted)', fontWeight: 700, color: 'var(--theme-text)' }}>{day}</td>
                                {periodStarts.map(start => {
                                    const slot = getSlot(day, start);
                                    return (
                                        <td key={`${day}-${start}`} style={{ padding: '10px' }}>
                                            {slot ? (
                                                <div style={{ border: '1px solid var(--theme-border)', borderRadius: '8px', padding: '8px', background: 'var(--theme-bg-muted)' }}>
                                                    <div style={{ fontWeight: 700, color: 'var(--theme-text)' }}>{slot.subject?.subjectCode || slot.subject?.subjectName}</div>
                                                    <div style={{ color: 'var(--theme-text-muted)', fontSize: '0.8rem' }}>{slot.section}</div>
                                                </div>
                                            ) : <span style={{ opacity: 0.35 }}>--</span>}
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

export default FacultyTimetable;
