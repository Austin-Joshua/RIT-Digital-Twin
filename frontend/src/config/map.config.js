export const CAMPUS_CONFIG = {
  CENTER_LAT: 13.0382427,
  CENTER_LNG: 80.0453935,
  ZOOM: 18,
  MAP_WIDTH: 1024,
  MAP_HEIGHT: 1024,
  MAP_TYPE: "satellite",
  getSatelliteImageUrl: (apiKey) =>
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=13.0382427,80.0453935` +
    `&zoom=18` +
    `&size=1024x1024` +
    `&maptype=satellite` +
    `&key=${apiKey}`,
};

export const CAMPUS_BUILDINGS = [
  {
    id: "main_block",
    name: "Main Academic Block",
    position: { x: 0, z: 0 },
    size: { width: 80, depth: 30, height: 18 },
    color: "#C8A97E",
    iotSensors: ["energy", "occupancy", "temperature"],
    floors: 4,
  },
  {
    id: "lab_block",
    name: "Lab Block",
    position: { x: -100, z: 20 },
    size: { width: 60, depth: 25, height: 14 },
    color: "#A8B8C8",
    iotSensors: ["energy", "occupancy"],
    floors: 3,
  },
  {
    id: "workshop",
    name: "Workshop Block",
    position: { x: 110, z: 10 },
    size: { width: 50, depth: 40, height: 10 },
    color: "#8B7355",
    iotSensors: ["energy", "temperature"],
    floors: 2,
  },
  {
    id: "library",
    name: "Central Library",
    position: { x: -50, z: -80 },
    size: { width: 45, depth: 35, height: 16 },
    color: "#D4B896",
    iotSensors: ["energy", "occupancy", "temperature"],
    floors: 3,
  },
  {
    id: "admin_block",
    name: "Administration Block",
    position: { x: 60, z: -70 },
    size: { width: 40, depth: 25, height: 20 },
    color: "#B8C4CC",
    iotSensors: ["energy", "occupancy"],
    floors: 4,
  },
  {
    id: "hostel_a",
    name: "Hostel Block A",
    position: { x: -140, z: -100 },
    size: { width: 30, depth: 20, height: 24 },
    color: "#E8D5B0",
    iotSensors: ["energy", "occupancy"],
    floors: 6,
  },
  {
    id: "hostel_b",
    name: "Hostel Block B",
    position: { x: -100, z: -100 },
    size: { width: 30, depth: 20, height: 24 },
    color: "#E8D5B0",
    iotSensors: ["energy", "occupancy"],
    floors: 6,
  },
  {
    id: "canteen",
    name: "Canteen & Food Court",
    position: { x: 10, z: 80 },
    size: { width: 35, depth: 25, height: 8 },
    color: "#F0A060",
    iotSensors: ["occupancy", "temperature"],
    floors: 1,
  },
  {
    id: "auditorium",
    name: "Auditorium",
    position: { x: -20, z: -140 },
    size: { width: 55, depth: 45, height: 14 },
    color: "#9090A8",
    iotSensors: ["energy", "occupancy"],
    floors: 1,
  },
  {
    id: "sports_complex",
    name: "Sports Complex",
    position: { x: 160, z: -60 },
    size: { width: 70, depth: 50, height: 12 },
    color: "#78A878",
    iotSensors: ["energy"],
    floors: 1,
  },
];

export const IOT_COLOR_SCALE = {
  low: "#00E676",
  medium: "#FFEA00",
  high: "#FF5252",
};
