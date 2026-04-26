import React, { useMemo, useState, useEffect } from 'react';
import api from '../../services/api';
import Skeleton from '../../components/common/Skeleton';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
let timetableMemoryCache = null;
let timetableLastFetchedAt = 0;
const TIMETABLE_CACHE_TTL_MS = 60 * 1000;

const Timetable = () => {
    const hasWarmCache = Array.isArray(timetableMemoryCache) && timetableMemoryCache.length >= 0;
    const [timetable, setTimetable] = useState(hasWarmCache ? timetableMemoryCache : []);
    const [loading, setLoading] = useState(!hasWarmCache);

    useEffect(() => {
        let isMounted = true;

        const fetchTimetable = async (opts = { setState: true }) => {
            try {
                const res = await api.get('/academic/student/timetable');
                const data = res.data || [];
                timetableMemoryCache = data;
                timetableLastFetchedAt = Date.now();
                if (opts.setState && isMounted) {
                    setTimetable(data);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Timetable Fetch Error:", err);
                if (opts.setState && isMounted) {
                    setTimetable(timetableMemoryCache || []);
                    setLoading(false);
                }
            }
        };

        const hasRecentCache = timetableMemoryCache && (Date.now() - timetableLastFetchedAt < TIMETABLE_CACHE_TTL_MS);
        if (!hasRecentCache) {
            fetchTimetable({ setState: true });
        } else {
            // Render immediately from cache and refresh in background.
            setTimetable(timetableMemoryCache || []);
            setLoading(false);
            fetchTimetable({ setState: false });
        }

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

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', color: 'var(--theme-text)' }}>My Weekly Time Table</h2>

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
                        {DAYS.map((day, rowIndex) => (
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
    );
};

export default Timetable;
