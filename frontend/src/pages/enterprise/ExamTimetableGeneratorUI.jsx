import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LuFileCode } from 'react-icons/lu';
import { academicAiApi } from '../../services/enterpriseApi';
import { useToast } from '../../hooks/ToastContext';
import { useAuth } from '../../hooks/AuthContext';

const DEFAULT_SECTION_OPTIONS = ['CSE-A', 'CSE-B', 'CSE-C', 'CSE-D', 'CSE-E', 'CSE-F', 'CSE-G'];
const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const ExamTimetableGeneratorUI = () => {
    useAuth();
    const [deptId, setDeptId] = useState('');
    const [sections, setSections] = useState(['CSE-A']);
    const [availableSections, setAvailableSections] = useState(DEFAULT_SECTION_OPTIONS);
    const [allSections, setAllSections] = useState(false);
    const [semesterNumber, setSemesterNumber] = useState('3');
    const [generating, setGenerating] = useState(false);
    const [timetable, setTimetable] = useState([]);
    const [classWiseTimetable, setClassWiseTimetable] = useState({});
    const [facultyWiseTimetable, setFacultyWiseTimetable] = useState({});
    const [analysis, setAnalysis] = useState(null);
    const [validation, setValidation] = useState(null);
    const [generateAccess, setGenerateAccess] = useState({ canGenerate: true, message: '' });
    const { addToast } = useToast();

    useEffect(() => {
        academicAiApi.getClassTimetableGenerateAccess(Number(semesterNumber))
            .then((res) => {
                const payload = res.data || { canGenerate: true, message: 'Using default timetable generation access.' };
                setGenerateAccess(payload);
                setDeptId(payload.allowedDepartmentId ? String(payload.allowedDepartmentId) : '');
                if (payload.availableSections?.length) {
                    setAvailableSections(payload.availableSections);
                    setSections(payload.availableSections);
                } else {
                    setAvailableSections(DEFAULT_SECTION_OPTIONS);
                }
            })
            .catch(() => {
                setGenerateAccess({ canGenerate: true, message: 'Using default timetable generation access.' });
            });
    }, [semesterNumber]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const targetSections = allSections ? availableSections : sections;
            if (!targetSections.length) {
                addToast('Please select at least one section.', 'warning');
                setGenerating(false);
                return;
            }

            const res = await academicAiApi.generateClassTimetable({
                deptId: Number(deptId),
                sections: targetSections,
                semesterNumber: Number(semesterNumber),
                periodsPerDay: 8,
                daysPerWeek: 5,
                periodDurationMinutes: 50,
                strictMode: false
            });

            const payload = res.data || {};
            const validationPayload = payload.validation || {};
            setValidation(validationPayload);
            setClassWiseTimetable(payload.classWiseTimetable || {});
            setFacultyWiseTimetable(payload.facultyWiseTimetable || {});
            setTimetable(payload.slots || []);
            setAnalysis({
                clashesResolved: `${(validationPayload.facultyClashCount || 0) + (validationPayload.classClashCount || 0)}`,
                roomUtilization: `${validationPayload.scheduledPeriods || 0}/${validationPayload.totalDemandPeriods || 0}`,
                facultyBalance: validationPayload.allSubjectsScheduled ? 'Balanced' : 'Partial'
            });
            addToast(payload.message || 'Optimized timetable generated and stored successfully.', payload.success ? 'success' : 'warning');
        } catch (error) {
            console.error('Failed to generate timetable', error);
            addToast('Failed to generate timetable.', 'error');
            setTimetable([]);
            setClassWiseTimetable({});
            setFacultyWiseTimetable({});
            setValidation(null);
            setAnalysis(null);
        } finally {
            setGenerating(false);
        }
    };

    const handlePdfDownload = async () => {
        try {
            const targetSections = allSections ? availableSections : sections;
            if (!targetSections.length) {
                addToast('Select sections before downloading PDF.', 'warning');
                return;
            }
            const response = await academicAiApi.exportClassTimetablePdf({
                deptId: Number(deptId),
                sections: targetSections,
                semesterNumber: Number(semesterNumber),
                periodsPerDay: 8,
                daysPerWeek: 5,
                periodDurationMinutes: 50,
                strictMode: false
            });
            if (!response?.data || response.data.size === 0) {
                addToast('PDF response was empty. Please generate timetable once and retry.', 'warning');
                return;
            }
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const sectionLabel = allSections ? 'all-sections' : targetSections.join('-').toLowerCase();
            a.download = `department-timetable-sem${semesterNumber || 'x'}-${sectionLabel}-optimized.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            addToast('Timetable PDF downloaded successfully.', 'success');
        } catch (error) {
            const apiMessage = error?.response?.data?.message;
            addToast(apiMessage || 'Failed to download timetable PDF.', 'error');
        }
    };

    const classSections = useMemo(() => Object.keys(classWiseTimetable || {}).sort(), [classWiseTimetable]);

    const buildSubjectRows = (section) => {
        const sectionSlots = (timetable || []).filter((slot) => slot.section === section);
        const bySubject = new Map();
        sectionSlots.forEach((slot) => {
            const code = slot?.subject?.subjectCode || 'UNASSIGNED';
            const existing = bySubject.get(code) || {
                courseCode: code,
                courseName: slot?.subject?.subjectName || 'Unassigned',
                faculty: slot?.faculty?.user
                    ? `${slot.faculty.user.firstName || ''} ${slot.faculty.user.lastName || ''}`.trim() || slot.faculty.user.username
                    : '-',
                credits: slot?.subject?.credits ?? '-',
                contactHours: 0
            };
            existing.contactHours += 1;
            bySubject.set(code, existing);
        });
        return Array.from(bySubject.values()).map((row) => {
            const isLab = /LAB|LABORATORY|PRACTICUM/i.test(`${row.courseCode} ${row.courseName}`);
            return {
                ...row,
                ltp: isLab ? `0-0-${Math.max(2, row.contactHours)}` : `${Math.max(1, row.contactHours)}-0-0`
            };
        });
    };

    const renderDocumentTable = (section) => {
        const entries = classWiseTimetable[section] || [];
        const periods = [...new Map(entries.map((entry) => [entry.period, `${String(entry.startTime || '').slice(0, 5)}-${String(entry.endTime || '').slice(0, 5)}`])).entries()]
            .sort((a, b) => a[0] - b[0]);
        const groupedByDay = DAY_ORDER.reduce((acc, day) => {
            acc[day] = entries.filter((entry) => entry.day === day).sort((a, b) => a.period - b.period);
            return acc;
        }, {});
        const subjectRows = buildSubjectRows(section);

        return (
            <div key={section} style={{ background: '#fff', color: '#111', border: '1px solid #d1d5db', borderRadius: '8px', padding: '18px', marginBottom: '18px', fontFamily: '"Times New Roman", Times, serif' }}>
                <div style={{ textAlign: 'center', lineHeight: 1.4 }}>
                    <div style={{ fontSize: '17px', fontWeight: 700, textTransform: 'uppercase' }}>Rajalakshmi Institute of Technology</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase' }}>Department of Computer Science and Engineering</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Semester {semesterNumber} - Weekly Class Timetable</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '13px', fontWeight: 600 }}>
                    <span>Class: {section}</span>
                    <span>Venue: Department Block</span>
                    <span>Date: {new Date().toLocaleDateString()}</span>
                </div>

                <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #111', padding: '8px', fontWeight: 700, width: '120px' }}>Day / Period</th>
                                {periods.map(([period, label]) => (
                                    <th key={period} style={{ border: '1px solid #111', padding: '8px', fontWeight: 700 }}>{`P${period} (${label})`}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DAY_ORDER.map((day) => {
                                const dayEntries = groupedByDay[day] || [];
                                const renderedCells = [];
                                for (let i = 0; i < dayEntries.length; i += 1) {
                                    const current = dayEntries[i];
                                    const isLab = /LAB|LABORATORY|PRACTICUM/i.test(`${current.subjectCode || ''} ${current.subjectName || ''}`);
                                    let span = 1;
                                    if (isLab) {
                                        while (
                                            i + span < dayEntries.length &&
                                            dayEntries[i + span].subjectCode === current.subjectCode &&
                                            dayEntries[i + span].facultyName === current.facultyName &&
                                            dayEntries[i + span].period === current.period + span
                                        ) {
                                            span += 1;
                                        }
                                    }
                                    renderedCells.push(
                                        <td key={`${day}-${current.period}`} colSpan={span} style={{ border: '1px solid #111', padding: '7px', textAlign: 'center', verticalAlign: 'middle', height: '56px', fontSize: '12px' }}>
                                            <div style={{ fontWeight: 700 }}>{current.subjectCode}</div>
                                            <div>{current.facultyName}</div>
                                        </td>
                                    );
                                    i += span - 1;
                                }
                                return (
                                    <tr key={day}>
                                        <td style={{ border: '1px solid #111', padding: '8px', fontWeight: 700, textAlign: 'center' }}>{day}</td>
                                        {renderedCells}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Subject Allocation Table</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Course Code', 'Course Name', 'Faculty', 'L-T-P', 'Credits', 'Contact Hours'].map((head) => (
                                    <th key={head} style={{ border: '1px solid #111', padding: '7px', fontWeight: 700, fontSize: '12px' }}>{head}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {subjectRows.map((row) => (
                                <tr key={row.courseCode}>
                                    <td style={{ border: '1px solid #111', padding: '7px', fontSize: '12px' }}>{row.courseCode}</td>
                                    <td style={{ border: '1px solid #111', padding: '7px', fontSize: '12px' }}>{row.courseName}</td>
                                    <td style={{ border: '1px solid #111', padding: '7px', fontSize: '12px' }}>{row.faculty}</td>
                                    <td style={{ border: '1px solid #111', padding: '7px', textAlign: 'center', fontSize: '12px' }}>{row.ltp}</td>
                                    <td style={{ border: '1px solid #111', padding: '7px', textAlign: 'center', fontSize: '12px' }}>{row.credits}</td>
                                    <td style={{ border: '1px solid #111', padding: '7px', textAlign: 'center', fontSize: '12px' }}>{row.contactHours}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Faculty Timetable Allocation</h1>
                <p style={{ color: 'var(--text-secondary)' }}>One-click optimized multi-class timetable generation and persistence for student and parent accounts.</p>
            </div>

            {generateAccess?.message && (
                <div style={{ marginBottom: '12px', border: '1px solid var(--theme-border)', borderRadius: '12px', padding: '12px', background: 'var(--card-bg)', color: generateAccess.canGenerate ? '#166534' : '#b45309' }}>
                    {generateAccess.message}
                </div>
            )}

            <div className="exam-gen-controls" style={{
                background: 'var(--card-bg)',
                padding: '24px',
                borderRadius: '16px',
                border: '1.5px solid var(--theme-border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                alignItems: 'end'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--theme-text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Sections</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: 'var(--theme-text)' }}>
                            <input
                                type="checkbox"
                                checked={allSections}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setAllSections(checked);
                                    if (checked) setSections(availableSections);
                                    else setSections(availableSections.slice(0, 1));
                                }}
                            />
                            Generate for all available sections
                        </label>
                        {!allSections && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px' }}>
                                {availableSections.map((option) => (
                                    <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--theme-text)' }}>
                                        <input
                                            type="checkbox"
                                            checked={sections.includes(option)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setSections((prev) => checked ? [...prev, option] : prev.filter((item) => item !== option));
                                            }}
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--theme-text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Semester</label>
                    <input
                        type="number"
                        min="1"
                        max="8"
                        value={semesterNumber}
                        onChange={(e) => setSemesterNumber(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg-muted)', color: 'var(--theme-text)' }}
                    />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating || !deptId || !generateAccess.canGenerate}
                    style={{ padding: '13px', borderRadius: '8px', border: 'none', background: generating ? '#ccc' : 'var(--color-primary-navy)', color: 'white', fontWeight: 'bold', cursor: (generating || !deptId || !generateAccess.canGenerate) ? 'not-allowed' : 'pointer' }}
                >
                    {generating ? 'AI Processing...' : 'Generate Optimized Schedule'}
                </button>
                <button
                    onClick={handlePdfDownload}
                    disabled={!deptId || !generateAccess.canGenerate}
                    style={{ padding: '13px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'transparent', color: 'var(--theme-text)', fontWeight: 'bold', cursor: (!deptId || !generateAccess.canGenerate) ? 'not-allowed' : 'pointer' }}
                >
                    Download Department PDF
                </button>
            </div>

            {analysis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                    {[
                        { label: 'Conflicts Resolved', val: analysis.clashesResolved, color: 'var(--theme-brand-strong)' },
                        { label: 'Room Utilization', val: analysis.roomUtilization, color: '#ca8a04' },
                        { label: 'Faculty Balance', val: analysis.facultyBalance, color: '#3c8dbc' }
                    ].map((stat) => (
                        <div key={stat.label} style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: stat.color }}>{stat.val}</div>
                            <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', fontWeight: '700', textTransform: 'uppercase', marginTop: '4px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {validation && (
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontWeight: 800, marginBottom: '8px' }}>Validation Checklist</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '8px', fontSize: '13px' }}>
                        <div>{validation.allRequiredHoursSatisfied ? '✔' : '✘'} Required hours satisfied</div>
                        <div>{validation.facultyClashFree ? '✔' : '✘'} No faculty clashes</div>
                        <div>{validation.classClashFree ? '✔' : '✘'} No class conflicts</div>
                        <div>{validation.crossClassConflictFree ? '✔' : '✘'} No cross-class conflicts</div>
                        <div>{validation.allSlotsValid ? '✔' : '✘'} All slots valid</div>
                    </div>
                </div>
            )}

            {classSections.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 800 }}>Class-Wise Timetable Sheets</h3>
                    {classSections.map((section) => renderDocumentTable(section))}
                </motion.div>
            )}

            {Object.keys(facultyWiseTimetable || {}).length > 0 && (
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px', padding: '14px', overflowX: 'auto' }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '1rem', fontWeight: 800 }}>Faculty-Wise Timetable</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid var(--theme-border)', padding: '8px' }}>Faculty</th>
                                <th style={{ border: '1px solid var(--theme-border)', padding: '8px' }}>Day</th>
                                <th style={{ border: '1px solid var(--theme-border)', padding: '8px' }}>Period</th>
                                <th style={{ border: '1px solid var(--theme-border)', padding: '8px' }}>Subject</th>
                                <th style={{ border: '1px solid var(--theme-border)', padding: '8px' }}>Class</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(facultyWiseTimetable).flatMap(([facultyName, rows]) =>
                                (rows || []).filter((row) => !row.freePeriod).map((row) => (
                                    <tr key={`${facultyName}-${row.day}-${row.period}-${row.section}-${row.subjectCode}`}>
                                        <td style={{ border: '1px solid var(--theme-border)', padding: '8px' }}>{facultyName}</td>
                                        <td style={{ border: '1px solid var(--theme-border)', padding: '8px' }}>{row.day}</td>
                                        <td style={{ border: '1px solid var(--theme-border)', padding: '8px' }}>{`${row.period} (${String(row.startTime || '').slice(0, 5)}-${String(row.endTime || '').slice(0, 5)})`}</td>
                                        <td style={{ border: '1px solid var(--theme-border)', padding: '8px' }}>{`${row.subjectCode} - ${row.subjectName}`}</td>
                                        <td style={{ border: '1px solid var(--theme-border)', padding: '8px' }}>{row.section}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {analysis && (
                <div style={{ background: 'rgba(var(--card-bg-rgb, 255, 255, 255), 0.6)', border: '1.5px solid var(--theme-border)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', background: 'rgba(11, 44, 107, 0.1)', borderRadius: '10px' }}>
                            <LuFileCode color="var(--theme-brand-strong)" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--theme-text)', textTransform: 'uppercase' }}>Neural Conflict Resolution Report</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { issue: 'Faculty clashes', resolution: `${analysis.clashesResolved || 0} detected after optimization`, status: Number(analysis.clashesResolved) === 0 ? 'RESOLVED' : 'PARTIAL' },
                            { issue: 'Period coverage', resolution: `Scheduled ratio ${analysis.roomUtilization || '-'}`, status: analysis.facultyBalance === 'Balanced' ? 'OPTIMIZED' : 'PARTIAL' },
                            { issue: 'Load distribution', resolution: `Faculty load state: ${analysis.facultyBalance || 'Unknown'}`, status: 'REPORTED' }
                        ].map((log, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--theme-bg-muted)', borderRadius: '12px', border: '1px solid var(--theme-border)' }}>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--theme-text)' }}>{log.issue}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', marginTop: '2px' }}>{log.resolution}</div>
                                </div>
                                <span style={{ fontSize: '9px', fontWeight: '900', color: '#16a34a', background: 'rgba(22, 163, 74, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>{log.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ExamTimetableGeneratorUI;
