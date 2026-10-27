import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine
} from 'recharts';
import twinService from '../../services/twinService';
import StatusBadge from '../../platform/ui/StatusBadge';
import { ErrorState, LoadingState } from '../../platform/ui/AsyncState';
import ErrorBoundary from '../../components/ErrorBoundary';
import './simulation-lab.css';

const DEFAULT_PRESETS = [
  {
    id: 'normal-day',
    name: 'Normal Operating Day',
    badge: 'Standard Baseline',
    description: 'Standard academic timetable with typical 100% scheduled classes and baseline transit.',
    affected: 'Campus-wide (All buildings and bus routes)',
    assumptions: 'All academic buildings open, normal timetable grid, 0% EV transit.',
    values: { intakePercent: 0, extraClassrooms: 0, seatsPerNewClassroom: 60, busCapacityPercent: 0, evAdoptionPercent: 0, hvacEfficiencyPercent: 0, timetableLoadPercent: 0 }
  },
  {
    id: 'exam-day',
    name: 'Examination Day',
    badge: 'Low Movement',
    description: 'Reduced classroom transitions with prolonged quiet hall occupancy and lower peak crowd corridors.',
    affected: 'Academic blocks (Main Block, CS Block, Biotech, Library)',
    assumptions: 'Hall seating arranged at 50% spacing, low midday corridor traffic, slight HVAC cooling increase.',
    values: { intakePercent: 0, extraClassrooms: 0, seatsPerNewClassroom: 60, busCapacityPercent: -20, evAdoptionPercent: 0, hvacEfficiencyPercent: 5, timetableLoadPercent: -25 }
  },
  {
    id: 'peak-demand',
    name: 'Peak-Hour Demand',
    badge: 'Stress Test',
    description: 'Simulates 25% surge in student presence, high midday HVAC cooling, and transit capacity squeeze.',
    affected: 'All classrooms, corridors, transit lines 1-4',
    assumptions: 'Simultaneous lab schedules, peak heat-index hour, full student presence.',
    values: { intakePercent: 25, extraClassrooms: 0, seatsPerNewClassroom: 60, busCapacityPercent: 10, evAdoptionPercent: 0, hvacEfficiencyPercent: -5, timetableLoadPercent: 30 }
  },
  {
    id: 'classroom-demand-up',
    name: 'Increased Classroom Demand',
    badge: 'Expansion',
    description: 'Models a 20% increase in academic intake paired with 4 new classrooms to relieve bottlenecking.',
    affected: 'Department classrooms, allocation grid, corridor capacity',
    assumptions: 'New classrooms accommodate 60 seats each, section sizes expanded.',
    values: { intakePercent: 20, extraClassrooms: 4, seatsPerNewClassroom: 60, busCapacityPercent: 15, evAdoptionPercent: 0, hvacEfficiencyPercent: 0, timetableLoadPercent: 15 }
  },
  {
    id: 'energy-saving',
    name: 'Energy-Saving Operation',
    badge: 'Green Campus',
    description: 'Aggressive HVAC setback (+2 deg C), consolidated evening sections, and optimized route dispatching.',
    affected: 'Central chiller plant, Main Block, Mech Block, Transit',
    assumptions: '25% HVAC efficiency gain, non-essential lighting dimmed, timetable consolidated into fewer wings.',
    values: { intakePercent: 0, extraClassrooms: 0, seatsPerNewClassroom: 60, busCapacityPercent: 0, evAdoptionPercent: 40, hvacEfficiencyPercent: 25, timetableLoadPercent: -15 }
  },
  {
    id: 'building-closure',
    name: 'Building Closure (Maintenance)',
    badge: 'Contingency',
    description: 'Mechanical Sciences Block closed for scheduled HVAC retrofit; classes relocated to Main & CS Blocks.',
    affected: 'Mechanical Sciences Block (0 kW), Main Block & CS Block (+load)',
    assumptions: 'Mechanical Block load set to zero; sections migrated to other available halls.',
    values: { intakePercent: 0, extraClassrooms: 0, seatsPerNewClassroom: 60, busCapacityPercent: -10, evAdoptionPercent: 0, hvacEfficiencyPercent: 10, timetableLoadPercent: -10 }
  },
  {
    id: 'transport-electrification',
    name: 'Fleet Electrification (EV Transition)',
    badge: 'ESG Transformation',
    description: 'Transition 80% of campus diesel buses to electric transit, cutting transit diesel emissions.',
    affected: 'Campus transit routes 1-4, EV charging depots, carbon emissions',
    assumptions: '80% diesel replacement, zero tailpipe emissions, depot power drawn from green solar offsets.',
    values: { intakePercent: 0, extraClassrooms: 0, seatsPerNewClassroom: 60, busCapacityPercent: 20, evAdoptionPercent: 80, hvacEfficiencyPercent: 10, timetableLoadPercent: 0 }
  },
  {
    id: 'emergency-crowd',
    name: 'Emergency Crowd Management',
    badge: 'Safety Protocol',
    description: 'Staggered lecture dispersal to eliminate bottlenecking in Main Block foyer and canteen quadrangle.',
    affected: 'Main foyer, central stairwells, bus boarding terminal',
    assumptions: 'Dispersal intervals staggered by 15 mins, timetable load rebalanced to off-peak slots.',
    values: { intakePercent: 0, extraClassrooms: 2, seatsPerNewClassroom: 80, busCapacityPercent: 30, evAdoptionPercent: 0, hvacEfficiencyPercent: 0, timetableLoadPercent: -20 }
  }
];

const EMPTY_SCENARIO = {
  name: '',
  intakePercent: 0,
  extraClassrooms: 0,
  seatsPerNewClassroom: 60,
  busCapacityPercent: 0,
  evAdoptionPercent: 0,
  hvacEfficiencyPercent: 0,
  timetableLoadPercent: 0
};

const CHART_COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#ec4899'];

function blankScenarios() {
  return [
    { ...EMPTY_SCENARIO, name: 'Scenario A (Balanced)', enabled: true, intakePercent: 15, hvacEfficiencyPercent: 10, evAdoptionPercent: 30 },
    { ...EMPTY_SCENARIO, name: 'Scenario B (Eco Operation)', enabled: true, intakePercent: 0, hvacEfficiencyPercent: 25, evAdoptionPercent: 80 },
    { ...EMPTY_SCENARIO, name: 'Scenario C (High Demand)', enabled: true, intakePercent: 25, extraClassrooms: 4, busCapacityPercent: 20 }
  ];
}

function formatValue(metric) {
  if (!metric || metric.value == null) return 'N/A';
  return `${typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}${metric.unit ? ` ${metric.unit}` : ''}`;
}

export default function SimulationLab() {
  const navigate = useNavigate();

  // Navigation tab: 'studio' | 'telemetry' | 'sweep' | 'missions' | 'history'
  const [activeTab, setActiveTab] = useState('studio');

  // Scenario Studio state
  const [catalog, setCatalog] = useState(null);
  const [scenarios, setScenarios] = useState(blankScenarios);
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [selectedPresetId, setSelectedPresetId] = useState('normal-day');
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');

  // Synthetic Telemetry & Clock Scrubber state
  const [simClockMinutes, setSimClockMinutes] = useState(600); // 10:00 AM (600 mins)
  const [isPlayingClock, setIsPlayingClock] = useState(false);
  const [telemetryMetric, setTelemetryMetric] = useState('power');
  const [syntheticTimeSeries, setSyntheticTimeSeries] = useState([]);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  // Parameter Sweep Optimizer state
  const [sweepParam, setSweepParam] = useState('hvacEfficiencyPercent');
  const [sweepMin, setSweepMin] = useState(0);
  const [sweepMax, setSweepMax] = useState(40);
  const [sweepStep, setSweepStep] = useState(5);
  const [sweepResult, setSweepResult] = useState(null);
  const [sweepLoading, setSweepLoading] = useState(false);

  // Mission Mode state
  const [missions, setMissions] = useState([]);
  const [activeMissionId, setActiveMissionId] = useState('energy-reduction');
  const [missionCandidate, setMissionCandidate] = useState({
    intakePercent: 0,
    extraClassrooms: 0,
    seatsPerNewClassroom: 60,
    busCapacityPercent: 0,
    evAdoptionPercent: 40,
    hvacEfficiencyPercent: 25,
    timetableLoadPercent: -10
  });
  const [missionEvalResult, setMissionEvalResult] = useState(null);
  const [missionLoading, setMissionLoading] = useState(false);

  // Simulation History state
  const [historyRuns, setHistoryRuns] = useState([]);

  const loadHistory = () => {
    twinService.getSimulationHistory()
      .then((res) => {
        if (Array.isArray(res?.data)) setHistoryRuns(res.data);
      })
      .catch(() => setHistoryRuns([]));
  };

  // Fetch initial catalog, missions, history
  useEffect(() => {
    twinService.getSimulationCatalog()
      .then((res) => {
        if (res?.data) setCatalog(res.data);
      })
      .catch(() => setCatalog(null));

    twinService.getMissions()
      .then((res) => {
        if (res?.data) setMissions(res.data);
      })
      .catch(() => setMissions([]));

    loadHistory();
  }, []);

  // Telemetry auto-fetch when clock or metric or active scenario changes
  const formattedClock = useMemo(() => {
    const hours = Math.floor(simClockMinutes / 60);
    const mins = simClockMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }, [simClockMinutes]);

  useEffect(() => {
    let isSubscribed = true;
    twinService.getSyntheticTelemetry({
      metric: telemetryMetric,
      scenarioId: selectedPresetId,
      startHour: 8,
      endHour: 18,
      stepMinutes: 30
    })
      .then((res) => {
        if (isSubscribed && res?.data?.series) {
          setSyntheticTimeSeries(res.data.series);
        }
      })
      .catch(() => {
        if (isSubscribed) setSyntheticTimeSeries([]);
      })
      .finally(() => {
        if (isSubscribed) setTelemetryLoading(false);
      });
    return () => {
      isSubscribed = false;
    };
  }, [telemetryMetric, selectedPresetId]);

  // Clock playback loop
  useEffect(() => {
    if (!isPlayingClock) return undefined;
    const interval = setInterval(() => {
      setSimClockMinutes((prev) => {
        if (prev >= 18 * 60) return 8 * 60; // loop back to 08:00
        return prev + 15;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlayingClock]);

  // Current Scenario editing helpers
  const currentScenario = scenarios[activeScenarioIdx] || scenarios[0];

  const updateCurrentScenario = (patch) => {
    setScenarios((rows) =>
      rows.map((row, idx) => (idx === activeScenarioIdx ? { ...row, ...patch, enabled: true } : row))
    );
    setSimResult(null);
  };

  const applyPresetToCurrent = (preset) => {
    setSelectedPresetId(preset.id);
    updateCurrentScenario({
      name: `${preset.name} (Custom)`,
      ...(preset.values || {})
    });
  };

  // Run Multi-Scenario Simulation
  const executeSimulation = () => {
    const selected = scenarios.filter((row) => row.enabled);
    setSimLoading(true);
    setSimError('');
    twinService.simulateScenario({ scenarios: selected })
      .then((res) => {
        setSimResult(res.data);
        loadHistory();
      })
      .catch(() => setSimError('The simulation engine was unable to execute the requested scenario parameters.'))
      .finally(() => setSimLoading(false));
  };

  // Run Parameter Sweep
  const executeSweep = () => {
    setSweepLoading(true);
    twinService.runParameterSweep({
      parameter: sweepParam,
      min: Number(sweepMin),
      max: Number(sweepMax),
      step: Number(sweepStep),
      baseScenario: {
        intakePercent: currentScenario.intakePercent,
        extraClassrooms: currentScenario.extraClassrooms,
        busCapacityPercent: currentScenario.busCapacityPercent,
        hvacEfficiencyPercent: currentScenario.hvacEfficiencyPercent,
        timetableLoadPercent: currentScenario.timetableLoadPercent,
        evAdoptionPercent: currentScenario.evAdoptionPercent
      }
    })
      .then((res) => setSweepResult(res.data))
      .catch(() => setSweepResult(null))
      .finally(() => setSweepLoading(false));
  };

  // Evaluate Mission
  const executeMissionEvaluation = () => {
    setMissionLoading(true);
    twinService.evaluateMission({
      missionId: activeMissionId,
      candidate: missionCandidate
    })
      .then((res) => setMissionEvalResult(res.data))
      .catch(() => setMissionEvalResult(null))
      .finally(() => setMissionLoading(false));
  };

  // Export operational report
  const downloadOperationalReportJSON = () => {
    const reportData = {
      reportType: 'SMART_CAMPUS_OPERATIONAL_INTELLIGENCE_REPORT',
      generatedAt: new Date().toISOString(),
      provenance: 'DETERMINISTIC_SYNTHETIC_SIMULATION',
      simulatedClock: formattedClock,
      activePreset: selectedPresetId,
      scenariosEvaluated: scenarios.filter((s) => s.enabled),
      baselineVersusScenario: simResult?.current || {},
      recommendation: simResult?.recommendation || {},
      assumptions: [
        'Classroom allocations reflect the 40-slot weekly timetable baseline.',
        'HVAC electrical demand calculated via baseline base load + 5.5 kW per active section.',
        'Bus transit diesel baseline modeled at 2.68 kg CO2/L; EV transition assumes clean solar charging.'
      ],
      limitations: 'All outputs are deterministic simulations. Not physical IoT sensor measurements.'
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rit_campus_simulation_report_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Bar chart rows from result
  const comparisonBarRows = useMemo(() => {
    if (!simResult?.current) return [];
    const keys = [
      { id: 'power', label: 'Power Load (kW)' },
      { id: 'utilization', label: 'Room Utilization (%)' },
      { id: 'crowd', label: 'Crowd Density (%)' },
      { id: 'transportFill', label: 'Transit Fill (%)' },
      { id: 'carbonEmissions', label: 'Daily Emissions (kg CO2)' }
    ];
    return keys.map((k) => {
      const row = { metric: k.label };
      row.Baseline = simResult.current[k.id]?.value ?? 0;
      (simResult.scenarios || []).forEach((sc) => {
        row[sc.name] = sc.simulated?.[k.id]?.value ?? 0;
      });
      return row;
    });
  }, [simResult]);

  return (
    <section className="sim-lab" aria-label="Smart Campus Intelligence Simulation Lab">
      {/* Header */}
      <header>
        <p className="sim-kicker">Interactive Smart Campus Intelligence & Scenario Studio</p>
        <h1 className="page-header" style={{ marginBottom: 4 }}>
          Campus Simulation Lab & What-If Studio
        </h1>
        <p className="sim-note">
          Ground operational campus decisions with physics- and timetable-calibrated synthetic simulations.
          No physical IoT hardware or manual meter entries required.
        </p>
      </header>

      {/* Provenance Notice */}
      <div className="sim-banner" role="status">
        <div className="sim-banner-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="sim-provenance-tag">PROVENANCE: SYNTHETIC / SIMULATED</span>
            <StatusBadge source="SIMULATED" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--theme-text-muted)' }}>Simulated Clock:</span>
            <strong style={{ color: 'var(--color-accent-gold)', fontFamily: 'monospace', fontSize: 16 }}>
              {formattedClock}
            </strong>
          </div>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 12 }}>
          Data is deterministically generated from the verified timetable grid, architectural footprints, and
          authoritative engineering formulas. Authoritative historical records are never overwritten.
        </p>
      </div>

      {/* Main Tab Navigation */}
      <nav className="sim-mode-nav" aria-label="Simulation Lab Modes">
        <button
          type="button"
          className={`sim-mode-tab ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
        >
          <span>Scenario Studio & Presets</span>
        </button>
        <button
          type="button"
          className={`sim-mode-tab ${activeTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          <span>Deterministic Telemetry & Clock</span>
        </button>
        <button
          type="button"
          className={`sim-mode-tab ${activeTab === 'sweep' ? 'active' : ''}`}
          onClick={() => setActiveTab('sweep')}
        >
          <span>Parameter Sweep Optimizer</span>
        </button>
        <button
          type="button"
          className={`sim-mode-tab ${activeTab === 'missions' ? 'active' : ''}`}
          onClick={() => setActiveTab('missions')}
        >
          <span>Campus Missions</span>
        </button>
        <button
          type="button"
          className={`sim-mode-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span>History & Reports</span>
        </button>
      </nav>

      {/* =========================================================================
          TAB 1: SCENARIO STUDIO & PRESETS
          ========================================================================= */}
      {activeTab === 'studio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Preset Cards Selector */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--theme-text-muted)', marginBottom: 8 }}>
              Standardized Operational Presets (Select to Populate)
            </h3>
            <div className="sim-preset-grid">
              {(catalog?.presets || DEFAULT_PRESETS).map((preset) => (
                <div
                  key={preset.id}
                  className={`sim-preset-card ${selectedPresetId === preset.id ? 'active' : ''}`}
                  onClick={() => applyPresetToCurrent(preset)}
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <div className="sim-preset-title">
                      <span>{preset.name || preset.label}</span>
                      <span className="sim-preset-badge">{preset.badge || 'Preset'}</span>
                    </div>
                    <p className="sim-preset-desc">{preset.description || preset.because}</p>
                  </div>
                  <div>
                    <p className="sim-preset-affected">
                      <strong>Entities:</strong> {preset.affected || 'Campus-wide'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Studio Layout: Scenario Sliders (Left) & Results/Charts (Right) */}
          <div className="sim-layout">
            {/* Left: Interactive Scenario Configurator */}
            <div className="sim-card">
              <div className="sim-tabs" role="tablist">
                {scenarios.map((sc, idx) => (
                  <button
                    key={sc.name || idx}
                    type="button"
                    role="tab"
                    className={activeScenarioIdx === idx ? 'active' : ''}
                    onClick={() => setActiveScenarioIdx(idx)}
                  >
                    {sc.name || `Scenario ${idx + 1}`}
                  </button>
                ))}
              </div>

              <label className="sim-field">
                Scenario Name
                <input
                  type="text"
                  value={currentScenario.name}
                  maxLength={80}
                  onChange={(e) => updateCurrentScenario({ name: e.target.value })}
                />
              </label>

              <SliderField
                label="Student Intake Adjustment"
                value={currentScenario.intakePercent}
                min={-50}
                max={100}
                unit="%"
                onChange={(val) => updateCurrentScenario({ intakePercent: val })}
              />

              <SliderField
                label="Additional Classrooms"
                value={currentScenario.extraClassrooms}
                min={0}
                max={40}
                unit=" rooms"
                onChange={(val) => updateCurrentScenario({ extraClassrooms: val })}
              />

              {currentScenario.extraClassrooms > 0 && (
                <SliderField
                  label="Seats per New Classroom"
                  value={currentScenario.seatsPerNewClassroom}
                  min={20}
                  max={200}
                  unit=" seats"
                  onChange={(val) => updateCurrentScenario({ seatsPerNewClassroom: val })}
                />
              )}

              <SliderField
                label="Transit Bus Fleet Seats"
                value={currentScenario.busCapacityPercent}
                min={-80}
                max={100}
                unit="%"
                onChange={(val) => updateCurrentScenario({ busCapacityPercent: val })}
              />

              <SliderField
                label="Fleet EV Transition Target"
                value={currentScenario.evAdoptionPercent || 0}
                min={0}
                max={100}
                unit="%"
                onChange={(val) => updateCurrentScenario({ evAdoptionPercent: val })}
              />

              <SliderField
                label="HVAC Efficiency Improvement"
                value={currentScenario.hvacEfficiencyPercent}
                min={0}
                max={40}
                unit="%"
                onChange={(val) => updateCurrentScenario({ hvacEfficiencyPercent: val })}
              />

              <SliderField
                label="Timetable Load Shift"
                value={currentScenario.timetableLoadPercent}
                min={-40}
                max={50}
                unit="%"
                onChange={(val) => updateCurrentScenario({ timetableLoadPercent: val })}
              />

              <div className="sim-actions">
                <button
                  type="button"
                  onClick={() => updateCurrentScenario({ enabled: !currentScenario.enabled })}
                >
                  {currentScenario.enabled ? 'Exclude from Run' : 'Include in Run'}
                </button>
                <button
                  type="button"
                  className="sim-run-btn"
                  onClick={executeSimulation}
                  disabled={simLoading || scenarios.every((s) => !s.enabled)}
                >
                  {simLoading ? 'Simulating...' : 'Execute Simulation'}
                </button>
              </div>
            </div>

            {/* Right: Simulation Output & Side-by-Side Comparison Matrix */}
            <div>
              {simError && <ErrorState message={simError} onRetry={executeSimulation} />}
              {simLoading && !simResult && <LoadingState label="Computing timetable and engineering formula outcomes" />}

              {!simResult && !simLoading && !simError && (
                <div className="sim-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <h3 style={{ color: 'var(--color-accent-gold)', marginBottom: 8 }}>Ready to Simulate</h3>
                  <p className="sim-note" style={{ maxWidth: 500, margin: '0 auto' }}>
                    Adjust the scenario parameters on the left or click any operational preset above, then
                    click <strong>Execute Simulation</strong> to inspect side-by-side trade-offs.
                  </p>
                </div>
              )}

              {simResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Recommendation Card */}
                  {simResult.recommendation && (
                    <div className="sim-card" style={{ borderLeft: '4px solid #10b981' }}>
                      <h3 style={{ fontSize: 16, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8 }}>
                        Multi-Objective Recommendation: {simResult.recommendation.best}
                      </h3>
                      <p style={{ margin: '6px 0', fontSize: 13, color: 'var(--theme-text)' }}>
                        {simResult.recommendation.why}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--theme-text-muted)' }}>
                        <strong>Compared on:</strong> {simResult.recommendation.comparedOn}
                      </p>
                      {simResult.recommendation.tradeoffs?.length > 0 && (
                        <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--theme-text-muted)' }}>
                          {simResult.recommendation.tradeoffs.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Multi-Objective Side-by-Side Comparison Matrix */}
                  <div className="sim-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                        Multi-Objective Comparison Matrix
                      </h3>
                      <button
                        type="button"
                        onClick={downloadOperationalReportJSON}
                        style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid var(--color-accent-gold)',
                          color: 'var(--color-accent-gold)',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        Download Report (JSON)
                      </button>
                    </div>

                    <div className="sim-table-wrap">
                      <table className="sim-matrix-table" aria-label="Scenario comparison matrix">
                        <thead>
                          <tr>
                            <th>Objective Metric</th>
                            <th>Provenance</th>
                            <th>Current Baseline</th>
                            {(simResult.scenarios || []).map((sc) => (
                              <th key={sc.name}>{sc.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(simResult.current || {}).map(([key, metric]) => (
                            <tr key={key}>
                              <td>
                                <strong>{metric.label}</strong>
                              </td>
                              <td>
                                <StatusBadge source={metric.source} />
                              </td>
                              <td>
                                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                  {formatValue(metric)}
                                </span>
                              </td>
                              {(simResult.scenarios || []).map((sc) => {
                                const simMetric = sc.simulated?.[key];
                                const delta = sc.deltas?.[key];
                                const isPositive = delta > 0;
                                const isLowerBetter = ['power', 'crowd', 'carbonEmissions'].includes(key);
                                const isFavorable = isLowerBetter ? delta < 0 : delta > 0;

                                return (
                                  <td key={sc.name}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                      {formatValue(simMetric)}
                                    </span>
                                    {delta != null && delta !== 0 && (
                                      <span
                                        className={`sim-delta-badge ${isFavorable ? 'sim-delta-good' : 'sim-delta-warn'}`}
                                        style={{ marginLeft: 6 }}
                                      >
                                        {isPositive ? '+' : ''}{delta}
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Visual Chart Comparison */}
                  {comparisonBarRows.length > 0 && (
                    <div className="sim-card">
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                        Multi-Objective Performance Comparison
                      </h3>
                      <div className="sim-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={comparisonBarRows} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                            <Legend />
                            <Bar dataKey="Baseline" fill="#64748b" />
                            {(simResult.scenarios || []).map((sc, idx) => (
                              <Bar
                                key={sc.name}
                                dataKey={sc.name}
                                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* 3D Map Link */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="sim-run-btn"
                      style={{ maxWidth: 260 }}
                      onClick={() => navigate('/map')}
                    >
                      Inspect in 3D Campus Twin
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DETERMINISTIC SYNTHETIC TELEMETRY & CAMPUS CLOCK
          ========================================================================= */}
      {activeTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Simulated Campus Clock Bar */}
          <div className="sim-clock-bar">
            <div className="sim-clock-display">
              <span style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--theme-text-muted)' }}>
                Simulated Campus Clock:
              </span>
              <span className="sim-clock-time">{formattedClock}</span>
            </div>

            <div className="sim-clock-controls">
              <button
                type="button"
                className="sim-btn-icon"
                title="Rewind 30 mins"
                onClick={() => setSimClockMinutes((m) => Math.max(8 * 60, m - 30))}
              >
                -30m
              </button>
              <button
                type="button"
                className="sim-btn-icon"
                title={isPlayingClock ? 'Pause Simulated Clock' : 'Play Simulated Clock'}
                onClick={() => setIsPlayingClock(!isPlayingClock)}
                style={{
                  background: isPlayingClock ? '#10b981' : '#1e3a5f',
                  color: '#fff',
                  fontWeight: 700
                }}
              >
                {isPlayingClock ? '⏸' : '▶'}
              </button>
              <button
                type="button"
                className="sim-btn-icon"
                title="Advance 30 mins"
                onClick={() => setSimClockMinutes((m) => Math.min(18 * 60, m + 30))}
              >
                +30m
              </button>
              <button
                type="button"
                className="sim-btn-icon"
                title="Reset to 10:00 AM"
                onClick={() => setSimClockMinutes(10 * 60)}
              >
                Reset
              </button>
            </div>

            <input
              type="range"
              className="sim-clock-slider"
              min={8 * 60}
              max={18 * 60}
              step={15}
              value={simClockMinutes}
              onChange={(e) => setSimClockMinutes(Number(e.target.value))}
            />
          </div>

          {/* Metric Selector & Active Preset Switcher */}
          <div className="sim-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { id: 'power', label: 'Electrical Power (kW)' },
                  { id: 'occupancy', label: 'Classroom Occupancy (%)' },
                  { id: 'crowd', label: 'Crowd Density (%)' },
                  { id: 'transit', label: 'Transit Ridership' },
                  { id: 'temperature', label: 'Ambient Temp (°C)' },
                  { id: 'solar', label: 'Solar Irradiance (W/m²)' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`sim-mode-tab ${telemetryMetric === m.id ? 'active' : ''}`}
                    style={{ border: '1px solid var(--theme-border)' }}
                    onClick={() => setTelemetryMetric(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--theme-text-muted)' }}>Scenario Profile:</span>
                <select
                  value={selectedPresetId}
                  onChange={(e) => setSelectedPresetId(e.target.value)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: 13
                  }}
                >
                  {DEFAULT_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time-Series Chart */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent-gold)' }}>
                  Synthetic Diurnal Curve: {telemetryMetric.toUpperCase()} across Campus Day (08:00 – 18:00)
                </h4>
                <span className="sim-provenance-tag">SEEDED DETERMINISTIC MODEL</span>
              </div>

              {telemetryLoading ? (
                <LoadingState label="Computing time-series telemetry curve" />
              ) : (
                <div className="sim-chart-container" style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={syntheticTimeSeries} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="timestamp" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Legend />
                      <ReferenceLine x={formattedClock} stroke="#f59e0b" strokeWidth={2} label={{ value: 'NOW', fill: '#f59e0b', fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={`${telemetryMetric.toUpperCase()} (Simulated)`}
                        stroke="#38bdf8"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <p className="sim-note" style={{ marginTop: 12 }}>
                Generated using deterministic diurnal equations (sinusoidal solar curve + academic timetable bell-curve).
                Synthetic readings provide full interactive fidelity without live IoT hardware or unverified mock data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PARAMETER SWEEP OPTIMIZER
          ========================================================================= */}
      {activeTab === 'sweep' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="sim-card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              Multi-Objective Parameter Sweep & Trade-Off Explorer
            </h3>
            <p className="sim-note">
              Performs an exhaustive, transparent parameter sweep across configured bounds to chart the Pareto
              trade-off between Electrical Power, Room Utilization, and Carbon Emissions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 16 }}>
              <label className="sim-field" style={{ marginTop: 0 }}>
                Parameter to Sweep
                <select value={sweepParam} onChange={(e) => setSweepParam(e.target.value)}>
                  <option value="hvacEfficiencyPercent">HVAC Efficiency (%)</option>
                  <option value="intakePercent">Student Intake (%)</option>
                  <option value="timetableLoadPercent">Timetable Load (%)</option>
                  <option value="evAdoptionPercent">Fleet EV Adoption (%)</option>
                </select>
              </label>

              <label className="sim-field" style={{ marginTop: 0 }}>
                Minimum Value
                <input type="number" value={sweepMin} onChange={(e) => setSweepMin(Number(e.target.value))} />
              </label>

              <label className="sim-field" style={{ marginTop: 0 }}>
                Maximum Value
                <input type="number" value={sweepMax} onChange={(e) => setSweepMax(Number(e.target.value))} />
              </label>

              <label className="sim-field" style={{ marginTop: 0 }}>
                Step Size
                <input type="number" value={sweepStep} onChange={(e) => setSweepStep(Number(e.target.value))} />
              </label>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="sim-run-btn"
                style={{ maxWidth: 220 }}
                onClick={executeSweep}
                disabled={sweepLoading}
              >
                {sweepLoading ? 'Computing Sweep...' : 'Run Parameter Sweep'}
              </button>
            </div>
          </div>

          {sweepResult && (
            <div className="sim-card">
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-accent-gold)', marginBottom: 12 }}>
                Pareto Trade-Off Curve for {sweepResult.parameter}
              </h4>

              <div className="sim-chart-container" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sweepResult.points || []} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="parameterValue" stroke="#94a3b8" label={{ value: sweepResult.parameter, position: 'insideBottom', offset: -10, fill: '#94a3b8' }} />
                    <YAxis yAxisId="left" stroke="#38bdf8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="powerKw" name="Electrical Load (kW)" stroke="#38bdf8" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="utilizationPercent" name="Room Utilization (%)" stroke="#10b981" strokeWidth={2} />
                    <Line yAxisId="left" type="monotone" dataKey="carbonEmissions" name="Carbon Emissions (kg CO2)" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Table of points */}
              <div className="sim-table-wrap" style={{ marginTop: 16 }}>
                <table className="sim-matrix-table">
                  <thead>
                    <tr>
                      <th>Step Value</th>
                      <th>Electrical Power (kW)</th>
                      <th>Room Utilization (%)</th>
                      <th>Crowd Density (%)</th>
                      <th>Carbon (kg CO2/day)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sweepResult.points || []).map((pt, i) => (
                      <tr key={i}>
                        <td><strong>{pt.parameterValue}</strong></td>
                        <td>{pt.powerKw} kW</td>
                        <td>{pt.utilizationPercent}%</td>
                        <td>{pt.crowdPercent}%</td>
                        <td>{pt.carbonEmissions} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: CAMPUS MISSIONS
          ========================================================================= */}
      {activeTab === 'missions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Mission Selection Grid */}
          <div className="sim-mission-grid">
            {missions.map((m) => (
              <div
                key={m.id}
                className={`sim-mission-card ${activeMissionId === m.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveMissionId(m.id);
                  setMissionEvalResult(null);
                }}
                role="button"
                tabIndex={0}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent-gold)', textTransform: 'uppercase' }}>
                      {m.category || 'Mission'}
                    </span>
                    <span className="sim-preset-badge">Objective</span>
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, margin: '8px 0 4px', color: '#fff' }}>{m.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--theme-text-muted)', lineHeight: 1.4 }}>{m.description}</p>
                </div>

                <div style={{ borderTop: '1px solid #334155', paddingTop: 8, fontSize: 12 }}>
                  <p style={{ margin: 0, color: '#38bdf8' }}>
                    <strong>Goal:</strong> {m.targetSummary || 'Meet constraint criteria'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Active Mission Workspace */}
          <div className="sim-layout">
            {/* Candidate Form */}
            <div className="sim-card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
                Candidate Operational Proposal
              </h3>
              <p className="sim-note">
                Tune the levers to satisfy the mission constraints and maximize your simulation score.
              </p>

              <SliderField
                label="HVAC Efficiency Improvement"
                value={missionCandidate.hvacEfficiencyPercent}
                min={0}
                max={40}
                unit="%"
                onChange={(val) => setMissionCandidate({ ...missionCandidate, hvacEfficiencyPercent: val })}
              />

              <SliderField
                label="Fleet EV Adoption"
                value={missionCandidate.evAdoptionPercent}
                min={0}
                max={100}
                unit="%"
                onChange={(val) => setMissionCandidate({ ...missionCandidate, evAdoptionPercent: val })}
              />

              <SliderField
                label="Timetable Load Shift"
                value={missionCandidate.timetableLoadPercent}
                min={-30}
                max={30}
                unit="%"
                onChange={(val) => setMissionCandidate({ ...missionCandidate, timetableLoadPercent: val })}
              />

              <SliderField
                label="Student Intake Adjustment"
                value={missionCandidate.intakePercent}
                min={-30}
                max={40}
                unit="%"
                onChange={(val) => setMissionCandidate({ ...missionCandidate, intakePercent: val })}
              />

              <SliderField
                label="Additional Classrooms"
                value={missionCandidate.extraClassrooms}
                min={0}
                max={10}
                unit=" rooms"
                onChange={(val) => setMissionCandidate({ ...missionCandidate, extraClassrooms: val })}
              />

              <div style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="sim-run-btn"
                  style={{ width: '100%' }}
                  onClick={executeMissionEvaluation}
                  disabled={missionLoading}
                >
                  {missionLoading ? 'Evaluating Model...' : 'Evaluate Mission Proposal'}
                </button>
              </div>
            </div>

            {/* Score & Evaluation Result */}
            <div>
              {!missionEvalResult && !missionLoading && (
                <div className="sim-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <h4 style={{ color: 'var(--color-accent-gold)' }}>Submit Your Proposal</h4>
                  <p className="sim-note">
                    Click <strong>Evaluate Mission Proposal</strong> to check your adjustments against objective scoring rules.
                  </p>
                </div>
              )}

              {missionLoading && <LoadingState label="Scoring candidate parameters against model constraints" />}

              {missionEvalResult && (
                <div className="sim-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className={`sim-score-circle sim-badge-${(missionEvalResult.badge || 'retry').toLowerCase()}`}>
                      <span>{missionEvalResult.score}</span>
                      <span style={{ fontSize: 10, fontWeight: 600 }}>/ 100</span>
                    </div>
                    <h3 style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>
                      Award: {missionEvalResult.badge} BADGE
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--theme-text-muted)', maxWidth: 450, margin: '6px auto 0' }}>
                      {missionEvalResult.explanation}
                    </p>
                  </div>

                  {/* Constraint Checklist */}
                  <div style={{ borderTop: '1px solid #334155', paddingTop: 14 }}>
                    <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--theme-text-muted)', marginBottom: 8 }}>
                      Constraint Validation
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(missionEvalResult.constraintChecks || []).map((chk, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <span style={{ color: chk.passed ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                            {chk.passed ? '✓' : '✗'}
                          </span>
                          <span>{chk.label}</span>
                          <span style={{ marginLeft: 'auto', fontFamily: 'monospace', color: 'var(--theme-text-muted)' }}>
                            {chk.actual}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  {missionEvalResult.breakdown && (
                    <div style={{ background: '#020617', padding: 12, borderRadius: 8, fontSize: 12 }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-accent-gold)' }}>
                        Scoring Breakdown
                      </p>
                      {Object.entries(missionEvalResult.breakdown).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                          <span style={{ textTransform: 'capitalize' }}>{k}</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v} pts</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: HISTORY & OPERATIONAL REPORTS
          ========================================================================= */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="sim-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Simulation Run History</h3>
                <p className="sim-note">Audit log of stored simulation runs with parameters, timestamps, and outcomes.</p>
              </div>
              <button
                type="button"
                className="sim-run-btn"
                style={{ maxWidth: 220 }}
                onClick={downloadOperationalReportJSON}
              >
                Download Operational Report
              </button>
            </div>

            <div className="sim-history-list">
              {historyRuns.length === 0 ? (
                <p className="sim-note">No stored simulation runs recorded yet. Execute a simulation to build the audit log.</p>
              ) : (
                historyRuns.map((run, i) => (
                  <div key={i} className="sim-history-item">
                    <div>
                      <strong style={{ fontSize: 14 }}>{run.scenarioName || 'Scenario Run'}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--theme-text-muted)' }}>
                        Recorded: {run.recordedAt || 'Recent'} | Model: v1.4-calibrated
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="sim-provenance-tag">SAVED RUN</span>
                      <button
                        type="button"
                        style={{
                          background: '#1e293b',
                          border: '1px solid #334155',
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          if (run.parameters) {
                            updateCurrentScenario(run.parameters);
                            setActiveTab('studio');
                          }
                        }}
                      >
                        Reload
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SliderField({ label, value, min, max, unit = '', onChange }) {
  return (
    <label className="sim-field">
      <div className="sim-field-row">
        <span>{label}</span>
        <span className="sim-field-val">
          {value > 0 ? `+${value}` : value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
