import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { FaUserClock, FaChartPie, FaDownload, FaSave, FaCheck, FaTimes, FaCalendarAlt } from 'react-icons/fa';

const FacultyAttendance = () => {
    const { addToast } = useToast();
    const [selectedCourse, setSelectedCourse] = useState('CS8651 - Internet Programming');
    const [markingMode, setMarkingMode] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [students, setStudents] = useState([
        { reg: '211520104001', name: 'Aakash S', attended: 42, total: 45, percentage: 93.3, currentStatus: 'present' },
        { reg: '211520104002', name: 'Balaji K', attended: 35, total: 45, percentage: 77.8, currentStatus: 'present' },
        { reg: '211520104003', name: 'Chandini R', attended: 44, total: 45, percentage: 97.8, currentStatus: 'present' },
        { reg: '211520104004', name: 'Dinesh M', attended: 28, total: 45, percentage: 62.2, currentStatus: 'absent' },
        { reg: '211520104005', name: 'Elango P', attended: 40, total: 45, percentage: 88.9, currentStatus: 'present' },
    ]);

    const handleStatusToggle = (index, status) => {
        if (!markingMode) return;
        const newStudents = [...students];
        newStudents[index].currentStatus = status;
        setStudents(newStudents);
    };

    const markAll = (status) => {
        if (!markingMode) return;
        const newStudents = students.map(s => ({ ...s, currentStatus: status }));
        setStudents(newStudents);
    };

    const handleSave = () => {
        setMarkingMode(false);
        addToast(`Attendance for ${date} saved successfully.`, 'success');

        // Simulate recalculation
        const updated = students.map(s => {
            const newTotal = s.total + 1;
            const newAttended = s.currentStatus === 'present' ? s.attended + 1 : s.attended;
            return {
                ...s,
                total: newTotal,
                attended: newAttended,
                percentage: ((newAttended / newTotal) * 100).toFixed(1)
            };
        });
        setStudents(updated);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                        <FaUserClock style={{ color: 'var(--color-accent-gold)' }} /> Attendance Management
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--theme-text-muted)' }}>Record daily attendance and monitor student risk levels</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                        style={{
                            background: 'var(--card-bg)',
                            color: 'var(--theme-text)',
                            borderColor: 'var(--theme-border)',
                            '--tw-ring-color': 'var(--color-accent-gold)'
                        }}
                    >
                        <option value="CS8651 - Internet Programming">CS8651 - Internet Programming / CSE-A</option>
                        <option value="CS8691 - Artificial Intelligence">CS8691 - Artificial Intelligence / CSE-B</option>
                    </select>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors">
                        <FaDownload /> Export CSV
                    </button>
                    {!markingMode ? (
                        <button
                            onClick={() => setMarkingMode(true)}
                            className="text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm"
                            style={{ background: 'var(--color-primary-navy)' }}
                        >
                            Mark Attendance
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm animate-pulse"
                        >
                            <FaSave /> Save Register
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl shadow-sm border flex justify-between items-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                    <div>
                        <div className="text-sm mb-1" style={{ color: 'var(--theme-text-muted)' }}>Overall Class Attendance</div>
                        <div className="text-4xl font-black" style={{ color: 'var(--theme-text)' }}>84.5%</div>
                    </div>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary-100)' }}>
                        <FaChartPie className="text-3xl" style={{ color: 'var(--color-primary-navy)' }} />
                    </div>
                </div>
                <div className="p-6 rounded-xl shadow-sm border flex justify-between items-center" style={{ background: 'var(--color-error-100)', borderColor: 'var(--color-error)' }}>
                    <div>
                        <div className="text-sm mb-1" style={{ color: 'var(--color-error)' }}>Students Below 75% Risk</div>
                        <div className="text-4xl font-black" style={{ color: 'var(--color-error)' }}>{students.filter(s => s.percentage < 75).length}</div>
                    </div>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--color-error-100)', opacity: 0.8 }}>
                        <FaUserClock className="text-3xl" style={{ color: 'var(--color-error)' }} />
                    </div>
                </div>
            </div>

            <div className="rounded-xl shadow-sm border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ background: 'var(--theme-bg-muted)', borderColor: 'var(--theme-border)' }}>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>Student Roster</h3>

                    {markingMode && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: 'var(--card-bg)', borderColor: 'var(--theme-border)' }}>
                                <FaCalendarAlt className="text-gray-400" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="text-sm bg-transparent outline-none font-medium"
                                    style={{ color: 'var(--theme-text)' }}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => markAll('present')} className="text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-md hover:bg-green-200 transition-colors">Mark All Present</button>
                                <button onClick={() => markAll('absent')} className="text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1.5 rounded-md hover:bg-red-200 transition-colors">Mark All Absent</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs uppercase tracking-wider border-b" style={{ background: 'var(--theme-bg-muted)', color: 'var(--theme-text-muted)', borderColor: 'var(--theme-border)' }}>
                                <th className="p-4 font-bold">Register Number</th>
                                <th className="p-4 font-bold">Student Name</th>
                                <th className="p-4 font-bold text-center">History (Att/Tot)</th>
                                <th className="p-4 font-bold text-center">Aggr. %</th>
                                {markingMode && <th className="p-4 font-bold text-center bg-blue-50/50 dark:bg-blue-900/20">Today's Status</th>}
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {students.map((student, idx) => (
                                <tr key={idx} className="border-b transition-colors" style={{ borderColor: 'var(--theme-border)' }}>
                                    <td className="p-4 font-mono font-medium" style={{ color: 'var(--theme-text-muted)' }}>{student.reg}</td>
                                    <td className="p-4 font-bold" style={{ color: 'var(--theme-text)' }}>{student.name}</td>
                                    <td className="p-4 text-center font-mono" style={{ color: 'var(--theme-text-muted)' }}>
                                        <span className="font-bold" style={{ color: 'var(--theme-text)' }}>{student.attended}</span> / {student.total}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.percentage >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {student.percentage}%
                                        </span>
                                    </td>
                                    {markingMode && (
                                        <td className="p-4 text-center bg-blue-50/20 dark:bg-blue-900/10">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleStatusToggle(idx, 'present')}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${student.currentStatus === 'present' ? 'bg-green-500 text-white shadow-md scale-110' : 'bg-gray-100 text-gray-400 dark:bg-navy-700 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-500'}`}
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusToggle(idx, 'absent')}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${student.currentStatus === 'absent' ? 'bg-red-500 text-white shadow-md scale-110' : 'bg-gray-100 text-gray-400 dark:bg-navy-700 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500'}`}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FacultyAttendance;
