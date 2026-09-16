import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import twinService from '../../services/twinService';
import StatusBadge from '../../platform/ui/StatusBadge';
import { ErrorState, LoadingState } from '../../platform/ui/AsyncState';
import ErrorBoundary from '../../components/ErrorBoundary';
import './simulation-lab.css';

const EMPTY = {
  name: '',
  intakePercent: 0,
  extraClassrooms: 0,
  seatsPerNewClassroom: 60,
  busCapacityPercent: 0,
  hvacEfficiencyPercent: 0,
  timetableLoadPercent: 0,
};

const COLORS = ['#D4AF37', '#1e3a5f', '#0f766e'];

function blankScenarios() {
  return [
    { ...EMPTY, name: 'Scenario A', enabled: true, intakePercent: 20 },
    { ...EMPTY, name: 'Scenario B', enabled: true, intakePercent: 20, extraClassrooms: 5 },
    { ...EMPTY, name: 'Scenario C', enabled: true, intakePercent: 20, extraClassrooms: 5, busCapacityPercent: 20 },
  ];
}

function formatValue(metric) {
  if (!metric || metric.value == null) return 'Not stored';
  return `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`;
}

function deltaClass(key, delta) {
  if (delta == null || delta === 0) return '';
  const lowerIsBetter = !['classrooms', 'seats', 'transportSeats'].includes(key);
  const worse = lowerIsBetter ? delta > 0 : delta < 0;
  return worse ? 'sim-delta-up' : 'sim-delta-down';
}

function SimulationLab() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const focusBuilding = params.get('building');
  const focusName = params.get('name');
  const [catalog, setCatalog] = useState(null);
  const [scenarios, setScenarios] = useState(blankScenarios);
  const [active, setActive] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    twinService.getSimulationCatalog()
      .then((response) => setCatalog(response.data))
      .catch(() => setCatalog(null));
  }, []);

  const current = scenarios[active];

  const update = (patch) => {
    setScenarios((rows) => rows.map((row, index) => (index === active ? { ...row, ...patch, enabled: true } : row)));
    setResult(null);
  };

  const applyPreset = (preset) => {
    update(preset.values || {});
  };

  const run = () => {
    const selected = scenarios.filter((row) => row.enabled);
    setLoading(true);
    setError('');
    twinService.simulateScenario({ scenarios: selected })
      .then((response) => setResult(response.data))
      .catch(() => setError('The simulation did not run. No estimated campus state was substituted.'))
      .finally(() => setLoading(false));
  };

  const chartRows = !result?.current ? [] : Object.entries(result.current)
    .filter(([key, metric]) => metric?.value != null && ['occupancy', 'crowd', 'utilization', 'transportFill'].includes(key))
    .map(([key, metric]) => {
      const row = { metric: metric.label };
      row.Current = metric.value;
      (result.scenarios || []).forEach((scenario) => {
        row[scenario.name] = scenario.simulated?.[key]?.value ?? null;
      });
      return row;
    });

  const hourRows = (result?.hours || []).map((hour) => ({
    hour: hour.hour,
    Current: hour.current,
    ...(hour.scenarios || {}),
  }));

  return (
    <section className="sim-lab" aria-label="Simulation lab">
      <header>
        <p className="sim-kicker">Digital twin simulation lab</p>
        <h1 className="page-header" style={{ marginBottom: 4 }}>Compare a change before it is real</h1>
        <p className="sim-note">Current figures come from the timetable, stored rooms, the energy formula, and route seats. Everything you run is simulated and does not change campus state.</p>
        {focusBuilding ? (
          <p className="sim-note">Opened for {focusName || `building ${focusBuilding}`}. This lab still compares campus-wide scenarios and does not run until you choose Run. The result is not the current campus state.</p>
        ) : null}
      </header>

      <div className="sim-banner" role="status">
        <strong>Simulated</strong>
        <StatusBadge source="SIMULATED" />
        <p>A result here is not occupancy, a meter reading, or a bus location. The student CGPA what-if is a separate calculator and is not this lab.</p>
      </div>

      <div className="sim-layout">
        <div className="sim-card">
          <div className="sim-tabs" role="tablist" aria-label="Scenarios">
            {scenarios.map((scenario, index) => (
              <button key={scenario.name} type="button" role="tab" aria-selected={active === index} className={active === index ? 'active' : ''} onClick={() => setActive(index)}>
                {scenario.name}{scenario.enabled ? '' : ' off'}
              </button>
            ))}
          </div>
          <label className="sim-field">
            Name
            <input type="text" value={current.name} maxLength={80} onChange={(event) => update({ name: event.target.value })} />
          </label>
          <div className="sim-presets" aria-label="Scenario presets">
            {(catalog?.presets || []).map((preset) => (
              <button key={preset.id} type="button" title={preset.because} onClick={() => applyPreset(preset)}>{preset.label}</button>
            ))}
          </div>
          {(catalog?.unsupported || []).map((item) => (
            <p key={item.id} className="sim-unsupported">{item.label}: {item.because}</p>
          ))}
          <Slider label="Student intake" value={current.intakePercent} min={-50} max={100} suffix="%" onChange={(value) => update({ intakePercent: value })} />
          <Slider label="New classrooms" value={current.extraClassrooms} min={0} max={40} onChange={(value) => update({ extraClassrooms: value })} />
          {current.extraClassrooms > 0 && (
            <Slider label="Seats in each new classroom" value={current.seatsPerNewClassroom} min={20} max={200} onChange={(value) => update({ seatsPerNewClassroom: value })} />
          )}
          <Slider label="Bus capacity" value={current.busCapacityPercent} min={-80} max={100} suffix="%" onChange={(value) => update({ busCapacityPercent: value })} />
          <Slider label="HVAC efficiency" value={current.hvacEfficiencyPercent} min={0} max={40} suffix="%" onChange={(value) => update({ hvacEfficiencyPercent: value })} />
          <Slider label="Timetable load" value={current.timetableLoadPercent} min={-40} max={50} suffix="%" onChange={(value) => update({ timetableLoadPercent: value })} />
          <p className="sim-note">Timetable load changes assumed classes on the weekly grid. It is the same lever as utilization, so it is not applied twice. New classrooms are not placed on the map.</p>
          <div className="sim-actions">
            <button type="button" onClick={() => update({ enabled: !current.enabled })}>{current.enabled ? 'Leave out of comparison' : 'Include in comparison'}</button>
            <button type="button" className="sim-run" onClick={run} disabled={loading || scenarios.every((row) => !row.enabled)}>
              {loading ? 'Running' : 'Run simulation'}
            </button>
          </div>
        </div>

        <div>
          {error ? <ErrorState message={error} onRetry={run} /> : null}
          {loading && !result ? <LoadingState label="Reading timetable and room records" /> : null}
          {!result && !error ? <p className="sim-note">Run one or more scenarios to compare them with the stored timetable. Empty categories are not filled in.</p> : null}
          {result && (
            <div className="sim-result">
              <div className="sim-banner">
                <strong>{result.label || 'SIMULATED'}</strong>
                <StatusBadge source={result.source} />
                <p>{result.because}</p>
                <p>{result.window?.label}: {result.window?.because}</p>
              </div>
              <section className="sim-card">
                <h2>Which scenario performs best</h2>
                <p>{result.recommendation?.best ? result.recommendation.best : 'No scenario is better on timetable pressure.'}</p>
                <p>{result.recommendation?.why}</p>
                <p>{result.recommendation?.comparedOn}</p>
                <ul>
                  {(result.recommendation?.tradeoffs || []).map((line) => <li key={line}>{line}</li>)}
                </ul>
              </section>
              <section className="sim-metrics">
                {Object.entries(result.current || {}).map(([key, metric]) => (
                  <article key={key}>
                    <span>{metric.label}</span>
                    <StatusBadge source={metric.source} />
                    <strong>{formatValue(metric)}</strong>
                    <p>Current. {metric.because}</p>
                    {(result.scenarios || []).map((scenario) => {
                      const delta = scenario.deltas?.[key];
                      return (
                        <p key={scenario.name}>
                          {scenario.name}: {formatValue(scenario.simulated?.[key])}
                          {delta == null ? '' : <span className={deltaClass(key, delta)}> ({delta > 0 ? '+' : ''}{delta})</span>}
                        </p>
                      );
                    })}
                  </article>
                ))}
              </section>
              {chartRows.length > 0 && (
                <section className="sim-card">
                  <h2>Current versus simulated</h2>
                  <div className="sim-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartRows}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Current" fill="#94a3b8" />
                        {(result.scenarios || []).map((scenario, index) => (
                          <Bar key={scenario.name} dataKey={scenario.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
              {hourRows.some((row) => row.Current != null) && (
                <section className="sim-card">
                  <h2>Timetable hours today</h2>
                  <p className="sim-note">Crowd percent by stored start time. Not a forecast beyond today&apos;s timetable.</p>
                  <div className="sim-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={hourRows}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Current" stroke="#94a3b8" strokeWidth={2} dot={false} />
                        {(result.scenarios || []).map((scenario, index) => (
                          <Line key={scenario.name} type="monotone" dataKey={scenario.name} stroke={COLORS[index % COLORS.length]} strokeWidth={2} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
              <section className="sim-card">
                <h2>Buildings in this hour</h2>
                <p className="sim-note">Only buildings that already have a class in the comparison hour. Simulated rooms are not drawn on the campus map.</p>
                <div className="sim-buildings">
                  {(result.buildings || []).length === 0 ? <p>No building has a class in this hour.</p> : result.buildings.map((building) => (
                    <article key={building.name}>
                      <strong>{building.name}</strong>
                      <p>Current crowd: {building.current == null ? 'Not stored' : `${building.current}%`}</p>
                      {Object.entries(building.scenarios || {}).map(([name, value]) => (
                        <p key={name}>{name}: {value == null ? 'Not stored' : `${value}%`}</p>
                      ))}
                      <p>{building.because}</p>
                    </article>
                  ))}
                </div>
                <button type="button" onClick={() => navigate('/map')}>Open campus map</button>
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Slider({ label, value, min, max, suffix = '', onChange }) {
  return (
    <label className="sim-field">
      {label}: {value}{suffix}
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <input type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export default function SimulationLabWrapped(props) {
  return (
    <ErrorBoundary inline title="Simulation Scenario Visualizer Interrupted">
      <SimulationLab {...props} />
    </ErrorBoundary>
  );
}
