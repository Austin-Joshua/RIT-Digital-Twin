import React, { useState } from 'react';

/**
 * MiniCalendar — reusable dynamic calendar widget.
 * Shows the current real month/year with navigation and highlights today.
 */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const buildCalendarGrid = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = [];
    let week = Array(firstDay).fill(0);
    for (let d = 1; d <= daysInMonth; d++) {
        week.push(d);
        if (week.length === 7) { grid.push(week); week = []; }
    }
    if (week.length > 0) {
        while (week.length < 7) week.push(0);
        grid.push(week);
    }
    return grid;
};

const MiniCalendar = () => {
    const now = new Date();
    const [viewDate, setViewDate] = useState({ year: now.getFullYear(), month: now.getMonth() });

    const prevMonth = () => {
        setViewDate(v => {
            const d = new Date(v.year, v.month - 1, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
        });
    };
    const nextMonth = () => {
        setViewDate(v => {
            const d = new Date(v.year, v.month + 1, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
        });
    };
    const goToday = () => setViewDate({ year: now.getFullYear(), month: now.getMonth() });

    const isToday = (day) =>
        day > 0 &&
        viewDate.year === now.getFullYear() &&
        viewDate.month === now.getMonth() &&
        day === now.getDate();

    const isWeekend = (colIdx) => colIdx === 0 || colIdx === 6;

    const grid = buildCalendarGrid(viewDate.year, viewDate.month);

    return (
        <div className="stu-calendar-card" style={{
            background: 'var(--card-bg)',
            borderTop: '3px solid var(--ims-teal)',
            borderColor: 'var(--theme-border)',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div className="stu-calendar-header" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderBottom: '1px solid var(--theme-border)'
            }}>
                <button onClick={prevMonth} style={{
                    background: 'none', border: '1px solid var(--theme-border)', borderRadius: '6px',
                    padding: '4px 10px', cursor: 'pointer', color: 'var(--theme-text)', fontSize: '14px'
                }}>‹</button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <span className="cal-title" style={{ fontWeight: '700', fontSize: '15px', color: 'var(--theme-text)' }}>
                        {MONTHS[viewDate.month]} {viewDate.year}
                    </span>
                    <button onClick={goToday} style={{
                        background: 'none', border: 'none', color: 'var(--color-accent-gold)',
                        fontSize: '11px', cursor: 'pointer', padding: 0, fontWeight: '600'
                    }}>Today</button>
                </div>

                <button onClick={nextMonth} style={{
                    background: 'none', border: '1px solid var(--theme-border)', borderRadius: '6px',
                    padding: '4px 10px', cursor: 'pointer', color: 'var(--theme-text)', fontSize: '14px'
                }}>›</button>
            </div>

            {/* Legend */}
            <div className="stu-calendar-legend" style={{
                display: 'flex', gap: '16px', padding: '8px 16px',
                borderBottom: '1px solid var(--theme-border)'
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3c8dbc', display: 'inline-block' }} />Today
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(239,68,68,0.35)', display: 'inline-block' }} />Weekend
                </span>
            </div>

            {/* Grid */}
            <div className="stu-calendar-grid" style={{ padding: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {DAYS.map(d => (
                                <th key={d} style={{
                                    padding: '8px 4px', fontSize: '11px', fontWeight: '700', textAlign: 'center',
                                    color: 'var(--color-primary-navy)', background: 'rgba(11,44,107,0.07)',
                                    textTransform: 'uppercase', letterSpacing: '0.5px'
                                }}>{d}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {grid.map((week, wi) => (
                            <tr key={wi}>
                                {week.map((day, di) => (
                                    <td key={di} style={{
                                        border: '1px solid var(--theme-border)',
                                        height: '52px',
                                        width: '14.28%',
                                        padding: '4px 6px',
                                        textAlign: 'center',
                                        verticalAlign: 'middle',
                                        fontSize: '13px',
                                        fontWeight: isToday(day) ? '700' : '400',
                                        color: isToday(day) ? '#fff' : day === 0 ? 'transparent' : isWeekend(di) ? '#e53e3e' : 'var(--theme-text)',
                                        background: isToday(day) ? '#3c8dbc' : day === 0 ? 'transparent' : isWeekend(di) ? 'rgba(239,68,68,0.05)' : 'var(--card-bg)',
                                        borderRadius: isToday(day) ? '6px' : '0',
                                        cursor: day > 0 ? 'default' : 'default',
                                    }}>
                                        {day > 0 ? day : ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MiniCalendar;
