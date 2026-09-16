import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/AuthContext';
import { academicFees, academicYearLabel, pendingAcademicFees } from '../../utils/studentFees';
import RingStat from '../../components/common/RingStat';

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
    const { user } = useAuth();
    const now = useMemo(() => new Date(), []);
    const yearLabel = academicYearLabel(now);
    const semester = semesterWindow(now);

    const [kpiData, setKpiData] = useState({
        cgpa: null,
        attendance: null,
        arrear: 0,
        loading: true,
    });
    const [timetable, setTimetable] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const feesPending = pendingAcademicFees();
    const academicTotal = academicFees
        .filter((fee) => fee.type === 'ACADEMIC')
        .reduce((sum, fee) => sum + fee.amount, 0);
    const feesPaidShare = academicTotal === 0
        ? 100
        : Math.round(((academicTotal - feesPending) / academicTotal) * 100);

    const cgpa = kpiData.cgpa !== null ? Number(kpiData.cgpa) : null;
    const attendance = kpiData.attendance !== null ? Math.round(Number(kpiData.attendance)) : null;
    const arrears = Number(kpiData.arrear || 0);

    useEffect(() => {
        let isMounted = true;

        // 1. Authoritative CGPA
        const pCgpa = api.get('/academic/student/cgpa')
            .then((res) => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    const valid = res.data.filter(s => typeof s.gpa === 'number');
                    const mean = valid.length > 0 ? valid.reduce((acc, curr) => acc + curr.gpa, 0) / valid.length : null;
                    return mean;
                }
                return null;
            })
            .catch(() => null);

        // 2. Authoritative Attendance Summary
        const pAtt = api.get('/erp/student/attendance-summary')
            .then((res) => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    const avg = res.data.reduce((sum, r) => sum + Number(r.percentage || 0), 0) / res.data.length;
                    return avg;
                }
                return null;
            })
            .catch(() => null);

        // 3. Timetable
        const pTt = api.get('/academic/student/timetable')
            .then((res) => Array.isArray(res.data) ? res.data : [])
            .catch(() => []);

        Promise.all([pCgpa, pAtt, pTt]).then(([cgpaVal, attVal, ttData]) => {
            if (!isMounted) return;
            setKpiData({
                cgpa: cgpaVal,
                attendance: attVal,
                arrear: 0,
                loading: false,
            });
            setTimetable(ttData);
        });

        return () => { isMounted = false; };
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
                    value={cgpa !== null ? `${cgpa.toFixed(2)} / 10` : 'Data unavailable'}
                    center={cgpa !== null ? cgpa.toFixed(2) : '—'}
                    sub="Overall performance"
                    percent={cgpa !== null ? (cgpa / 10) * 100 : 0}
                    color="#2ecc71"
                />
                <RingStat
                    label="Attendance"
                    value={attendance !== null ? `${attendance}%` : 'Data unavailable'}
                    center={attendance !== null ? `${attendance}%` : '—'}
                    sub="Average this semester"
                    percent={attendance !== null ? attendance : 0}
                    color="#17a2b8"
                />
                <RingStat
                    label="Arrears"
                    value={String(arrears)}
                    center={String(arrears)}
                    percent={arrears === 0 ? 0 : Math.min(100, arrears * 25)}
                    color="#dc3545"
                />
                <RingStat
                    label="Fees Pending"
                    value={`₹${(feesPending || 0).toLocaleString('en-IN')}`}
                    center={feesPending === 0 ? '100% Paid' : 'Due'}
                    sub={`AY ${yearLabel}`}
                    percent={feesPaidShare}
                    color="#f0ad4e"
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
