import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SimulationLab from '../pages/enterprise/SimulationLab';
import twinService from '../services/twinService';

vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  };
});

vi.mock('../services/twinService', () => ({
  default: {
    getSimulationCatalog: vi.fn(),
    simulateScenario: vi.fn(),
    getSimulationHistory: vi.fn(),
    runParameterSweep: vi.fn(),
    getSyntheticTelemetry: vi.fn(),
    getMissions: vi.fn(),
    evaluateMission: vi.fn(),
  },
}));

describe('SimulationLab Smart Campus Intelligence Studio', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    twinService.getSimulationCatalog.mockResolvedValue({
      data: {
        presets: [
          {
            id: 'normal-day',
            name: 'Normal Operating Day',
            badge: 'Standard Baseline',
            description: 'Standard academic timetable with typical 100% scheduled classes.',
            affected: 'Campus-wide',
            values: { intakePercent: 0, extraClassrooms: 0, hvacEfficiencyPercent: 0 }
          },
          {
            id: 'energy-saving',
            name: 'Energy-Saving Operation',
            badge: 'Green Campus',
            description: 'Aggressive HVAC setback and evening section consolidation.',
            affected: 'Central chiller plant, Main Block',
            values: { intakePercent: 0, extraClassrooms: 0, hvacEfficiencyPercent: 25 }
          }
        ]
      }
    });

    twinService.getMissions.mockResolvedValue({
      data: [
        {
          id: 'energy-reduction',
          title: 'Campus Energy Decarbonization',
          category: 'Sustainability',
          description: 'Reduce electrical demand below 120 kW.',
          targetSummary: 'Modeled demand < 120 kW with utilization >= 60%'
        }
      ]
    });

    twinService.getSimulationHistory.mockResolvedValue({
      data: [
        {
          scenarioName: 'Eco Operation Run 1',
          recordedAt: '2026-10-28 09:00',
          parameters: { intakePercent: 0, hvacEfficiencyPercent: 20 }
        }
      ]
    });

    twinService.getSyntheticTelemetry.mockResolvedValue({
      data: {
        metric: 'power',
        scenarioId: 'normal-day',
        unit: 'kW',
        series: [
          { timestamp: '08:00', hour: 8.0, value: 105.2 },
          { timestamp: '10:00', hour: 10.0, value: 142.8 },
          { timestamp: '12:00', hour: 12.0, value: 155.0 }
        ]
      }
    });
  });

  const renderLab = async () => {
    let result;
    await act(async () => {
      result = render(
        <BrowserRouter>
          <SimulationLab />
        </BrowserRouter>
      );
    });
    return result;
  };

  it('renders studio header, provenance notice, and mode tabs', async () => {
    await renderLab();

    expect(screen.getByText(/Campus Simulation Lab & What-If Studio/i)).toBeTruthy();
    expect(screen.getByText(/PROVENANCE: SYNTHETIC \/ SIMULATED/i)).toBeTruthy();
    expect(screen.getByText(/Scenario Studio & Presets/i)).toBeTruthy();
    expect(screen.getByText(/Deterministic Telemetry & Clock/i)).toBeTruthy();
    expect(screen.getByText(/Parameter Sweep Optimizer/i)).toBeTruthy();
    expect(screen.getByText(/Campus Missions/i)).toBeTruthy();
  });

  it('renders operational presets and populates scenario upon selection', async () => {
    await renderLab();

    await waitFor(() => {
      expect(screen.getByText(/Energy-Saving Operation/i)).toBeTruthy();
    });

    const energyPreset = screen.getByText(/Energy-Saving Operation/i);
    await act(async () => {
      fireEvent.click(energyPreset);
    });

    expect(screen.getByDisplayValue(/Energy-Saving Operation \(Custom\)/i)).toBeTruthy();
  });

  it('executes simulation and displays multi-objective comparison matrix', async () => {
    twinService.simulateScenario.mockResolvedValueOnce({
      data: {
        source: 'SIMULATED',
        current: {
          power: { label: 'Electrical Power', value: 135.5, unit: 'kW', source: 'CALCULATED' },
          utilization: { label: 'Room Utilization', value: 68.2, unit: '%', source: 'STORED' }
        },
        recommendation: {
          best: 'Scenario A (Balanced)',
          why: 'Provides optimal balance between energy conservation and space availability.',
          comparedOn: 'Electrical load and classroom capacity',
          tradeoffs: ['Scenario A reduces energy by 14 kW with no seat deficit.']
        },
        scenarios: [
          {
            name: 'Scenario A (Balanced)',
            simulated: {
              power: { label: 'Electrical Power', value: 121.5, unit: 'kW', source: 'SIMULATED' },
              utilization: { label: 'Room Utilization', value: 68.2, unit: '%', source: 'SIMULATED' }
            },
            deltas: {
              power: -14.0,
              utilization: 0.0
            }
          }
        ]
      }
    });

    await renderLab();

    const runBtn = screen.getByRole('button', { name: /execute simulation/i });
    await act(async () => {
      fireEvent.click(runBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Multi-Objective Recommendation: Scenario A \(Balanced\)/i)).toBeTruthy();
      expect(screen.getByText(/Multi-Objective Comparison Matrix/i)).toBeTruthy();
      expect(screen.getByText(/-14/i)).toBeTruthy();
    });
  });

  it('switches to Deterministic Telemetry & Clock tab and controls clock', async () => {
    await renderLab();

    const telemetryTab = screen.getByRole('button', { name: /deterministic telemetry & clock/i });
    await act(async () => {
      fireEvent.click(telemetryTab);
    });

    expect(screen.getByText(/Simulated Campus Clock:/i)).toBeTruthy();
    expect(screen.getAllByText(/10:00/i).length).toBeGreaterThan(0);

    const advanceBtn = screen.getByTitle(/advance 30 mins/i);
    await act(async () => {
      fireEvent.click(advanceBtn);
    });

    expect(screen.getAllByText(/10:30/i).length).toBeGreaterThan(0);
  });

  it('switches to Campus Missions tab and evaluates proposal', async () => {
    twinService.evaluateMission.mockResolvedValueOnce({
      data: {
        missionId: 'energy-reduction',
        score: 92,
        badge: 'GOLD',
        explanation: 'Outstanding proposal! Power reduced to 112 kW while maintaining 64% room utilization.',
        constraintChecks: [
          { label: 'Demand < 120 kW', actual: '112.4 kW', passed: true },
          { label: 'Utilization >= 60%', actual: '64.2%', passed: true }
        ],
        breakdown: {
          base: 50,
          energyBonus: 25,
          utilizationBonus: 17
        }
      }
    });

    await renderLab();

    const missionsTab = screen.getByRole('button', { name: /campus missions/i });
    await act(async () => {
      fireEvent.click(missionsTab);
    });

    await waitFor(() => {
      expect(screen.getByText(/Campus Energy Decarbonization/i)).toBeTruthy();
    });

    const evalBtn = screen.getByRole('button', { name: /evaluate mission proposal/i });
    await act(async () => {
      fireEvent.click(evalBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Award: GOLD BADGE/i)).toBeTruthy();
      expect(screen.getByText(/92/i)).toBeTruthy();
      expect(screen.getByText(/Outstanding proposal!/i)).toBeTruthy();
    });
  });
});
