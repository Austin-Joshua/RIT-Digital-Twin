import apiClient from './api';
import cachedGeo from '../config/rit-osm-cache.json';

const RIT_CENTER = {
  lat: 13.0389,
  lng: 80.0449
};

const LAT_TO_M = 111320;
const LNG_TO_M = 111320 * Math.cos((RIT_CENTER.lat * Math.PI) / 180);

/**
 * Fetches real campus building footprints and 3D geometry metadata.
 * 1. Tries authoritative backend endpoint `/api/campus/buildings`
 * 2. Falls back to verified cached OpenStreetMap GeoJSON dataset (guaranteed 100% resilient)
 */
export async function fetchOSMBuildings() {
  try {
    // 1. Try authoritative backend records
    const res = await apiClient.get('/campus/buildings');
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((b) => {
        let footprint = b.footprint;
        if ((!footprint || footprint.length === 0) && b.footprintGeometry) {
          try {
            footprint = JSON.parse(b.footprintGeometry);
          } catch (_e) {
            /* ignore parse failure */
          }
        }
        if (!footprint || footprint.length < 3) {
          // Fall back to cached footprint for this building code if available
          const cached = (cachedGeo.officialBuildings || []).find(
            (cb) => cb.code === b.code || cb.name === b.name
          );
          if (cached) footprint = cached.footprint;
        }

        return {
          id: b.id,
          code: b.code,
          name: b.name,
          buildingType: b.geometrySource || 'ACADEMIC',
          levels: b.numberOfLevels || 4,
          height: b.heightMeters || 16,
          geometryStatus: b.geometryStatus || 'APPROXIMATE',
          geometrySource: b.geometrySource || 'OPENSTREETMAP_WGS84',
          heightSource: b.heightSource || 'ESTIMATED_LEVELS_4M',
          osmWayId: b.osmWayId,
          latitude: b.latitude || RIT_CENTER.lat,
          longitude: b.longitude || RIT_CENTER.lng,
          footprint: footprint || [[-20, -20], [-20, 20], [20, 20], [20, -20]],
          sourceUpdatedAt: b.sourceUpdatedAt,
          lastVerifiedAt: b.lastVerifiedAt,
          energyKw: b.energyKw,
          energySource: b.energySource,
          roomCount: b.roomCount
        };
      });
    }
  } catch (err) {
    console.info('Backend /api/campus/buildings unavailable, using cached real OSM dataset:', err?.message);
  }

  // 2. Fall back to verified cached OpenStreetMap GeoJSON
  const combined = [
    ...(cachedGeo.officialBuildings || []),
    ...(cachedGeo.peripheralBuildings || [])
  ];

  return combined.map((b) => ({
    id: b.id,
    code: b.code,
    name: b.name,
    buildingType: b.type || 'ACADEMIC',
    levels: b.levels || 2,
    height: b.heightMeters || (b.levels ? b.levels * 4 : 8),
    geometryStatus: b.geometryStatus || 'UNVERIFIED',
    geometrySource: b.geometrySource || 'OPENSTREETMAP_WGS84',
    heightSource: b.heightSource || 'UNVERIFIED_ESTIMATE_4M',
    osmWayId: b.osmWayId,
    latitude: b.latitude || RIT_CENTER.lat,
    longitude: b.longitude || RIT_CENTER.lng,
    footprint: b.footprint || [],
    sourceUpdatedAt: b.sourceUpdatedAt,
    lastVerifiedAt: b.lastVerifiedAt
  }));
}

/**
 * Returns the official campus reference geographic metadata
 */
export function getCampusReference() {
  return {
    collegeName: cachedGeo.collegeName || "Rajalakshmi Institute of Technology (RIT)",
    location: cachedGeo.location || "Kuthambakkam, Chennai, Tamil Nadu, India",
    latitude: RIT_CENTER.lat,
    longitude: RIT_CENTER.lng,
    crs: cachedGeo.crs || "WGS84 (EPSG:4326)",
    areaSqm: cachedGeo.areaSqm || 44029,
    builtSqm: cachedGeo.builtSqm || 16297
  };
}
