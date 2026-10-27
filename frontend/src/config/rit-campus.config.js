import cachedGeo from './rit-osm-cache.json';

export const RIT_CAMPUS = {
  CENTER: cachedGeo.center || { lat: 13.0389, lng: 80.0449 },
  LOCATION: cachedGeo.location || "Kuthambakkam, Chennai, Tamil Nadu, India",
  COLLEGE_NAME: cachedGeo.collegeName || "Rajalakshmi Institute of Technology (RIT)",
  CRS: cachedGeo.crs || "WGS84 (EPSG:4326)",
  ZOOM: 18,
  TILT: 60,
  HEADING: 320,
  AREA_SQM: 44029,
  BUILT_SQM: 16297,
  BUILDINGS: cachedGeo.officialBuildings || [],
  PERIPHERAL_BUILDINGS: cachedGeo.peripheralBuildings || [],
  ROADS: [
    { points: [[-20, -145], [-20, -100], [-25, -20], [-25, 35], [-25, 90]], width: 8, type: "main" },
    { points: [[-140, -10], [-80, -10], [-30, -10], [10, -10], [60, -10], [110, -10]], width: 6, type: "main" },
    { points: [[-140, 60], [-80, 60], [-25, 60], [20, 60], [70, 60], [110, 60]], width: 5, type: "perimeter" },
    { points: [[-85, -50], [-85, 70]], width: 4, type: "service" },
    { points: [[65, -80], [65, 50]], width: 4, type: "service" },
  ],
  TREE_CLUSTERS: [
    { cx: -80, cz: -100, count: 12, spread: 25 },
    { cx: 55, cz: 60, count: 8, spread: 20 },
    { cx: -30, cz: 110, count: 10, spread: 18 },
    { cx: 115, cz: 50, count: 15, spread: 30 },
    { cx: 10, cz: -115, count: 6, spread: 12 },
    { cx: -90, cz: 50, count: 7, spread: 15 },
  ],
  SENSOR_LABELS: {
    energy: { icon: "⚡", unit: "%", label: "Energy Usage" },
    occupancy: { icon: "👥", unit: "%", label: "Occupancy" },
    temperature: { icon: "🌡", unit: "°C", label: "Temperature" },
    air_quality: { icon: "💨", unit: "AQI", label: "Air Quality" },
    water_usage: { icon: "💧", unit: "%", label: "Water Usage" },
    machinery_vibration: { icon: "⚙", unit: "Hz", label: "Machinery Vibration" },
  },
};

export default RIT_CAMPUS;
