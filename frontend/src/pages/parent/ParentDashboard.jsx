import { Link } from 'react-router-dom';
import RoleExperience from '../../platform/ui/RoleExperience';

const ParentDashboard = () => (
    <div className="stu-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <RoleExperience />
        <p style={{ margin: 0, color: 'var(--theme-text-muted)', fontSize: '14px' }}>
            Records below stay on the existing pages. This home does not estimate fees or campus traffic.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/parent/attendance">Attendance</Link>
            <Link to="/parent/grades">Grades</Link>
        </div>
    </div>
);

export default ParentDashboard;
