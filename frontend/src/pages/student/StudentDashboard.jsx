import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/AuthContext';
import { getAcademicStats } from '../../utils/MockDataGenerator';
import { academicYearLabel, pendingAcademicFees } from '../../utils/studentFees';

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

function RingStat({ label, value, center, sub, percent, color }) {
    const safe = Math.max(0, Math.min(100, percent));
    return (
        <article className="ims-stat-card">
            <div className="ims-ring" style={{ '--ring': color, '--pct': `${safe}%` }}>
                <span>{center}</span>
            </div>
            <div>
                <div className="ims-stat-label">{label}</div>
                <div className="ims-stat-value">{value}</div>
                {sub ? <div className="ims-stat-sub">{sub}</div> : null}
            </div>
        </article>
    );
}

const StudentDashboard = () => {
    const { user } = useAuth();
    const email = user?.email || 'guest@ritchennai.edu.in';
    const initialStats = getAcademicStats(email);
    const now = useMemo(() => new Date(), []);
    const yearLabel = academicYearLabel(now);
    const semester = semesterWindow(now);

    const [kpiData, setKpiData] = useState({
        cgpa: initialStats.cgpa,
        attendance: initialStats.attendance,
        arrear: initialStats.arrears,
    });
    const [timetable, setTimetable] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const feesPending = pendingAcademicFees();
    const feesPaidShare = feesPending === 0 ? 100 : 18;

    useEffect(() => {
        api.get('/academic/student/cgpa')
            .then((cgpaRes) => {
                if (Array.isArray(cgpaRes.data) && cgpaRes.data.length > 0) {
                    const apiCgpa = cgpaRes.data.reduce((acc, curr) => acc + curr.gpa, 0) / cgpaRes.data.length;
                    if (apiCgpa > 0) setKpiData((prev) => ({ ...prev, cgpa: apiCgpa }));
                }
            })
            .catch(() => {});
        api.get('/academic/student/timetable')
            .then((res) => setTimetable(Array.isArray(res.data) ? res.data : []))
            .catch(() => setTimetable([]));
    }, [user]);

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
            <div className="ims-stat-row">
                <RingStat
                    label="CGPA"
                    value={`${Number(kpiData.cgpa || 0).toFixed(2)} / 10`}
                    center={Number(kpiData.cgpa || 0).toFixed(2)}
                    sub="Overall performance"
                    percent={(Number(kpiData.cgpa || 0) / 10) * 100}
                    color="#2ecc71"
                />
                <RingStat
                    label="Attendance"
                    value={`${Number(kpiData.attendance || 0).toFixed(0)}%`}
                    center={`${Number(kpiData.attendance || 0).toFixed(0)}%`}
                    sub="Average this semester"
                    percent={Number(kpiData.attendance || 0)}
                    color="#17a2b8"
                />
                <RingStat
                    label="Arrears"
                    value={String(kpiData.arrear || 0)}
                    center={String(kpiData.arrear || 0)}
                    percent={kpiData.arrear ? 25 : 100}
                    color={kpiData.arrear ? '#e63946' : '#2ecc71'}
                />
                <RingStat
                    label="Fees Pending"
                    value={`₹${feesPending.toLocaleString('en-IN')}`}
                    center={feesPending === 0 ? '100% Paid' : 'Due'}
                    sub={`AY ${yearLabel}`}
                    percent={feesPaidShare}
                    color={feesPending === 0 ? '#2ecc71' : '#f4a261'}
                />
            </div>

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
                                    const className = [
                                        'cal-day',
                                        isToday ? 'is-today' : '',
                                        holiday ? 'holiday' : '',
                                        noOrder ? 'no-order' : '',
                                        outside ? 'out-of-range' : '',
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
