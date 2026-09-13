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

const CATMark = () => {
    const { user } = useAuth();
    const marks = getInternalMarks(user?.email || 'guest@ritchennai.edu.in');
    const headers = [
        'Subject Code',
        'Subject Name',
        'Faculty Name',
        'CO-1 (25 Marks)',
        'CO-2 (25 Marks)',
        'CO-3 (25 Marks)',
        'Total (75 Marks)',
        'Internal Weightage',
    ];
    const rows = SUBJECTS.map(([code, name], index) => {
        const score = marks.cat[index]?.score ?? 0;
        const co1 = Math.round(score * 0.34);
        const co2 = Math.round(score * 0.33);
        const co3 = Math.max(0, Math.round(score) - co1 - co2);
        const total = co1 + co2 + co3;
        return {
            key: code,
            'Subject Code': code,
            'Subject Name': name,
            'Faculty Name': 'Assigned Faculty',
            'CO-1 (25 Marks)': co1,
            'CO-2 (25 Marks)': co2,
            'CO-3 (25 Marks)': co3,
            'Total (75 Marks)': total,
            'Internal Weightage': Math.round((total / 75) * 20),
        };
    });

    return <ImsReportTable title="CAT Mark" headers={headers} rows={rows} />;
};

export default CATMark;
