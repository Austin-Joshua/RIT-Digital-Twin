import React, { useMemo, useState, useEffect } from 'react';
import api from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import dynamicCache from '../../utils/dynamicCache';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const Timetable = () => {
    const cachedData = dynamicCache.get('student_timetable');
    const [timetable, setTimetable] = useState(cachedData || []);
    const [loading, setLoading] = useState(!cachedData);

    useEffect(() => {
        let isMounted = true;

        dynamicCache.fetchSWR(
            'student_timetable',
            async () => {
                const res = await api.get('/academic/student/timetable');
                return res.data || [];
            },
            {
                onData: (data) => {
                    if (isMounted) {
                        setTimetable(data);
                        setLoading(false);
                    }
                }
            }
        ).catch((err) => {
            console.error("Timetable Fetch Error:", err);
            if (isMounted) setLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const alignTimes = useMemo(
        () => [...new Set((timetable || []).map(slot => slot.startTime))].sort(),
        [timetable]
    );
    const slotMap = useMemo(() => {
        const map = new Map();
        (timetable || []).forEach((slot) => {
            const key = `${slot.dayOfWeek}|${String(slot.startTime || '').substring(0, 5)}`;
            map.set(key, slot);
        });
        return map;
    }, [timetable]);

    if (loading) return <div style={{ padding: '24px' }}><Skeleton height="400px" /></div>;

    if (!timetable.length) {
        return (
            <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '16px', color: 'var(--theme-text)' }}>My Weekly Time Table</h2>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px', padding: '18px', color: 'var(--theme-text-muted)' }}>
                    Timetable is not generated for your class yet. Please contact principal/faculty coordinator.
                </div>
            </div>
        );
    }

    const currentDayIndex = new Date().getDay();
    const defaultDay = currentDayIndex >= 1 && currentDayIndex <= 5 ? DAYS[currentDayIndex - 1] : 'MONDAY';
    const [selectedDay, setSelectedDay] = useState(defaultDay);
    const [viewMode, setViewMode] = useState('weekly');

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: 'var(--theme-text)' }}>My Time Table</h2>
                <div style={{ display: 'flex', gap: '6px', background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '8px', padding: '4px' }}>
                    <button
                        type="button"
                        onClick={() => setViewMode('weekly')}
                        style={{
                            border: 'none',
                            background: viewMode === 'weekly' ? 'var(--color-primary-navy, #007bff)' : 'transparent',
                            color: viewMode === 'weekly' ? '#fff' : 'var(--theme-text)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        📅 Weekly Grid
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('daily')}
                        style={{
                            border: 'none',
                            background: viewMode === 'daily' ? 'var(--color-primary-navy, #007bff)' : 'transparent',
                            color: viewMode === 'daily' ? '#fff' : 'var(--theme-text)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        📱 Daily View (Mobile Friendly)
                    </button>
                </div>
            </div>

            {viewMode === 'daily' ? (
                <div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
                        {DAYS.map(day => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => setSelectedDay(day)}
                                style={{
                                    border: '1px solid var(--theme-border)',
                                    background: selectedDay === day ? 'var(--color-primary-navy, #007bff)' : 'var(--card-bg)',
                                    color: selectedDay === day ? '#fff' : 'var(--theme-text)',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                        {alignTimes.map(time => {
                            const slot = slotMap.get(`${selectedDay}|${time.substring(0, 5)}`);
                            if (!slot) return null;
                            return (
                                <div key={time} style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-soft)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '11px', background: 'rgba(0,123,255,0.1)', color: '#007bff', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                                            ⏰ {time.substring(0, 5)}
                                        </span>
                                        <span style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                                            Section {slot.section}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--theme-text)', marginBottom: '4px' }}>
                                        {slot.subject?.subjectName || slot.subject?.subjectCode || 'Class Session'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>
                                        👨‍🏫 Faculty: {slot.faculty?.user?.firstName || 'Assigned Professor'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', marginBottom: '8px' }}>
                        💡 Tip: Swipe sideways on mobile to view all lecture slots, or switch to <strong>Daily View</strong>.
                    </div>
                    <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: 'var(--shadow-soft)', WebkitOverflowScrolling: 'touch', border: '1px solid var(--theme-border)' }}>
                        <table className="stu-data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '700px', background: 'var(--card-bg)' }}>
                    <thead style={{ background: 'var(--color-primary-navy)', color: 'var(--color-text-light)' }}>
                        <tr>
                            <th style={{ padding: '16px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Day / Time</th>
                            {alignTimes.map(t => (
                                <th key={t} style={{ padding: '16px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                                    {t.substring(0, 5)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {DAYS.map((day) => (
                            <tr key={day} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                <td style={{ padding: '16px', fontWeight: 'bold', borderRight: '1px solid var(--theme-border)', color: 'var(--theme-text)', background: 'var(--theme-bg-muted)' }}>
                                    {day}
                                </td>
                                {alignTimes.map(time => {
                                    const slot = slotMap.get(`${day}|${time.substring(0, 5)}`);
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
            )}
        </div>
    );
};

export default Timetable;
