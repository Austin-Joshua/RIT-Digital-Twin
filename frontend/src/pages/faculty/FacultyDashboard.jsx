import { useEffect, useState } from 'react';
import api from '../../services/api';
import RoleExperience from '../../platform/ui/RoleExperience';

const FacultyDashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [subjectsNote, setSubjectsNote] = useState('Reading assigned subjects.');

    useEffect(() => {
        api.get('/faculty/subjects')
            .then((res) => {
                const rows = Array.isArray(res.data) ? res.data : [];
                setSubjects(rows);
                setSubjectsNote(rows.length ? '' : 'No subjects are assigned to this login.');
            })
            .catch(() => {
                setSubjects([]);
                setSubjectsNote('Assigned subjects could not be read. None were invented.');
            });
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <RoleExperience />
            <div className="stu-info-card">
                <div className="info-header">Assigned subjects</div>
                <div className="info-body">
                    {subjects.length === 0 ? (
                        <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px' }}>{subjectsNote}</p>
                    ) : (
                        <table className="stu-data-table">
                            <thead>
                                <tr>
                                    <th>Subject code</th>
                                    <th>Subject name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((subject) => (
                                    <tr key={subject.subjectId || subject.subjectCode}>
                                        <td>{subject.subjectCode || '—'}</td>
                                        <td>{subject.subjectName || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
