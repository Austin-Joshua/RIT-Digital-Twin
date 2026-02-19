import React from 'react';
import {
    FaGraduationCap, FaExclamationTriangle, FaPercentage, FaPlaneDeparture,
    FaArrowCircleRight
} from 'react-icons/fa';

/* Feb 2026: starts on Sunday */
const feb2026 = [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
];
const holidays = [14, 26];
const noOrderDays = [];
const now = new Date();
const todayDate = now.getDate();
const isCurrentMonth = now.getMonth() === 1 && now.getFullYear() === 2026;

const kpis = [
    { label: 'CGPA', value: '0', color: 'green', icon: <FaGraduationCap /> },
    { label: 'Arrears in Hand', value: '0', color: 'yellow', icon: <FaExclamationTriangle /> },
    { label: 'Average Attendance', value: '0', color: 'teal', icon: <FaPercentage /> },
    { label: 'Taken Leave', value: '0', color: 'red', icon: <FaPlaneDeparture /> },
];

const StudentDashboard = () => (
    <div className="stu-page">
        {/* Welcome */}
        <div className="stu-welcome">
            <h2>Hi, welcome back!</h2>
            <div className="stu-breadcrumb">Dashboard</div>
        </div>

        {/* KPI Cards */}
        <div className="stu-kpi-row">
            {kpis.map((kpi) => (
                <div key={kpi.label} className={`stu-kpi-card ${kpi.color}`}>
                    <div>
                        <div className="kpi-value">{kpi.value}</div>
                        <div className="kpi-label">{kpi.label}</div>
                    </div>
                    <span className="kpi-icon">{kpi.icon}</span>
                    <a href="#" className="kpi-more">
                        More info &nbsp;<FaArrowCircleRight />
                    </a>
                </div>
            ))}
        </div>

        {/* Announcements & Events */}
        <div className="stu-info-row">
            <div className="stu-info-card">
                <div className="info-header">Announcements</div>
                <div className="info-body">
                    <ul><li>No Announcements</li></ul>
                </div>
                <div className="info-footer"><a href="#">More..</a></div>
            </div>
            <div className="stu-info-card">
                <div className="info-header">Placement / Events Schedule</div>
                <div className="info-body">
                    <ul><li>No Events</li></ul>
                </div>
                <div className="info-footer"><a href="#">More..</a></div>
            </div>
        </div>

        {/* Calendar */}
        <div className="stu-calendar-card">
            <div className="stu-calendar-header">
                <span className="cal-title">February &nbsp; 2026</span>
                <div className="stu-calendar-legend">
                    <span className="legend-item"><span className="legend-dot holiday"></span> HoliDay</span>
                    <span className="legend-item"><span className="legend-dot no-order"></span> No order Day</span>
                    <span className="legend-item"><span className="legend-dot today"></span> Today</span>
                </div>
            </div>
            <div className="stu-calendar-grid">
                <table>
                    <thead>
                        <tr>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <th key={d}>{d}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {feb2026.map((week, wi) => (
                            <tr key={wi}>
                                {week.map((day, di) => {
                                    let cls = '';
                                    if (day === 0) cls = 'empty';
                                    else if (isCurrentMonth && day === todayDate) cls = 'today';
                                    else if (holidays.includes(day)) cls = 'holiday';
                                    else if (noOrderDays.includes(day)) cls = 'no-order';
                                    return <td key={di} className={cls}>{day > 0 ? day : ''}</td>;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default StudentDashboard;
