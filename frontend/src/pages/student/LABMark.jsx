import { useAuth } from '../../hooks/AuthContext';
import { getInternalMarks } from '../../utils/MockDataGenerator';
import ImsReportTable from '../../components/common/ImsReportTable';

const LABS = [
    ['CS3461', 'Operating Systems Laboratory'],
    ['CS3462', 'Database Management Systems Laboratory'],
];

const LABMark = () => {
    const { user } = useAuth();
    const marks = getInternalMarks(user?.email || 'guest@ritchennai.edu.in');
    const headers = ['Subject Code', 'Subject Name', 'Faculty Name', 'Internal Mark', 'Max'];
    const rows = LABS.map(([code, name], index) => ({
        key: code,
        'Subject Code': code,
        'Subject Name': name,
        'Faculty Name': 'Assigned Faculty',
        'Internal Mark': marks.cat[index]?.score ?? '—',
        Max: 50,
    }));

    return <ImsReportTable title="LAB Mark" headers={headers} rows={rows} />;
};

export default LABMark;
