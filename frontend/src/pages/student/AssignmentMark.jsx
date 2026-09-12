import { useAuth } from '../../hooks/AuthContext';
import { getInternalMarks } from '../../utils/MockDataGenerator';
import ImsReportTable from '../../components/common/ImsReportTable';

const SUBJECTS = [
    ['CS3401', 'Algorithms and Data Structures'],
    ['CS3402', 'Operating Systems'],
    ['CS3403', 'Computer Networks'],
    ['CS3404', 'Database Management'],
    ['GE3401', 'Professional Ethics'],
];

const AssignmentMark = () => {
    const { user } = useAuth();
    const marks = getInternalMarks(user?.email || 'guest@ritchennai.edu.in');
    const headers = [
        'Subject Code',
        'Subject Name',
        'Faculty Name',
        'Assignment Mark-1 (10-Marks)',
        'Assignment Mark-2 (10-Marks)',
        'Total (50 -Marks)',
    ];
    const rows = SUBJECTS.map(([code, name], index) => {
        const score = marks.assignments[index]?.score ?? 0;
        const first = Math.min(10, Math.round(score / 2));
        const second = Math.min(10, Math.max(0, Math.round(score) - first));
        return {
            key: code,
            'Subject Code': code,
            'Subject Name': name,
            'Faculty Name': 'Assigned Faculty',
            'Assignment Mark-1 (10-Marks)': first,
            'Assignment Mark-2 (10-Marks)': second,
            'Total (50 -Marks)': first + second,
        };
    });

    return <ImsReportTable title="Assignment Mark" headers={headers} rows={rows} />;
};

export default AssignmentMark;
