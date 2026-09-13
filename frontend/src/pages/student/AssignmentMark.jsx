import ImsReportTable from '../../components/common/ImsReportTable';

const AssignmentMark = () => (
    <ImsReportTable
        title="Assignment Mark"
        headers={['Subject Code', 'Subject Name', 'Faculty Name', 'Assignment Mark-1 (10-Marks)', 'Assignment Mark-2 (10-Marks)', 'Total (50 -Marks)']}
        rows={[]}
        emptyLabel="No assignment marks are stored for this login."
    />
);

export default AssignmentMark;
