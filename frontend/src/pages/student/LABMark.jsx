import ImsReportTable from '../../components/common/ImsReportTable';

const LABMark = () => (
    <ImsReportTable
        title="LAB Mark"
        headers={['Subject Code', 'Subject Name', 'Faculty Name', 'Internal Mark', 'Max']}
        rows={[]}
        emptyLabel="No lab marks are stored for this login."
    />
);

export default LABMark;
