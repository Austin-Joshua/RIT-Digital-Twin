import { LuCalendar } from 'react-icons/lu';
import React, { useMemo, useState, useEffect } from 'react';
import api from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import dynamicCache from '../../utils/dynamicCache';

const DAYS = [
    { key: 'MON', label: 'MON DAY' },
    { key: 'TUE', label: 'TUES DAY' },
    { key: 'WED', label: 'WEDNES DAY' },
    { key: 'THU', label: 'THURS DAY' },
    { key: 'FRI', label: 'FRI DAY' },
    { key: 'SAT', label: 'SATUR DAY' }
];

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Authentic Verified Timetable Data from Screenshots media_1793186951849_8792f201.png & media_1793187037292_f1d8e536.png
const AUTHENTIC_TIMETABLE = {
    '1|MON': [{ subject: 'Computer Networks (CS23511)', staff: 'ARAVINDH S (CS190)' }],
    '1|TUE': [{ subject: 'Data Warehousing and Data Mining (AD23V13)', staff: 'SOWMYA S (CS203)' }],
    '1|WED': [{ subject: 'Compiler Design (CS23512)', staff: 'DR. MADHAN V. (CS130)' }],
    '1|THU': [{ subject: 'Computer Networks (CS23511)', staff: 'ARAVINDH S (CS190)' }],
    '1|FRI': [{ subject: 'Data Warehousing and Data Mining (AD23V13)', staff: 'SOWMYA S (CS203)' }],
    '1|SAT': [{ subject: 'AZURE for Data Analytics (CS23IC3)', staff: 'ARAVINDH S (CS190)' }, { subject: 'Disaster Risk Reduction and Management (MX23511)', staff: 'SARAVANAN M. (PH15)' }],

    '2|MON': [{ subject: 'Compiler Design (CS23512)', staff: 'DR. MADHAN V. (CS130)' }],
    '2|TUE': [{ subject: 'Health Care Analytics (AD23V14)', staff: 'HARSHANA B (CS218)' }],
    '2|WED': [{ subject: 'Health Care Analytics (AD23V14)', staff: 'HARSHANA B (CS218)' }],
    '2|THU': [{ subject: 'Data Warehousing and Data Mining (AD23V13)', staff: 'SOWMYA S (CS203)' }],
    '2|FRI': [{ subject: 'Health Care Analytics (AD23V14)', staff: 'HARSHANA B (CS218)' }],
    '2|SAT': [{ subject: 'AZURE for Data Analytics (CS23IC3)', staff: 'ARAVINDH S (CS190)' }, { subject: 'Disaster Risk Reduction and Management (MX23511)', staff: 'SARAVANAN M. (PH15)' }],

    '3|MON': [{ subject: 'Deep Learning Techniques (AD23531)', staff: 'VINITHA R (CS204)' }],
    '3|TUE': [{ subject: 'Data Exploration and Visualization (AD23532)', staff: 'CHARUMATHY M (CS250)' }],
    '3|WED': [{ subject: 'Computer Networks (CS23511)', staff: 'ARAVINDH S (CS190)' }],
    '3|THU': [{ subject: 'Deep Learning Techniques (AD23531)', staff: 'VINITHA R (CS204)' }],
    '3|FRI': [{ subject: 'Data Exploration and Visualization (AD23532)', staff: 'CHARUMATHY M (CS250)' }],
    '3|SAT': [{ subject: 'AZURE for Data Analytics (CS23IC3)', staff: 'ARAVINDH S (CS190)' }, { subject: 'Disaster Risk Reduction and Management (MX23511)', staff: 'SARAVANAN M. (PH15)' }],

    '4|MON': [{ subject: 'Computer Networks Laboratory (CS23521)', staff: 'ARAVINDH S (CS190)' }],
    '4|TUE': [{ subject: 'Compiler Design (CS23512)', staff: 'DR. MADHAN V. (CS130)' }],
    '4|WED': [{ subject: 'Deep Learning Techniques (AD23531)', staff: 'VINITHA R (CS204)' }],
    '4|THU': [{ subject: 'Data Exploration and Visualization (AD23532)', staff: 'CHARUMATHY M (CS250)' }],
    '4|FRI': [{ subject: 'Deep Learning Techniques (AD23531)', staff: 'VINITHA R (CS204)' }],
    '4|SAT': [{ subject: 'AZURE for Data Analytics (CS23IC3)', staff: 'ARAVINDH S (CS190)' }, { subject: 'Disaster Risk Reduction and Management (MX23511)', staff: 'SARAVANAN M. (PH15)' }],

    '5|MON': [{ subject: 'Computer Networks Laboratory (CS23521)', staff: 'ARAVINDH S (CS190)' }],
    '5|TUE': [{ subject: 'Deep Learning Techniques Laboratory (AD23521)', staff: 'VINITHA R (CS204)' }],
    '5|WED': [{ subject: 'Data Exploration and Visualization (AD23532)', staff: 'CHARUMATHY M (CS250)' }],
    '5|THU': [{ subject: 'Compiler Design (CS23512)', staff: 'DR. MADHAN V. (CS130)' }],
    '5|FRI': [{ subject: 'Compiler Design (CS23512)', staff: 'DR. MADHAN V. (CS130)' }],
    '5|SAT': [{ subject: 'AZURE for Data Analytics (CS23IC3)', staff: 'ARAVINDH S (CS190)' }, { subject: 'Disaster Risk Reduction and Management (MX23511)', staff: 'SARAVANAN M. (PH15)' }],

    '6|MON': [{ subject: 'Computer Networks Laboratory (CS23521)', staff: 'ARAVINDH S (CS190)' }],
    '6|TUE': [{ subject: 'Deep Learning Techniques Laboratory (AD23521)', staff: 'VINITHA R (CS204)' }],
    '6|WED': [{ subject: 'Computer Networks (CS23511)', staff: 'ARAVINDH S (CS190)' }],
    '6|THU': [{ subject: 'Health Care Analytics (AD23V14)', staff: 'HARSHANA B (CS218)' }],
    '6|FRI': [{ subject: 'Computer Networks (CS23511)', staff: 'ARAVINDH S (CS190)' }],
    '6|SAT': [{ subject: 'AZURE for Data Analytics (CS23IC3)', staff: 'ARAVINDH S (CS190)' }, { subject: 'Disaster Risk Reduction and Management (MX23511)', staff: 'SARAVANAN M. (PH15)' }],

    '7|MON': [{ subject: 'Data Warehousing and Data Mining (AD23V13)', staff: 'SOWMYA S (CS203)' }],
    '7|TUE': [{ subject: 'Deep Learning Techniques (AD23531)', staff: 'VINITHA R (CS204)' }],
    '7|WED': [{ subject: 'Data Exploration and Visualization (AD23532)', staff: 'CHARUMATHY M (CS250)' }],
    '7|THU': [{ subject: 'Compiler Design (CS23512)', staff: 'DR. MADHAN V. (CS130)' }],
    '7|FRI': [{ isSpecial: true, specialTitle: 'Mentoring', staff: 'ARAVINDH S (CS190)' }],
    '7|SAT': [{ subject: 'AZURE for Data Analytics (CS23IC3)', staff: 'ARAVINDH S (CS190)' }, { subject: 'Disaster Risk Reduction and Management (MX23511)', staff: 'SARAVANAN M. (PH15)' }],

    '8|MON': [{ subject: 'Fundamentals of Quantum Computing (VL23M02)', staff: 'DR MARISELVAM A K (EC210)' }],
    '8|TUE': [{ subject: 'Fundamentals of Quantum Computing (VL23M02)', staff: 'DR MARISELVAM A K (EC210)' }],
    '8|WED': [{ subject: 'Quantum Information Science (VL23M04)', staff: 'DR.VIEERALINGAAM G (EC110)' }],
    '8|THU': [{ subject: 'Quantum Information Science (VL23M04)', staff: 'DR.VIEERALINGAAM G (EC110)' }],
    '8|FRI': [{ subject: 'Fundamentals of Quantum Computing (VL23M02)', staff: 'DR MARISELVAM A K (EC210)' }],
    '8|SAT': [{ subject: 'Disaster Risk Reduction and Management (MX23511)', staff: 'SARAVANAN M. (PH15)' }, { subject: 'AZURE for Data Analytics (CS23IC3)', staff: 'ARAVINDH S (CS190)' }],

    '9|MON': [],
    '9|TUE': [{ subject: 'Fundamentals of Quantum Computing (VL23M02)', staff: 'DR MARISELVAM A K (EC210)' }],
    '9|WED': [{ subject: 'Quantum Information Science (VL23M04)', staff: 'DR.VIEERALINGAAM G (EC110)' }],
    '9|THU': [{ subject: 'Quantum Information Science (VL23M04)', staff: 'DR.VIEERALINGAAM G (EC110)' }],
    '9|FRI': [],
    '9|SAT': [{ subject: 'Disaster Risk Reduction and Management (MX23511)', staff: 'SARAVANAN M. (PH15)' }, { subject: 'AZURE for Data Analytics (CS23IC3)', staff: 'ARAVINDH S (CS190)' }],
};

const Timetable = () => {
    const cachedData = dynamicCache.get('student_timetable');
    const [timetable, setTimetable] = useState(cachedData || null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('weekly');

    useEffect(() => {
        let isMounted = true;
        dynamicCache.fetchSWR(
            'student_timetable',
            async () => {
                const res = await api.get('/academic/student/timetable');
                return res.data;
            },
            {
                onData: (data) => {
                    if (isMounted && data && Array.isArray(data) && data.length > 0) {
                        setTimetable(data);
                    }
                }
            }
        ).catch(() => {});

        return () => { isMounted = false; };
    }, []);

    const getSlots = (period, dayKey) => {
        const key = `${period}|${dayKey}`;
        if (timetable && Array.isArray(timetable)) {
            const matches = timetable.filter(s => {
                const dayMatch = (s.dayOfWeek || '').toUpperCase().startsWith(dayKey);
                const periodMatch = s.periodNumber === period;
                return dayMatch && periodMatch;
            });
            if (matches.length > 0) {
                return matches.map(s => ({
                    subject: `${s.subject?.subjectName || s.subjectName || ''} (${s.subject?.subjectCode || s.subjectCode || ''})`,
                    staff: `${s.faculty?.user?.firstName || s.facultyName || ''} (${s.facultyCode || ''})`
                }));
            }
        }
        return AUTHENTIC_TIMETABLE[key] || [];
    };

    if (loading) return <div style={{ padding: '24px' }}><Skeleton height="500px" /></div>;

        return (
        <div className="ims-page-container">
            {/* Header Banner following TransportDirectory & Simulator hierarchy */}
            <div className="ims-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ims-header-icon-box">
                        <LuCalendar />
                    </div>
                    <div>
                        <h1 className="ims-header-title">My Time Table</h1>
                        <p className="ims-header-subtitle">Period-wise weekly academic schedule and laboratory allocations</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="ims-candy-badge" style={{ background: 'linear-gradient(180deg, #1d4ed8 0%, #0B2C6B 100%)', color: '#ffffff', padding: '7px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', boxShadow: '0 3px 10px rgba(11,44,107,0.25)' }}>
                        Class : B.E. CSE / 5 / A
                    </span>
                    <button
                        type="button"
                        onClick={() => setViewMode('weekly')}
                        className={`ims-candy-btn ${viewMode === 'weekly' ? 'ims-candy-primary' : 'ims-candy-neutral'} ims-candy-sm`}
                    >
                        Weekly Grid
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('daily')}
                        className={`ims-candy-btn ${viewMode === 'daily' ? 'ims-candy-primary' : 'ims-candy-neutral'} ims-candy-sm`}
                    >
                        Daily View
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="ims-candy-btn ims-candy-neutral ims-candy-sm"
                    >
                        Print
                    </button>
                </div>
            </div>

            {/* Main Elevated Card with Curvy Corners */}
            <div className="ims-card-elevated" style={{ padding: '20px' }}>
                {viewMode === 'weekly' ? (
                    <div style={{
                        borderRadius: '12px',
                        border: '1.5px solid #e2e8f0',
                        overflowX: 'auto'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'separate',
                            borderSpacing: 0,
                            minWidth: '980px',
                            fontSize: '12px'
                        }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #dee2e6' }}>
                                    <th style={{
                                        padding: '12px 14px',
                                        textAlign: 'center',
                                        fontWeight: 700,
                                        color: '#475569',
                                        borderRight: '1px solid #dee2e6',
                                        width: '60px'
                                    }}>
                                        DAY
                                    </th>
                                    {DAYS.map(d => (
                                        <th
                                            key={d.key}
                                            style={{
                                                padding: '12px 14px',
                                                textAlign: 'center',
                                                fontWeight: 700,
                                                color: '#475569',
                                                borderRight: '1px solid #dee2e6'
                                            }}
                                        >
                                            {d.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PERIODS.map(period => (
                                    <tr key={period} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        {/* Period Number */}
                                        <td style={{
                                            padding: '14px 10px',
                                            textAlign: 'center',
                                            fontWeight: 700,
                                            color: '#0B2C6B',
                                            background: '#f8fafc',
                                            borderRight: '1px solid #dee2e6',
                                            verticalAlign: 'middle',
                                            fontSize: '13px'
                                        }}>
                                            {period}
                                        </td>

                                        {/* Day Cells */}
                                        {DAYS.map(day => {
                                            const slots = getSlots(period, day.key);
                                            return (
                                                <td
                                                    key={day.key}
                                                    style={{
                                                        padding: '8px',
                                                        borderRight: '1px solid #dee2e6',
                                                        verticalAlign: 'top',
                                                        background: '#ffffff'
                                                    }}
                                                >
                                                    {slots.length === 0 ? null : (
                                                        slots.map((s, idx) => (
                                                            <div
                                                                key={idx}
                                                                style={{
                                                                    border: '1px solid #bae6fd',
                                                                    borderLeft: '4px solid #0B2C6B',
                                                                    borderRadius: '8px',
                                                                    background: '#f0f9ff',
                                                                    padding: '8px 10px',
                                                                    marginBottom: slots.length > 1 ? '6px' : 0,
                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                                                                }}
                                                            >
                                                                {s.isSpecial ? (
                                                                    <div style={{ color: '#d97706', fontWeight: 700, fontSize: '11.5px', marginBottom: '2px' }}>
                                                                        ★ {s.specialTitle}
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ color: '#0B2C6B', fontWeight: 600, fontSize: '12px', lineHeight: '1.3', marginBottom: '4px' }}>
                                                                        {s.subject}
                                                                    </div>
                                                                )}
                                                                <div style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <span>👤</span> {s.staff}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Daily View */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {DAYS.map(day => (
                            <div key={day.key} style={{
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '12px',
                                background: '#f8fafc',
                                padding: '16px'
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#0B2C6B', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', fontWeight: '700' }}>
                                    {day.label}
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {PERIODS.map(p => {
                                        const slots = getSlots(p, day.key);
                                        if (slots.length === 0) return null;
                                        return slots.map((s, idx) => (
                                            <div key={`${p}-${idx}`} style={{
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                background: '#ffffff',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                <span className="ims-candy-badge" style={{ background: '#e0f2fe', color: '#0369a1', marginBottom: '4px', padding: '2px 8px', fontSize: '11px' }}>
                                                    Period {p}
                                                </span>
                                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{s.subject || s.specialTitle}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{s.staff}</div>
                                            </div>
                                        ));
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timetable;
