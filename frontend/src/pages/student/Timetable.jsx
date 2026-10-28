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
        <div style={{ padding: '16px 24px', maxWidth: '100%', margin: '0 auto' }}>
            {/* Class Badge Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                    background: '#007bff',
                    color: '#ffffff',
                    padding: '8px 18px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '14px',
                    letterSpacing: '0.3px',
                    boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
                }}>
                    Class : B.E. CSE / 5 / A
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                        type="button"
                        onClick={() => setViewMode('weekly')}
                        style={{
                            border: '1px solid #ced4da',
                            background: viewMode === 'weekly' ? '#007bff' : '#ffffff',
                            color: viewMode === 'weekly' ? '#ffffff' : '#495057',
                            padding: '6px 14px',
                            borderRadius: '4px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Weekly Grid
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('daily')}
                        style={{
                            border: '1px solid #ced4da',
                            background: viewMode === 'daily' ? '#007bff' : '#ffffff',
                            color: viewMode === 'daily' ? '#ffffff' : '#495057',
                            padding: '6px 14px',
                            borderRadius: '4px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Daily View
                    </button>
                </div>
            </div>

            {/* Authentic IMS 9-Period x 6-Day Grid */}
            {viewMode === 'weekly' ? (
                <div style={{
                    background: '#ffffff',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    overflowX: 'auto'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: '980px',
                        fontSize: '12px'
                    }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={{
                                    padding: '12px 14px',
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    color: '#495057',
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
                                            color: '#495057',
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
                                <tr key={period} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    {/* Period Number */}
                                    <td style={{
                                        padding: '14px 10px',
                                        textAlign: 'center',
                                        fontWeight: 700,
                                        color: '#343a40',
                                        background: '#fcfcfc',
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
                                                                border: '1px solid #cce5ff',
                                                                borderRadius: '4px',
                                                                padding: '8px 10px',
                                                                marginBottom: idx < slots.length - 1 ? '6px' : '0',
                                                                background: '#f8fbff',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {s.isSpecial ? (
                                                                <>
                                                                    <div style={{ color: '#007bff', fontWeight: 700, fontSize: '11px', marginBottom: '2px' }}>
                                                                        {s.specialTitle}
                                                                    </div>
                                                                    <div style={{ color: '#6c757d', fontSize: '10px' }}>Staff</div>
                                                                    <div style={{ color: '#0056b3', fontWeight: 600, fontSize: '10.5px' }}>
                                                                        {s.staff}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div style={{ color: '#007bff', fontWeight: 600, fontSize: '10.5px', marginBottom: '1px' }}>
                                                                        Subject
                                                                    </div>
                                                                    <div style={{ color: '#0056b3', fontWeight: 700, fontSize: '11px', lineHeight: 1.3, marginBottom: '4px' }}>
                                                                        {s.subject}
                                                                    </div>
                                                                    <div style={{ color: '#6c757d', fontSize: '10px' }}>Staff</div>
                                                                    <div style={{ color: '#0056b3', fontWeight: 600, fontSize: '10.5px' }}>
                                                                        {s.staff}
                                                                    </div>
                                                                </>
                                                            )}
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {PERIODS.map(period => {
                        const todaySlots = getSlots(period, 'MON');
                        return (
                            <div key={period} style={{
                                background: '#ffffff',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                padding: '14px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#007bff', marginBottom: '8px' }}>
                                    Period {period}
                                </div>
                                {todaySlots.length === 0 ? (
                                    <div style={{ color: '#adb5bd', fontSize: '12px' }}>Free Period</div>
                                ) : (
                                    todaySlots.map((s, idx) => (
                                        <div key={idx} style={{ border: '1px solid #cce5ff', borderRadius: '4px', padding: '8px', background: '#f8fbff', textAlign: 'center' }}>
                                            <div style={{ color: '#0056b3', fontWeight: 700, fontSize: '12px' }}>{s.subject || s.specialTitle}</div>
                                            <div style={{ color: '#6c757d', fontSize: '11px', marginTop: '2px' }}>Staff: {s.staff}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Timetable;
