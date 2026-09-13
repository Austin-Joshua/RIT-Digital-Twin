import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import RoleExperience from '../../platform/ui/RoleExperience';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function semesterWindow(date = new Date()) {
    const year = date.getFullYear();
    if (date.getMonth() >= 5) {
        return { start: new Date(year, 5, 8), end: new Date(year, 10, 30) };
    }
    return { start: new Date(year, 0, 6), end: new Date(year, 4, 15) };
}

function formatDay(date) {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const StudentDashboard = () => {
    const now = useMemo(() => new Date(), []);
    const semester = semesterWindow(now);
    const [timetable, setTimetable] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        api.get('/academic/student/timetable')
            .then((res) => setTimetable(Array.isArray(res.data) ? res.data : []))
            .catch(() => setTimetable([]));
    }, []);

    const calendar = useMemo(() => {
        const year = now.getFullYear();
        const month = now.getMonth();
        const first = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        const cells = Array(first).fill(null);
        for (let day = 1; day <= days; day += 1) cells.push(day);
        while (cells.length % 7 !== 0) cells.push(null);
        return { year, month, cells };
    }, [now]);

    const daySlots = useMemo(() => {
        if (!selectedDate) return [];
        const name = DAY_NAMES[selectedDate.getDay()];
        return timetable
            .filter((slot) => String(slot.dayOfWeek || '').toUpperCase() === name)
            .slice()
            .sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || '')));
    }, [selectedDate, timetable]);

    const openDay = (day) => {
        if (!day) return;
        const date = new Date(calendar.year, calendar.month, day);
        if (date.getDay() === 0 || date.getDay() === 6) return;
        if (date < semester.start || date > semester.end) return;
        setSelectedDate(date);
    };

    return (
        <div className="stu-dashboard">
            <RoleExperience />

            <section className="ims-calendar-card">
                <div className="ims-cal-legend">
                    <strong>{MONTHS[calendar.month]} {calendar.year}</strong>
                    <span><i className="swatch holiday" /> Holiday</span>
                    <span><i className="swatch no-order" /> No order Day</span>
                    <span><i className="swatch today" /> Today</span>
                </div>
                <p className="ims-cal-note">
                    Semester period: {formatDay(semester.start)} – {formatDay(semester.end)}
                </p>
                <p className="ims-cal-note">Click any weekday within the semester period to view that day&apos;s period-wise timetable.</p>
                <table className="ims-cal-table">
                    <thead>
                        <tr>
                            {WEEKDAYS.map((day) => <th key={day}>{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: calendar.cells.length / 7 }, (_, week) => (
                            <tr key={week}>
                                {calendar.cells.slice(week * 7, week * 7 + 7).map((day, index) => {
                                    const date = day ? new Date(calendar.year, calendar.month, day) : null;
                                    const isToday = date && date.toDateString() === now.toDateString();
                                    const outside = date && (date < semester.start || date > semester.end);
                                    const holiday = index === 0;
                                    const noOrder = index === 6;
                                    const hasClass = Boolean(day) && !outside && !holiday && !noOrder;
                                    const className = [
                                        'cal-day',
                                        isToday ? 'is-today' : '',
                                        holiday ? 'holiday' : '',
                                        noOrder ? 'no-order' : '',
                                        outside ? 'out-of-range' : '',
                                        hasClass ? 'has-class' : '',
                                        !day ? 'empty' : '',
                                    ].filter(Boolean).join(' ');
                                    return (
                                        <td key={`${week}-${index}`}>
                                            <button type="button" className={className} onClick={() => openDay(day)} disabled={!day}>
                                                {day || ''}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {selectedDate && (
                <section className="stu-info-card ims-day-panel">
                    <div className="info-header">
                        {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="info-body">
                        {daySlots.length === 0 ? (
                            <p>No periods are scheduled for this day.</p>
                        ) : (
                            <table className="stu-data-table">
                                <thead>
                                    <tr>
                                        <th>Period</th>
                                        <th>Subject</th>
                                        <th>Faculty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {daySlots.map((slot, index) => (
                                        <tr key={`${slot.startTime}-${index}`}>
                                            <td>{String(slot.startTime || '').substring(0, 5) || index + 1}</td>
                                            <td>{slot.subject?.subjectName || slot.subject?.subjectCode || 'Class'}</td>
                                            <td>{slot.faculty?.user?.firstName || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="info-footer">
                        <Link to="/student/timetable">Open full timetable</Link>
                        <Link to="/student/fee">Open academic fee</Link>
                    </div>
                </section>
            )}
        </div>
    );
};

export default StudentDashboard;
