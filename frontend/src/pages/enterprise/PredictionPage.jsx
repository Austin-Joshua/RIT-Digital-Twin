import AlertCenter from '../../platform/ui/AlertCenter';
import DecisionCenter from '../../platform/ui/DecisionCenter';

const PredictionPage = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '40px' }}>
    <div>
      <h1 className="page-header" style={{ marginBottom: '4px' }}>Predictive intelligence</h1>
      <p style={{ color: 'var(--theme-text-muted)', fontSize: '14px' }}>
        Alerts come from the timetable, stored risk rows, and prediction models that used stored samples. The decision center estimates impact only when the existing simulator can.
      </p>
    </div>
    <AlertCenter />
    <DecisionCenter />
  </div>
);

export default PredictionPage;
