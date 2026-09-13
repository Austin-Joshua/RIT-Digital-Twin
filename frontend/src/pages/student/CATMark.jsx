import ImsReportTable from '../../components/common/ImsReportTable';

const CATMark = () => (
    <ImsReportTable
        title="CAT Mark"
        headers={['Subject Code', 'Subject Name', 'Faculty Name', 'CO-1 (25 Marks)', 'CO-2 (25 Marks)', 'CO-3 (25 Marks)', 'Total (75 Marks)', 'Internal Weightage']}
        rows={[]}
        emptyLabel="No CAT marks are stored for this login."
    />
);

export default CATMark;
