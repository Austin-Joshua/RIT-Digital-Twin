import React, { useMemo, useState } from 'react';
import { useToast } from '../../hooks/ToastContext';
import { FaGraduationCap, FaSave, FaSearch } from 'react-icons/fa';
import api from '../../services/api';
import { estimateGradeFromInputs } from '../../features/academics/gradingUtils';

const FacultyGrading = () => {
    const { addToast } = useToast();
    const [selectedCourse, setSelectedCourse] = useState('');
    const [semester, setSemester] = useState('');
    const [search, setSearch] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [students, setStudents] = useState([
        { reg: '211520104001', name: 'Aakash S', currentGrade: 'A+', cat1Marks: 18, cat2Marks: 17, cat3Marks: 16, assignmentMarks: 18, examMarks: 72 },
        { reg: '211520104002', name: 'Balaji K', currentGrade: 'A', cat1Marks: 16, cat2Marks: 17, cat3Marks: 15, assignmentMarks: 17, examMarks: 68 },
        { reg: '211520104003', name: 'Chandini R', currentGrade: 'O', cat1Marks: 20, cat2Marks: 20, cat3Marks: 19, assignmentMarks: 20, examMarks: 76 },
        { reg: '211520104004', name: 'Dinesh M', currentGrade: 'B+', cat1Marks: 14, cat2Marks: 13, cat3Marks: 12, assignmentMarks: 14, examMarks: 60 },
        { reg: '211520104005', name: 'Elango P', currentGrade: 'A', cat1Marks: 17, cat2Marks: 18, cat3Marks: 16, assignmentMarks: 17, examMarks: 70 },
    ]);

    React.useEffect(() => {
        const loadAssignments = async () => {
            try {
                const res = await api.get('/erp/faculty/assignments');
                const rows = Array.isArray(res.data) ? res.data : [];
                setAssignments(rows);
                if (rows.length > 0) {
                    setSelectedCourse(`${rows[0].subjectCode} - ${rows[0].subjectName}`);
                    setSemester(String(rows[0].semester));
                }
            } catch {
                addToast('Using local grading data. Faculty assignment API unavailable.', 'warning');
            }
        };
        loadAssignments();
    }, [addToast]);

    React.useEffect(() => {
        const loadRoster = async () => {
            const picked = assignments.find((a) => `${a.subjectCode} - ${a.subjectName}` === selectedCourse);
            if (!picked) return;
            try {
                setLoading(true);
                const res = await api.get('/erp/faculty/roster', {
                    params: { subjectId: picked.subjectId, semester: picked.semester, section: picked.section }
                });
                const rows = Array.isArray(res.data) ? res.data : [];
                if (rows.length > 0) {
                    setStudents(rows.map((r) => ({
                        studentId: r.studentId,
                        studentSubjectId: r.studentSubjectId,
                        reg: r.registerNo,
                        name: r.name,
                        currentGrade: 'NA',
                        cat1Marks: 0,
                        cat2Marks: 0,
                        cat3Marks: 0,
                        assignmentMarks: 0,
                        examMarks: 0
                    })));
                }
            } catch {
                addToast('Unable to fetch roster from server. You can still edit local draft.', 'warning');
            } finally {
                setLoading(false);
            }
        };
        loadRoster();
    }, [assignments, selectedCourse, addToast]);

    const handleMarksChange = (index, field, value) => {
        const newStudents = [...students];
        newStudents[index][field] = parseInt(value) || 0;

        newStudents[index].currentGrade = estimateGradeFromInputs(newStudents[index]);

        setStudents(newStudents);
    };

    const filteredStudents = useMemo(() => {
        const q = search.trim().toLowerCase();
        return students
            .map((s, index) => ({ ...s, __index: index }))
            .filter((s) => !q ||
                String(s.reg || '').toLowerCase().includes(q) ||
                String(s.name || '').toLowerCase().includes(q));
    }, [students, search]);

    const handleSave = async () => {
        const gradingData = { lastUpdated: new Date().toISOString(), course: selectedCourse, semester: semester, students };
        localStorage.setItem('connectivity_grading', JSON.stringify(gradingData));

        const apiReady = students.some((s) => s.studentSubjectId);
        if (!apiReady) {
            addToast("Grades saved locally. Connect a mapped roster to publish.", "warning");
            return;
        }
        try {
            setSaving(true);
            for (const s of students) {
                await api.post('/erp/faculty/internal-marks', {
                    studentSubjectId: s.studentSubjectId,
                    cat1Marks: s.cat1Marks,
                    cat2Marks: s.cat2Marks,
                    cat3Marks: s.cat3Marks,
                    assignmentMarks: s.assignmentMarks
                });
                await api.post('/erp/faculty/publish-grade', {
                    studentSubjectId: s.studentSubjectId,
                    externalMarks: s.examMarks
                });
            }
            addToast("Internal marks saved and grades published to student portal.", "success");
        } catch {
            addToast("Publish failed for one or more records. Please retry.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                        <FaGraduationCap style={{ color: 'var(--color-accent-gold)' }} /> Performance Grading
                    </h1>
                    <p style={{ color: 'var(--theme-text-muted)' }}>Enter and manage student internal and end-semester scores</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                    style={{ background: 'var(--color-primary-navy)', boxShadow: '0 4px 15px rgba(11, 44, 107, 0.3)' }}
                >
                    <FaSave /> {saving ? 'Publishing...' : 'Save & Publish'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border mb-6" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                <div>
                    <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--theme-text-muted)' }}>Subject</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full p-2.5 rounded-lg border outline-none"
                        style={{ background: 'var(--card-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}
                    >
                        {assignments.length > 0 ? assignments.map((a) => (
                            <option key={a.facultySubjectId} value={`${a.subjectCode} - ${a.subjectName}`}>
                                {a.subjectCode} - {a.subjectName} / {a.section}
                            </option>
                        )) : (
                            <>
                                <option>CS8651 - Internet Programming</option>
                                <option>CS8691 - Artificial Intelligence</option>
                            </>
                        )}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--theme-text-muted)' }}>Semester</label>
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full p-2.5 rounded-lg border outline-none"
                        style={{ background: 'var(--card-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}
                    >
                        {assignments.length > 0 ? (
                            [...new Set(assignments.map((a) => String(a.semester)))].map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))
                        ) : (
                            <>
                                <option>VI</option>
                                <option>VIII</option>
                            </>
                        )}
                    </select>
                </div>
                <div className="relative">
                    <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--theme-text-muted)' }}>Search Student</label>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Reg No or Name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 p-2.5 rounded-lg border outline-none"
                            style={{ background: 'var(--card-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border overflow-x-auto shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                        <tr style={{ background: 'var(--theme-bg-muted)', borderBottom: '2px solid var(--theme-border)' }}>
                            <th className="p-4 text-left text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Register No</th>
                            <th className="p-4 text-left text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Student Name</th>
                            <th className="p-4 text-center text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>CAT1/CAT2/CAT3/Assign</th>
                            <th className="p-4 text-center text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Exam (80)</th>
                            <th className="p-4 text-center text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Calculated Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={`${student.reg}-${student.__index}`} className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                                <td className="p-4 font-mono text-sm" style={{ color: 'var(--theme-text-muted)' }}>{student.reg}</td>
                                <td className="p-4 font-bold" style={{ color: 'var(--theme-text)' }}>{student.name}</td>
                                <td className="p-4 text-center">
                                    <div className="flex gap-1 justify-center">
                                        <input type="number" max="50" value={student.cat1Marks} onChange={(e) => handleMarksChange(student.__index, 'cat1Marks', e.target.value)} className="w-14 p-1 text-center border rounded font-bold" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                                        <input type="number" max="50" value={student.cat2Marks} onChange={(e) => handleMarksChange(student.__index, 'cat2Marks', e.target.value)} className="w-14 p-1 text-center border rounded font-bold" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                                        <input type="number" max="50" value={student.cat3Marks} onChange={(e) => handleMarksChange(student.__index, 'cat3Marks', e.target.value)} className="w-14 p-1 text-center border rounded font-bold" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                                        <input type="number" max="50" value={student.assignmentMarks} onChange={(e) => handleMarksChange(student.__index, 'assignmentMarks', e.target.value)} className="w-14 p-1 text-center border rounded font-bold" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <input
                                        type="number"
                                        max="80"
                                        value={student.examMarks}
                                        onChange={(e) => handleMarksChange(student.__index, 'examMarks', e.target.value)}
                                        className="w-16 p-1 text-center border rounded font-bold"
                                        style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                    />
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-4 py-1.5 rounded-lg font-bold ${student.currentGrade === 'O' ? 'bg-green-600 text-white' :
                                        student.currentGrade === 'A+' ? 'bg-green-500 text-white' :
                                            student.currentGrade === 'A' ? 'bg-blue-500 text-white' :
                                                'bg-amber-500 text-white'
                                        }`}>
                                        {student.currentGrade}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FacultyGrading;
