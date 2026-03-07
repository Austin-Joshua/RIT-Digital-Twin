import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { FaGraduationCap, FaSave, FaCheckCircle, FaSearch, FaFilter } from 'react-icons/fa';

const FacultyGrading = () => {
    const { addToast } = useToast();
    const [selectedCourse, setSelectedCourse] = useState('CS8651 - Internet Programming');
    const [semester, setSemester] = useState('VI');
    const [search, setSearch] = useState('');

    const [students, setStudents] = useState([
        { reg: '211520104001', name: 'Aakash S', currentGrade: 'A+', internalMarks: 18, examMarks: 72 },
        { reg: '211520104002', name: 'Balaji K', currentGrade: 'A', internalMarks: 16, examMarks: 68 },
        { reg: '211520104003', name: 'Chandini R', currentGrade: 'O', internalMarks: 20, examMarks: 76 },
        { reg: '211520104004', name: 'Dinesh M', currentGrade: 'B+', internalMarks: 14, examMarks: 60 },
        { reg: '211520104005', name: 'Elango P', currentGrade: 'A', internalMarks: 17, examMarks: 70 },
    ]);

    const handleMarksChange = (index, field, value) => {
        const newStudents = [...students];
        newStudents[index][field] = parseInt(value) || 0;

        // Auto-calculate grade (simple logic)
        const total = newStudents[index].internalMarks + newStudents[index].examMarks;
        if (total >= 90) newStudents[index].currentGrade = 'O';
        else if (total >= 80) newStudents[index].currentGrade = 'A+';
        else if (total >= 70) newStudents[index].currentGrade = 'A';
        else if (total >= 60) newStudents[index].currentGrade = 'B+';
        else newStudents[index].currentGrade = 'B';

        setStudents(newStudents);
    };

    const handleSave = () => {
        // Persist to localStorage for connectivity
        const gradingData = {
            lastUpdated: new Date().toISOString(),
            course: selectedCourse,
            semester: semester,
            students: students
        };
        localStorage.setItem('connectivity_grading', JSON.stringify(gradingData));
        addToast("Grades saved and published to student portals.", "success");
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
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                    style={{ background: 'var(--color-primary-navy)', boxShadow: '0 4px 15px rgba(11, 44, 107, 0.3)' }}
                >
                    <FaSave /> Save & Publish
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
                        <option>CS8651 - Internet Programming</option>
                        <option>CS8691 - Artificial Intelligence</option>
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
                        <option>VI</option>
                        <option>VIII</option>
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
                            <th className="p-4 text-center text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Internal (20)</th>
                            <th className="p-4 text-center text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Exam (80)</th>
                            <th className="p-4 text-center text-xs font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>Calculated Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, idx) => (
                            <tr key={idx} className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                                <td className="p-4 font-mono text-sm" style={{ color: 'var(--theme-text-muted)' }}>{student.reg}</td>
                                <td className="p-4 font-bold" style={{ color: 'var(--theme-text)' }}>{student.name}</td>
                                <td className="p-4 text-center">
                                    <input
                                        type="number"
                                        max="20"
                                        value={student.internalMarks}
                                        onChange={(e) => handleMarksChange(idx, 'internalMarks', e.target.value)}
                                        className="w-16 p-1 text-center border rounded font-bold"
                                        style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                    />
                                </td>
                                <td className="p-4 text-center">
                                    <input
                                        type="number"
                                        max="80"
                                        value={student.examMarks}
                                        onChange={(e) => handleMarksChange(idx, 'examMarks', e.target.value)}
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
