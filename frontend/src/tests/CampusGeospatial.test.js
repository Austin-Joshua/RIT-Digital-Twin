import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../services/api';
import { fetchOSMBuildings, getCampusReference } from '../services/campus-osm.service';
import { extrudeBuilding, statusToColor, valueToColor } from '../utils/campus-3d.utils';
import RIT_CAMPUS from '../config/rit-campus.config';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockRejectedValue(new Error('Backend offline in test'))
  }
}));

describe('Campus Geospatial & Real-World 3D Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides the fixed RIT campus reference coordinates at 13.0389 N, 80.0449 E', () => {
    const ref = getCampusReference();
    expect(ref.collegeName).toContain('Rajalakshmi Institute of Technology');
    expect(ref.latitude).toBeCloseTo(13.0389, 4);
    expect(ref.longitude).toBeCloseTo(80.0449, 4);
    expect(ref.crs).toBe('WGS84 (EPSG:4326)');
  });

  it('RIT_CAMPUS configuration includes real coordinates and CRS metadata', () => {
    expect(RIT_CAMPUS.CENTER.lat).toBeCloseTo(13.0389, 4);
    expect(RIT_CAMPUS.CENTER.lng).toBeCloseTo(80.0449, 4);
    expect(RIT_CAMPUS.COLLEGE_NAME).toBe('Rajalakshmi Institute of Technology (RIT)');
    expect(RIT_CAMPUS.CRS).toBe('WGS84 (EPSG:4326)');
    expect(RIT_CAMPUS.BUILDINGS.length).toBeGreaterThanOrEqual(10);
    expect(RIT_CAMPUS.PERIPHERAL_BUILDINGS.length).toBeGreaterThanOrEqual(5);
  });

  it('fetchOSMBuildings loads real building footprints with status and height provenance', async () => {
    const buildings = await fetchOSMBuildings();
    expect(buildings.length).toBeGreaterThanOrEqual(15);

    // Verify Main Academic Block
    const mainBlock = buildings.find(b => b.code === 'MAIN' || b.name.includes('Main Academic'));
    expect(mainBlock).toBeDefined();
    expect(mainBlock.geometryStatus).toBe('VERIFIED');
    expect(mainBlock.geometrySource).toBe('OPENSTREETMAP_WGS84');
    expect(mainBlock.osmWayId).toBe('367941212');
    expect(mainBlock.height).toBe(16);
    expect(mainBlock.levels).toBe(4);
    expect(mainBlock.footprint.length).toBeGreaterThanOrEqual(4);

    // Verify Peripheral structure has UNVERIFIED status
    const peripheral = buildings.find(b => b.geometryStatus === 'UNVERIFIED');
    expect(peripheral).toBeDefined();
    expect(peripheral.footprint.length).toBeGreaterThanOrEqual(3);
  });

  it('statusToColor maps geometry statuses to distinct color tokens', () => {
    expect(statusToColor('VERIFIED')).toBe('#10B981'); // Emerald Green
    expect(statusToColor('APPROXIMATE')).toBe('#F59E0B'); // Amber
    expect(statusToColor('UNVERIFIED')).toBe('#6B7280'); // Slate Gray
    expect(statusToColor('INCOMPLETE')).toBe('#EF4444'); // Crimson
  });

  it('valueToColor classifies telemetry thresholds properly', () => {
    expect(valueToColor(0.1)).toBe('#00E676');
    expect(valueToColor(0.5)).toBe('#FFEA00');
    expect(valueToColor(0.9)).toBe('#FF5252');
  });

  it('extrudeBuilding creates 3D body and roof meshes with correct floor levels', () => {
    const sampleFootprint = [[0, 0], [20, 0], [20, 30], [0, 30], [0, 0]];
    const result = extrudeBuilding(sampleFootprint, 16, {
      bodyColor: '#C0B090',
      roofColor: '#8B7355',
    });

    expect(result.group).toBeDefined();
    expect(result.bodyMesh).toBeDefined();
    expect(result.bodyMat).toBeDefined();
    expect(result.roofMesh).toBeDefined();
    expect(result.roofMat).toBeDefined();
    expect(result.roofMesh.position.y).toBe(16);
  });
});
